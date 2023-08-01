/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// API Getaway
// METHOD - GET
// DEPLOYMENT STAGE - /api
// ROUTE - /api/callback
// URL QUERY STRING PARAMETERS- shop
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ENV VARIABLES - HOST,SHOPIFY_API_KEY,SHOPIFY_API_SECRET
//                 SHOPIFY_SCOPE -write_script_tag,write_orders
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const AWS = require("aws-sdk"); // Load the AWS SDK for Node.js
const axios = require("axios");
exports.handler = async (event, context) => {
  const { shop } = event.queryStringParameters;

  console.log("shop", shop);

  const documentClient = new AWS.DynamoDB.DocumentClient();

  let allowedOrigins = `https://admin.shopify.com,https://${shop}`;

  const getParams = {
    TableName: "shopifyShopMaster",
    FilterExpression: "#name = :shopvalue AND #status = :statusValue ",
    ExpressionAttributeNames: {
      "#name": "shop",
      "#status": "status",
    },
    ExpressionAttributeValues: {
      ":shopvalue": shop,
      ":statusValue": "installed",
    },
  };

  let response = "";
  try {
    const data = await documentClient.scan(getParams).promise();
    console.log("data", JSON.stringify(data.Items));
    var res;
    if (data.Items.length > 0) {
      try {
        const gethtml = await axios.get(
          "https://xxerddasettings.s3.us-east-1.amazonaws.com/client/index.html"
        );
        console.log("html", gethtml);
        const htmlContent = gethtml.data;
        const response = {
          statusCode: 200,
          headers: {
            "Content-Type": "text/html",
            "Access-Control-Allow-Origin": "*",
            "x-frame-options": "ALLOW-FROM",
            "Content-Security-Policy": `frame-ancestors ${allowedOrigins}`,
          },
          body: htmlContent,
        };
        return response;
      } catch (error) {
        console.log("error", error);
        return {
          statusCode: 500,
          body: "Error: " + error.message,
        };
      }
    } else {
      const red_url = process.env.HOST + "/api/app";
      const url = await authUrl(shop, red_url);
      response = buildResponse(302, url);
      return response;
    }
  } catch (error) {
    console.log("error", error);
  }
  return response;

  async function authUrl(shop, REDIRECT_URL) {
    return (
      "https://" +
      shop +
      "/admin/oauth/authorize?client_id=" +
      process.env.SHOPIFY_API_KEY +
      "&scope=" +
      process.env.SHOPIFY_SCOPES +
      "&redirect_uri=" +
      REDIRECT_URL +
      "&access_mode=offline"
    );
  }

  function buildResponse(statusCode, redirectUrl) {
    return {
      statusCode: statusCode, // 302 Found - indicates a temporary redirect
      headers: {
        Location: redirectUrl, // Specify the target URL for the redirect
        "Access-Control-Allow-Origin": "*",
        "x-frame-options": "ALLOW-FROM",
        "Content-Security-Policy": `frame-ancestors ${allowedOrigins}`,
      },
    };
  }
};
