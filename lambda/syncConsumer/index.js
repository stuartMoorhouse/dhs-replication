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

  const executePutRequest = async (docUri, collection, content, getStatusCode) => {
    let putStatusCode = 0;
    return new Promise((resolve, reject) => {
      const putReq = https.request(targetOptions(docUri, collection), putResponse => {
        console.log(`statusCode (PUT ${docUri}): ${putResponse.statusCode}`);
        putStatusCode = putResponse.statusCode;
        putResponse.on('end', () => {
          const responseObj = {
            uri: docUri,
            getResponse: getStatusCode,
            putResponse: putResponse.putStatusCode,
            completed: new Date().toISOString()
          };
          console.log(`PUT response: ${responseObj}`);
          return resolve(responseObj);
        });
      });
      putReq.on('error', e => {
        console.log(`FAILED PUT for ${docUri}: ${e.message}`);
        return reject(e);
      });
      putReq.write(content);
      putReq.end();
    });
  };

  const executeGetRequest = async (docUri) => {
    let contentStr = '';
    let statusCode = 0;

    return new Promise((resolve, reject) => {
      const getReq = https.get(sourceOptions(docUri), getResponse => {
        console.log(`statusCode (GET ${docUri}): ${getResponse.statusCode}`);
        statusCode = getResponse.statusCode;
        getResponse.on('data', data => {
          contentStr += data;
        });
        getResponse.on('end', () => {
          const responseObj = {
            statusCode: statusCode,
            content: contentStr,
            uri: docUri
          };
          return resolve(responseObj);
        });
      });
      getReq.on('error', e => {
        console.log(`FAILED GET for ${docUri}: ${e.message}`);
        return reject(e);
      });
      getReq.end();
    });
  };

  return new Promise((resolve, reject) => {
    console.log(`EVENT: ${JSON.stringify(event)}`);
    const records = [].concat(event.Records);
    const getRequests = records.map(record => {
      const docUri = record.body;
      console.log(`docUri: ${docUri}`);
      const getResponses = executeGetRequest(docUri, 'test');
      return getResponses;
    });
    const putRequests = Promise.all(getRequests).then(getResponses => {
      const puts = getResponses.map(getResponse => {
        return executePutRequest(getResponse.uri, 'test', getResponse.content, getResponse.statusCode);
      });
      return Promise.all(puts);
    });

    resolve(Promise.resolve(putRequests));
  });
};

