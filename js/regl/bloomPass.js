import { makePassFBO, makePass } from "./utils";
import highPassFrag  from '../../shaders/glsl/bloomPass.highPass.frag.glsl';
import blurFrag      from '../../shaders/glsl/bloomPass.blur.frag.glsl';
import combineFrag   from '../../shaders/glsl/bloomPass.combine.frag.glsl';


// The bloom pass is basically an added high-pass blur.
// The blur approximation is the sum of a pyramid of downscaled, blurred textures.

const pyramidHeight = 5;

// A pyramid is just an array of FBOs, where each FBO is half the width
// and half the height of the FBO below it.
const makePyramid = (regl, height, halfFloat) =>
  Array(height)
    .fill()
    .map((_) => makePassFBO(regl, halfFloat));

const resizePyramid = (pyramid, vw, vh, scale) =>
  pyramid.forEach((fbo, index) =>
    fbo.resize(
      Math.floor((vw * scale) / 2 ** index),
      Math.floor((vh * scale) / 2 ** index)
    )
  );

export default ({ regl, config }, inputs) => {
  const { bloomStrength, bloomSize, highPassThreshold } = config;
  const enabled = bloomSize > 0 && bloomStrength > 0;

  // If there's no bloom to apply, return a no-op pass with an empty bloom texture
  if (!enabled) {
    return makePass({
      primary: inputs.primary,
      bloom: makePassFBO(regl),
    });
  }

  // Build three pyramids of FBOs, one for each step in the process
  const highPassPyramid = makePyramid(regl, pyramidHeight, config.useHalfFloat);
  const hBlurPyramid = makePyramid(regl, pyramidHeight, config.useHalfFloat);
  const vBlurPyramid = makePyramid(regl, pyramidHeight, config.useHalfFloat);
  const output = makePassFBO(regl, config.useHalfFloat);

 
  // The high pass restricts the blur to bright things in our input texture.
  const highPass = regl({
    frag: regl.prop("frag"),
    uniforms: {
      highPassThreshold,
      tex: regl.prop("tex"),
    },
    framebuffer: regl.prop("fbo"),
  });


  // A 2D gaussian blur is just a 1D blur done horizontally, then done vertically.
  // The FBO pyramid's levels represent separate levels of detail;
  // by blurring them all, this basic blur approximates a more complex gaussian:
  // https://web.archive.org/web/20191124072602/https://software.intel.com/en-us/articles/compute-shader-hdr-and-bloom

  const blur = regl({
    frag: regl.prop("frag"),
    uniforms: {
      tex: regl.prop("tex"),
      direction: regl.prop("direction"),
      height: regl.context("viewportHeight"),
      width: regl.context("viewportWidth")
    },
    framebuffer: regl.prop("fbo"),
  });

  // The pyramid of textures gets flattened (summed) into a final blurry "bloom" texture
  const combine = regl({
    frag: regl.prop("frag"),
    uniforms: {
      bloomStrength,
      ...Object.fromEntries(
        vBlurPyramid.map((fbo, index) => [`pyr_${index}`, fbo])
      ),
    },
    framebuffer: output,
  });

  return makePass(
    {
      primary: inputs.primary,
      bloom: output,
    },
    null, //no promise to resolve, it's in the bundle already
    (w, h) => {
      // The blur pyramids can be lower resolution than the screen.
      resizePyramid(highPassPyramid, w, h, bloomSize);
      resizePyramid(hBlurPyramid, w, h, bloomSize);
      resizePyramid(vBlurPyramid, w, h, bloomSize);
      output.resize(w, h);
    },
    (shouldRender) => {
      if (!shouldRender) {
        return;
      }

      for (let i = 0; i < pyramidHeight; i++) {
        const highPassFBO = highPassPyramid[i];
        const hBlurFBO = hBlurPyramid[i];
        const vBlurFBO = vBlurPyramid[i];
        highPass({
          fbo: highPassFBO,
          frag: highPassFrag,
          tex: i === 0 ? inputs.primary : highPassPyramid[i - 1],
        });
        blur({
          fbo: hBlurFBO,
          frag: blurFrag,
          tex: highPassFBO,
          direction: [1, 0],
        });
        blur({
          fbo: vBlurFBO,
          frag: blurFrag,
          tex: hBlurFBO,
          direction: [0, 1],
        });
      }

      combine({ frag: combineFrag });
    }
  );
};
