import { LegacyCard, Tabs } from "@shopify/polaris";
import { React, useState, useCallback } from "react";

export default function TabComponents() {
  const [selected, setSelected] = useState(0);

  const handleTabChange = useCallback(
    (selectedTabIndex) => setSelected(selectedTabIndex),
    []
  );

  const tabs = [
    {
      id: "Dashboard-1",
      content: "Dashboard content",
      accessibilityLabel: "Dashboard",
      panelID: "dashboard",
    },
    {
      id: "Address-Config-1",
      content: "Address Config content",
      panelID: "Address Config",
    },
    {
      id: "Payment-Settings-1",
      content: "Payment Settings content",
      panelID: "Payment-Settings-1",
    },
    // {
    //   id: "prospects-1",
    //   content: "Prospects",
    //   panelID: "prospects-content-1",
    // },
  ];

  return (
    <Tabs tabs={tabs} selected={selected} onSelect={handleTabChange}>
      <LegacyCard.Section title={tabs[selected].content}>
        <p>Tab {selected} selected</p>
      </LegacyCard.Section>
    </Tabs>
  );
}
