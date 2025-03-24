import React, { useState, useEffect, useRef } from 'react';
import { Box, TextField, IconButton, Typography, List, ListItem, ListItemText, ListItemAvatar, Avatar, Paper, Container, AppBar } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import axios from 'axios';
import Header from './Header';
// import Footer from './Footer';

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

const ChatComponent = () => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const endOfMessagesRef = useRef(null);

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const newMessage = { user: 'You', text: userInput, timestamp: new Date().toLocaleTimeString() };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setUserInput('');

    try {
      const response = await axios.post('http://localhost:3002/api/getSuggestions', {
        query: userInput
      });

      const botResponse = { user: 'Bot', text: response.data.suggestion || "I'm not sure how to respond to that.", timestamp: new Date().toLocaleTimeString() };
      setMessages((prevMessages) => [...prevMessages, botResponse]);
    } catch (error) {
      console.error('Error fetching suggestion:', error);
      const errorMessage = { user: 'Bot', text: 'Sorry, something went wrong. Please try again later.', timestamp: new Date().toLocaleTimeString() };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <AppBar position="fixed" sx={{ zIndex: 1100, backgroundColor: 'white', color: 'black' }}>
        <Header title="School Blogging Platform" sections={sections} />
      </AppBar>
      
      {/* Background image container */}
      <Box
        sx={{
          position: 'fixed',
          width: '100%',
          height: '100%',
          zIndex: -1,
          backgroundImage: "url('https://th.bing.com/th/id/R.d35cb820b02b78a3023c9fe4bc8f218d?rik=IdcsTsiRGJnVXw&pid=ImgRaw&r=0')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      
      {/* Chat interface container */}
      <Container sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Paper elevation={3} sx={{ maxWidth: 600, margin: 'auto', padding: 2, position: 'relative', zIndex: 1, marginTop: 20 }}>
          <Typography variant="h4" textAlign="center" gutterBottom>Chat with AI Assistant</Typography>
          <List sx={{ maxHeight: 300, overflow: 'auto', mb: 5 }}>
            {messages.map((msg, index) => (
              <ListItem key={index} alignItems="flex-start">
                <ListItemAvatar>
                  <Avatar>
                    {msg.user === 'Bot' ? <ChatBubbleOutlineIcon /> : <PersonOutlineIcon />}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary={`${msg.user} (${msg.timestamp})`} secondary={msg.text} />
              </ListItem>
            ))}
            <div ref={endOfMessagesRef} />
          </List>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TextField
              fullWidth
              variant="outlined"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your message..."
              sx={{ mr: 1 }}
            />
            <IconButton onClick={handleSendMessage} color="primary"><SendIcon /></IconButton>
          </Box>
        </Paper>
      </Container>
      {/* <Footer title="School Blog Footer" description="Empowering students with knowledge and a sense of community." /> */}
    </Box>
  );
};

export default ChatComponent;
