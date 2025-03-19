import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Grid, Card, CardContent, CardMedia, Fade, TextField, Switch, FormControlLabel,
  Button, Dialog, DialogTitle, DialogContent, DialogActions, 
   Box, CssBaseline 
} from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CommentIcon from '@mui/icons-material/Comment';
// import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import Header from './Header';
import { useUser } from '../UserContext';
import { sections } from './Blog';

const PostsDisplay = () => {
  const [posts, setPosts] = useState([]);
  const [checked, setChecked] = useState(false);
  const [openCommentDialog, setOpenCommentDialog] = useState(false);
  const [currentPostId, setCurrentPostId] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [openFullPostDialog, setOpenFullPostDialog] = useState(false);
  const [currentPost, setCurrentPost] = useState(null);
  const { user: currentUser } = useUser(); 
  const [aiReplyEnabled, setAiReplyEnabled] = useState(false);
  const [aiReply, setAiReply] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);


  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/posts');
        if (!response.ok) throw new Error('Failed to fetch posts');
        
        const data = await response.json();
        setPosts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };
  
    fetchPosts();
    setChecked(true);
  }, []);

  // Handle Like
  const handleLike = async (postId) => {
    try {
      const response = await fetch(`http://localhost:5000/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) throw new Error('Failed to like post');

      setPosts(posts.map(post => 
        post.id === postId ? { ...post, liked: true, likes: (post.likes || 0) + 1 } : post
      ));
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  // Open Comment Dialog
  const handleOpenComments = (postId) => {
    setSelectedPostId(postId);
    setCurrentPostId(postId);
    setOpenCommentDialog(true);
  };
  

  const handleCloseComments = () => {
    setOpenCommentDialog(false);
    setCurrentPostId(null);
    setNewComment('');
  };

  // Add Comment
  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    // console.log("Current Post ID when adding comment:", currentPostId); // Debugging

    try {
      const response = await fetch(`http://localhost:5000/posts/${currentPostId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newComment, author: currentUser?.username }),
      });

      if (!response.ok) throw new Error('Failed to add comment');

      setPosts(posts.map(post =>
        post.id === currentPostId 
          ? { ...post, comments: [...(post.comments || []), { text: newComment, author: currentUser?.username }] }
          : post
      ));

      setNewComment('');
      handleCloseComments();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  // Handle Delete
  const handleDeletePost = (postId) => {
    setDeleteConfirmationOpen(true);
    setCurrentPostId(postId);
  };

  const confirmDeletePost = async () => {
    try {
      const response = await fetch(`http://localhost:5000/posts/${currentPostId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete post');

      setPosts(posts.filter(post => post.id !== currentPostId));
      setDeleteConfirmationOpen(false);
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const cancelDeletePost = () => {
    setDeleteConfirmationOpen(false);
  };

  // Open Full Post
  const handleOpenFullPost = (post) => {
    setCurrentPost(post);
    setOpenFullPostDialog(true);
  };

  // Close Full Post
  const handleCloseFullPost = () => {
    setOpenFullPostDialog(false);
    setCurrentPost(null);
  };

  // AI Reply Generation
  const generateAIReply = async (postId) => {
    if (!aiReplyEnabled) return;
  
    setIsLoading(true);
  
    try {
      // Find the post description based on postId
      const post = posts.find((p) => p.id === postId);  // Assuming `posts` is an array of post objects
  
      if (!post || !post.description?.trim()) {
        console.error("Error: Post description is missing.");
        setAiReply("AI reply cannot be generated without a post description.");
        setIsLoading(false);
        return;
      }
  
      console.log("Sending request:", JSON.stringify({ postId, content: post.description }));
  
      const response = await fetch("http://localhost:3002/api/generateReply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, content: post.description }),
      });
  
      if (!response.ok) throw new Error("Failed to generate AI reply");
  
      const data = await response.json();
      setAiReply(data.reply);
    } catch (error) {
      console.error("Error generating AI reply:", error);
      setAiReply("AI could not generate a reply. Please try again.");
    }
  
    setIsLoading(false);
  };
  
  

  return (
    <React.Fragment>
      <Header title="School Blogging Platform" sections={sections} />
      <CssBaseline />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          School Blogging Posts
        </Typography>
        {posts.length === 0 ? <Typography>Loading Posts...</Typography> : (
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
                    onClick={() => handleOpenFullPost(post)}
                  >
                    <CardMedia
                      component="img"
                      height="200"
                      image={post.image || 'https://picsum.photos/200/300?random=1'}
                      alt={post.title}
                    />
                    <CardContent>
                      <Typography gutterBottom variant="h5">
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
                          Like ({post.likes || 0})
                        </Button>
                        <Button startIcon={<CommentIcon />} onClick={() => handleOpenComments(post.id)}>
                          Comment
                        </Button>
                        {currentUser?.persona === 'Moderator' && (
                          <Button startIcon={<DeleteIcon />} onClick={() => handleDeletePost(post.id)} sx={{ color: 'error.main', marginLeft: 'auto' }}>
                            Delete
                          </Button>
                        )}
                      </Box>

                      {/*  Comments Section */}
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="h6">Comments:</Typography>
                        {post.comments && post.comments.length > 0 ? (
                          post.comments.map((comment, index) => (
                            <Typography key={index} sx={{ ml: 2 }}>
                              <strong>{comment.author}:</strong> {comment.text}
                            </Typography>
                          ))
                        ) : (
                          <Typography sx={{ ml: 2 }}>No comments yet.</Typography>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Fade>
            ))}
          </Grid>
        )}

        {/* Comment Dialog */}
<Dialog open={openCommentDialog} onClose={handleCloseComments} maxWidth="sm" fullWidth disableEnforceFocus={false}>
  <DialogTitle>Add a Comment</DialogTitle>
  <DialogContent>
    <TextField
      autoFocus
      fullWidth
      variant="outlined"
      label="Write a comment..."
      multiline
      rows={3}
      value={newComment}
      onChange={(e) => setNewComment(e.target.value)}
    />

    {/* AI Reply Toggle */}
    <FormControlLabel
      control={
        <Switch
          checked={aiReplyEnabled}
          onChange={() => setAiReplyEnabled(prev => !prev)}
          color="primary"
        />
      }
      label="Use AI to Generate a Reply"
      sx={{ mt: 2 }}
    />

    {/* AI Reply Button */}
    <Button 
      variant="contained" 
      onClick={() => generateAIReply(selectedPostId, newComment)} 
      disabled={!aiReplyEnabled || isLoading}
      sx={{ mt: 2 }}
    >
      {isLoading ? "Generating..." : "Generate AI Reply"}
    </Button>

    {/* Display AI Reply */}
    {aiReply && (
      <Box sx={{ mt: 2, p: 2, border: '1px solid #ccc', borderRadius: '5px', backgroundColor: '#f5f5f5' }}>
        <Typography variant="subtitle2">AI Suggestion:</Typography>
        <Typography>{aiReply}</Typography>
      </Box>
    )}
  </DialogContent>
  
  <DialogActions>
    <Button onClick={handleCloseComments} color="secondary">Cancel</Button>
    <Button onClick={handleAddComment} variant="contained">Submit</Button>
  </DialogActions>
</Dialog>


        {/* Delete Post Confirmation */}
        <Dialog open={deleteConfirmationOpen} onClose={cancelDeletePost} maxWidth="xs" fullWidth>
          <DialogTitle>Delete Post</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to delete this post?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={cancelDeletePost} color="primary">Cancel</Button>
            <Button onClick={confirmDeletePost} color="primary">Delete</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </React.Fragment>
  );
};

export default PostsDisplay;
