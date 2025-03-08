import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, Card, CardContent, CardMedia, Fade, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, Box, Avatar } from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CommentIcon from '@mui/icons-material/Comment';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import Header from './Header';
import { useUser } from '../UserContext';
import sections from './Blog'; // Import the sections variable from Blog.js
import { CssBaseline } from '@mui/material';


const PostsDisplay = () => {
  const [posts, setPosts] = useState([]);
  const [checked, setChecked] = useState(false);
  const [openCommentDialog, setOpenCommentDialog] = useState(false);
  const [currentPostId, setCurrentPostId] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [openFullPostDialog, setOpenFullPostDialog] = useState(false);  // For viewing full post
  const [currentPost, setCurrentPost] = useState(null); // Store the current post for full view
  const { user: currentUser } = useUser(); // Use the useUser hook to access the current user

  useEffect(() => {
    let loadedPosts = JSON.parse(localStorage.getItem('posts')) || [];
    const userLikes = JSON.parse(localStorage.getItem('userLikes')) || {};
    const comments = JSON.parse(localStorage.getItem('comments')) || {};

    loadedPosts = loadedPosts.map(post => ({
      ...post,
      liked: userLikes[post.id]?.includes(currentUser?.username),
      likes: userLikes[post.id]?.length || 0,
      comments: comments[post.id] || [],
    }));

    setPosts(loadedPosts);
    setChecked(true);
  }, [currentUser]);

  const handleLike = (postId) => {
    const userLikes = JSON.parse(localStorage.getItem('userLikes')) || {};
    if (userLikes[postId]?.includes(currentUser.username)) {
      // User has already liked this post
      return;
    }
    const updatedLikes = userLikes[postId] ? [...userLikes[postId], currentUser.username] : [currentUser.username];
    localStorage.setItem('userLikes', JSON.stringify({ ...userLikes, [postId]: updatedLikes }));

    setPosts(posts.map(post => {
      if (post.id === postId) {
        return { ...post, liked: true, likes: post.likes + 1 };
      }
      return post;
    }));
  };

  const handleOpenComments = (postId) => {
    setCurrentPostId(postId);
    setOpenCommentDialog(true);
  };

  const handleCloseComments = () => {
    setOpenCommentDialog(false);
    setCurrentPostId(null);
    setNewComment('');
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comments = JSON.parse(localStorage.getItem('comments')) || {};
      const updatedComments = {
        ...comments,
        [currentPostId]: [...(comments[currentPostId] || []), { text: newComment, author: currentUser.username }], // Include the current user's username
      };

      localStorage.setItem('comments', JSON.stringify(updatedComments));

      setPosts(posts.map(post => {
        if (post.id === currentPostId) {
          return { ...post, comments: [...post.comments, { text: newComment, author: currentUser.username }] };
        }
        return post;
      }));

      setNewComment('');
      handleCloseComments();
    }
  };

  const handleDeletePost = (postId) => {
    setDeleteConfirmationOpen(true);
    setCurrentPostId(postId);
  };

  const confirmDeletePost = () => {
    const updatedPosts = posts.filter(post => post.id !== currentPostId);
    setPosts(updatedPosts);
    localStorage.setItem('posts', JSON.stringify(updatedPosts));
    setDeleteConfirmationOpen(false);
  };

  const cancelDeletePost = () => {
    setDeleteConfirmationOpen(false);
  };

  // Open full post dialog
  const handleOpenFullPost = (post) => {
    setCurrentPost(post);
    setOpenFullPostDialog(true);
  };

  // Close full post dialog
  const handleCloseFullPost = () => {
    setOpenFullPostDialog(false);
    setCurrentPost(null);
  };

  return (
    <React.Fragment>
      <Header title="School Blogging Platform" sections={sections} />
      <CssBaseline /> {/* Apply baseline styles */}
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
          School Blogging Posts
        </Typography>
        <Grid container spacing={4}>
          {posts.map((post, index) => (
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
                  onClick={() => handleOpenFullPost(post)} // Click to open full post
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
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                      <Button startIcon={post.liked ? <FavoriteIcon /> : <FavoriteBorderIcon />} onClick={() => handleLike(post.id)}>
                        Like ({post.likes})
                      </Button>
                      <Button startIcon={<CommentIcon />} onClick={() => handleOpenComments(post.id)}>
                        Comment
                      </Button>
                      {currentUser?.persona === 'Moderator' && (
                        <Button
                          startIcon={<DeleteIcon />}
                          onClick={() => handleDeletePost(post.id)}
                          sx={{
                            color: (theme) => theme.palette.error.main,
                            textTransform: 'none',
                            fontWeight: 'bold',
                            marginLeft: 'auto',
                          }}
                        >
                          Delete
                        </Button>
                      )}
                    </Box>
                    {post.comments.map((comment, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <Avatar sx={{ width: 24, height: 24, mr: 1 }}>{comment.author.charAt(0)}</Avatar>
                        <Typography variant="body2" color="text.secondary">
                          {`${comment.author}: ${comment.text}`}
                        </Typography>
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              </Grid>
            </Fade>
          ))}
        </Grid>

        {/* Full Post Dialog */}
        <Dialog open={openFullPostDialog} onClose={handleCloseFullPost} maxWidth="md" fullWidth>
          <DialogTitle>{currentPost?.title}</DialogTitle>
          <DialogContent>
            <CardMedia
              component="img"
              height="400"
              width="500"
              image={currentPost?.image || 'https://picsum.photos/200/300?random=1'}
              alt={currentPost?.title}
            />
            <Typography variant="body1" sx={{ mt: 2 }}>
              {currentPost?.description}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              {currentPost?.content}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseFullPost}>Close</Button>
          </DialogActions>
        </Dialog>

        <Dialog open={openCommentDialog} onClose={handleCloseComments} maxWidth="sm" fullWidth>
          <DialogTitle>Add a comment
            <IconButton
              aria-label="close"
              onClick={handleCloseComments}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label="Comment"
              type="text"
              fullWidth
              variant="standard"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleAddComment}>Add Comment</Button>
          </DialogActions>
        </Dialog>
        
        {/* Delete Post Confirmation */}
        <Dialog
          open={deleteConfirmationOpen}
          onClose={cancelDeletePost}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle>Delete Post</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to delete this post?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={cancelDeletePost} color="primary">
              Cancel
            </Button>
            <Button onClick={confirmDeletePost} color="primary">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </React.Fragment>
  );
};

export default PostsDisplay;
