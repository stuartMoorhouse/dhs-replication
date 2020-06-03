import json
import os
import boto3

# Environment variables that can be used to debug:
# table = os.environ['table']
# keyname = os.environ['keyname']
# key = os.environ['key']
# valuename = os.environ['valuename']
# value = os.environ['value']

def lambda_handler(event, context):

    table = event["table"]
    keyname = event["keyname"]
    key = event["key"]
    valuename = event["valuename"]
    value = event["value"]

    client = boto3.client('dynamodb')
    client.put_item(
        TableName = table,
        Item = {
            keyname: {'S': key},
            valuename: {'S': value}
        }
        )

    return {
        'body': json.dumps(f'The function lambda_handler() was run')
    }
