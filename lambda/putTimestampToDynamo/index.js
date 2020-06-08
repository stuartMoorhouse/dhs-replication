'use strict';

const AWS = require('aws-sdk');
AWS.config.update({ region: 'eu-north-1' });

const table = process.env.table;
const keyname = process.env.keyname;
const valuename = process.env.valuename;

exports.handler = async (event, context, callback) => {

  const key = event.collection;
  const value = event.dateTime;

  const putParams = {
    TableName: table,
    Item: {}
  };
  putParams.Item[keyname] = key;
  putParams.Item[valuename] = value;

  return new Promise((resolve, reject) => {
    const docClient = new AWS.DynamoDB.DocumentClient();
    return docClient.put(putParams, (err, data) => {
      if (err) {
        console.error(`Error putting ${keyname}: ${key} to DynamoDb: ${err}`);
        reject(err);
      } else {
        console.log(`Put ${keyname}: ${key} to DynamoDb.}`);
        resolve({
          timestamp: value,
          completed: new Date().toISOString(),
          status: 'completed',
          parameters: putParams
        });
      };
    });
  });

}
