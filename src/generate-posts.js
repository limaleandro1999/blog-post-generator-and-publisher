const { getOpenAIInstance, getDynamoDbInstance } = require('./utils');

let posts = [];

// go on DynamoDB and get all the posts
const getAllThePosts = async () => {
    try {
        console.log('post table name', process.env.DYNAMODB_POST_TABLE)
        const dynamoDb = getDynamoDbInstance();
        const params = {
            TableName: process.env.DYNAMODB_POST_TABLE,
        };
    
        const result = await dynamoDb.scan(params).promise();
    
        return result.Items;    
    } catch (error) {
        console.log(error);
    }
}

// get recommendation prompt for the already published posts
const getRecommendationPrompt = () => {
    console.log('posts', posts);
    const notPublishedPosts = posts?.filter((post) => post.published);

    return `${notPublishedPosts.map((post) => `Title: ${post.title} URL: ${post.link}`)}`;
}

// get the next blog post title
const getNextBlogPost = () => {
    return posts?.find((post) => !post.content);
}

// use chatgpt to generate a blog post from a title
const generateBlogPost = async (title) => {
    try {
        const openai = getOpenAIInstance();
        const prompt = `
            Generate blog post using markdown with the title ${title}.
            Try to keep a good SEO score.
            Only post links that are relevant to the topic and for official sites, you can also use the blog posts that I'll metion.
            Add some code examples and try to keep the post with less than 1000 words. 
            If it's possible, choose ONLY TWO of these blog posts that are RELATABLE to the one that will be generated: ${getRecommendationPrompt()}
        `;
        console.log('prompt', prompt);
        console.log('recommentations', getRecommendationPrompt());
        
        const response = await openai.createCompletion({
            model: 'text-davinci-003',
            prompt,
            max_tokens: 3000,
        });

        console.log('finished generating');
        console.log('response', response.data);

        return response.data.choices[0].text; 
    } catch (error) {
        console.log('error', error);
        console.log(error.response.data);
    }
};

const saveBlogPost = async (title, content) => {
    try {
        // update the post on DynamoDB
        const dynamoDb = getDynamoDbInstance();
        const params = {
            TableName: process.env.DYNAMODB_POST_TABLE,
            Key: {
                title,
            },
            UpdateExpression: 'set content = :content',
            ExpressionAttributeValues: {
                ':content': content,
            },
            ReturnValues: 'UPDATED_NEW',
        };

        return await dynamoDb.update(params).promise();
    } catch (error) {
        console.log(error);
    }
}

const handler = async (event, context) => {
    console.log('Generating blog post...');
    
    posts = await getAllThePosts();
    const nextPostToBePublished = getNextBlogPost();

    if (!nextPostToBePublished) {
        console.log('There is no blog post to be published!');
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'There is no blog post to be published!',
            }),
        };
    }

    const content = await generateBlogPost(nextPostToBePublished.title);

    if (!content) {
        console.log(`Error generating blog post for ${nextPostToBePublished.title}`);

        return {
            statusCode: 500,
            body: JSON.stringify({
                message: `Error generating blog post for ${nextPostToBePublished.title}`,
            }),
        };
    }

    const response = await saveBlogPost(nextPostToBePublished.title, content);
    
    console.log(response);
    console.log('Blog post generated successfully!');

    return {
        statusCode: 200,
        body: JSON.stringify({
            message: 'Blog post generated successfully!',
        }),
    };
}

module.exports = {
    handler,
    getNextBlogPost,
    generateBlogPost,
    saveBlogPost,
};