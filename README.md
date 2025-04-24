# 📝 BlogBoard

A full-stack blogging platform tailored for school users to post articles, interact via comments and likes, and receive AI-powered recommendations based on real-time weather and location data.

---

## 🔧 Tech Stack

- **Frontend:** React, Material-UI, Google Maps JavaScript API
- **Backend:** Node.js + Express.js
- **Database:** Elasticsearch
- **AI Integration:** OpenAI Chat Completion API
- **Search Integration:** SerpAPI
- **Weather Integration:** OpenWeatherMap API
- **Location:** HTML5 Geolocation API / IPAPI

---

## ✨ Key Features

### 📰 Blogging System

- Users can **create, view, like, and delete posts**
- **Comment system** with optional AI-generated replies
- Metadata display: category, author, likes, comments

### 🤖 AI-Powered Comment Replies

- Toggle switch to **enable AI reply generation**
- Uses **OpenAI GPT-3.5** to craft thoughtful responses

### 🔔 Subscription & Notification System

- Users can **subscribe/unsubscribe** to specific post categories
- New post triggers **real-time notification** to relevant subscribers
- Notifications are viewable from a dedicated UI dialog

### 📍 "Recommended For You" Smart Assistant

- Located in the top right of the app as a **button**
- On click, shows a **popup** with:
  - 🗺️ **Google Map** with 10 balloons:
    - 🟢 Green → Current location
    - 🔴 Red → 3 Restaurants
    - 🔵 Blue → 3 Concerts/Musical Events
    - 🟡 Yellow → 3 Sports Events
  - 🧠 AI-generated recommendation (based on weather and location)
- Real-time data pulled from:
  - 📍 HTML5 Geolocation
  - 🌤️ OpenWeatherMap API
  - 🔎 SerpAPI

---

## 🗂️ Project Structure

```
nishant-k02-school-blogging-website/
├── README.md
├── package.json
├── public/
│   ├── index.html
│   ├── manifest.json
│   └── robots.txt
└── src/
    ├── api.js                # OpenAI, SerpAPI, Weather integration
    ├── server.js             # Express server and Elasticsearch routes
    ├── UserContext.js        # Auth and user state management
    ├── App.js                # Root React component
    ├── components/           # All major UI components
    │   ├── Header.js         # Navigation, chatbot, recommendations
    │   ├── PostsDisplay.js   # Post cards, comments, AI replies
    │   ├── CreatePost.js     # Post creation form
    │   ├── chatbot.js        # AI assistant chatbot UI
    │   ├── SearchResults.js  # Search results using Elasticsearch
    │   ├── Login.js / Register.js
    │   └── Blog.js, Main.js, etc.
    ├── Data/
    │   ├── posts.json
    │   ├── posts.xml
    │   ├── users.xml
    │   └── initialUsersData.js
    └── Utils/
        ├── localStorageUtils.js
        ├── storageUtils.js
        └── xmlUtils.js
```

---

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/school-blogging-platform.git
cd school-blogging-platform
```

### 2. Install Dependencies

#### Backend:

```bash
cd backend
npm install
```

#### Frontend:

```bash
cd ../
npm install
```

### 3. Configure Environment

Create `.env` file in `backend/` with the following:

```
OPENAI_API_KEY=your_openai_api_key
SERP_API_KEY=your_serpapi_key
OPENWEATHERMAP_API_KEY=your_openweathermap_key
```

### 4. Run the Backend

```bash
cd backend
node server.js
```

### 5. Run the Frontend

```bash
npm start
```

---

## 📫 API Testing with Postman

Here are some useful endpoints to test:

| Method | Endpoint                     | Description                      |
| ------ | ---------------------------- | -------------------------------- |
| GET    | `/api/posts`                 | Retrieve all posts               |
| POST   | `/api/posts`                 | Create a new post                |
| POST   | `/posts/:id/comment`         | Add comment to a post            |
| POST   | `/posts/:id/like`            | Like a post                      |
| POST   | `/api/subscribe`             | Subscribe to a topic             |
| POST   | `/api/unsubscribe`           | Unsubscribe from a topic         |
| GET    | `/api/subscriptions/:userId` | Get user subscriptions           |
| POST   | `/api/generateReply`         | Generate AI comment for a post   |
| POST   | `/api/recommend`             | Get real-time AI recommendations |

---

## 🔍 View Elasticsearch Data

To view your indexed data in Elasticsearch, visit:

```
http://localhost:9200/blog-posts/_search?pretty
http://localhost:9200/subscriptions/_search?pretty
```

(Ensure Elasticsearch is running locally on port `9200`)

---

## 🧠 Powered By

- [OpenAI](https://platform.openai.com/)
- [OpenWeatherMap](https://openweathermap.org/)
- [SerpAPI](https://serpapi.com/)
- [Google Maps JavaScript API](https://developers.google.com/maps)
- [Elasticsearch](https://www.elastic.co/elasticsearch/)

---
