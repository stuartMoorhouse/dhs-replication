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

  return new Promise((resolve, reject) => {
    console.log(`EVENT: ${JSON.stringify(event)}`);
    const docUri = event.Records[0].body;
    console.log(`docUri: ${docUri}`);
    const req = https.get(sourceOptions(docUri), getResponse => {
      console.log('statusCode (GET): ' + getResponse.statusCode);
      getResponse.on('data', data => {
        const putReq = https.request(targetOptions(docUri, 'test'), putResponse => {
          console.log('statusCode (PUT): ' + putResponse.statusCode);
          resolve({
            uri: docUri,
            getResponse: getResponse.statusCode,
            putResponse: putResponse.statusCode,
            completed: new Date().toISOString()
          });
        });
        putReq.on('error', e => {
          reject(e);
        });
        putReq.on('data', putResponseData => {
          console.log(`PUT response data: ${putResponseData}`)
        });
        putReq.write(data);
        putReq.end();
      });
    });

    req.on('error', e => {
      reject(e.message);
    });

    req.end();
  });
};

