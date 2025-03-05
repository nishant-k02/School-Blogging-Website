import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider } from './UserContext'; // Ensure this path is correct
import Login from './components/Login';
import Register from './components/Register';
import Blog from './components/Blog';
import CreatePost from './components/CreatePost';
import PostsDisplay from './components/PostsDisplay';


function App() {
  return (
    <UserProvider> {/* Wrap routes with UserProvider */}
      <Router>
        <Routes>
          <Route path="/" element={<Navigate replace to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/createpost" element={<CreatePost />} />
          <Route path="/postsdisplay" element={<PostsDisplay />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
