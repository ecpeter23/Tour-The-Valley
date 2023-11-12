# Tour The Valley

Tour The Valley is a dynamic web application designed to keep the community informed about local events, news, and weather. This project leverages AWS services for backend functionalities, including AWS Lambda for serverless computing and AWS database services for event data storage and retrieval.

## Project Structure

The website comprises the following main files and directories:

- `index.html` - The main HTML file for the website.
- `script.js` - Contains JavaScript code for dynamic interaction and AWS Lambda function integration.
- `style.css` - Stylesheet for customizing the appearance of the website.

### Key Features

- Community Events: Displays upcoming events and allows users to add new events.
- Community News: Shows the latest news articles relevant to the community.
- Local Weather: Provides current weather information for the area.

## AWS Configuration

The application uses AWS Lambda functions to interact with the AWS database where event details are stored.

### Lambda Functions

- `fetchEvents` - Retrieves event data from the AWS database.
- 'rsvpToEvent' - Iterates the peopleAttending an event by one
- `addEvent` - Allows users to add new events to the database.

### Database

- The AWS database is used to store and manage event details, such as event names, dates, descriptions, and attendance.

## Setup and Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/ecpeter23/Tour-The-Valley.git
