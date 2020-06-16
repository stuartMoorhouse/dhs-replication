/**
 * A Lambda function that returns a static string
 */
const sourceUsername = process.env.sourceUsername;
const sourcePassword = process.env.sourcePassword;
const sourceHost = process.env.sourceHost;
const sourcePort = process.env.sourcePort;

const BASIC = 'basic';
const TEST = 'test';

const marklogic = require('marklogic');

exports.handler = async () => {


    const sourceClient = marklogic.createDatabaseClient({
        host: sourceHost,
        port: sourcePort,
        user: sourceUsername,
        password: sourcePassword,
        authType: BASIC,
        ssl: true
    });

    // If you change this message, you will need to change getUrisFromDhsAndProduceMessages.test.js
    const message = 'Hello from Lambda!';

    // All log statements are written to CloudWatch
    console.info(`${message}`);

    return message;
}
