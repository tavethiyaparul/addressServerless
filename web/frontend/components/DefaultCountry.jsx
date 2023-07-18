import { Card, DisplayText, Select, Text } from "@shopify/polaris";
import React, { useCallback, useState } from "react";
import Switch from "react-switch";

export default function DefaultCountry() {
  const [shippingCountry, setshippingCountry] = useState({
    setDefaultswitch: true,
    selectCountrySelect: "Australia",
  });

  const handleChange = (e, name) => {
    console.log("checked", shippingCountry, "ev ==", e, name);

    setshippingCountry({ ...shippingCountry, [name]: e });
  };

  const handleSelectChange1 = useCallback(
    (value) =>
      setshippingCountry({ ...shippingCountry, selectCountrySelect: value }),
    // setSelected(value),
    []
  );

  const options1 = [
    {
      label: "Australia",
      value: "Australia",
    },
    {
      label: "Canada",
      value: "Canada",
    },
    { label: "Argentina", value: "Argentina" },
  ];

  return (
    <div>
      <Card>
        <div style={{ padding: "10px" }}>
          <DisplayText size="small">Default Shipping Country</DisplayText>
          <hr></hr>
          <br></br>
          <div>
            <div
              className=""
              style={{
                display: "flex",
                gap: "10px",
                justifyContent: "space-between",
              }}
            >
              {/* <Text variant="headingXs" as="h6"> */}
              Set Default Country
              {/* </Text> */}
              <Switch
                // height={26}
                // width={50}
                onColor="#6ba4b6"
                uncheckedIcon={false}
                checkedIcon={false}
                onChange={(e) => handleChange(e, "setDefaultswitch")}
                checked={shippingCountry.setDefaultswitch}
                className="react-switch"
                name="setDefaultswitch"
              />
            </div>
            <div>
              <Select
                label="Select Default Country"
                options={options1}
                onChange={handleSelectChange1}
                value={shippingCountry.selectCountrySelect}
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
