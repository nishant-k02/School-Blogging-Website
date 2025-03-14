const express = require('express');
const bodyParser = require('body-parser');
const { Client } = require('@elastic/elasticsearch');
const cors = require('cors');

const app = express();
const port = 5000;

const client = new Client({ node: 'http://localhost:9200' });

app.use(cors());
app.use(bodyParser.json());

app.post('/api/posts', async (req, res) => {
    try {
        const { id, title, description, category, author, date } = req.body;
        
        const result = await client.index({
            index: 'blog-posts',
            id: id.toString(),
            document: { title, description, category, author, date }
        });

        res.status(201).json({ message: 'Post saved', result });
    } catch (error) {
        console.error('Elasticsearch error:', error);
        res.status(500).json({ error: 'Failed to save post' });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
