const axios = require('axios');
const { getDynamoDbInstance } = require('./utils');

// create a post on dev.to using the dev.to API
const createPost = async (post) => {
    try {
        const response = await axios.post('https://dev.to/api/articles', post, {
            headers: {
            'api-key': process.env.DEVTO_API_KEY,
            },
        });
        return response;    
    } catch (error) {
        console.log(error);
    }
};

// create a blog post using chatgpt and then post it on dev.to
const createBlogPost = async (title, postBody, tags) => {
    const post = {
        article: {
            title: title,
            published: true,
            body_markdown: postBody,
            tags,
        },
    };
    const response = await createPost(post);
    return response;
}

// update the post on DynamoDB to set the published attribute to true and the url of the post
const updatePost = async (title, link) => {
    try {
        // update the post on DynamoDB
        const dynamoDb = getDynamoDbInstance();
        const params = {
            TableName: process.env.DYNAMODB_POST_TABLE,
            Key: {
                title,
            },
            UpdateExpression: 'set published = :published, link = :link',
            ExpressionAttributeValues: {
                ':published': true,
                ':link': link,
            },
            ReturnValues: 'UPDATED_NEW',
        };

        return await dynamoDb.update(params).promise();
    } catch (error) {
        console.log(error);
    }
}

const handler = async (event, context) => {
    console.log('Publishing blog post...');
    console.log(event.Records);
    
    for (const record of event.Records) {
        if (record.eventName === 'MODIFY') {
            console.log('MODIFY event', 'publish-post');
            const published = record.dynamodb.NewImage.published.BOOL;

            if (!published) {
                console.log('Publishing blog post...');

                const title = record.dynamodb.NewImage.title.S;
                const content = record.dynamodb.NewImage.content.S;
                // tags is an array of strings
                const tags = record.dynamodb.NewImage.tags.L.map((tag) => tag.S);
                
                
                console.log('title', title);
                console.log('content', content);
                console.log('tags', tags);

                const response = await createBlogPost(title, content, tags);
                console.log('blog post', response.data);

                const url = response.data.url;

                const updatedPost = await updatePost(title, url);
                console.log('updated post', updatedPost);
            }
        }
    }

    return {
        statusCode: 200,
        body: JSON.stringify({
            message: 'Blog post published successfully!',
        }),
    };
}

module.exports = {
    handler,
};