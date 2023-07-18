import { Autocomplete, Spinner, DisplayText, LegacyStack, Tag, Text,Button, LegacyCard } from "@shopify/polaris";
import React, { useState, useCallback, useMemo, useEffect } from "react";
import Switch from "react-switch";
import { Select } from "@shopify/polaris";
import axios from "axios";
import { useAppBridge } from "@shopify/app-bridge-react";
import country from "../basicfunction/country.json"

export default function Addressvalidation() {
  const app = useAppBridge();
 
  console.log("app=========",app.shop);
  const [loader, setLoader] = useState(false);
  const [btnLoader,setBtnLoader] = useState(false);
  // const [checked, setchecked] = useState(true);
  console.log("country",country)

  const updatedCountries = country?.map((country, i) => {
    return {
      label: country.name,
      value: country.name,
      
    };
  });
  console.log("updatedCountries",updatedCountries)
  const [addressValue, setaddressValue] = useState({
    enableAutofill: true,
    restrictShipment: true,
    basedCharacters: true,
    appendZip: true,
    missingApartments: true,
    autoCompleteValidate: true,
    capitalizedAddress: "CapitalizeAddress",
    addressLimits: "Do Not Limit",
    setDefaultswitch: true,
    selectCountrySelect: "Australia",
    limitedCountries:true,
    selectCountryDropdown: [],
  });

  const handleChange = (e, name) => {
    setaddressValue({ ...addressValue, [name]: e });
    // if (addressValue.checkBox2 == true) {
    //   setaddressValue({ ...addressValue, checkBox2: false });
    // } else {
    //   setaddressValue({ ...addressValue, checkBox2: true });
    // }
  };
  console.log("checked", addressValue);

  const options1 = [
    {
      label: "Capitalize Addresses (First Character Only)",
      value: "CapitalizeAddress",
    },
    {
      label: "Uppercase Addresses",
      value: "UppercaseAddress",
    },
    { label: "Lowercase Addresses", value: "LowercaseAddress" },
  ];
  const options2 = [
    {
      label: "Do Not Limit",
      value: "Do Not Limit",
    },
    {
      label: "Add Limit",
      value: "Add Limit",
    },
  ];

  const options11 = [
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


  // const [removeCountry, setremoveCountry] = useState({
  //   limitedCountries: true,
  //   selectCountryDropdown: ["Australia"],
  // });

  const deselectedOptions =  [
      {
        label: "Australia",
        value: "Australia",
      },
      {
        label: "Canada",
        value: "Canada",
      },
      { label: "Argentina", value: "Argentina" },
    ]
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState(updatedCountries);
console.log("options",options)
  const updateText = useCallback(
    (value) => {
      setInputValue(value);

      if (value === "") {
        setOptions(updatedCountries);
        return;
      }

      const filterRegex = new RegExp(value, "i");
      const resultOptions = updatedCountries?.filter((option) =>
        option.label.match(filterRegex)
      );

      setOptions(resultOptions);
    },
    [updatedCountries]
  );

  const removeTag = useCallback(
    (tag) => () => {
      const options = [...selectedOptions];
      options?.splice(options?.indexOf(tag), 1);
      setSelectedOptions(options);
    },
    [selectedOptions]
  );

  const verticalContentMarkup =
    selectedOptions?.length > 0 ? (
      <LegacyStack spacing="extraTight" alignment="center">
        {selectedOptions?.map((option) => {
          let tagLabel = "";
          tagLabel = option.replace("_", " ");
          tagLabel = titleCase(tagLabel);
          return (
            <Tag key={`option${option}`} onRemove={removeTag(option)}>
              {tagLabel}
            </Tag>
          );
        })}
      </LegacyStack>
    ) : null;

  const textField = (
    <Autocomplete.TextField
      onChange={updateText}
      label="Selected Countries will be Excluded from Dropdown"
      value={inputValue}
      placeholder="Select Countries"
      verticalContent={verticalContentMarkup}
      autoComplete="off"
    />
  );

  const options123 = [
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

  // const handleChangeRemove = (e, name) => {
  //   console.log("checked", removeCountry, "ev ==", e, name);

  //   setremoveCountry({ ...removeCountry, [name]: e });
  // };

  const getAddressValidation=async()=>{
    setLoader(true);
    await axios
      .get(
        `https://fbtu4zlun9.execute-api.us-east-1.amazonaws.com/api/addressvalidation?shop=${window.shop}`
      )
      .then((res) => {
        setLoader(false);
        console.log("getAddressValidation", res?.data);
        setaddressValue({
          enableAutofill: res?.data[0]?.autoFill,
          restrictShipment:res?.data[0]?.shipmentPO ,
          basedCharacters: res?.data[0]?.latinCharacters,
          appendZip: res?.data[0]?.postalCode,
          missingApartments: res?.data[0]?.missingApartment,
          autoCompleteValidate: res?.data[0]?.validateApartment,
          capitalizedAddress: res?.data[0]?.capitalizeAddress,
          addressLimits: res?.data[0]?.limitNoOfCharacters,
          setDefaultswitch: res?.data[0]?.setDefaultCountry,
          selectCountrySelect: res?.data[0]?.selectDefaultCountry,
          limitedCountries:res?.data[0]?.limitOptionCountry,
          // selectCountryDropdown:res?.data[0]?.countriesExcluded,
        })
        setSelectedOptions(res?.data[0]?.countriesExcluded?res?.data[0]?.countriesExcluded:[])
      })
      .catch((err) => {
        console.log("error", err);
        setLoader(false);
      });
  }

  const addressValidationSave = async () => {
    const data = {
      autoFill:addressValue.enableAutofill,
      shipmentPO:addressValue.restrictShipment,
      latinCharacters:addressValue.basedCharacters,
      postalCode:addressValue.appendZip,
      capitalizeAddress:addressValue.capitalizedAddress,
      limitNoOfCharacters:addressValue.addressLimits,
      missingApartment:addressValue.missingApartments,
      validateApartment:addressValue.autoCompleteValidate,
      shop:window.shop,
      // shop:"ram.myshopify.com",
      setDefaultCountry:addressValue.setDefaultswitch,
      selectDefaultCountry:addressValue.selectCountrySelect,
      limitOptionCountry:addressValue.limitedCountries,
      countriesExcluded:selectedOptions
    }

    setBtnLoader(true);
    await axios
      .post(
        `https://fbtu4zlun9.execute-api.us-east-1.amazonaws.com/api/addressvalidation`,
        data
      )
      .then((res) => {
        setBtnLoader(false);
        console.log("addressValidationSave ", res?.data);
      })
      .catch((err) => {
        setBtnLoader(false);
        console.log("error", err);
      });
  };
  useEffect(() => {
    getAddressValidation()
  }, [])
  

  return (
   <>
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
      <div style={{ padding: "10px" }}>
      <LegacyCard sectioned>
        <DisplayText size="small">
          General Address Validation Options
        </DisplayText>
        <hr></hr>
        <br></br>
       
        <div style={{ display: "grid", gap: "10px" }}>
          <div
            className=""
            style={{
              display: "flex",
              gap: "10px",
              justifyContent: "space-between",
            }}
          >
            {/* <Text variant="headingXs" as="h6"> */}
            Enable Autofill of both First and Last Name
            {/* </Text> */}
            <Switch   
              onColor="#6ba4b6"
              uncheckedIcon={false}
              checkedIcon={false}
              onChange={(e) => handleChange(e, "enableAutofill")}
              checked={addressValue?.enableAutofill}
              className="react-switch"
              name="checkBox1"
            />
          </div>

          <div
            style={{
              display: "flex",
              gap: "10px",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {/* <Text variant="headingXs" as="h6"> */}
            Restrict shipment to PO Boxes
            {/* </Text> */}
            <Switch
              // height={26}
              // width={50}
              onColor="#6ba4b6"
              uncheckedIcon={false}
              checkedIcon={false}
              onChange={(e) => handleChange(e, "restrictShipment")}
              checked={addressValue?.restrictShipment}
              className="react-switch"
            />
          </div>

          <div
            style={{
              display: "flex",
              gap: "10px",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {/* <Text variant="headingXs" as="h6"> */}
            Restrict non latin based characters
            {/* </Text> */}
            <Switch
              // height={26}
              // width={50}
              onColor="#6ba4b6"
              uncheckedIcon={false}
              checkedIcon={false}
              onChange={(e) => handleChange(e, "basedCharacters")}
              checked={addressValue?.basedCharacters}
              className="react-switch"
            />
          </div>

          <div
            style={{
              display: "flex",
              gap: "10px",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {/* <Text variant="headingXs" as="h6"> */}
            Append Zip+4 Postal Code (U.S. only)
            {/* </Text> */}
            <Switch
              // height={26}
              // width={50}
              onColor="#6ba4b6"
              uncheckedIcon={false}
              checkedIcon={false}
              onChange={(e) => handleChange(e, "appendZip")}
              checked={addressValue?.appendZip}
              className="react-switch"
            />
          </div>

          <div>
            <Select
              label="Capitalize address"
              placeholder="select"
              options={options1}
              onChange={(e)=>{handleChange(e,"capitalizedAddress")}}
              value={addressValue?.capitalizedAddress}
            />
          </div>

          <div>
            <Select
             placeholder="select"
              label="Limit Numbers of Characters in Adderss Line1 and Address Line2"
              options={options2}
              onChange={(e)=>{handleChange(e,"addressLimits")}}
              value={addressValue.addressLimits}
            />
          </div>

          <div
            style={{
              display: "flex",
              gap: "10px",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {/* <Text variant="headingXs" as="h6"> */}
            Check for Missing Apartments & Stuites
            {/* </Text> */}
            <Switch
              // height={26}
              // width={50}
              onColor="#6ba4b6"
              uncheckedIcon={false}
              checkedIcon={false}
              onChange={(e) => handleChange(e, "missingApartments")}
              checked={addressValue?.missingApartments}
              className="react-switch"
            />
          </div>

          <div
            style={{
              display: "flex",
              gap: "10px",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {/* <Text variant="headingXs" as="h6"> */}
              Autocomplete and Validate Apartment & Suites
            {/* </Text> */}
            <Switch
              onColor="#6ba4b6"
              uncheckedIcon={false}
              checkedIcon={false}
              onChange={(e) => handleChange(e, "autoCompleteValidate")}
              checked={addressValue?.autoCompleteValidate}
              className="react-switch"
            />
          </div>
        </div>
        </LegacyCard>
      </div>

      <div style={{ padding: "10px" }}>
      <LegacyCard sectioned>
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
                checked={addressValue.setDefaultswitch}
                className="react-switch"
                name="setDefaultswitch"
              />
            </div>
            <div>
              <Select
              placeholder="select"
                label="Select Default Country"
                options={options1}
                onChange={(e)=>{handleChange(e,"selectCountrySelect")}}
                value={addressValue.selectCountrySelect}
              />
            </div>
          </div>
       </LegacyCard>  
        </div>


        <div style={{ padding: "10px" }}>
        <LegacyCard sectioned>
          <DisplayText size="small">
            Remove The Following Countries from the Country Dropdown List
          </DisplayText>
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
       
              Limit options Shown in Country Dropdown
           
              <Switch
                
                onColor="#6ba4b6"
                uncheckedIcon={false}
                checkedIcon={false}
                onChange={(e) => handleChange(e, "limitedCountries")}
                checked={addressValue.limitedCountries}
                className="react-switch"
                name="limitedCountries"
              />
            </div>
            <div style={{ height: "auto" }}>
              <Autocomplete
                allowMultiple
                options={options}
                selected={selectedOptions}
                textField={textField}
                onSelect={setSelectedOptions}
                listTitle="Suggested Tags"
              />
            </div>
          </div>
          <br />
          <Button loading={btnLoader} onClick={()=>addressValidationSave()}>Save</Button>
          </LegacyCard>
          
        </div>
    </div>
    )}
    </>
  );
}

function titleCase(string) {
  return string
    .toLowerCase()
    .split(" ")
    .map((word) => word?.replace(word[0], word[0]?.toUpperCase()))
    .join("");
}
