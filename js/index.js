import React from "react";
import { createRoot } from "react-dom/client";
import { Matrix } from "./Matrix";
//import { Matrix } from "react-matrix-rain";

const root = createRoot(document.getElementById("root"));
let idx = 1;
const versions = [
  "3d",
  "trinity",
  "bugs",
  "megacity",
  "nightmare",
  "paradise",
  "resurrections",
  "operator",
  "holoplay",
  "throwback",
  "updated",
  "1999",
  "2003",
  "2021",
];



const App = () => {
  const [version, setVersion] = React.useState(versions[0]);
  const [cursorColor, setCursorColor] = React.useState("1,0,0");
  const [density, setDensity] = React.useState(2);
  const onChange = (e) => {
    const { value } = e.target;
    if (e.target.type === "text") {
      if (value.split(",").length !== 3) {
        setCursorColor("1,0,0");
        return;
      }
      setCursorColor(value);
    } else if (e.target.type === "range") {
      setDensity(value);
    }
  }
  // const [number, setNumber] = React.useState(0);
  // const onButtonClick = (version) => {
  //   setVersion((s) => {
  //     const newVersion = versions[idx];
  //     idx = (idx + 1) % versions.length;
  //     console.log(newVersion);
  //     return newVersion;
  //   });
  // };
  // const newNum = () => setNumber((n) => n + 1);
  // console.log("version", version);
  // console.log("num", number);

  return (
    <div>
      <h1>Rain</h1>
      <span>Versions: </span>
      {versions.map((version,i) => <button key={i} onClick={() => setVersion(version)}>{version}</button>)}
      <div>Cursor Color: <input onChange={onChange} value={cursorColor} placeholder="1,0,0"/></div>
      <div>Density: <input min="0.1" max="20" onChange={onChange} value={density} type="range"/>{density}</div>
      {/* <button onClick={newNum}>change number</button> */}
      <Matrix version={version} cursorColor={cursorColor} density={density} />
    </div>
  );
};
root.render(<App />);
