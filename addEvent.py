import json
import boto3
from botocore.exceptions import ClientError


def lambda_handler(event, context):
    # Initialize DynamoDB resource
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('Events')

    try:
        # Extracting event details from the input
        event_details = json.loads(event['body'])

        # Make sure eventId and peopleAttending are integers
        event_id = int(event_details['eventId'])
        people_attending = int(event_details['peopleAttending'])

        # Constructing the item to be added
        item = {
            "EventID": event_id,
            "Address": event_details['location'],
            "Description": event_details['description'],
            "EndDate": event_details['endDate'],
            "EventName": event_details['eventName'],
            "ImageURL": event_details['imageURL'],
            "PeopleAttending": people_attending,
            "StartDate": event_details['startDate']
        }

        # Adding the item to the DynamoDB table
        table.put_item(Item=item)

        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'Event added successfully'}),
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        }
    except ClientError as e:
        print("DynamoDB error:", e.response['Error']['Message'])
        return {
            'statusCode': 500,
            'body': json.dumps({'message': 'Error adding event to database'}),
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        }
    except (ValueError, TypeError, KeyError) as error:
        return {
            'statusCode': 400,
            'body': json.dumps({'message': f'Invalid input: {str(error)}'}),
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        }
