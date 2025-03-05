import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Typography, Grid, Card, CardActionArea, CardContent, CardMedia, Button, Stack } from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import CommentIcon from '@mui/icons-material/Comment';
import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, List, ListItem, ListItemText } from '@mui/material';

function FeaturedPost(props) {
  const { post } = props;
  const [likes, setLikes] = useState(0);
  const [comments, setComments] = useState([]);
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);
  const [isViewCommentsDialogOpen, setIsViewCommentsDialogOpen] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isFullPostDialogOpen, setIsFullPostDialogOpen] = useState(false);

  const handleLike = () => {
    setLikes(likes + 1);
    console.log("Liked!");
  };

  const handleOpenCommentDialog = () => {
    setIsCommentDialogOpen(true);
  };

  const handleCloseCommentDialog = () => {
    setIsCommentDialogOpen(false);
  };

  const handleAddComment = () => {
    if (newComment.trim() !== '') {
      setComments([...comments, newComment]);
      setNewComment('');
      handleCloseCommentDialog();
    }
  };

  const handleOpenViewCommentsDialog = () => {
    setIsViewCommentsDialogOpen(true);
  };

  const handleCloseViewCommentsDialog = () => {
    setIsViewCommentsDialogOpen(false);
  };

  const handleOpenFullPostDialog = () => {
    setIsFullPostDialogOpen(true);
  };

  const handleCloseFullPostDialog = () => {
    setIsFullPostDialogOpen(false);
  };

  return (
    <Grid item xs={12} md={6}>
      <CardActionArea component="a" onClick={handleOpenFullPostDialog}>
        <Card sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <CardContent sx={{ flex: 1 }}>
            <Typography component="h2" variant="h5">
              {post.title}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {post.date}
            </Typography>
            <Typography variant="subtitle1" paragraph>
              {post.description}
            </Typography>
            <Typography variant="subtitle1" color="primary">
              Continue reading...
            </Typography>
          </CardContent>
          <CardMedia
            component="img"
            sx={{ width: '100%', height: 160 }}
            image={post.image}
            alt={post.imageLabel}
          />
          <Stack direction="row" spacing={1} justifyContent="center" alignItems="center" sx={{ padding: 2 }}>
            <Button startIcon={<FavoriteBorderIcon />} onClick={handleLike}>
              Like ({likes})
            </Button>
            <Button startIcon={<CommentIcon />} onClick={handleOpenCommentDialog}>
              Comment ({comments.length})
            </Button>
            {comments.length > 0 && (
              <Button variant="outlined" onClick={handleOpenViewCommentsDialog}>
                View Comments
              </Button>
            )}
          </Stack>
        </Card>
      </CardActionArea>

      {/* Full Post Dialog */}
      <Dialog open={isFullPostDialogOpen} onClose={handleCloseFullPostDialog}>
        <DialogTitle>{post.title}</DialogTitle>
        <DialogContent>
          <Typography variant="h6">{post.date}</Typography>
          <Typography variant="body1" paragraph>
            {post.description}
          </Typography>
          <CardMedia
            component="img"
            sx={{ width: '100%', height: 200, marginBottom: 2 }}
            image={post.image}
            alt={post.imageLabel}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseFullPostDialog}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Add Comment Dialog */}
      <Dialog open={isCommentDialogOpen} onClose={handleCloseCommentDialog}>
        <DialogTitle>Add a Comment</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Comment"
            type="text"
            fullWidth
            variant="standard"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCommentDialog}>Cancel</Button>
          <Button onClick={handleAddComment}>Add Comment</Button>
        </DialogActions>
      </Dialog>

      {/* View Comments Dialog */}
      <Dialog open={isViewCommentsDialogOpen} onClose={handleCloseViewCommentsDialog}>
        <DialogTitle>Comments</DialogTitle>
        <DialogContent>
          {comments.length > 0 ? (
            <List>
              {comments.map((comment, index) => (
                <ListItem key={index}>
                  <ListItemText primary={comment} />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography>No comments yet.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewCommentsDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
}

FeaturedPost.propTypes = {
  post: PropTypes.shape({
    date: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired,
    imageLabel: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
  }).isRequired,
};

export default FeaturedPost;
