import json
import boto3
from botocore.exceptions import ClientError


def lambda_handler(event, context):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('Events')

    try:
        body = json.loads(event['body'])
        event_id = int(body['eventId'])  # Convert eventId to an integer

        # Update the 'PeopleAttending' field in the DynamoDB table
        response = table.update_item(
            Key={'EventID': event_id},
            UpdateExpression='SET PeopleAttending = PeopleAttending + :inc',
            ExpressionAttributeValues={':inc': 1}
        )

        return {
            'statusCode': 200,
            'body': json.dumps(response),
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'  # Necessary for CORS
            }
        }
    except ClientError as e:
        print("DynamoDB error:", e.response['Error']['Message'])
        return {
            'statusCode': 500,
            'body': json.dumps({'message': 'Error RSVPing to event'})
        }
    except (ValueError, TypeError):
        return {
            'statusCode': 400,
            'body': json.dumps({'message': 'Invalid event ID format'})
        }
