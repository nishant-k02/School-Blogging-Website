import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider } from './UserContext'; // Ensure this path is correct
import Login from './components/Login';
import Register from './components/Register';
import Blog from './components/Blog';
// import CreatePost from './components/CreatePost';


function App() {
  return (
    <UserProvider> {/* Wrap routes with UserProvider */}
      <Router>
        <Routes>
          <Route path="/" element={<Navigate replace to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/blog" element={<Blog />} />
          {/* <Route path="/createpost" element={<CreatePost />} /> */}
          {/* <Route path="/PostsDisplay" element={<PostsDisplay />} />
          <Route path="/profile" element={<Profile />} /> */}
          {/* ... other routes */}
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
