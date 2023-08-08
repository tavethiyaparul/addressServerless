/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// API Getaway
// METHOD - GET
// DEPLOYMENT STAGE - /api
// ROUTE - /api/manualusagecharge
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ENV VARIABLES - AMOUNTCHARGE -0.04, SHOPIFY_API_SECRET,SHOPIFY_API_VERSION - 2023-01
////////
//api body passed//
// {
//     "shop":"rishivtest123.myshopify.com",
//     "id":1124613292308 //order id
// }

const AWS = require("aws-sdk");
const axios = require("axios");
const documentClient = new AWS.DynamoDB.DocumentClient();
exports.handler = async (event) => {
  console.log("event", event);
  const body = JSON.parse(event.body);
  const allowedOrigins = `https://admin.shopify.com https://${body?.shop}`;
  console.log("body", body, body?.shop);
  let response = "";

  const getParams = {
    TableName: "shopifyShopMaster",
    FilterExpression: "#name = :shopvalue AND #status = :statusValue ",
    ExpressionAttributeNames: {
      "#name": "shop",
      "#status": "status",
    },
    ExpressionAttributeValues: {
      ":shopvalue": body?.shop,
      ":statusValue": "installed",
    },
  };

  try {
    const data = await documentClient.scan(getParams).promise();
    console.log("data", data);
    const AppSubscriptionId = data?.Items[0]?.payment_charge_id;
    const accessToken = data?.Items[0]?.access_token;

    const orderId = body.id;

    console.log("accessToken", accessToken);
    var url = `https://${body.shop}/admin/api/${process.env.SHOPIFY_API_VERSION}/graphql.json`;

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
      var updatedCappedAmount = balance.plan.pricingDetails.cappedAmount.amount;
      var updatedBalanceAmount = balance.plan.pricingDetails.balanceUsed.amount;
      console.log(
        "updatedCappedAmount, updatedBalanceAmount",
        updatedCappedAmount,
        updatedBalanceAmount
      );
      var updatedDiffAmount = updatedCappedAmount - updatedBalanceAmount;
      console.log("updatedDiffAmount", updatedDiffAmount);

      // if usage charge exists in Db then used this one other wise env
      const getShopIdParams = {
        TableName: "displaySetting",
        FilterExpression: "shop = :shopValue",
        ExpressionAttributeValues: {
          ":shopValue": body.shop,
        },
      };
      let usageCharge;
      try {
        const data = await documentClient.scan(getShopIdParams).promise();
        console.log("data=================", data);
        usageCharge = data?.Items[0]?.usageChargePrice;
      } catch (err) {
        console.log("error,", err);
      }
      console.log("usageCharge", usageCharge);
      var amountCharge;
      if (usageCharge) {
        amountCharge = usageCharge;
      } else {
        amountCharge = process.env.AMOUNTCHARGE;
      }
      console.log("amountCharge", amountCharge);
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
                            description: "Charge for order number: ${orderId}",
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
                  shop: body.shop,
                  orderId: orderId,
                  paymentStatus: "paid",
                  appUsageId:
                    chargeUser?.data?.appUsageRecordCreate?.appUsageRecord?.id,
                  created_at: new Date().getTime(),
                  updated_at: new Date().getTime(),
                },
              };

              console.log("order", putParams);
              try {
                const data = await documentClient.put(putParams).promise();
                return buildResponse(200, "order create successfully..");
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
