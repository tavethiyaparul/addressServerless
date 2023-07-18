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
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useTranslation, Trans } from "react-i18next";

import { trophyImage } from "../assets";
// import { ProductsCard } from "../components";
// import TabComponents from "../components/TabComponents";
import TopBarcomponent from "../components/TopBarcomponent";
import Addressvalidation from "../components/Addressvalidation";
import DefaultCountry from "../components/DefaultCountry";
import RemoveCountry from "../components/RemoveCountry";

export default function HomePage() {
  const { t } = useTranslation();
  return (
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
      <div>
        <Addressvalidation />
        <br />
        {/* <DefaultCountry /> */}
        {/* <br /> */}
        {/* <RemoveCountry /> */}
        {/* <br /> */}
       
      </div>

    </Page>
  );
}
