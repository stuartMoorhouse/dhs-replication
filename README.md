# dhs-replication

## Goals
When data in DHS A is added or modified, copy it into DHS B.

### Workflow

A CloudWatch Event periodically triggers a Step Function State Machine (Step Function A)

Step Function A

  Lambda A.1 gets the state (last-accessed timestamp) from the DynamoDB table

  Lambda A.2 run DHS query X against DHS A
             gets a list of uris that were added between the last-accessed timestamp and the current time.

  Lambda A.3a writes one message per uri to the SNS Topic
    AND
  Lambda A.3b writes the new "last-accessed" timestamp to DynamoDB

SQS queues "subscribe" to 2 SNS Topics (fan-out pattern)

Lambda B is triggered when a new message is added to the SNS Topic
Lambda B GETs the document at the uri in the message
         PUTs the document into DHS B

### Resources
DynamoDB table
CloudWatch Event
Lambdas
Step Function Step Machine(s)?
SQS Queue
SNS Topic

## Stretch goals
- Using streaming in the Java function, rather than loading it into memory
- Application to add new Collection into the workflow
- Reastrict permissions for lambda functions (down from Admin)
- refactor DynamdoDB Lambda functions to make them re-useable
