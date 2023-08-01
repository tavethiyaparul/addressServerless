/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// API Getaway
// METHOD - GET, POST
// DEPLOYMENT STAGE - /api
// ROUTE - /api/script
// URL QUERY STRING PARAMETERS- shop
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ENV VARIABLES - HOST,SHOPIFY_API_VERSION - 2023-01
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const AWS = require("aws-sdk");
const axios = require("axios");
const documentClient = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  console.log("event", event);
  console.log("event.httpMethod", event.httpMethod);
  const httpMethod = event.httpMethod;

  const body = JSON.parse(event.body);
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
  } else if (originDomain == body?.shop) {
    allowedOrigins = "https://" + body?.shop;
  }
  let response = "";
  switch (httpMethod) {
    case "GET":
      const getSettingIdParams = {
        TableName: "shopifyShopMaster",
        FilterExpression: "shop = :shopValue",
        ExpressionAttributeValues: {
          ":shopValue": event.queryStringParameters.shop,
        },
      };
      try {
        const data = await documentClient.scan(getSettingIdParams).promise();
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

      let shop = bodyData.shop;
      let scriptStatus = bodyData.scriptStatus;
      const getShopParams = {
        TableName: "shopifyShopMaster",
        FilterExpression: "shop = :shopValue",
        ExpressionAttributeValues: {
          ":shopValue": shop,
        },
      };
      try {
        const data = await documentClient.scan(getShopParams).promise();
        const accessToken = data?.Items[0]?.access_token;
        const id = data?.Items[0]?.scriptId;
        console.log("data==============================", accessToken);
        if (data.Items.length > 0) {
          let scriptId;
          console.log("scriptStatus", scriptStatus);
          if (scriptStatus) {
            const script = await getScript(
              `https://${shop}/admin/api/2023-01/script_tags.json`,
              accessToken
            );
            console.log("script", script?.script_tag?.id);

            if (script) {
              scriptId = script?.script_tag?.id;
            }
          } else {
            const scriptDelete = await deleteScript(
              `https://${shop}/admin/api/2023-01/script_tags/${id}.json`,
              accessToken
            );
            console.log("scriptDelete", scriptDelete);
            scriptId = null;
          }

          const params = {
            TableName: "shopifyShopMaster",
            Key: { shop: shop },
            UpdateExpression:
              "SET #scriptId = :scriptId, #scriptStatus = :scriptStatus",
            ExpressionAttributeNames: {
              "#scriptId": "scriptId",
              "#scriptStatus": "scriptStatus",
            },
            ExpressionAttributeValues: {
              ":scriptId": scriptId,
              ":scriptStatus": scriptStatus,
            },
            ReturnValues: "ALL_NEW",
          };

          try {
            const data = await documentClient.update(params).promise();
            response = buildResponse(200, "Item added successfully");
          } catch (err) {
            response = buildResponse(403, `Unable to put item: ${err}`);
          }
        }
      } catch (err) {
        response = buildResponse(403, `Unable to put item: ${err}`);
      }
      return response;

    default:
      response = buildResponse(400, "Invalid HTTP method", shop);
      return response;
  }

  function buildResponse(statusCode, data) {
    console.log("=====================", data);
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

  async function getScript(url, access_token) {
    console.log("urlurlurlurl", url, access_token);
    try {
      const response = await axios({
        url,
        method: "POST",
        data: {
          script_tag: {
            event: "onload",
            src: `https://addressvalidationshopify.s3.amazonaws.com/xxerddaScript.js`,
            display_scope: "all",
          },
        },
        headers: {
          "X-Shopify-Access-Token": access_token,
          "Content-Type": "application/json",
        },
        responseType: "json",
      });
      console.log("response Access token", response.data);
      return response.data;
    } catch (e) {
      console.log("getScript", e);
    }
  }

  async function deleteScript(url, access_token) {
    console.log("urlurlurlurl", url, access_token);
    try {
      const response = await axios({
        url,
        method: "DELETE",
        headers: {
          "X-Shopify-Access-Token": access_token,
        },
        responseType: "json",
      });
      console.log("response Access token", response.data);
      return response.data;
    } catch (e) {
      console.log("getScript", e);
    }
  }
};
