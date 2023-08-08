import {
  TextField,
  Spinner,
  Button,
  Toast,
} from "@shopify/polaris";
import React, { useEffect, useState } from "react";
import ReactSwitch from "react-switch";
import ColorModal from "../components/ColorModal";
import axios from "axios";
import { useAppBridge } from "@shopify/app-bridge-react";


const setting = () => {
  const app = useAppBridge();

  //  Toast for success and error message , loader
  const [toastFlag, setToastFlag] = useState({
    active: false,
    error: false,
    message: "",
  });

  const toastMarkup = toastFlag.active ? (
    <Toast
      content={toastFlag.message}
      error={toastFlag.error}
      onDismiss={() => {
        setToastFlag({ ...toastFlag, active: false });
      }}
    />
  ) : null;


  const [input, setInput] = useState({
    text_color: "",
    background_color: "",
  });

  
  const [value, setValue] = useState({
    size: "",
    afterTitle: "",
    bottomMargin: "",
    beforeTitle: "",
    topMargin: "",
    shop: "",
    usageChargePrice:"",
  });

  const [loader, setLoader] = useState(false);
  const [btnLoader, setBtnLoader] = useState(false);
  const handleChangeInputValue = (val, key) => {
    let temp = { ...input };
    temp[key] = val;
    setInput(temp);
  };

  const [script, setScript] = useState(false);
  const [colorPicker, setColorPicker] = useState({
    textColor: false,
    backgroundColor: false,
  });

  const handleChangeColorPicker = (key, val) => {
    const temp = { ...colorPicker };
    temp[key] = val;
    setColorPicker(temp);
  };

  const handleChangeEvent = (e, name) => {
    setValue({ ...value, [name]: e });
  };

  //get script api call
  const getScript = async () => {
    const headers = {
      'x-api-key': 'WCCVZwsyADEpXKtAxaRZ4P0ctah32qS7k4Usw5I0' 
    };
    await axios
      .get(
        `https://fbtu4zlun9.execute-api.us-east-1.amazonaws.com/api/script?shop=${window.shop}`,{ headers }
      )
      .then((res) => {
        setScript(res?.data?.[0]?.scriptStatus);
      })
      .catch((err) => {
        console.log("error", err);
        setToastFlag({
          active: true,
          error: true,
          message: "Something went wrong,please try again later!",
        });
      });
  };

  //create script api call
  const scriptSave = async (e) => {
    setScript(e);
    const headers = {
      'x-api-key': 'WCCVZwsyADEpXKtAxaRZ4P0ctah32qS7k4Usw5I0' 
    };
    await axios
      .post(
        `https://fbtu4zlun9.execute-api.us-east-1.amazonaws.com/api/script`,
        { shop: window.shop, scriptStatus: e },
        { headers }
      )
      .then((res) => {
        console.log("scriptSave", res.data.scriptStatus);
        setToastFlag({
          active: true,
          error: false,
          message: "Script saved successfully",
        });
      })
      .catch((err) => {
        console.log("error", err);
        setToastFlag({
          active: true,
          error: true,
          message: "Something went wrong,please try again later!",
        });
      });
  };

  //get setting api
  const getSetting = async () => {
    setLoader(true);
    const headers = {
      'x-api-key': 'WCCVZwsyADEpXKtAxaRZ4P0ctah32qS7k4Usw5I0' 
    };
    await axios
      .get(
        `https://fbtu4zlun9.execute-api.us-east-1.amazonaws.com/api/setting?shop=${window.shop}`,{ headers }
      )
      .then((res) => {
        setLoader(false);
        console.log("getSetting", res.data);
        setValue({
          size: res?.data[0]?.size,
          afterTitle: res?.data[0]?.afterTitle,
          bottomMargin: res?.data[0]?.bottomMargin,
          beforeTitle: res?.data[0]?.beforeTitle,
          topMargin: res?.data[0]?.topMargin,
          usageChargePrice:res?.data[0]?.usageChargePrice
        });
        setInput({
          text_color: res?.data[0]?.textColor,
          background_color: res?.data[0]?.backColor,
        });
      })
      .catch((err) => {
        setLoader(false);
        console.log("error", err);
        setToastFlag({
          active: true,
          error: true,
          message: "Something went wrong,please try again later!",
        });
      });
  };

  //create seeting api
  const settingSave = async () => {
    const data = {
      size: value?.size,
      afterTitle: value?.afterTitle,
      bottomMargin: value?.bottomMargin,
      beforeTitle: value?.beforeTitle,
      topMargin: value?.topMargin,
      textColor: input?.text_color,
      backColor: input?.background_color,
      shop: window.shop,
      usageChargePrice:value?.usageChargePrice
    };
    setBtnLoader(true);
    const headers = {
      'x-api-key': 'WCCVZwsyADEpXKtAxaRZ4P0ctah32qS7k4Usw5I0' 
    };
    await axios
      .post(
        `https://fbtu4zlun9.execute-api.us-east-1.amazonaws.com/api/setting`,
        data,
        { headers }
      )
      .then((res) => {
        setBtnLoader(false);
        console.log("settingSave", res);
        setToastFlag({
          active: true,
          error: false,
          message: "Save successfully",
        });
      })
      .catch((err) => {
        setBtnLoader(false);
        console.log("error", err);
        setToastFlag({
          active: true,
          error: true,
          message: "Something went wrong,please try again later!",
        });
      });
  };

  useEffect(() => {
    getScript();
  }, []);

  useEffect(() => {
    getSetting();
  }, []);

  return (
    <>
      {loader ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Spinner accessibilityLabel="Spinner example" size="large" />
        </div>
      ) : (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <p style={{ fontSize: "14px" }}>Script Tag Enable and Disable</p>
            <ReactSwitch
              onColor="#6ba4b6"
              uncheckedIcon
              checkedIcon
              onChange={(e) => scriptSave(e)}
              checked={script ? script : false}
            />
          </div>
          <br />
          <TextField
            label="Usage Charge Price"
            value={value?.usageChargePrice}
            onChange={(e) => handleChangeEvent(e, "usageChargePrice")}
            autoComplete="off"
          />
          <br />
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                width: "50%",
                position: "relative",
              }}
            >
              <p style={{ width: "39%" }}>Background Color </p>
              <div
                style={{
                  width: "70px",
                  cursor: "pointer",
                  height: "34px",
                  position: "relative",
                  backgroundColor: input?.background_color,
                  "&:hover": {
                    backgroundColor: input?.background_color,
                    boxShadow: "none",
                  },
                  borderRadius: "8px",
                  border: "1px solid #000",
                }}
                onClick={() => {
                  handleChangeColorPicker("backgroundColor", true);
                }}
              >
                {colorPicker?.backgroundColor && (
                  <ColorModal
                    colorKey={"background_color"}
                    title={"Choose Text Color"}
                    activeVal={colorPicker?.backgroundColor}
                    handleChange={() => {
                      handleChangeColorPicker("backgroundColor", false);
                    }}
                    inputValue={input?.background_color}
                    handleChangeInputValue={handleChangeInputValue}
                  />
                )}
              </div>
            </div>
            <br />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                width: "50%",
                position: "relative",
              }}
            >
              <p style={{ width: "39%" }}>Text Color </p>
              <div
                style={{
                  width: "70px",
                  cursor: "pointer",
                  height: "34px",
                  position: "relative",
                  backgroundColor: input?.text_color,
                  "&:hover": {
                    backgroundColor: input?.text_color,
                    boxShadow: "none",
                  },
                  borderRadius: "8px",
                  border: "1px solid #000",
                }}
                onClick={() => {
                  handleChangeColorPicker("textColor", true);
                }}
              >
                {colorPicker?.textColor && (
                  <ColorModal
                    colorKey={"text_color"}
                    title={"Choose Text Color"}
                    activeVal={colorPicker?.textColor}
                    handleChange={() => {
                      handleChangeColorPicker("textColor", false);
                    }}
                    inputValue={input?.text_color}
                    handleChangeInputValue={handleChangeInputValue}
                  />
                )}
              </div>
            </div>
          </div>
          <br />
          <TextField
            label="Size"
            value={value?.size}
            onChange={(e) => handleChangeEvent(e, "size")}
            autoComplete="off"
          />
          <br />
          <TextField
            label="Before Title Text"
            value={value?.beforeTitle}
            onChange={(e) => handleChangeEvent(e, "beforeTitle")}
            autoComplete="off"
          />
          <br />
          <TextField
            label="After Title Text"
            value={value?.afterTitle}
            onChange={(e) => handleChangeEvent(e, "afterTitle")}
            autoComplete="off"
          />
          <br />
          <TextField
            label="Margin Top"
            value={value?.topMargin}
            onChange={(e) => handleChangeEvent(e, "topMargin")}
            autoComplete="off"
          />
          <br />
          <TextField
            label="Margin Bottom"
            value={value?.bottomMargin}
            onChange={(e) => handleChangeEvent(e, "bottomMargin")}
            autoComplete="off"
          />
          <br />

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button loading={btnLoader} primary onClick={() => settingSave()}>
              save
            </Button>
          </div>
        </div>
      )}
      {toastMarkup}
    </>
  );
};

export default setting;
