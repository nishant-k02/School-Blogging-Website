import React from 'react';
import {
  CssBaseline,
  Grid,
  Container,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import GitHubIcon from '@mui/icons-material/GitHub';
import FacebookIcon from '@mui/icons-material/Facebook';
import XIcon from '@mui/icons-material/X';
import Header from './Header';
import MainFeaturedPost from './MainFeaturedPost';
import FeaturedPost from './FeaturedPost';
import Main from './Main';
import Sidebar from './Sidebar';
import Footer from './Footer';
import post1 from './blog-post.1.md';
import post2 from './blog-post.2.md';
import post3 from './blog-post.3.md';

const theme = createTheme({
  palette: {
    primary: {
      main: '#ff4081',
    },
    secondary: {
      main: '#651fff',
    },
    background: {
      default: '#f4f4f4',
    },
  },
  typography: {
    fontFamily: 'Poppins, sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      color: '#3f51b5',
    },
    h2: {
      fontWeight: 600,
      color: '#ff4081',
    },
    body1: {
      color: '#333',
    },
  },
  components: {
    MuiContainer: {
      styleOverrides: {
        root: {
          padding: '20px',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          padding: '20px',
          borderRadius: '10px',
          backgroundColor: '#fff',
          boxShadow: '0px 4px 10px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});

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

const mainFeaturedPost = {
  title: 'School Blogging Platform',
  description: 'A platform for students to make a difference in the world.',
  image: 'https://www.shutterstock.com/image-photo/beautiful-blurred-background-bright-classroom-260nw-2475753339.jpg',
  imageText: 'main image description',
  linkText: 'Continue reading…',
};

const featuredPosts = [
  {
    title: 'Education Post',
    date: 'Nov 12',
    description: 'This is a wider card with supporting text below.',
    image: 'https://media.istockphoto.com/id/1588288383/photo/back-view-of-student-raising-his-hand-to-answer-teachers-question-during-education-training.jpg?s=612x612&w=0&k=20&c=ZSyPrLqe6WdE81WXiESD5AqIVw1a7hKv85UI5I-Vwco=',
    imageLabel: 'Image Text',
  },
  {
    title: 'Sports Post',
    date: 'Nov 11',
    description: 'A deeper dive into sports activities on campus.',
    image: 'https://img.washingtonpost.com/wp-apps/imrs.php?src=https://arc-anglerfish-washpost-prod-washpost.s3.amazonaws.com/public/PKHXFKVZAJDUTJ4NJ77GQCK2EU_size-normalized.jpg&high_res=true&w=2048',
    imageLabel: 'Image Text',
  },
  {
    title: 'Hollywood Post',
    date: 'Nov 11',
    description: 'This is a wider card with supporting text below as a natural lead-in to additional content.',
    image: 'https://ca-times.brightspotcdn.com/dims4/default/2b84196/2147483647/strip/true/crop/3900x2600+0+0/resize/2000x1333!/quality/75/?url=https%3A%2F%2Fcalifornia-times-brightspot.s3.amazonaws.com%2Fc7%2F16%2F5c6bbf564d40b689286aab7dbf7d%2F1242049-et-hollywood-legion-theater-ajs-923.jpg',
    imageLabel: 'Image Text',
  },
  {
    title: 'Love Post',
    date: 'Nov 11',
    description: 'This is a wider card with supporting text below as a natural lead-in to additional content.',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTuLX1fkXaGUjkBFC6CXZWGyRTrqWb5YjionA&s',
    imageLabel: 'Image Text',
  },
];

const sidebar = {
  title: 'About',
  description: 'Dedicated to enriching student life through knowledge and community engagement.',
  archives: [
    { title: 'March 2020', url: '#' },
    { title: 'February 2020', url: '#' },
    { title: 'January 2020', url: '#' },
  ],
  social: [
    { name: 'GitHub', icon: GitHubIcon },
    { name: 'Twitter', icon: XIcon },
    { name: 'Facebook', icon: FacebookIcon },
  ],
};

export default function Blog() {

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg">
        <Header title="School Blogging Platform" sections={sections} />
        <main>
          <MainFeaturedPost post={mainFeaturedPost} />
          <Grid container spacing={4}>
            {featuredPosts.map((post) => (
              <FeaturedPost key={post.title} post={post} />
            ))}
          </Grid>
          <Grid container spacing={5} sx={{ mt: 3 }}>
            <Main title="Latest Insights" posts={[post1, post2, post3]} />
            <Sidebar {...sidebar} />
          </Grid>
        </main>
      </Container>
      <Footer title="Stay Connected" description="Empowering students with knowledge and a sense of community." />
    </ThemeProvider>
  );
}
