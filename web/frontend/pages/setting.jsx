import {
  LegacyCard,
  Text,
  Page,
  TextField,
  DisplayText,
  Spinner,
  Button,
  Layout,
} from "@shopify/polaris";
import React, { useEffect, useState } from "react";
import ReactSwitch from "react-switch";
import ColorModal from "../components/ColorModal";
import axios from "axios";
import { useAppBridge } from "@shopify/app-bridge-react";
import TopBarcomponent from "../components/TopBarcomponent";

const setting = () => {
  const app = useAppBridge();
  console.log("app", app.hostOrigin.split("//")[1]);

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

  console.log("script ______________________________", script);
  const getScript = async () => {
    await axios
      .get(
        `https://fbtu4zlun9.execute-api.us-east-1.amazonaws.com/api/script?shop=${window.shop}`
      )
      .then((res) => {
        console.log("getScript", res?.data?.[0]?.scriptStatus);

        setScript(res?.data?.[0]?.scriptStatus);
      })
      .catch((err) => {
        console.log("error", err);
      });
  };

  const scriptSave =  async(e) => {
    console.log("cvbnm,================.",e)
    setScript(e)
    await axios
      .post(
        `https://fbtu4zlun9.execute-api.us-east-1.amazonaws.com/api/script`,
        { shop: window.shop, scriptStatus: e }
      )
      .then((res) => {
        // setScript(res.data.scriptStatus);
        console.log("scriptSave", res.data.scriptStatus);
      })
      .catch((err) => {
        console.log("error", err);
      });
  };

  const getSetting = async () => {
    setLoader(true);
    await axios
      .get(
        `https://fbtu4zlun9.execute-api.us-east-1.amazonaws.com/api/setting?shop=${
          window.shop
        }`
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
        });
        setInput({
          text_color: res?.data[0]?.textColor,
          background_color: res?.data[0]?.backColor,
        });
      })
      .catch((err) => {
        console.log("error", err);
        setLoader(false);
      });
  };

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
    };
    setBtnLoader(true);
    await axios
      .post(
        `https://fbtu4zlun9.execute-api.us-east-1.amazonaws.com/api/setting`,
        data
      )
      .then((res) => {
        setBtnLoader(false);
        console.log("settingSave", res);
      })
      .catch((err) => {
        setBtnLoader(false);
        console.log("error", err);
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
      <Page>
        <Layout>
          <TopBarcomponent />
        </Layout>
        {loader ? (
          <div
            style={{
              height: "100vh",
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
            <center>
              <p
                style={{
                  fontSize: "25px",
                  marginBottom: "30px",
                  marginTop: "10px",
                }}
              >
                Display Setting
              </p>
            </center>
            <LegacyCard sectioned>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <p style={{ fontSize: "14px" }}>
                  Script Tag Enable and Disable
                </p>
                <ReactSwitch
                  onColor="#6ba4b6"
                  uncheckedIcon
                  checkedIcon
                  onChange={(e)=>scriptSave(e)}
                  checked={script?script:false} 
                />
              </div>
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
              {/* <button
              style={{ background: "#6ba4b6", width: "60px", height: "35px" }}
              onClick={() => settingSave()}
            >
              Save
            </button> */}
              <Button loading={btnLoader} onClick={() => settingSave()}>
                save
              </Button>
            </LegacyCard>
          </div>
        )}
      </Page>
    </>
  );
};

export default setting;
