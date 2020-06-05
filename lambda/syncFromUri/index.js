'use strict';
const marklogic = require('marklogic')

const targetUsername = process.env.targetUsername;
const targetPassword = process.env.targetPassword;
const targetHost = process.env.targetHost;
const targetPort = process.env.targetPort;

const sourceUsername = process.env.sourceUsername;
const sourcePassword = process.env.sourcePassword;
const sourceHost = process.env.sourceHost;
const sourcePort = process.env.sourcePort;

const BASIC = 'basic';
const TEST = 'test';


exports.handler = async (event, context, callback) => {
  const sourceClient = marklogic.createDatabaseClient({
    host: sourceHost,
    port: sourcePort,
    user: sourceUsername,
    password: sourcePassword,
    authType: BASIC,
    ssl: true
  });

  const targetClient = marklogic.createDatabaseClient({
    host: targetHost,
    port: targetPort,
    user: targetUsername,
    password: targetPassword,
    authType: BASIC,
    ssl: true
  });

  const putDocToTarget = (docUri, collections, content, contentType) => {
    return targetClient.documents.write({
      uri: docUri,
      contentType: contentType,
      content: content,
      collections: collections
    }).result(
      fulfill => {
        return fulfill;
      },
      err => {
        console.error(JSON.stringify(error));
      });
  }

  const getDocFromSource = async (docUri) => {
    return sourceClient.documents.read(docUri)
      .result(
        documents => {
          console.log(`received ${documents.length} doc from ${docUri}`)
          return documents;
        },
        err => {
          console.error(`Error getting ${docUri}: ${JSON.stringify(error)}`);
        });
  };

  const syncUri = async (docUri) => {
    return getDocFromSource(docUri)
      .then(docs => {
        return docs.map(doc => {
          const content = doc.content;
          const contentType = doc.contentType;
          return putDocToTarget(docUri, TEST, content, contentType)
            .then(() => {
              console.log(`Put ${docUri} to ${targetHost}`);
              return {
                uri: docUri,
                completed: new Date().toISOString()
              }
            });
        });
      })
      .then(tasks => {
        return Promise.all(tasks);
      })
  };

  return new Promise((resolve, reject) => {
    console.log(`EVENT: ${JSON.stringify(event)}`);
    const records = [].concat(event.Records);
    const syncTasks = records.map(record => {
      const docUri = record.body;
      return syncUri(docUri);
    });
    return Promise.all(syncTasks)
      .then(taskReceipts => resolve(taskReceipts));
  });
};

