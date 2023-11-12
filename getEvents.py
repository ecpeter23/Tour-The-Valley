import json
import boto3
from botocore.exceptions import ClientError


def lambda_handler(event, context):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('Events')

    try:
        response = table.scan()

        events = []
        for item in response['Items']:
            event = {
                'eventID': str(item.get('EventID', '-1')),
                'eventName': item.get('EventName', 'No EventName'),
                'location': item.get('Address', 'No Location'),
                'description': item.get('Description', 'No Description'),
                'startDate': item.get('StartDate', 'No Start Date'),
                'endDate': item.get('EndDate', 'No End Date'),
                'peopleAttening': int(item.get('PeopleAttending', '0')),
                'imageURL': item.get('ImageURL', ''),
            }
            events.append(event)

        return {
            'statusCode': 200,
            'body': json.dumps(events),
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'  # Necessary for CORS
            }
        }
    except ClientError as e:
        return {
            'statusCode': 500,
            'body': json.dumps(e.response['Error']),
            'headers': {
                'Content-Type': 'application/json'
            }
        }
