///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// API Getaway
// METHOD - GET
// DEPLOYMENT STAGE - /api
// ROUTE - /api/paymentcreate
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ENV VARIABLES -CAPPED_AMOUNT-1000, HOST,SHOPIFY_API_VERSION - 2023-01,PRICE-0, TERMS-Usage charge will be charged per order, TEST-true, TRIAL-0
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const AWS = require("aws-sdk"); // Load the AWS SDK for Node.js
const axios = require("axios");
exports.handler = async (event) => {
  const documentClient = new AWS.DynamoDB.DocumentClient();
  console.log("test-etsy-app.myshopify.com", event);
  const { shop } = event.queryStringParameters;

  let response = "";
  let allowedOrigins = "";
  const headers = event.headers || {};
  console.log("headers", headers);
  // Extract the origin domain from the 'origin' header
  const originDomain = headers.origin
    ? headers.origin.replace(/^https?:\/\//, "")
    : null;
  // Now you have the origin domain in the 'originDomain' variable
  console.log("Request received from domain:", originDomain);

  if (originDomain == event?.queryStringParameters?.shop) {
    allowedOrigins = "https://" + event?.queryStringParameters?.shop;
  } else if (originDomain == "admin.shopify.com") {
    allowedOrigins = "https://admin.shopify.com";
  }

  const getShopIdParams = {
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
  try {
    const data = await documentClient.scan(getShopIdParams).promise();

    console.log("data==============================", JSON.stringify(data));
    if (data.Items.length > 0) {
      const shopGet = data.Items[0];
      const accessToken = data.Items[0].access_token;
      console.log("accessToken===========", accessToken);

      const url = `https://${shop}/admin/api/${process.env.SHOPIFY_API_VERSION}/graphql.json`;

      var test_charge = process.env.TEST;
      var trial_days = process.env.TRIAL;

      const query = `mutation {
                appSubscriptionCreate(
                  name: "PREMIUM"
                  returnUrl: "${process.env.HOST}/api/paymentConfirmation?shop=${shop}"
                  test: ${test_charge}
                  lineItems: [{
                    plan: {
                      appUsagePricingDetails: {
                        terms:"${process.env.TERMS}"
                        cappedAmount: { amount: ${process.env.CAPPED_AMOUNT}, currencyCode: USD }
                      }
                    }
                  }]
                ){
                  userErrors {
                    field
                    message
                  }
                  confirmationUrl
                  appSubscription {
                    createdAt
                    returnUrl
                    status
                    test
                    trialDays
                    currentPeriodEnd
                    name
                    id
                    lineItems {
                      id
                      plan {
                        pricingDetails {
                          __typename
                        }
                      }
                    }
                  }
                }
              }`;

      const result = await POST_API(url, accessToken, query);
      console.log("ans for product Detail is ", result);
      response = buildResponse(
        302,
        result?.data?.appSubscriptionCreate?.confirmationUrl
      );
    }
  } catch (error) {
    console.log("error", error);
    response = buildResponse(403, `Unable to get item: ${error}`);
  }

  return response;

  function buildResponse(statusCode, redirectUrl) {
    return {
      statusCode: statusCode,
      headers: {
        Location: redirectUrl,
        "Access-Control-Allow-Origin": allowedOrigins,
        "x-frame-options": "ALLOW-FROM",
        "Content-Security-Policy": `frame-ancestors ${allowedOrigins}`,
      },
    };
  }
};

async function POST_API(url, accessToken, data) {
  try {
    const answer = await axios({
      url,
      method: "POST",
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/graphql",
      },
      responseType: "json",
      data,
    });

    console.log(
      "answeransweransweranswer============",
      JSON.stringify(answer.data)
    );
    return answer.data;
  } catch (error) {
    console.log("error in post api of GraphQl------", error);
    return error.data;
  }
}
