import { BrowserRouter } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { NavigationMenu } from "@shopify/app-bridge-react";
import Routes from "./Routes";

import {
  AppBridgeProvider,
  QueryProvider,
  PolarisProvider,
} from "./components";

export default function App() {
  // Any .tsx or .jsx files in /pages will become a route
  // See documentation for <Routes /> for more info
console.log("================================",location?.href)
let condition =location?.href.includes("/api/auth_callback")
const basename = condition ? '/api/auth_callback' : '';
console.log("dfghjm",basename)
  const pages = import.meta.globEager("./pages/**/!(*.test.[jt]sx)*.([jt]sx)");
  // const basePath = '/api/auth_callback' || '/api/app'   basename={basePath}
 
  const { t } = useTranslation();

  return (
    <PolarisProvider>
      <BrowserRouter basename={basename}>
        <AppBridgeProvider>
          <QueryProvider>
            <NavigationMenu
              navigationLinks={[
                {
                  label: t("NavigationMenu.setting"),
                  destination: "/setting",
                },
              ]}
            />
            <Routes pages={pages} />
          </QueryProvider>
        </AppBridgeProvider>
      </BrowserRouter>
    </PolarisProvider>
  );
  
}
