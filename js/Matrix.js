import React, { useEffect, useRef, memo } from "react";
import { createRain, destroyRain } from "./regl/main";
import makeConfig from "./utils/config";

/**
 * @typedef {'hsl'|'rgb'} ColourSpace
 */

/**
 * @typedef {object} Colour
 * @property {ColourSpace} space
 * @property {number[]} values   // 3-tuple: [0–1] or [0–360, 0–1, 0–1]
 */

/**
 * @typedef {'classic'|'megacity'|'neomatrixology'|'operator'|
*   'nightmare'|'paradise'|'resurrections'|'trinity'|
*   'morpheus'|'bugs'|'palimpsest'|'twilight'|
*   'holoplay'|'3d'|'throwback'|'updated'|
*   '1999'|'2003'|'2021'|string
* } MatrixVersion
*/

/**
* @typedef {object} MatrixProps
* 
* // — core identity —
* @property {MatrixVersion}          [version]
* @property {keyof typeof fonts}     [font]
* @property {'palette'|'stripe'|string} [effect]
* 
* // — textures —
* @property {keyof typeof textureURLs|null} [baseTexture]
* @property {keyof typeof textureURLs|null} [glintTexture]
* 
* // — toggles —
* @property {boolean}                [useCamera]
* @property {boolean}                [volumetric]
* @property {boolean}                [loops]
* @property {boolean}                [skipIntro]
* @property {'regl'|'three'|string}  [renderer]
* @property {boolean}                [suppressWarnings]
* @property {boolean}                [useHalfFloat]
* @property {boolean}                [useHoloplay]
* @property {boolean}                [isometric]
* 
* // — glyph appearance —
* @property {number}                 [glyphEdgeCrop]
* @property {number}                 [glyphHeightToWidth]
* @property {number}                 [glyphVerticalSpacing]
* @property {boolean}                [glyphFlip]
* @property {number}                 [glyphRotation]      // radians
* 
* // — cursor & glint —
* @property {boolean}                [isolateCursor]
* @property {Colour}                 [cursorColor]
* @property {number}                 [cursorIntensity]
* @property {boolean}                [isolateGlint]
* @property {Colour}                 [glintColor]
* @property {number}                 [glintIntensity]
* 
* // — animation & timing —
* @property {number}                 [animationSpeed]
* @property {number}                 [fps]
* @property {number}                 [cycleSpeed]
* @property {number}                 [cycleFrameSkip]
* @property {number}                 [fallSpeed]
* @property {number}                 [forwardSpeed]
* @property {number}                 [raindropLength]
* @property {number}                 [slant]             // radians
* 
* // — optical effects —
* @property {number}                 [bloomStrength]
* @property {number}                 [bloomSize]
* @property {number}                 [highPassThreshold]
* @property {number}                 [baseBrightness]
* @property {number}                 [baseContrast]
* @property {number}                 [glintBrightness]
* @property {number}                 [glintContrast]
* @property {number}                 [brightnessOverride]
* @property {number}                 [brightnessThreshold]
* @property {number}                 [brightnessDecay]
* @property {number}                 [ditherMagnitude]
* @property {boolean}                [hasThunder]
* 
* // — geometry —
* @property {number}                 [numColumns]
* @property {number}                 [density]
* @property {boolean}                [isPolar]
* @property {'circle'|'box'|string|null} [rippleTypeName]
* @property {number}                 [rippleThickness]
* @property {number}                 [rippleScale]
* @property {number}                 [rippleSpeed]
* 
* // — colour mapping —
* @property {{ color: Colour, at: number }[]} [palette]
* @property {Colour[]}               [stripeColors]
* @property {Colour}                 [backgroundColor]
* @property {number}                 [glyphIntensity]
* 
* // — misc / experimental —
* @property {number}                 [resolution]
* @property {string|null}            [testFix]
* 
* // — React passthrough —
* @property {React.CSSProperties}    [style]
* @property {string}                 [className]
* 
* // — catch-all —
* @property {Record<string, unknown>} [key: string]
*/

/**
* @param {MatrixProps} props*/
export const Matrix = memo((props) => {
  const { style, className, ...rest } = props;
  const elProps = { style, className };
  const matrixRef = useRef(null);
  const rainRef = useRef(null);
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvasRef.current = canvas;

    return () => {
      if (canvasRef.current) {
        canvasRef.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    matrixRef.current.appendChild(canvasRef.current);
    const gl = canvasRef.current.getContext("webgl");
    createRain(canvasRef.current, makeConfig({ ...rest }), gl).then(
      (handles) => {
        rainRef.current = handles;
      }
    );

    return () => {
      if (rainRef.current) {
        destroyRain(rainRef.current);
      }
    };
  }, [props]);

  return <div ref={matrixRef} {...elProps}></div>;
});
