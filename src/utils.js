const { 
    OpenAIApi,
    Configuration, 
} = require('openai');
const { DynamoDB } = require('aws-sdk');

// setup OpenAI API
const getOpenAIInstance = () => {
    const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY
    });
    return new OpenAIApi(configuration);
};

// setup DynamoDB
const getDynamoDbInstance = () => {
    console.log(process.env)
    return new DynamoDB.DocumentClient({
        region: process.env.AWS_REGION,
        endpoint: process.env.IS_OFFLINE ? `http://${process.env.LOCALSTACK_HOSTNAME}:4569` : undefined
    });
}

module.exports = {
    getOpenAIInstance,
    getDynamoDbInstance,
};