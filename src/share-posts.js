// axios
const axios = require('axios');
const { getOpenAIInstance } = require('./utils');

// generate a linkeding comment using the openai api about the blog post published
const generateLinkedInComment = async (postTitle, postUrl) => {
    try {
        const openai = getOpenAIInstance();
        const response = await openai.createCompletion({
            model: 'text-davinci-003',
            prompt: `
                Generate a linkedin post for the blog post that I wrote '${postTitle}'.
                Use first person.
                Generate the message in English and Portuguese.
                Use emojis to identify each language.
                Add tags.
            `,
            max_tokens: 600,
        });
        return response.data.choices[0].text;
    } catch (error) {
        console.log(error.response.data);
    }
};

// create a post on linkedin using the linkedin api
const createLinkedInPost = async (comment, postTitle, postUrl) => {
    const token = process.env.LINKEDIN_ACCESS_TOKEN;
    const response = await axios.post(
        'https://api.linkedin.com/v2/ugcPosts', 
        {
            author: "urn:li:person:VlY50YGlqn",
            lifecycleState: "PUBLISHED",
            visibility: {
                "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
            },
            specificContent: {
                "com.linkedin.ugc.ShareContent": {
                    shareCommentary: {
                        text: comment
                    },
                    shareMediaCategory: "ARTICLE",
                    media: [
                        {
                            status: "READY",
                            description: {
                                text: `Leandro Lima - ${postTitle}`
                            },
                            originalUrl: postUrl,
                            title: {
                                text: `${postTitle}`
                            }
                        }
                    ]
                }
            }
        }, 
        {
            headers: {
                'Authorization': `Bearer ${token}`,
                'X-Restli-Protocol-Version': '2.0.0',
            },
        }
    );
    return response;
}

const handler = async (event, context) => {
    console.log('Publishing LinkedIn post...');
    console.log(event.Records);

    for (const record of event.Records) {
        if (record.eventName === 'MODIFY') {
            const published = record.dynamodb.NewImage.published.BOOL;

            if (published) {
                console.log('Publishing LinkedIn post...');

                const title = record.dynamodb.NewImage.title.S;
                const url = record.dynamodb.NewImage.link.S;

                console.log('title', title);
                console.log('url', url);

                const comment = await generateLinkedInComment(title, url);

                console.log('comment', comment);

                const response = await createLinkedInPost(comment, title, url);

                console.log(response.data);
            }
        }
    }

    return {
        statusCode: 200,
        body: JSON.stringify({
            message: 'LinkedIn post published successfully!',
        }),
    };
}

module.exports = {
    handler,
}
