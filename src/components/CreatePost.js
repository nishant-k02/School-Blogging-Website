import React, { useState, useEffect } from 'react';
import { Typography, TextField, Button, Container, Paper, Box, MenuItem, Select, InputLabel, FormControl, Snackbar, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../UserContext'; 
import Header from './Header'; 

const sections = [
  { title: 'Academic Resources', url: '#' },
  { title: 'Career Services', url: '#' },
  { title: 'Campus', url: '#' },
  { title: 'Culture', url: '#' },
  { title: 'Local Community Resources', url: '#' },
  { title: 'Sports', url: '#' },
  { title: 'Health', url: '#' },
  { title: 'Wellness', url: '#' },
  { title: 'Technology', url: '#' },
  { title: 'Travel', url: '#' },
  { title: 'Alumni', url: '#' },
];

const CreatePost = () => {
  const [postTitle, setPostTitle] = useState('');
  const [postDescription, setPostDescription] = useState('');
  const [postCategory, setPostCategory] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState('https://images.unsplash.com/photo-1432821596592-e2c18b78144f?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YmxvZyUyMGJhY2tncm91bmR8ZW58MHx8MHx8fDA%3D');
  const navigate = useNavigate();
  const { user } = useUser();

  useEffect(() => {
    setBackgroundImage(`https://images.unsplash.com/photo-1432821596592-e2c18b78144f?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YmxvZyUyMGJhY2tncm91bmR8ZW58MHx8MHx8fDA%3D`);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
        alert('You must be logged in to create a post.');
        return;
    }

    setLoading(true);

    const newPost = {
        id: Date.now().toString(),
        title: postTitle,
        description: postDescription,
        category: postCategory,
        author: user.username,
        comments: [],
        date: new Date().toISOString(),
    };

    try {
        const response = await fetch('http://localhost:5000/api/posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newPost),
        });

        if (response.ok) {
            console.log('Post saved to Elasticsearch');
        } else {
            console.error('Failed to save post');
        }
    } catch (error) {
        console.error('Error:', error);
    }

    setPostTitle('');
    setPostDescription('');
    setPostCategory('');
    setOpenSnackbar(true);
    setLoading(false);

    setTimeout(() => {
        navigate('/PostsDisplay');
    }, 2000);
};


  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <React.Fragment>
      <Header title="School Blogging Platform" sections={sections} />
      <Box
        sx={{
          position: 'fixed',
          width: '100%',
          height: '100%',
          zIndex: -1,
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <Container component="main" maxWidth="md">
        <Paper
          elevation={3}
          sx={{
            p: 4,
            mt: 4,
            mb: 4,
            position: 'relative',
            zIndex: 1,
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(5px)',
            borderRadius: '10px',
          }}
        >
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#333' }}>
            Create New Post
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Title"
              autoFocus
              value={postTitle}
              onChange={(e) => setPostTitle(e.target.value)}
              InputProps={{ style: { fontWeight: 'bold' } }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Description"
              multiline
              rows={4}
              value={postDescription}
              onChange={(e) => setPostDescription(e.target.value)}
              InputProps={{ style: { fontWeight: 'bold' } }}
              inputProps={{ maxLength: 500 }}
              helperText={`${postDescription.length}/500 characters`}
            />
            <Box mt={2} mb={2}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={postCategory}
                  label="Category"
                  onChange={(e) => setPostCategory(e.target.value)}
                  sx={{ fontWeight: 'bold', backgroundColor: '#f9f9f9', borderRadius: '5px' }}
                >
                  {sections.map((section) => (
                    <MenuItem key={section.title} value={section.title}>
                      {section.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, backgroundColor: '#1976D2', color: 'white', '&:hover': { backgroundColor: '#1565C0' } }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Submit Post'}
            </Button>
          </form>
        </Paper>
      </Container>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={2000}
        onClose={handleCloseSnackbar}
        message="Post submitted successfully!"
        sx={{ bottom: 16, left: 16 }}
      />
    </React.Fragment>
  );
};

export default CreatePost;
