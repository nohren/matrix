import React, { useEffect, useRef } from "react";
import { createRain, destroyRain } from "./regl/main";
import config from "./utils/config";
/**
 * //TODO - add props based on the configs
 *
 */
export function DigitalRain({}) {
  const matrix = useRef(null);

  //effects on mount and unmount
  useEffect(() => {
    const canvas = document.createElement("canvas");
    matrix.current.appendChild(canvas);
    const gl = canvas.getContext("webgl");
    createRain(canvas, config({}), gl);

    return () => {
      destroyRain(gl, canvas);
    };
  }, []);

  return <div ref={matrix}></div>;
}
