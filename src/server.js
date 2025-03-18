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

// Create a new post and notify subscribers
app.post('/api/posts', async (req, res) => {
    try {
        const { id, title, description, category, author, date } = req.body;
        
        await client.index({
            index: 'blog-posts',
            id: id.toString(),
            document: { title, description, category, author, date, likes: 0, comments: [] }
        });

        // Notify subscribers
        const { hits } = await client.search({
            index: 'subscriptions',
            body: {
                query: { match: { topic: category } } 
            }
        });

        const subscribers = hits.hits.map(hit => hit._source.userId);
        console.log(`Notifying subscribers:`, subscribers);

        res.status(201).json({ message: 'Post saved and subscribers notified', subscribers });
    } catch (error) {
        console.error('Elasticsearch error:', error);
        res.status(500).json({ error: 'Failed to save post' });
    }
});

// Fetch all posts
app.get('/api/posts', async (req, res) => {
    try {
        const response = await client.search({
            index: 'blog-posts',
            body: { query: { match_all: {} } }
        });

        if (!response.hits || !Array.isArray(response.hits.hits)) {
            throw new Error("Invalid Elasticsearch response structure");
        }

        const posts = response.hits.hits.map(hit => ({
            id: hit._id,
            ...hit._source
        }));

        res.json(posts);
    } catch (error) {
        console.error("Error fetching posts:", error.message);
        res.status(500).json({ error: "Failed to fetch posts" });
    }
});

// Like a post
app.post('/posts/:id/like', async (req, res) => {
    const { id } = req.params;
    try {
        const { _source } = await client.get({ index: 'blog-posts', id });
        if (!_source) return res.status(404).json({ error: 'Post not found' });

        const updatedLikes = (_source.likes || 0) + 1;
        await client.update({ index: 'blog-posts', id, body: { doc: { likes: updatedLikes } } });

        res.json({ message: 'Post liked', likes: updatedLikes });
    } catch (error) {
        if (error.meta && error.meta.statusCode === 404) {
            return res.status(404).json({ error: 'Post not found' });
        }
        console.error('Error liking post:', error);
        res.status(500).json({ error: 'Failed to like post' });
    }
});

// Add a comment to a post
app.post('/posts/:id/comment', async (req, res) => {
    const { id } = req.params;
    const { text, author } = req.body;

    try {
        const postResponse = await client.get({ index: 'blog-posts', id });
        if (!postResponse.found) return res.status(404).json({ error: 'Post not found' });

        const post = postResponse._source;
        const updatedComments = [...(post.comments || []), { text, author }];
        await client.update({ index: 'blog-posts', id, body: { doc: { comments: updatedComments } } });

        res.json({ message: 'Comment added', comments: updatedComments });
    } catch (error) {
        if (error.meta && error.meta.statusCode === 404) {
            return res.status(404).json({ error: 'Post not found' });
        }
        console.error('Error adding comment:', error);
        res.status(500).json({ error: 'Failed to add comment' });
    }
});

// Delete a post
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

// Search for posts
app.get('/api/search', async (req, res) => {
    const { query } = req.query;
    try {
        const { hits } = await client.search({
            index: 'blog-posts',
            body: { query: { multi_match: { query, fields: ['title', 'description', 'category', 'author'] } } }
        });

        const results = hits.hits.map(hit => ({ id: hit._id, ...hit._source }));
        res.json(results);
    } catch (error) {
        console.error('Elasticsearch search error:', error);
        res.status(500).json({ error: 'Search failed' });
    }
});

// Subscribe to a topic
app.post('/api/subscribe', async (req, res) => {
    try {
        const { userId, topic } = req.body;
        await client.index({
            index: 'subscriptions',
            id: `${userId}-${topic}`,
            document: { userId, topic }
        });

        res.json({ message: `Subscribed to ${topic}` });
    } catch (error) {
        console.error('Error subscribing:', error);
        res.status(500).json({ error: 'Subscription failed' });
    }
});

// Unsubscribe from a topic
app.post('/api/unsubscribe', async (req, res) => {
    try {
        const { userId, topic } = req.body;
        await client.delete({
            index: 'subscriptions',
            id: `${userId}-${topic}`
        });

        res.json({ message: `Unsubscribed from ${topic}` });
    } catch (error) {
        if (error.meta && error.meta.statusCode === 404) {
            return res.status(404).json({ error: 'Subscription not found' });
        }
        console.error('Error unsubscribing:', error);
        res.status(500).json({ error: 'Unsubscription failed' });
    }
});

// Get all subscriptions for a user
app.get('/api/subscriptions/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { hits } = await client.search({
            index: 'subscriptions',
            body: { query: { match: { userId } } }
        });

        const topics = hits.hits.map(hit => hit._source.topic);
        res.json({ userId, subscriptions: topics });
    } catch (error) {
        console.error('Error fetching subscriptions:', error);
        res.status(500).json({ error: 'Failed to fetch subscriptions' });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
