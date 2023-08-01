/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// API Getaway
// METHOD - ANY
// DEPLOYMENT STAGE - /api
// ROUTE - /api/paymentConfirmation
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ENV VARIABLES - HOST,SHOPIFY_API_VERSION - 2023-01
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const AWS = require("aws-sdk"); // Load the AWS SDK for Node.js
const axios = require("axios");
exports.handler = async (event) => {
  console.log("event", event);
  const documentClient = new AWS.DynamoDB.DocumentClient();

  const shop = event.queryStringParameters.shop;
  const charge_id = event.queryStringParameters.charge_id;
  let response = "";
  // let allowedOrigins = "*";

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
  try {
    const data = await documentClient.scan(getParams).promise();
    const accessToken = data.Items[0].access_token;
    console.log("data", accessToken);
    if (data.Items.length > 0) {
      const recurringURL = `https://${shop}/admin/api/${process.env.SHOPIFY_API_VERSION}/recurring_application_charges/${charge_id}.json`;

      const resRecurring = await axios.get(recurringURL, {
        headers: {
          "X-Shopify-Access-Token": accessToken,
        },
      });

      console.log("-------------------------------", resRecurring.data);
      if (resRecurring.data.recurring_application_charge.status === "active") {
        const usageChargeId = await getActiveUsageSubscriptionLineItemId(
          shop,
          accessToken,
          charge_id
        );
        console.log("111111111111111111111111111111", charge_id, usageChargeId);
        const params = {
          TableName: "shopifyShopMaster",
          Key: { shop: shop },
          UpdateExpression:
            "SET #payment_charge_id = :payment_charge_id, #payment_status= :payment_status,#usage_charge_id=:usage_charge_id",
          ExpressionAttributeNames: {
            "#payment_charge_id": "payment_charge_id",
            "#payment_status": "payment_status",
            "#usage_charge_id": "usage_charge_id",
          },
          ExpressionAttributeValues: {
            ":payment_charge_id": charge_id,
            ":payment_status": "AcceptedUsageCharge",
            ":usage_charge_id": usageChargeId,
          },
          ReturnValues: "ALL_NEW",
        };

        try {
          const update = await documentClient.update(params).promise();
          console.log("update data", update);
          return (response = buildResponse(
            302,
            `${process.env.HOST}/api/callback?shop=${shop}&host=${data?.Items[0]?.hostName}`
          ));
        } catch (err) {
          response = buildResponse(403, `Unable to put item: ${err}`);
        }
      }
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
        "Access-Control-Allow-Origin": "*",
        // 'x-frame-options':'ALLOW-FROM',
        // 'Content-Security-Policy': `frame-ancestors ${allowedOrigins}`,
      },
    };
  }
};
const getActiveUsageSubscriptionLineItemId = async (
  shop,
  access_token,
  charge_id
) => {
  console.log("in get Active Usage Subscription LineItemId", charge_id);
  let app_usage_line_item_id = "";
  const query = `{
        appInstallation {
          activeSubscriptions {
                status
                id
                  lineItems {
                  id
                  plan {
                  pricingDetails {
                      __typename
                      ... on AppRecurringPricing {
                          __typename
                          price {
                          amount
                          currencyCode
                          }
                      }
                      ...on AppUsagePricing {
                      terms
                      cappedAmount {
                          amount
                          currencyCode
      
                      }
                      balanceUsed {
                          amount
                          currencyCode
                      }
                      }
                  }
                  }
              }
          }
        }
      }`;
  const url = String(
    `https://${shop}/admin/api/${process.env.SHOPIFY_API_VERSION}/graphql.json`
  );
  let res = await POST_API(url, access_token, query);
  console.log(
    "res subscription",
    JSON.stringify(res?.data?.appInstallation?.activeSubscriptions, null, 2)
  );

  if (res?.data?.appInstallation?.activeSubscriptions) {
    const subscription = res.data.appInstallation.activeSubscriptions.find(
      (sub) => {
        return sub.id === `gid://shopify/AppSubscription/${charge_id}`;
      }
    );

    if (subscription) {
      const subscriptionLineItem = subscription.lineItems.find((lineItem) => {
        return lineItem?.plan?.pricingDetails?.__typename === "AppUsagePricing";
      });

      if (subscriptionLineItem) {
        app_usage_line_item_id = subscriptionLineItem.id;
      }
    }
  }
  console.log(JSON.stringify({ app_usage_line_item_id }, null, 2));
  return app_usage_line_item_id;
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

    return answer.data;
  } catch (error) {
    console.log("error in post api of GraphQl------", error);
    return error.data;
  }
}
