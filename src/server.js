const { getActivityRecommendation } = require("./api.js");
const express = require('express');
const bodyParser = require('body-parser');
const { Client } = require('@elastic/elasticsearch');
const cors = require('cors');

const app = express();
const port = 5000;
app.use(cors({ origin: '*' }));
const client = new Client({ node: 'http://localhost:9200' });
const axios = require('axios');


app.use(cors({
    origin: 'http://localhost:3000', // Replace with your frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
app.use(bodyParser.json());

// Function to fetch OpenAI response, similar to fetchOpenAIResponse in api.js
async function fetchOpenAIResponse(query) {
    const prompt = `Generate a small appreciate sentence based on the query: ${query}`;
    const openaiApiKey = process.env.OPENAI_API_KEY || 'your-openai-key'; // Replace with your actual OpenAI key

    try {
      const response = await axios.post(
          'https://api.openai.com/v1/completions', // Corrected endpoint for Completions
          {
              model: "gpt-3.5-turbo-instruct", // Adjust the model as needed
              prompt: prompt,
              max_tokens: 100,
              temperature: 0.7, // Optional: adjust as needed for creativity
              top_p: 1.0,
              frequency_penalty: 0.0,
              presence_penalty: 0.0,
          },
          {
              headers: {
                  'Authorization': `Bearer ${openaiApiKey}`,
                  'Content-Type': 'application/json'
              }
          }
      );
      // Ensure we correctly handle and return the generated text
      return response.data.choices && response.data.choices.length > 0 
               ? response.data.choices[0].text.trim() 
               : "No suggestions could be found.";
    } catch (error) {
        console.error('OpenAI API error:', error.response?.data || error.message);
        throw new Error('Failed to fetch response from OpenAI');
    }
}

// Endpoint to generate suggestions using OpenAI
app.post('/api/generate-suggestion', async (req, res) => {
    const { category } = req.body;
    
    try {
      const suggestion = await fetchOpenAIResponse(category);
      res.json({ suggestion });
    } catch (error) {
      console.error('Failed to generate suggestion:', error);
      res.status(500).json({ message: 'Failed to generate suggestion', error: error.message });
    }
  });

// Create a new post and notify subscribers
app.post('/api/posts', async (req, res) => {
    try {
        const { id, title, description, category, author, date } = req.body;

        // Save the new post in Elasticsearch
        const newPost = { title, description, category, author, date, likes: 0, comments: [] };
        await client.index({
            index: 'blog-posts',
            id: id.toString(),
            document: newPost,
        });
        
        console.log(`New post created:`, newPost); // Debugging statement to confirm the post was created

        // Fetch subscribers for the category
        const { hits } = await client.search({
            index: 'subscriptions',
            body: {
                query: { match: { topic: category } },
            },
        });

        // Initialize subscribers array
        const subscribers = hits.hits.map((hit) => hit._source.userId).filter((userId) => userId !== undefined && userId !== null);;

        console.log(`Subscribers for category "${category}":`, subscribers);  // Debugging statement to confirm subscribers are fetched

        // Notify subscribers
        if (subscribers.length > 0) {
            subscribers.forEach((userId) => {
                if (notificationClients[userId]) {
                    notificationClients[userId].forEach((client) => {
                        console.log(`Sending notification to user "${userId}"`);     // Debugging statement
                        client.write(`data: ${JSON.stringify(newPost)}\n\n`);
                    });
                }
            });
        } else {
            console.log(`No subscribers found for category "${category}"`);      // Debugging statement
        }

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

// Store SSE clients for real-time notifications
let notificationClients = {};

// SSE endpoint for real-time notifications
app.get('/api/notifications', (req, res) => {
  const userId = req.query.userId;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Add the client to the notificationClients map
  notificationClients[userId] = notificationClients[userId] || [];
  notificationClients[userId].push(res);

  // Remove the client when the connection closes
  req.on('close', () => {
    notificationClients[userId] = notificationClients[userId].filter(client => client !== res);
  });
});

//endpoint for suggestions
app.post("/api/recommend", async (req, res) => {
    const { query } = req.body;
    const recommendation = await getActivityRecommendation(query);
    res.json({ response: recommendation });
  });


// Resturant, music events, sports events recommendations endpoint

app.post('/api/recommendations', async (req, res) => {
    try {
      const openaiApiKey = 'your-openai-key'; // Replace with your actual OpenAI key
      const serpApiKey = 'your-serpapi-key'; // Replace with your actual SerpAPI key
      const weatherApiKey = 'your-openweathermap-key'; // Replace with your actual OpenWeatherMap key
  
      // Step 1: Get user's current city using IP
      const locationRes = await axios.get("https://ipapi.co/json/");
      const { city, latitude, longitude } = locationRes.data;
  
      // Step 2: Get current weather
      const weatherRes = await axios.get("https://api.openweathermap.org/data/2.5/weather", {
        params: {
          q: city,
          appid: weatherApiKey,
          units: 'metric',
        }
      });
      const weatherDescription = weatherRes.data.weather[0].description;
      const temperature = weatherRes.data.main.temp;
  
      // Step 3: Fetch event data using SerpAPI
      const fetchSerpResults = async (type) => {
        const { data } = await axios.get('https://serpapi.com/search.json', {
          params: {
            q: `${type} in ${city}`,
            location: city,
            api_key: serpApiKey,
          }
        });

        // console.log(`Raw ${type} SerpAPI result:`, JSON.stringify(data, null, 2));   Debugginhg statement to check the raw data
      
        // Try local_results first
        let results = data.local_results;
        if (!Array.isArray(results)) {
          // Try places_results if local_results is not an array
          results = data.places_results;
        }
      
        if (!Array.isArray(results)) {
          return [];
        }
      
        return results.slice(0, 3); // Return only top 3
      };
      
      
  
      const restaurants = await fetchSerpResults("restaurants");
      const concerts = await fetchSerpResults("music concerts");
      const sports = await fetchSerpResults("sports events");
  
      // Step 4: Format events for frontend
      const formatResult = (result, type) => {
        const lat = result.coordinates?.latitude || result.latitude;
        const lng = result.coordinates?.longitude || result.longitude;
      
        if (!lat || !lng) return null;
      
        return {
          name: result.title || result.name || "Unknown",
          type,
          address: result.address || result.address_lines?.join(', ') || "Not available",
          hours: result.hours || "Not listed",
          lat: parseFloat(lat),
          lng: parseFloat(lng),
        };
      };
      
      
  
      const recommendations = [
        ...restaurants.map(r => formatResult(r, "restaurant")),
        ...concerts.map(c => formatResult(c, "concert")),
        ...sports.map(s => formatResult(s, "sport")),
      ].filter(Boolean); // Remove nulls
  
      // Step 5: OpenAI summary
      const promptText = `Given this weather "${weatherDescription}" with temperature ${temperature}°C in ${city}, suggest 3 restaurants, 3 concerts, and 3 sports events:\n\n` +
        recommendations.map(r => `• [${r.type.toUpperCase()}] ${r.name} at ${r.address} (${r.hours})`).join('\n');
  
      const openaiRes = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful assistant who gives local activity recommendations.' },
          { role: 'user', content: promptText }
        ]
      }, {
        headers: {
          Authorization: `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json'
        }
      });
  
      const aiSummary = openaiRes.data.choices?.[0]?.message?.content || 'No summary available.';
  
      // Step 6: Respond with everything
      res.json({
        location: { city, latitude, longitude },
        weather: { description: weatherDescription, temperature },
        recommendations,
        summary: aiSummary
      });
  
    } catch (error) {
      console.error("Error in /api/recommendations:", error.message || error);
      res.status(500).json({ error: "Failed to fetch recommendations." });
    }
  });

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});