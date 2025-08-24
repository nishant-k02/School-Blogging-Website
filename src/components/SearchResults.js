import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, Card, CardContent, CardMedia, Fade } from '@mui/material';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import Header from './Header';
// import { useUser } from '../UserContext';
import { CssBaseline } from '@mui/material';
// import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
// import AddCommentIcon from '@mui/icons-material/AddComment';

const SearchResults = () => {
  const [posts, setPosts] = useState([]);
  const [checked, setChecked] = useState(false);
  // const [expandedPost, setExpandedPost] = useState(null);
  // const [commentText, setCommentText] = useState("");
  // const [userLikes, setUserLikes] = useState({});
  // const { user: currentUser } = useUser();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('query') || '';

  useEffect(() => {
    const fetchSearchResults = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/search?query=' + encodeURIComponent(searchQuery));
        setPosts(response.data);
        setChecked(true);
      } catch (error) {
        console.error("Error fetching search results:", error);
      }
    };

    if (searchQuery) {
      fetchSearchResults();
    }
  }, [searchQuery]);

  return (
    <React.Fragment>
      <Header title="Search Results" />
      <CssBaseline />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Search Results
        </Typography>

        {posts.length > 0 ? (
          <Grid container spacing={4}>
            {posts.map((post, index) => (
              <Fade in={checked} style={{ transitionDelay: `${index * 100}ms` }} key={post.id}>
                <Grid item xs={12} sm={6} md={4} sx={{ position: 'relative' }}>
                  <Card>
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
                    </CardContent>
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
