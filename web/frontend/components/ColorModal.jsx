import React, { useEffect, useRef } from "react";
import { ChromePicker } from "react-color";

export default function ColorModal(props) {
  const colorPickerRef = useRef(null);

  const handleClickOutside = (event) => {
    if (colorPickerRef.current && !colorPickerRef.current.contains(event.target)) {
      props?.handleChange()
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [colorPickerRef, props?.inputValue]);

  const colorPicker = (e) => {
    const newColor = {
      hex: e.hex,
      rgb: "(" + e.rgb.r + "," + e.rgb.g + "," + e.rgb.b + "," + e.rgb.a + ")",
    };
    props?.handleChangeInputValue(newColor?.hex, props?.colorKey);
  };
  return (
    <>
      {props?.activeVal && (
        <div style={{    zIndex: "99",
    position: "absolute",
    left: "70px"}} ref={colorPickerRef} >
          <ChromePicker
            color={props?.inputValue !== null && props?.inputValue}
            onChange={(e) => {
              colorPicker(e);
            }}
            disableAlpha
            renderers={false}
          />
        </div>
      )}
    </>
  );
}
