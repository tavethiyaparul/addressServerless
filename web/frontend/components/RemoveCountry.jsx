import {
  Autocomplete,
  Card,
  DisplayText,
  LegacyStack,
  Select,
  Tag,
  Text,
} from "@shopify/polaris";
import React, { useCallback, useMemo, useState } from "react";
import Switch from "react-switch";

export default function RemoveCountry() {
  const [removeCountry, setremoveCountry] = useState({
    limitedCountries: true,
    selectCountryDropdown: ["Australia"],
  });

  const deselectedOptions = useMemo(
    () => [
      {
        label: "Australia",
        value: "Australia",
      },
      {
        label: "Canada",
        value: "Canada",
      },
      { label: "Argentina", value: "Argentina" },
    ],
    []
  );
  const [selectedOptions, setSelectedOptions] = useState(["Canada"]);
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState(deselectedOptions);

  const updateText = useCallback(
    (value) => {
      setInputValue(value);

      if (value === "") {
        setOptions(deselectedOptions);
        return;
      }

      const filterRegex = new RegExp(value, "i");
      const resultOptions = deselectedOptions.filter((option) =>
        option.label.match(filterRegex)
      );

      setOptions(resultOptions);
    },
    [deselectedOptions]
  );

  const removeTag = useCallback(
    (tag) => () => {
      const options = [...selectedOptions];
      options.splice(options.indexOf(tag), 1);
      setSelectedOptions(options);
    },
    [selectedOptions]
  );

  const verticalContentMarkup =
    selectedOptions.length > 0 ? (
      <LegacyStack spacing="extraTight" alignment="center">
        {selectedOptions.map((option) => {
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

  const handleChange = (e, name) => {
    console.log("checked", removeCountry, "ev ==", e, name);

    setremoveCountry({ ...removeCountry, [name]: e });
  };

  return (
    <div>
      <Card>
        <div style={{ padding: "10px" }}>
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
              {/* <Text variant="headingXs" as="h6"> */}
              Limit options Shown in Country Dropdown
              {/* </Text> */}
              <Switch
                // height={26}
                // width={50}
                onColor="#6ba4b6"
                uncheckedIcon={false}
                checkedIcon={false}
                onChange={(e) => handleChange(e, "limitedCountries")}
                checked={removeCountry.limitedCountries}
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
            {/* <div>
              <Select
                label="Limit options Shown in Country Dropdown"
                options={options1}
                onChange={handleSelectChange1}
                value={removeCountry.selectCountrySelect}
              />
            </div> */}
          </div>
        </div>
      </Card>
    </div>
  );

  function titleCase(string) {
    return string
      .toLowerCase()
      .split(" ")
      .map((word) => word.replace(word[0], word[0].toUpperCase()))
      .join("");
  }
}
