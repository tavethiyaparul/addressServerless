/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// API Getaway
// METHOD - GET, POST
// DEPLOYMENT STAGE - /api
// ROUTE - /api/order
// URL QUERY STRING PARAMETERS- shop,orderId
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ENV VARIABLES - SHOPIFY_API_VERSION - 2023-01
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


const AWS = require("aws-sdk");
const axios = require("axios")
const documentClient = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  console.log("event",event);
  const body = JSON.parse(event.body)
  const httpMethod = event.httpMethod;
  console.log("event.httpMethod", httpMethod);
  
  let allowedOrigins = "";
  const headers = event.headers || {};
  console.log("headers",headers)
  // Extract the origin domain from the 'origin' header
  const originDomain = headers.origin ? headers.origin.replace(/^https?:\/\//, '') : null;
  // Now you have the origin domain in the 'originDomain' variable
  console.log('Request received from domain:', originDomain);
  
  if(originDomain == event?.queryStringParameters?.shop)
  {
    allowedOrigins = "https://"+event?.queryStringParameters?.shop;
  }
  else if(originDomain == 'admin.shopify.com'){
    allowedOrigins = 'https://admin.shopify.com';
  }
  else if(originDomain == body?.shop){
    allowedOrigins = "https://"+body?.shop;
  }
  
  let accessToken=""
   let response=""
  let shop = body?.shop || event?.queryStringParameters?.shop
  console.log("==============================",body?.shop)
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
     accessToken = data?.Items[0]?.access_token;
     console.log("accessToken",accessToken)
  } catch (error) {
    console.log("error,", error);
    response=buildResponse(500,JSON.stringify(error))
  }


  switch (httpMethod) {
    case "GET":
      const orderId = +event?.queryStringParameters?.orderId
      try {
        const url =`https://${shop}/admin/api/${process.env.SHOPIFY_API_VERSION}/orders/${orderId}.json`
        const order = await getOrder(url,accessToken)
        response=buildResponse(200,order?.order?.shipping_address)
      } catch (err) {
        console.log("error,", err);
        response=buildResponse(500,JSON.stringify(err))
      }
      return response;
    case "POST":
      console.log("post =================================", event.body);
      let data = JSON.parse(event?.body)
      console.log("bodyData", data);
      
      const url=`https://${data?.shop}/admin/api/${process.env.SHOPIFY_API_VERSION}/orders/${data.orderId}.json`
      const requestData = {
        order: {
          id: data.orderId.toString(),
          tags:data.statusAddrexx,
          shipping_address: {
            address1: data.address1Addrexx,
            address2: data.address2Addrexx,
            city: data.cityAddrexx,
            company: data.companyAdddrexx,
            country: data.countryLongAddrexx,
            first_name: data.firstNameAddrexx,
            last_name: data.lastNameAddrexx,
            latitude: data.latitudeAddrexx,
            longitude: data.longitudeAddrexx,
            phone: data.phoneAddrexx,
            province: data.provinceLongAddrexx,
            zip: data.zipAddrexx,
            name: data.nameAddrexx,
            country_code: data.countryShortyAddrexx,
            province_code: data.provinceShortAddrexx,
          },
        },
      };

        try {
        const orderData = await putOrder(url,accessToken,requestData)
        console.log("put params",orderData);
          response=buildResponse(200,orderData)
        } catch (err) {
          response=buildResponse(403,`Unable to put item: ${err}`)
        }
      return response;
      
    default:
     response= buildResponse(400,"Invalid HTTP method")
     return response
  }
 
  

function buildResponse(statusCode,data){
    return  {
      statusCode:statusCode, // 302 Found - indicates a temporary redirect
      headers: {
       'Content-Type': 'application/json',
       'Access-Control-Allow-Origin': allowedOrigins,
        'x-frame-options':'ALLOW-FROM',
        'Content-Security-Policy': `frame-ancestors ${allowedOrigins}`,
      },
      body: JSON.stringify(data)
    };
  }

  async function getOrder(url, access_token) {
    try {
      const response = await axios({
        url,
        method: "GET",
        headers: {
          "X-Shopify-Access-Token": access_token,
           "Accept-Encoding": "gzip,deflate,compress"
        },
         responseType: "json",
      });
      console.log("response Access token", response.data);
      return response.data;
    } catch (e) {
      console.log("getOrder Error",e);
    }
  }

  async function putOrder(url, access_token,data) {
    try {
      const response = await axios({
        url,
        method: "PUT",
        headers: {
          "X-Shopify-Access-Token": access_token,
         "Accept-Encoding": "gzip,deflate,compress"
        },
        data,
        responseType: "json",
      });
      console.log("response Access token", response.data);
      return response.data;
    } catch (e) {
     console.log("putOrder Error",e);
      return e.response.data
    }
  }
};