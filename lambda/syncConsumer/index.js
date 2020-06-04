'use strict';
const https = require('https');

const targetUsername = process.env.targetUsername;
const targetPassword = process.env.targetPassword;
const targetHost = process.env.targetHost;
const targetPort = process.env.targetPort;

const sourceUsername = process.env.sourceUsername;
const sourcePassword = process.env.sourcePassword;
const sourceHost = process.env.sourceHost;
const sourcePort = process.env.sourcePort;

const PUT = 'PUT';
const GET = 'GET';
const UTF8 = 'utf8';


exports.handler = async (event, context, callback) => {
  const targetAuthString = 'Basic ' + new Buffer(targetUsername + ':' + targetPassword).toString('base64');
  const sourceAuthString = 'Basic ' + new Buffer(sourceUsername + ':' + sourcePassword).toString('base64');

  const sourceOptions = (docUri) => {
    return {
      host: sourceHost,
      port: sourcePort,
      method: GET,
      path: `/v1/documents?uri=${docUri}`,
      headers: {
        Authorization: sourceAuthString
      }
    };
  };

  const targetOptions = (docUri, collection) => {
    return {
      host: targetHost,
      port: targetPort,
      method: PUT,
      path: `/v1/documents?uri=${docUri}&collection=${collection}`,
      headers: {
        Authorization: targetAuthString
      }
    };
  };

  const executePutRequest = (docUri, collection, content, getStatusCode, resolve) => {
    let putStatusCode = 0;
    const putReq = https.request(targetOptions(docUri, collection), putResponse => {
      console.log(`statusCode (PUT ${docUri}): ${putResponse.statusCode}`);
      putStatusCode = putResponse.statusCode;
    });
    putReq.write(content);
    putReq.on('error', e => {
      console.log(`FAILED PUT for ${docUri}: ${e.message}`);
    });
    putReq.on('data', putResponseData => {
      console.log(`PUT response data: ${putResponseData}`);
    });
    putReq.end();
    return {
      uri: docUri,
      getResponse: getStatusCode,
      putResponse: putStatusCode,
      completed: new Date().toISOString()
    };
  };


  return new Promise((resolve, reject) => {
    console.log(`EVENT: ${JSON.stringify(event)}`);
    const records = [].concat(event.Records);
    const getRequests = records.map(record => {
      const docUri = record.body;
      console.log(`docUri: ${docUri}`);
      let status = {};
      const getReq = https.get(sourceOptions(docUri), getResponse => {
        console.log(`statusCode (GET ${docUri}): ${getResponse.statusCode}`);
        let contentStr = '';
        getResponse.on('data', data => {
          contentStr += data;
        });
        getResponse.on('end', () => {
          status = executePutRequest(docUri, 'test', contentStr, getResponse.statusCode);
        });
      });

      getReq.on('error', e => {
        reject(e.message);
      });
      getReq.end();
    });
  });
};

