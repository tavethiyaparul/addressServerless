
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// API Getaway
// METHOD - POST
// DEPLOYMENT STAGE - /api
// ROUTE - /api/customers-data-request
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


exports.handler = async (event) => {
  
    const response = {
      statusCode: 200,
      body: JSON.stringify('Hello from Lambda!'),
    };
    return response;
  };