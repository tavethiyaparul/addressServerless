/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// API Getaway
// METHOD - GET, POST
// DEPLOYMENT STAGE - /api
// ROUTE - /api/addressvalidation
// URL QUERY STRING PARAMETERS- shop
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const AWS = require("aws-sdk");
const documentClient = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  console.log("event", JSON.stringify(event));
  console.log("event.httpMethod", event.httpMethod);
  const httpMethod = event.httpMethod;

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
  } else if (originDomain == event?.body?.shop) {
    allowedOrigins = "https://" + event?.body?.shop;
  }

  let response = "";
  switch (httpMethod) {
    case "GET":
      const getShopIdParams = {
        TableName: "addrexxSetting",
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
      console.log("post =================================", event.body);
      let bodyData = JSON.parse(event.body);
      console.log("bodyData", bodyData);
      console.log("bodyDatabodyDatabodyDatabodyDatabodyData", bodyData.shop);

      //Insert new item:
      const putParams = {
        TableName: "addrexxSetting",
        Item: {
          autoFill: bodyData.autoFill,
          shipmentPO: bodyData.shipmentPO,
          latinCharacters: bodyData.latinCharacters,
          postalCode: bodyData.postalCode,
          capitalizeAddress: bodyData.capitalizeAddress,
          limitNoOfCharacters: bodyData.limitNoOfCharacters,
          missingApartment: bodyData.missingApartment,
          validateApartment: bodyData.validateApartment,
          created_at: new Date().getTime(),
          updated_at: new Date().getTime(),
          shop: bodyData.shop,
          setDefaultCountry: bodyData.setDefaultCountry,
          selectDefaultCountry: bodyData.selectDefaultCountry,
          limitOptionCountry: bodyData.limitOptionCountry,
          countriesExcluded: bodyData.countriesExcluded,
        },
        // ConditionExpression: 'attribute_not_exists(shop)',
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
    console.log("=====================", data);
    return {
      statusCode: statusCode,
      // 302 Found - indicates a temporary redirect
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
