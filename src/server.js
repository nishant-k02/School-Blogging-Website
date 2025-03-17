const express = require('express');
const bodyParser = require('body-parser');
const { Client } = require('@elastic/elasticsearch');
const cors = require('cors');


const app = express();
const port = 5000;
app.use(cors({ origin: '*' }));
const client = new Client({ node: 'http://localhost:9200' });

app.use(cors());
app.use(bodyParser.json());

app.post('/api/posts', async (req, res) => {
    try {
        const { id, title, description, category, author, date } = req.body;
        
        const result = await client.index({
            index: 'blog-posts',
            id: id.toString(),
            document: { title, description, category, author, date, likes: 0, comments: [] }
        });

        res.status(201).json({ message: 'Post saved', result });
    } catch (error) {
        console.error('Elasticsearch error:', error);
        res.status(500).json({ error: 'Failed to save post' });
    }
});

app.get('/api/posts', async (req, res) => {
    try {
        const response = await client.search({
            index: 'blog-posts',
            body: {
                query: { match_all: {} }
            }
        });

        console.log("Elasticsearch Full Response:", JSON.stringify(response, null, 2)); // Pretty print JSON

        // 🔹 Fix: Check if `hits.hits` exists and is an array
        if (!response.hits || !Array.isArray(response.hits.hits)) {
            throw new Error("Invalid Elasticsearch response structure");
        }

        const posts = response.hits.hits.map(hit => {
            // console.log("Hit object:", hit); // Log each hit for debugging
            return {
                id: hit._id,
                ...hit._source
            };
        });

        res.json(posts);
    } catch (error) {
        console.error("Error fetching posts:", error.message);
        res.status(500).json({ error: "Failed to fetch posts" });
    }
});




  app.get('/posts', async (req, res) => {
    try {
        const { body } = await client.search({
            index: 'blog-posts',
            size: 1000, // Fetch up to 1000 posts
            body: {
                query: {
                    match_all: {} // Retrieve all posts
                }
            }
        });

        const posts = body.hits.hits.map(hit => ({
            id: hit._id,
            ...hit._source
        }));

        res.json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
});
app.post('/posts/:id/like', async (req, res) => {
    const { id } = req.params;
    try {
        const { _source } = await client.get({ index: 'blog-posts', id });
    
        if (!_source) {
            return res.status(404).json({ error: 'Post not found' });
        }
    
        const updatedLikes = (_source.likes || 0) + 1;
    
        await client.update({
            index: 'blog-posts',
            id,
            body: { doc: { likes: updatedLikes } }
        });
    
        res.json({ message: 'Post liked', likes: updatedLikes });
    } catch (error) {
        if (error.meta && error.meta.statusCode === 404) {
            return res.status(404).json({ error: 'Post not found' });
        }
        console.error('Error liking post:', error);
        res.status(500).json({ error: 'Failed to like post' });
    }
    
});
app.post('/posts/:id/comment', async (req, res) => {
    const { id } = req.params;
    const { text, author } = req.body;

    try {
        //  Fetch the post from Elasticsearch
        const postResponse = await client.get({ index: 'blog-posts', id });

        if (!postResponse.found) {
            console.error("Post not found:", id);
            return res.status(404).json({ error: 'Post not found' });
        }

        //  Extract post data
        const post = postResponse._source;  // Directly access _source
        console.log("Fetched post from Elasticsearch:", post);

        //  Ensure comments array exists
        const updatedComments = [...(post.comments || []), { text, author }];

        //  Update the post with new comments
        await client.update({
            index: 'blog-posts',
            id,
            body: {
                doc: { comments: updatedComments }
            }
        });

        console.log("Updated comments:", updatedComments);
        res.json({ message: 'Comment added', comments: updatedComments });

    } catch (error) {
        console.error('Error adding comment:', error);
        if (error.meta && error.meta.statusCode === 404) {
            return res.status(404).json({ error: 'Post not found' });
        }
        res.status(500).json({ error: 'Failed to add comment' });
    }
});



app.delete('/posts/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await client.delete({ index: 'blog-posts', id });
        res.json({ message: 'Post deleted' });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ error: 'Failed to delete post' });
    }
});




app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
