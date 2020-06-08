'use strict';

const AWS = require('aws-sdk');
AWS.config.update({ region: 'eu-north-1' });

exports.handler = async (event, context, callback) => {
  console.log(`Event: ${JSON.stringify(event)}`);

  const table = event.table;
  const keyname = event.keyname;
  const keyvalue = event.key;

  const keyObject = {};
  keyObject[keyname] = keyvalue;
  const params = {
    Key: keyObject,
    TableName: table
  };

  return new Promise((resolve, reject) => {
    const docClient = new AWS.DynamoDB.DocumentClient();
    console.log(`params: ${JSON.stringify(params)}`);
    return docClient.get(params, (err, data) => {
      if (err) {
        console.error(`Error getting ${keyname}: ${keyvalue} from DynamoDb: ${err}`);
        reject(err);
      } else {
        console.log(`Got ${keyname}: ${keyvalue} from DynamoDb: ${JSON.stringify(data)}`);
        const timestamp = data.Item.timestamp;
        resolve({
          timestamp: timestamp,
          collection: keyvalue
        });
      }
    });
  });
}
