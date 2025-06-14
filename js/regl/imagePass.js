import { loadImage, loadText, makePassFBO, makePass } from "./utils.js";
import imagePassFrag from "../../shaders/glsl/imagePass.frag.glsl";

// Multiplies the rendered rain and bloom by a loaded in image

const defaultBGURL = "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Flammarion_Colored.jpg/917px-Flammarion_Colored.jpg";

export default ({ regl, config }, inputs) => {
	const output = makePassFBO(regl, config.useHalfFloat);
	const bgURL = "bgURL" in config ? config.bgURL : defaultBGURL;
	const background = loadImage(regl, bgURL);
	const render = regl({
		frag: regl.prop("frag"),
		uniforms: {
			backgroundTex: background.texture,
			tex: inputs.primary,
			bloomTex: inputs.bloom,
		},
		framebuffer: output,
	});
	return makePass(
		{
			primary: output,
		},
		Promise.all([background.loaded]),
		(w, h) => output.resize(w, h),
		(shouldRender) => {
			if (shouldRender) {
				render({ frag: imagePassFrag });
			}
		}
	);
};
