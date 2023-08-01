/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// API Getaway
// METHOD - GET, POST
// DEPLOYMENT STAGE - /api
// ROUTE - /api/shop
// URL QUERY STRING PARAMETERS- shop
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const AWS = require("aws-sdk");
const documentClient = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  console.log("event", event);
  console.log("event.httpMethod", event.httpMethod);

  const body = JSON.parse(event.body);
  //allow origin
  const httpMethod = event.httpMethod;
  let allowedOrigins = "";
  const headers = event.headers || {};
  const originDomain = headers.origin
    ? headers.origin.replace(/^https?:\/\//, "")
    : null;

  // Now you have the origin domain in the 'originDomain' variable
  console.log("Request received from domain:", originDomain);

  if (originDomain == event?.queryStringParameters?.shop) {
    allowedOrigins = "https://" + event?.queryStringParameters?.shop;
  } else if (originDomain == "admin.shopify.com") {
    allowedOrigins = "https://admin.shopify.com";
  } else if (originDomain == body?.shop) {
    allowedOrigins = "https://" + body?.shop;
  }

  let response = "";
  switch (httpMethod) {
    case "GET":
      const getShopIdParams = {
        TableName: "shopifyShopMaster",
        FilterExpression: "shop = :shopValue",
        ExpressionAttributeValues: {
          ":shopValue": event.queryStringParameters.shop,
        },
      };
      try {
        const data = await documentClient.scan(getShopIdParams).promise();
        response = buildResponse(200, JSON.stringify(data.Items));
      } catch (err) {
        console.log("error,", err);
        response = buildResponse(500, JSON.stringify(err));
      }
      return response;
    case "POST":
      let bodyData = JSON.parse(event.body);
      console.log("bodyData", bodyData);
      console.log("bodyDatabodyDatabodyDatabodyDatabodyData", bodyData.shop);

      //Insert new item:
      const putParams = {
        TableName: "shopifyShopMaster",
        Item: {
          shop: bodyData.shop,
          access_token: bodyData.access_token,
          status: bodyData.status,
          payment_status: bodyData.payment_status,
          charge_id: bodyData.charge_id,
          created_at: new Date().getTime(),
          updated_at: new Date().getTime(),
          phone: bodyData.phone,
          country_code: bodyData.country_code,
          country_name: bodyData.country_name,
          access_scope: bodyData.access_scope,
          email: bodyData.email,
          money_formate: bodyData.money_formate,
          currency: bodyData.currency,
          zip: bodyData.zip,
          city: bodyData.city,
          shop_owner: bodyData.shop_owner,
          hostName: bodyData.hostName,
        },
      };

      try {
        const data = await documentClient.put(putParams).promise();
        console.log("put params", data.Items);
        response = buildResponse(200, "Item added successfully");
      } catch (err) {
        response = buildResponse(403, `Unable to put item: ${err}`);
      }
      return response;

    default:
      response = buildResponse(400, "Invalid HTTP method");
      return response;
  }

  function buildResponse(statusCode, data) {
    return {
      statusCode: statusCode, // 302 Found - indicates a temporary redirect
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
