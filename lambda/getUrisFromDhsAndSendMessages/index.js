var AWS = require("aws-sdk");
const username = process.env.username;
const password = process.env.password;
const host = process.env.host;
const port = process.env.port;


exports.handler = async function (event, context) {
    // TODO implement
    const https = require('https');

    // Load the AWS SDK
    // const SecretsManager = require('aws-sdk/clients/secretsmanager')
    // var region = "eu-north-1",
    //     secretName = "arn:aws:secretsmanager:eu-north-1:432266607967:secret:roche-hackaton-2-credentials-qnsm95",
    //     secret
    // //     decodedBinarySecret;

    // // Create a Secrets Manager client
    // var client = new SecretsManager({
    //     region: region
    // });
    // var secretUsername;
    // var secretPassword;

    // client.getSecretValue({ SecretId: secretName }, function(err, data) {
    //     if (err) {
    //         throw err;
    //     }
    //     else {
    //         console.log("secret:", data.SecretString)
    //         secret = data.SecretString;
    //         var secretUsername = secret.name;
    //         var secretPassword = secret.password;
    //         return data;
    //     }
    // });


    return new Promise((resolve, reject) => {
        const myPath = '/dataSync/dataSync.sjs?lastTimestamp=' + event.body.timestamp + '&collection=' + event.body.collection;
        console.log('myPath', myPath)
        const options = {
            host: host,
            path: myPath,
            port: port,
            method: 'GET',
            headers: {
                'Authorization': 'Basic ' + new Buffer(username + ':' + password).toString('base64')
            }
        };

        const req = https.request(options, (res) => {
            let body = "";
            res.on('data', function (data) {


                body += data;

                // resolve(JSON.parse(body));
            });
            res.on('end', () => {
                var bodyObj = JSON.parse(body)
                var sns = new AWS.SNS();
                const snsCalls = []

                for (var uri of bodyObj.uris) {
                    const message = {};
                    message.uri = uri;
                    message.dateTime = bodyObj.dateTime;
                    snsCalls.push(sns.publish({
                        Message: JSON.stringify(message),
                        TopicArn: "arn:aws:sns:eu-north-1:432266607967:dhs-replication-new-uri-to-process"
                    }).promise())
                }

                return Promise.all(snsCalls)
                    .then(() => {
                        var response = {};
                        response.collection = bodyObj.collection;
                        response.dateTime = bodyObj.dateTime;
                        response.numberOfUris = bodyObj.uris.length;
                        resolve(response);
                        console.log('Success');
                    })
                    .catch(err => console.log(err));


            })

        });

        req.on('error', (e) => {
            reject(e.message);
        });

        // send the request
        req.write(''); req.end();
    });

};
