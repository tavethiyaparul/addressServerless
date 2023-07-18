import { React } from "react";
import { useNavigate } from "react-router-dom";
import { Page, Text, Box, Card, Button, Link } from "@shopify/polaris";

export default function Support() {
  const navigate = useNavigate();

  return (
    <>
      <Page>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <div onClick={() => navigate("/")}>
            <a
              data-polaris-unstyled="true"
              className="Polaris-Breadcrumbs__Breadcrumb Polaris-Breadcrumbs--newDesignLanguage"
              href="#"
            >
              <span className="Polaris-Breadcrumbs__ContentWrapper">
                <span className="Polaris-Breadcrumbs__Icon">
                  <span className="Polaris-Icon Polaris-Icon--newDesignLanguage">
                    <svg
                      viewBox="0 0 20 20"
                      className="Polaris-Icon__Svg"
                      focusable="false"
                      aria-hidden="true"
                    >
                      <path d="M17 9H5.414l3.293-3.293a.999.999 0 1 0-1.414-1.414l-5 5a.999.999 0 0 0 0 1.414l5 5a.997.997 0 0 0 1.414 0 .999.999 0 0 0 0-1.414L5.414 11H17a1 1 0 1 0 0-2z"></path>
                    </svg>
                  </span>
                </span>
                <span className="Polaris-VisuallyHidden">Home</span>
              </span>
            </a>
          </div>
          <div>
            <Text variant="headingLg" as="h1">
              Support
            </Text>
          </div>
        </div>
        <Box>
          <div style={{ marginTop: "16px" }}>
            <Card>
              <div
                style={{
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                <div>
                  <Text variant="headingMd" as="h2">
                    Need help?
                  </Text>
                </div>
                <div>
                  <Text variant="bodyMd" as="p">
                    Whether it's design customizations or a question about Auto
                    Add to Cart, we're always happy to help.
                  </Text>
                </div>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <Button>Contact Support</Button>
                  <div style={{ marginLeft: "16px" }}>
                    <Link to="https://www.google.com">Documentation home</Link>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </Box>
      </Page>
    </>
  );
}
