import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, Card, CardContent, CardMedia, Fade, Box, IconButton, Collapse, TextField, Button } from '@mui/material';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import { useUser } from '../UserContext';
import { CssBaseline } from '@mui/material';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import AddCommentIcon from '@mui/icons-material/AddComment';

const SearchResults = () => {
  const [posts, setPosts] = useState([]);
  const [checked, setChecked] = useState(false);
  const [expandedPost, setExpandedPost] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [userLikes, setUserLikes] = useState({});
  const { user: currentUser } = useUser(); // Retrieve current user
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('query') || ''; // Get search query from URL params
  
  // Get posts from localStorage and Blog.js posts (featured posts)
  useEffect(() => {
    let loadedPosts = JSON.parse(localStorage.getItem('posts')) || [];
    const userLikes = JSON.parse(localStorage.getItem('userLikes')) || {};
    const comments = JSON.parse(localStorage.getItem('comments')) || {};

    loadedPosts = loadedPosts.map(post => ({
      ...post,
      liked: userLikes[post.id]?.includes(currentUser?.username), // Add check for currentUser
      likes: userLikes[post.id]?.length || 0,
      comments: comments[post.id] || [],
    }));

    // Combine localStorage posts with featured posts
    const combinedPosts = [
      ...loadedPosts,
      ...[
        { id: 'featured-1', title: 'Education Post', description: 'This is a wider card with supporting text below.', category: 'Education', author: 'Admin', image: 'https://media.istockphoto.com/id/1588288383/photo/back-view-of-student-raising-his-hand-to-answer-teachers-question-during-education-training.jpg?s=612x612&w=0&k=20&c=ZSyPrLqe6WdE81WXiESD5AqIVw1a7hKv85UI5I-Vwco=', likes: 0, comments: [] },
        { id: 'featured-2', title: 'Sports Post', description: 'A deeper dive into sports activities on campus.', category: 'Sports', author: 'Admin', image: 'https://img.washingtonpost.com/wp-apps/imrs.php?src=https://arc-anglerfish-washpost-prod-washpost.s3.amazonaws.com/public/PKHXFKVZAJDUTJ4NJ77GQCK2EU_size-normalized.jpg&high_res=true&w=2048', likes: 0, comments: [] },
        { id: 'featured-3', title: 'Hollywood Post', description: 'A wider card with supporting text below as a natural lead-in to additional content.', category: 'Entertainment', author: 'Admin', image: 'https://ca-times.brightspotcdn.com/dims4/default/2b84196/2147483647/strip/true/crop/3900x2600+0+0/resize/2000x1333!/quality/75/?url=https%3A%2F%2Fcalifornia-times-brightspot.s3.amazonaws.com%2Fc7%2F16%2F5c6bbf564d40b689286aab7dbf7d%2F1242049-et-hollywood-legion-theater-ajs-923.jpg', likes: 0, comments: [] }
      ]
    ];

    setPosts(combinedPosts);
    setUserLikes(userLikes);
    setChecked(true);
  }, [currentUser]);

  // Filter posts based on search query
  const filteredPosts = posts.filter((post) => {
    const searchText = searchQuery.trim().toLowerCase();
    return (
      searchText === '' || // Show all posts if search input is empty
      post.title.toLowerCase().includes(searchText) ||
      post.description.toLowerCase().includes(searchText) ||
      post.category.toLowerCase().includes(searchText) ||
      post.author.toLowerCase().includes(searchText)
    );
  });

  const handleExpandClick = (postId) => {
    setExpandedPost(expandedPost === postId ? null : postId);
  };

  const handleLikeClick = (postId) => {
    if (!currentUser) {
      alert("You must be logged in to like a post.");
      return;
    }

    const updatedLikes = { ...userLikes };
    const postLikes = updatedLikes[postId] || [];
    if (postLikes.includes(currentUser.username)) {
      postLikes.splice(postLikes.indexOf(currentUser.username), 1);
    } else {
      postLikes.push(currentUser.username);
    }
    updatedLikes[postId] = postLikes;
    setUserLikes(updatedLikes);
    localStorage.setItem('userLikes', JSON.stringify(updatedLikes));
  };

  const handleCommentSubmit = (postId) => {
    if (!currentUser) {
      alert("You must be logged in to comment.");
      return;
    }

    if (commentText.trim()) {
      const updatedComments = { ...JSON.parse(localStorage.getItem('comments') || '{}') };
      const postComments = updatedComments[postId] || [];
      postComments.push({ author: currentUser.username, text: commentText });
      updatedComments[postId] = postComments;

      localStorage.setItem('comments', JSON.stringify(updatedComments));
      setPosts(posts.map(post => post.id === postId ? { ...post, comments: postComments } : post));
      setCommentText("");
    }
  };

  if (!currentUser) {
    return (
      <Container>
        <Typography variant="h6" color="text.secondary">
          You must be logged in to view and interact with the posts.
        </Typography>
      </Container>
    );
  }

  return (
    <React.Fragment>
      <Header title="Search Results" />
      <CssBaseline />
      <Container maxWidth="lg" sx={{
        mt: 4,
        mb: 4,
        backgroundImage: 'url("https://source.unsplash.com/random/School")',
        backgroundSize: 'cover',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
      }}>
        <Typography variant="h4" gutterBottom sx={{ color: '#fff' }}>
          Search Results
        </Typography>

        {/* Show Posts if available */}
        {filteredPosts.length > 0 ? (
          <Grid container spacing={4}>
            {filteredPosts.map((post, index) => (
              <Fade in={checked} style={{ transitionDelay: `${index * 100}ms` }} key={post.id}>
                <Grid item xs={12} sm={6} md={4} sx={{ position: 'relative' }}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      cursor: 'pointer',
                      '&:hover': {
                        transform: 'scale(1.05)',
                        transition: 'transform 0.3s ease',
                      },
                    }}
                    onClick={() => handleExpandClick(post.id)} // Expand on click
                  >
                    <CardMedia
                      component="img"
                      height="200"
                      image={post.image || 'https://picsum.photos/200/300?random=1'}
                      alt={post.title}
                    />
                    <CardContent>
                      <Typography gutterBottom variant="h5" component="div">
                        {post.title}
                      </Typography>
                      <Typography variant="subtitle1" color="text.secondary">
                        {post.description}
                      </Typography>
                      <Typography variant="subtitle2" color="text.secondary">
                        Category: {post.category}
                      </Typography>
                      <Typography variant="subtitle2" color="text.secondary">
                        Posted by: {post.author}
                      </Typography>
                    </CardContent>

                    {/* Expand content */}
                    <Collapse in={expandedPost === post.id}>
                      <CardContent>
                        <Typography variant="h6">Likes: {post.likes}</Typography>
                        <IconButton onClick={() => handleLikeClick(post.id)}>
                          <ThumbUpAltIcon color={post.liked ? 'primary' : 'disabled'} />
                        </IconButton>
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="h6">Comments:</Typography>
                          {post.comments.length > 0 ? (
                            <Box>
                              {post.comments.map((comment, index) => (
                                <Box key={index} sx={{ mb: 1 }}>
                                  <Typography variant="body2">
                                    <strong>{comment.author}:</strong> {comment.text}
                                  </Typography>
                                </Box>
                              ))}
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary">No comments yet.</Typography>
                          )}
                          <TextField
                            fullWidth
                            label="Add a comment"
                            variant="outlined"
                            size="small"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            sx={{ mt: 2 }}
                          />
                          <Button
                            variant="contained"
                            color="primary"
                            startIcon={<AddCommentIcon />}
                            onClick={() => handleCommentSubmit(post.id)}
                            sx={{ mt: 1 }}
                          >
                            Add Comment
                          </Button>
                        </Box>
                      </CardContent>
                    </Collapse>
                  </Card>
                </Grid>
              </Fade>
            ))}
          </Grid>
        ) : (
          <Typography variant="h6" color="text.secondary">
            No results found.
          </Typography>
        )}
      </Container>
    </React.Fragment>
  );
};

export default SearchResults;
