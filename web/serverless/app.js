/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// API Getaway
// METHOD - GET
// DEPLOYMENT STAGE - /api
// ROUTE - /api/app
// URL QUERY STRING PARAMETERS- code,hmac,host,shop,timestamp
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ENV VARIABLES - HOST,SHOPIFY_API_KEY,SHOPIFY_API_SECRET
//                 SHOPIFY_API_VERSION -2023-01
//                 SHOPIFY_SCOPE -write_script_tag,write_orders
//                 AMOUNTCHARGE -0.04
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//TABLE_NAME - displaySetting,addrexxSetting,orderMaster,ShopifyShopMaster
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const AWS = require("aws-sdk"); // Load the AWS SDK for Node.js
const axios = require("axios");
const lambda = new AWS.Lambda();
const crypto = require("crypto");
const documentClient = new AWS.DynamoDB.DocumentClient();
exports.handler = async (event, context) => {
  console.log("event:", event);

  const webhookValidation = await validation(event);
  console.log("webhookValidation", webhookValidation);

  if (!webhookValidation) {
    return {
      statusCode: 401,
      body: "hmac validation failed",
    };
  }
  const { shop, hmac, host, timestamp, code } = event.queryStringParameters;

  let response = "";
  let allowedOrigins = "*";

  try {
    //generate access token
    const token = await accessToken(
      process.env.SHOPIFY_API_KEY,
      process.env.SHOPIFY_API_SECRET,
      shop,
      code
    );
    console.log("shopify Token ============", token);

    let url =
      "https://" +
      shop +
      "/admin/api/" +
      process.env.SHOPIFY_API_VERSION +
      "/shop.json";
    const responseShopData = await getShopDetails(
      shop,
      url,
      token.access_token
    );
    let responseShop = responseShopData && responseShopData?.shop;
    
    const params = {
      FunctionName: "addShop",
      Payload: JSON.stringify({
        httpMethod: "POST",
        body: JSON.stringify({
          hostName: host,
          shop: shop,
          access_token: token.access_token,
          status: "installed",
          created_at: new Date().getTime(),
          updated_at: new Date().getTime(),
          phone: responseShop.phone,
          country_code: responseShop.country_code,
          country_name: responseShop.country_name,
          access_scope: process.env.SHOPIFY_SCOPE,
          email: responseShop.email,
          money_formate: responseShop.money_formate,
          currency: responseShop.currency,
          zip: responseShop.zip,
          city: responseShop.city,
          shop_owner: responseShop.shop_owner,
        }),
      }),
    };
    console.log("params", params);
    const responseData = await lambda.invoke(params).promise();
    console.log("response data", responseData);

    const paramsSetting = {
      TableName: "displaySetting",
      Key: { shop: shop },
      UpdateExpression: "SET #usageChargePrice = :usageChargePriceValue",
      ExpressionAttributeNames: { "#usageChargePrice": "usageChargePrice" },
      ExpressionAttributeValues: { ":usageChargePriceValue": process.env.AMOUNTCHARGE},
      ReturnValues: "UPDATED_OLD",
    };

    try {
      const data = await documentClient.update(paramsSetting).promise();
      console.log("setting", data);
    } catch (err) {
      console.log("err", err);
    }

    const registerShopWebhook = await postApiRest(shop, token.access_token, {
      webhook: {
        topic: "app/uninstalled",
        address: process.env.HOST + "/api/webhook",
        format: "json",
      },
    });

    console.log("webhook", JSON.stringify(registerShopWebhook));

    const registerOrderWebhook = await postApiRest(shop, token.access_token, {
      webhook: {
        topic: "orders/create",
        address: process.env.HOST + "/api/webhook",
        format: "json",
      },
    });

    console.log("webhook order", JSON.stringify(registerOrderWebhook));

    if (registerShopWebhook) {
      console.log("register Shop webhook successfully registered...");
    }

    // const red_url = await embedAppUrl(shop)
    // console.log("redirect url",red_url)

    response = buildResponse(
      302,
      "https://fbtu4zlun9.execute-api.us-east-1.amazonaws.com/api/paymentcreate?shop=" +
        shop
    );
  } catch (error) {
    console.log("error", JSON.stringify(error));
    return JSON.stringify(error);
  }
  return response;

  function buildResponse(statusCode, redirectUrl) {
    return {
      statusCode: statusCode, // 302 Found - indicates a temporary redirect
      headers: {
        Location: redirectUrl, // Specify the target URL for the redirect
        "Access-Control-Allow-Origin": allowedOrigins,
        "x-frame-options": "ALLOW-FROM",
        "Content-Security-Policy": `frame-ancestors ${allowedOrigins}`,
      },
    };
  }

  async function embedAppUrl(shop) {
    return (
      process.env.HOST +
      "/?SHOPIFY_API_KEY=" +
      process.env.SHOPIFY_API_KEY +
      "&shop=" +
      shop
    );
  }

  async function accessToken(client_id, client_secret, shop, code) {
    try {
      const response = await axios({
        url: "https://" + shop + "/admin/oauth/access_token",
        method: "POST",
        headers: {
          "Accept-Encoding": "gzip,deflate,compress",
        },
        responseType: "json",
        data: {
          client_id,
          client_secret,
          code,
        },
      });
      return response.data;
    } catch (error) {
      console.log("accessTokenaccessToken", error);
    }
  }

  async function getShopDetails(shop, url, access_token) {
    try {
      const response = await axios({
        url,
        method: "GET",
        headers: {
          "X-Shopify-Access-Token": access_token,
          "Accept-Encoding": "gzip,deflate,compress",
        },
        responseType: "json",
      });
      console.log("response Access token", response.data);
      return response.data;
    } catch (e) {
      console.log("getShopDetails", e);
    }
  }

  async function postApiRest(shop, access_token, data) {
    try {
      const response = await axios({
        url:
          "https://" +
          shop +
          "/admin/api/" +
          process.env.SHOPIFY_API_VERSION +
          "/webhooks.json",
        method: "POST",
        headers: {
          "X-Shopify-Access-Token": access_token,
          "Accept-Encoding": "gzip,deflate,compress",
        },
        responseType: "json",
        data,
      });
      console.log("webhook", response.data);
      return response.data;
    } catch (error) {
      console.log("error in post api rest", error);
    }
  }

  async function validation(event) {
    try {
      const { SHOPIFY_API_SECRET } = process.env;

      const { queryStringParameters: data, headers } = event;
      const hmac = data.hmac;
      delete data.hmac;
      console.log("data", data);

      if (!data || !hmac) {
        return false;
      }

      // Construct the message for HMAC validation
      const message = Object.keys(data)
        .sort()
        .map((key) => `${key}=${encodeURIComponent(data[key])}`)
        .join("&");

      const digest = crypto
        .createHmac("sha256", SHOPIFY_API_SECRET)
        .update(message)
        .digest("hex");

      console.log("digest", digest);

      if (digest !== hmac) {
        console.log("verification failed");
        return false;
      }
      return true;
    } catch (error) {
      console.log(error);
      return {
        statusCode: 500,
        body: "Internal Server Error",
      };
    }
  }
};
