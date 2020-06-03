import json
import os
import boto3

table = event["table"]
keyname = event["keyname"]
key = event["key"]

# Environment variables that can be used to debug:
# table = os.environ['table']
# keyname = os.environ['keyname']
# key = os.environ['key']

client = boto3.client('dynamodb')
dynamo_DB_response = client.get_item(TableName=table, Key={keyname: { 'S': key } }) 
timestamp = dynamo_DB_response["Item"]["timestamp"]["S"]

json_output = {
  "timestamp": timestamp,
  "collection": key
}


def lambda_handler(event, context):

    return {
        'body': json_output
    }

