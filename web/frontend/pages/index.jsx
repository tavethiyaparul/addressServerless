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
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useTranslation, Trans } from "react-i18next";

import { trophyImage } from "../assets";
// import { ProductsCard } from "../components";
// import TabComponents from "../components/TabComponents";
import TopBarcomponent from "../components/TopBarcomponent";
import Addressvalidation from "../components/Addressvalidation";

export default function HomePage() {
  const { t } = useTranslation();
  return (
    <Page narrowWidth>
      <Layout>
        {/* <Layout.Section> */}
        <TopBarcomponent />

        {/* </Layout.Section> */}
      </Layout>
      {/* <Card> */}
      <DisplayText size="medium">
        Addrexx Configurations for Shopify
      </DisplayText>
      <Addressvalidation />

      {/* </Card> */}
    </Page>
  );
}
