import React from 'react'
import TopBarcomponent from "../components/TopBarcomponent";
import Addressvalidation from "../components/Addressvalidation";
import DefaultCountry from "../components/DefaultCountry";
import RemoveCountry from "../components/RemoveCountry";
import { DisplayText, Layout, Page } from '@shopify/polaris';

const dashboard = () => {
  return (
   <>
     <Page narrowWidth>
      <Layout>
           <TopBarcomponent />
      </Layout>
      <center>
        <DisplayText size="small">
          Addrexx Configurations for Shopify
        </DisplayText>
      </center>
      <br />
      <div style={{ display: "block", flexDirection: "" }}>
        <Addressvalidation />
        <br />
        <DefaultCountry />
        <br />
        <RemoveCountry />
      </div>

    </Page>
   </>
  )
}

export default dashboard