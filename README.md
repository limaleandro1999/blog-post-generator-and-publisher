# Automated Blog Post Generator and Publisher

A serverless application that generates blog posts, publishes them on dev.to, and shares them on LinkedIn using OpenAI, AWS Lambda, DynamoDB, and Axios.

## Overview

This project is a serverless application that automates the process of generating blog posts, publishing them on [dev.to](https://dev.to), and sharing them on LinkedIn. It uses the following technologies:

- [OpenAI](https://openai.com/) to generate blog post content
- [AWS Lambda](https://aws.amazon.com/lambda/) to run the serverless application
- [DynamoDB](https://aws.amazon.com/dynamodb/) to store the metadata for each blog post
- [Axios](https://axios-http.com/) to interact with the dev.to and LinkedIn APIs

## Architecture

![Architecture diagram](https://i.imgur.com/ZnvBhJw.png)

The application consists of the following components:

- **Lambda function**: This is the main component of the application. It listens to changes in a DynamoDB table and triggers a function to generate a new blog post, publish it on dev.to, and share it on LinkedIn.
- **DynamoDB table**: This table stores the metadata for each blog post, including the title, URL, and publication status.
- **OpenAI**: This service generates the content for each blog post based on a given prompt.
- **dev.to API**: This API is used to publish blog posts on the dev.to platform.
- **LinkedIn API**: This API is used to share blog posts on LinkedIn.

## Usage

To use this application, you'll need to set up the following prerequisites:

- An AWS account with sufficient permissions to create and manage Lambda functions and DynamoDB tables.
- An OpenAI API key.
- A dev.to account and API key.
- A LinkedIn account and API key.

Once you have these prerequisites set up, you can deploy the application to your AWS account and configure the necessary environment variables for your OpenAI, dev.to, and LinkedIn API keys. Once deployed, the application will automatically generate, publish, and share blog posts based on the settings you've configured.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.