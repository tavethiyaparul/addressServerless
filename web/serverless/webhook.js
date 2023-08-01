/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// API Getaway
// METHOD - GET
// DEPLOYMENT STAGE - /api
// ROUTE - /api/webhook
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ENV VARIABLES - AMOUNTCHARGE -0.1, SHOPIFY_API_SECRET,SHOPIFY_API_VERSION - 2023-01
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const AWS = require("aws-sdk");
const axios = require("axios");
const getRawBody = require("raw-body");
const crypto = require("crypto");
const documentClient = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  console.log("event", event);
  const shop = event.headers["X-Shopify-Shop-Domain"];
  const topic = event.headers["X-Shopify-Topic"];
  const body = JSON.stringify(JSON.parse(event.body));
  let response = "";
  const allowedOrigins = `https://admin.shopify.com https://${shop}`;

  const webhookValidation = await validation(event);
  console.log("webhookValidation", webhookValidation);
  if (webhookValidation) {
    await orderCreate(topic, shop, body);
    response = buildResponse(200, "webhook call successfully");
  } else {
    response = buildResponse(200, "webhook validation failed ");
  }

  return response;

  function buildResponse(statusCode, data) {
    return {
      statusCode: statusCode,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": allowedOrigins,
        "x-frame-options": "ALLOW-FROM",
        "Content-Security-Policy": `frame-ancestors ${allowedOrigins}`,
      },
      body: data,
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

    return answer.data;
  } catch (error) {
    console.log("error in post api of GraphQl------", error);
    return error.data;
  }
}

async function orderCreate(topic, shop, orderdata) {
  let order = JSON.parse(orderdata);
  if (topic === "app/uninstalled") {
    const params = {
      TableName: "shopifyShopMaster",
      Key: { shop: shop },
      UpdateExpression: "SET #status = :statusValue",
      ExpressionAttributeNames: { "#status": "status" },
      ExpressionAttributeValues: { ":statusValue": "uninstalled" },
      ReturnValues: "ALL_NEW",
    };

    try {
      const data = await documentClient.update(params).promise();
    } catch (err) {
      console.log("err", err);
    }
  } else if (topic === "orders/create") {
    let response = "";

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
      console.log("data", data);
      const AppSubscriptionId = data?.Items[0]?.payment_charge_id;
      const accessToken = data?.Items[0]?.access_token;
      const orderId = order.id;

      console.log("accessToken", accessToken);
      var url = `https://${shop}/admin/api/${process.env.SHOPIFY_API_VERSION}/graphql.json`;

      var balanceQuery = `query {
            node(id: "gid://shopify/AppSubscription/${AppSubscriptionId}") {
              ...on AppSubscription {
                lineItems {
                  plan {
                    pricingDetails {
                      __typename
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
          }
          `;

      let balance = await POST_API(url, accessToken, balanceQuery);

      balance = balance?.data?.node?.lineItems?.find((lineItem) => {
        return lineItem?.plan?.pricingDetails?.__typename === "AppUsagePricing";
      });

      console.log("balance", balance);

      if (balance) {
        var updatedCappedAmount =
          balance.plan.pricingDetails.cappedAmount.amount;
        var updatedBalanceAmount =
          balance.plan.pricingDetails.balanceUsed.amount;
        console.log(
          "updatedCappedAmount, updatedBalanceAmount",
          updatedCappedAmount,
          updatedBalanceAmount
        );
        var updatedDiffAmount = updatedCappedAmount - updatedBalanceAmount;
        console.log("updatedDiffAmount", updatedDiffAmount);

        var amountCharge = process.env.AMOUNTCHARGE;
        // Number(
        //   Number(careerCharge) + Number(orderTotalCost)
        // ).toFixed(2);
        console.log("amountCharge", amountCharge);
        if (amountCharge <= Number(updatedDiffAmount)) {
          if (AppSubscriptionId) {
            const usageQuery = `
                        mutation {
                          appUsageRecordCreate(
                            subscriptionLineItemId: "${data?.Items[0]?.usage_charge_id}"
                            description: "Charge for order number: ${order.orderId}",
                            price: { amount: ${amountCharge}, currencyCode: USD }
                          ) {
                            userErrors {
                              field
                              message
                            }
                            appUsageRecord {
                              id
                            }
                          }
                  }`;

            console.log("query", usageQuery);
            try {
              // call an api for payment
              const chargeUser = await POST_API(url, accessToken, usageQuery);
              console.log(chargeUser.data.appUsageRecordCreate.userErrors);
              console.log(
                "ans for payment Detail is ",
                chargeUser.data.appUsageRecordCreate,
                chargeUser.data.appUsageRecordCreate.appUsageRecord.id
              );

              if (chargeUser?.data?.appUsageRecordCreate?.appUsageRecord?.id) {
                console.log(
                  "==================================================",
                  orderId
                );
                const putParams = {
                  TableName: "orderMaster",
                  Item: {
                    shop: shop,
                    orderId: orderId,
                    paymentStatus: "paid",
                    appUsageId:
                      chargeUser?.data?.appUsageRecordCreate?.appUsageRecord
                        ?.id,
                    created_at: new Date().getTime(),
                    updated_at: new Date().getTime(),
                  },
                };

                console.log("order", putParams);
                try {
                  const data = await documentClient.put(putParams).promise();
                } catch (err) {
                  console.log("error", err);
                }
              }
            } catch (err) {
              console.log("order catch", err);
            }
          }
        }
      }
    } catch (err) {
      console.log("order last", err);
    }
  }
}

async function validation(event) {
  try {
    const { SHOPIFY_API_SECRET } = process.env;

    const headers = event.headers || {};
    const hmac = headers["X-Shopify-Hmac-Sha256"];
    console.log("hmac", hmac);
    const body = event.isBase64Encoded
      ? Buffer.from(event.body, "base64").toString("utf8")
      : event.body;
    const digest = crypto
      .createHmac("sha256", SHOPIFY_API_SECRET)
      .update(body, "utf8", "hex")
      .digest("base64");

    console.log("digest", digest);
    if (digest !== hmac) {
      return false;
    }
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}
