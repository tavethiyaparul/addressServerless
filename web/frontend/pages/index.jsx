import {
  Card,
  Page,
  Layout,
  TextContainer,
  Image,
  Stack,
  Link,
  Text,
  DisplayText,
  Button,
  LegacyCard,
  Tabs,
  Frame,
  FooterHelp,
} from "@shopify/polaris";
import { useTranslation, Trans } from "react-i18next";

import { trophyImage } from "../assets";
import TopBarcomponent from "../components/TopBarcomponent";
import Addressvalidation from "../components/Addressvalidation";
import Setting from "./settingPage";
import { useCallback, useState } from "react";

export default function HomePage() {
  const { t } = useTranslation();
  const [selected, setSelected] = useState(0);

  const handleTabChange = useCallback(
    (selectedTabIndex) => setSelected(selectedTabIndex),
    []
  );

  const tabs = [
    {
      id: "dashboard",
      content: "Dashboard",
    },
    {
      id: "setting",
      content: "Setting",
    },
  ];

  const RenderComponent = ({ selected }) => {
    switch (selected) {
      case 0:
        return <Addressvalidation />;
      case 1:
        return <Setting />;
      default:
        return null;
    }
  };

  return (
    <Frame>
      <Page>
        <Layout>
          <TopBarcomponent />
        </Layout>
        <center>
          <DisplayText size="small">
            Addrexx Configurations for Shopify
          </DisplayText>
        </center>
        <br />

        <LegacyCard>
          <Tabs tabs={tabs} selected={selected} onSelect={handleTabChange}>
            <LegacyCard.Section>
              <RenderComponent selected={selected} />
            </LegacyCard.Section>
          </Tabs>
        </LegacyCard>
        <br />
        <br />
        <br />
      </Page>
      <div
        style={{
          position: "fixed",
          left: "0",
          bottom: "0",
          width: "100%",
          backgroundColor: "white",
          flexShrink: "0",
          textAlign: "center",
          borderTop: "1px solid #ddd",
          zIndex: "9999",
        }}
      >
        <FooterHelp>
          For support, suggestion and app related queries, feel free to email us on {" "}
          <Link
            external
            onClick={() =>
              typeof window !== undefined && window.open("mailto:dlc@addrexx.com", "_blank")
            }
          >
            {" "}
            dlc@addrexx.com
          </Link>
        </FooterHelp>
      </div>
    </Frame>
  );
}
