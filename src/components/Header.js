import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import NotificationsIcon from '@mui/icons-material/Notifications';
import UnsubscribeIcon from '@mui/icons-material/Unsubscribe';
import SubscriptionsIcon from '@mui/icons-material/Subscriptions';
import {
  Avatar, Button, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Switch,ListSubheader,
  Toolbar, Typography, Drawer, List, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box, Divider, ListItem, Slide
} from '@mui/material';
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';

import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import CreateIcon from '@mui/icons-material/Create';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SearchIcon from '@mui/icons-material/Search';
import ManageUsersIcon from '@mui/icons-material/Group';
import DeleteIcon from '@mui/icons-material/Delete';
import HomeIcon from '@mui/icons-material/Home';
import FaceIcon from '@mui/icons-material/Face';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useUser } from '../UserContext';
import { getUserDataFromLocalStorage, saveUserDataToLocalStorage } from '../Utils/xmlUtils';
import axios from 'axios';
import { Badge } from '@mui/material';
import EventRecommendation from '../components/EventRecommendation';


function Header({ sections = [], title = '' }) {
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isProfileDialogOpen, setProfileDialogOpen] = useState(false);
  const [isManageUsersDialogOpen, setManageUsersDialogOpen] = useState(false);
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState(user?.password || '');
  const [profileMessage, setProfileMessage] = useState('');
  const [users, setUsers] = useState(getUserDataFromLocalStorage());
  const [newUser, setNewUser] = useState({ username: '', email: '', password: '', persona: '' });
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [notifications, setNotifications] = useState([]);
  // const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isNotificationsDialogOpen, setNotificationsDialogOpen] = useState(false);
  const [isSubscribeOpen, setSubscribeOpen] = useState(false);

  const [subscribedCategories, setSubscribedCategories] = useState(user ? user.subscribedCategories || [] : []);

  const [isChatbotOpen, setChatbotOpen] = useState(false);

  const [recommendations, setRecommendations] = useState([]);
const [aiSummary, setAiSummary] = useState('');
const [mapCenter, setMapCenter] = useState({ lat: 41.8781, lng: -87.6298 }); // Default Chicago
const [selectedRec, setSelectedRec] = useState(null);

const [isRecOpen, setRecOpen] = useState(false);

// eslint-disable-next-line
const handleRegenerate = () => {
  handleChatbotOpen({ stopPropagation: () => {} });
};


useEffect(() => {
  // console.log("Fetched recommendations:", recommendations);
}, [recommendations]);


useEffect(() => {
  if (!user) return;

  const fetchSubscriptionsAndSetupSSE = async () => {
    try {
      // Fetch subscriptions
      const response = await fetch(`http://localhost:5000/api/subscriptions/${user.username}`);
      if (response.ok) {
        const data = await response.json();
        setSubscribedCategories(data.subscriptions); // Update subscribed categories
        // console.log("Fetched subscriptions:", data.subscriptions); // Debugging

        // Set up SSE connection
        const eventSource = new EventSource(`http://localhost:5000/api/notifications?userId=${user.username}`);
        // console.log(`SSE connection established for user "${user.username}"`);

        eventSource.onmessage = (event) => {
          try {
            const newPost = JSON.parse(event.data);
            console.log(`Received notification from server:`, newPost);

            console.log("Subscribed categories:", data.subscriptions);
            if (data.subscriptions.includes(newPost.category)) {
              console.log(`Adding notification for category "${newPost.category}"`);
              setNotifications((prevNotifications) => [
                { id: Date.now(), message: `New post in "${newPost.category}": "${newPost.title}"` },
                ...prevNotifications,
              ]);
            } else {
              console.log(`Ignoring notification for category "${newPost.category}"`);
            }
          } catch (error) {
            console.error("Error parsing notification data:", error);
          }
        };

        eventSource.onerror = () => {
          console.error("EventSource connection failed.");
          eventSource.close();
        };

        return () => eventSource.close(); // Cleanup logic to close SSE connection
      } else {
        console.error("Failed to fetch subscriptions");
      }
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
    }
  };

  fetchSubscriptionsAndSetupSSE(); // Fetch subscriptions and set up SSE
}, [user]);

// Log notifications only once during state updates
useEffect(() => {
  // console.log("Current notifications:", notifications);
}, [notifications]);


// Prevent modal from closing when interacting inside
// eslint-disable-next-line
const handleModalClick = (event) => {
  event.stopPropagation(); // Prevents modal from closing on clicks inside
};

const handleChatbotOpen = async (event) => {
  event.stopPropagation();
  setChatbotOpen(true);

  try {
    const response = await axios.post('http://localhost:5000/api/recommendations');
    const { location, recommendations, summary } = response.data;

    setMapCenter({ lat: location.latitude, lng: location.longitude });
    setRecommendations(recommendations);
    setAiSummary(summary);
  } catch (error) {
    console.error('Failed to fetch recommendations:', error.message);
  }
};


const handleChatbotClose = (event) => {
  event.stopPropagation();
  setChatbotOpen(false);
};

const handleSubscribeOpen = () => {
  setSubscribeOpen(true);
};

const handleSubscribeClose = () => {
  setSubscribeOpen(false);
};

const handleNotificationsClick = () => {
  setNotificationsDialogOpen(true);
};

const handleNotificationsClose = () => {
  setNotificationsDialogOpen(false)
};

// Update handleSubscribe and handleUnsubscribe functions
const handleSubscribe = async (category) => {
  try {
    const response = await fetch('http://localhost:5000/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.username, topic: category }),
    });

    if (response.ok) {
      setSubscribedCategories([...subscribedCategories, category]);
      setNotifications(prev => [
        ...prev,
        { id: Date.now(), message: `Successfully subscribed to ${category}` }
      ]);
    } else {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Subscription failed');
    }
  } catch (error) {
    setNotifications(prev => [
      ...prev,
      { id: Date.now(), message: `Error: ${error.message}` }
    ]);
  }
};


const handleUnsubscribe = async (category) => {
  try {
    const response = await fetch('http://localhost:5000/api/unsubscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.username, topic: category }),
    });

    if (response.ok) {
      setSubscribedCategories(subscribedCategories.filter(cat => cat !== category));
      setNotifications(prev => [
        ...prev,
        { id: Date.now(), message: `Successfully unsubscribed from ${category}` }
      ]);
    } else {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to unsubscribe from ${category}`);
    }
  } catch (error) {
    setNotifications(prev => [
      ...prev,
      { id: Date.now(), message: `Error: ${error.message}` }
    ]);
  }
};



  const handleLogout = () => {
    setUser(null);
    navigate('/login');
    handleMenuClose();
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setIsDrawerOpen(open);
  };

  const handleProfileClick = () => {
    setProfileDialogOpen(true);
  };

  const handleProfileClose = () => {
    setProfileDialogOpen(false);
  };

  const handleUpdateProfile = () => {
    // Update profile logic
    setUser({ ...user, username, email, password });
    setProfileMessage('Profile updated successfully!');
    setTimeout(() => {
      setProfileMessage('');
      navigate('/blog');
    }, 2000);
  };

  const handleManageUsers = () => {
    setManageUsersDialogOpen(true);
    handleMenuClose();
  };

  const handleAddUser = () => {
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    saveUserDataToLocalStorage(updatedUsers);
    setNewUser({ username: '', email: '', password: '', persona: '' });
  };

  const handleDeleteUser = (emailToDelete) => {
    const updatedUsers = users.filter(user => user.email !== emailToDelete);
    setUsers(updatedUsers);
    saveUserDataToLocalStorage(updatedUsers);
    setDeleteConfirmation(false);
    setUserToDelete(null);
  };

  const menuList = () => (
    <div
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      
      <List>
        <Slide direction="right" in={isDrawerOpen} mountOnEnter unmountOnExit>
          <ListItem button onClick={() => navigate('/CreatePost')}>
            <ListItemIcon>
              <CreateIcon />
            </ListItemIcon>
            <ListItemText primary="Create Post" />
          </ListItem>
        </Slide>
        <Slide direction="right" in={isDrawerOpen} mountOnEnter unmountOnExit>
          <ListItem button onClick={() => navigate('/PostsDisplay')}>
            <ListItemIcon>
              <SearchIcon />
            </ListItemIcon>
            <ListItemText primary="View Posts" />
          </ListItem>
        </Slide>
        <Slide direction="right" in={isDrawerOpen} mountOnEnter unmountOnExit>
                <ListItem button onClick={() => navigate('/chatbot')}>
          <ListItemIcon>
            <FaceIcon /> {/* Use the WbSunnyIcon instead of WeatherIcon */}
          </ListItemIcon>
          <ListItemText primary="AI Assistant" />
        </ListItem>
              </Slide>
        <Divider />
        {user && user.persona === 'Administrator' && (
          <Slide direction="right" in={isDrawerOpen} mountOnEnter unmountOnExit>
            <ListItem button onClick={handleManageUsers}>
              <ListItemIcon>
                <ManageUsersIcon />
              </ListItemIcon>
              <ListItemText primary="Manage Users" />
            </ListItem>
          </Slide>
        )}
      </List>
    </div>
  );
  return (
    <React.Fragment>
      <Toolbar sx={{ borderBottom: 1, borderColor: 'divider' }}>
        {user && (
          <Slide direction="down" in={!isDrawerOpen}>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={toggleDrawer(true)}
            >
              <MenuIcon />
            </IconButton>
          </Slide>
        )}
        <Drawer anchor="left" open={isDrawerOpen} onClose={toggleDrawer(false)}>
          {menuList()}
        </Drawer>
        <Typography component="h2" variant="h5" color="inherit" align="center" noWrap sx={{ flex: 1 }}>
          {title}
        </Typography>
        <TextField
            variant="outlined"
            size="small"
            placeholder="Search by title or author"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ ml: 0, mr: 0 }}
        />
        <IconButton onClick={() => navigate(`/search?query=${searchQuery}`)}>
          <SearchIcon />
        </IconButton>
        <Button variant="outlined" sx={{ ml: 2, mr: 3 }} onClick={() => setRecOpen(true)}>
          Recommended For You
        </Button>
        <EventRecommendation open={isRecOpen} onClose={() => setRecOpen(false)} />

        {user && (
          <div>
            <Button
              onClick={handleMenuClick}
              sx={{ textTransform: 'none', color: 'inherit' }}
            >
              <Avatar sx={{ marginRight: 1 }}>{user.username.charAt(0)}</Avatar>
              {user.username}
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem component={RouterLink} to="/blog">
                <ListItemIcon>
                  <HomeIcon />
                </ListItemIcon>
                <ListItemText>Home</ListItemText>
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText>Logout</ListItemText>
              </MenuItem>
              <MenuItem onClick={handleProfileClick}>
                <ListItemIcon>
                  <AccountCircleIcon />
                </ListItemIcon>
                <ListItemText>Profile</ListItemText>
              </MenuItem>
              <MenuItem onClick={handleNotificationsClick}>
                <ListItemIcon>
                  <Badge 
                    badgeContent={notifications.length} 
                    color="error"
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                  >
                    <NotificationsIcon fontSize="medium" />
                  </Badge>
                </ListItemIcon>
                <ListItemText>Notifications</ListItemText>
              </MenuItem>

              <MenuItem onClick={handleSubscribeOpen}>
                <ListItemIcon>
                  <NotificationsIcon />
                </ListItemIcon>
                <ListItemText>Subscribe</ListItemText>
              </MenuItem>
              {user?.persona === 'Administrator' && (
                <MenuItem onClick={handleManageUsers}>
                  <ListItemIcon>
                    <ManageUsersIcon />
                  </ListItemIcon>
                  <ListItemText>Manage Users</ListItemText>
                </MenuItem>
              )}
            </Menu>
          </div>
        )}
      </Toolbar>
<Dialog open={isSubscribeOpen} onClose={handleSubscribeClose}>
  <DialogTitle>Manage Subscriptions</DialogTitle>
  <DialogContent>
    <ListSubheader>
      {subscribedCategories.length > 0 
        ? `Subscribed to ${subscribedCategories.length} categories`
        : "No active subscriptions"}
    </ListSubheader>
    {sections.map((section) => (
      <ListItem key={section.title}>
        <ListItemIcon>
          {subscribedCategories.includes(section.title) 
            ? <SubscriptionsIcon color="primary" /> 
            : <UnsubscribeIcon color="action" />}
        </ListItemIcon>
        <ListItemText 
          primary={section.title} 
          secondary={`${section.description || 'Category updates'}`} 
        />
        <Switch
          checked={subscribedCategories.includes(section.title)}
          onChange={() => subscribedCategories.includes(section.title) 
            ? handleUnsubscribe(section.title) 
            : handleSubscribe(section.title)}
        />
      </ListItem>
    ))}
  </DialogContent>
</Dialog>

<Dialog open={isChatbotOpen} onClose={handleChatbotClose} fullWidth maxWidth="lg">
  <DialogTitle>Recommended For You</DialogTitle>
  <Box mb={2}>
  <Typography variant="subtitle2">Legend:</Typography>
  <Box display="flex" alignItems="center" gap={2} mt={1}>
    <Box display="flex" alignItems="center" gap={1}>
      <img src="http://maps.google.com/mapfiles/ms/icons/red-dot.png" alt="Restaurant" />
      <Typography variant="body2">Showing {recommendations.length} of 9 possible locations. Some results may not include coordinates.
      </Typography>
    </Box>
    <Box display="flex" alignItems="center" gap={1}>
      <img src="http://maps.google.com/mapfiles/ms/icons/blue-dot.png" alt="Concert" />
      <Typography variant="body2">Concerts</Typography>
    </Box>
    <Box display="flex" alignItems="center" gap={1}>
      <img src="http://maps.google.com/mapfiles/ms/icons/orange-dot.png" alt="Sports" />
      <Typography variant="body2">Sports</Typography>
    </Box>
    <Box display="flex" alignItems="center" gap={1}>
      <img src="http://maps.google.com/mapfiles/ms/icons/green-dot.png" alt="You" />
      <Typography variant="body2">You</Typography>
    </Box>
  </Box>
</Box>

  <DialogContent>
    <div style={{ height: '500px', width: '100%' }}>
      <GoogleMap
        mapContainerStyle={{ height: '100%', width: '100%' }}
        zoom={12}
        center={mapCenter}
      >
        {/* User Marker */}
        <Marker position={mapCenter} label="You" />

        {/* Recommendation Markers */}
        {recommendations.map((rec, idx) => {
  const isValidCoords = rec.lat && rec.lng && !isNaN(rec.lat) && !isNaN(rec.lng);
  if (!isValidCoords) {
    console.warn("Skipping marker with invalid lat/lng:", rec);
    return null;
  }

  return (
    <Marker
      key={idx}
      position={{ lat: rec.lat, lng: rec.lng }}
      onClick={() => setSelectedRec(rec)}
      icon={{
        url:
          rec.type === 'restaurant'
            ? 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
            : rec.type === 'concert'
            ? 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
            : 'http://maps.google.com/mapfiles/ms/icons/orange-dot.png',
      }}
    />
  );
})}


{selectedRec && (
  <InfoWindow
    position={{ lat: selectedRec.lat, lng: selectedRec.lng }}
    onCloseClick={() => setSelectedRec(null)}
  >
    <div>
      <Typography variant="subtitle2">{selectedRec.name}</Typography>
      <Typography variant="body2">{selectedRec.address}</Typography>
      <Typography variant="caption">{selectedRec.hours}</Typography>
    </div>
  </InfoWindow>
)}

      </GoogleMap>
    </div>
    <Box mt={2}>
      <Typography variant="body2">{aiSummary}</Typography>
    </Box>
  </DialogContent>
  <DialogActions>
    {/* <Button onClick={handleRegenerate}>Regenerate</Button> */}
    <Button onClick={handleChatbotClose}>Close</Button>
  </DialogActions>
</Dialog>


      <Toolbar
        component="nav"
        variant="dense"
        sx={{ justifyContent: 'space-between', overflowX: 'auto' }}
      >
        {sections && sections.length > 0 ? (
          sections.map((section) => (
            <RouterLink
              key={section.title}
              to={section.url}
              style={{ textDecoration: 'none', color: 'inherit', padding: '10px', flexShrink: 0 }}
            >
              {section.title}
            </RouterLink>
          ))
        ) : (
          <Typography>No sections available</Typography>
        )}
      </Toolbar>

      {/* Profile Dialog */}
      <Dialog open={isProfileDialogOpen} onClose={handleProfileClose}>
        <DialogTitle>Update Profile</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="username"
            label="Username"
            type="text"
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            margin="dense"
            id="email"
            label="Email Address"
            type="email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="dense"
            id="persona"
            label="Persona"
            type="text"
            fullWidth
            value={user?.persona || ''}
            disabled
          />
          <TextField
            margin="dense"
            id="password"
            label="Password"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {profileMessage && (
            <Typography variant="body2" color="success" align="center" sx={{ mt: 2 }}>
              {profileMessage}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleProfileClose}>Cancel</Button>
          <Button onClick={handleUpdateProfile} color="primary">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Notifications Dialog */}

      <Dialog open={isNotificationsDialogOpen} onClose={handleNotificationsClose} fullWidth>
        <DialogTitle>
          Notifications
          <Button
            variant="outlined"
            size="small"
            onClick={() => setNotifications([])} // Clear all notifications
            sx={{ float: 'right' }}
          >
            Clear All
          </Button>
        </DialogTitle>
        <DialogContent dividers>
          <List>
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <ListItem key={notification.id} divider>
                  <ListItemIcon><NotificationsIcon color="action" /></ListItemIcon>
                  <ListItemText
                    primary={notification.message}
                    secondary={new Date(notification.id).toLocaleString()}
                  />
                </ListItem>
              ))
            ) : (
              <ListItem>
                <ListItemText primary="New post created in category ''Health' : Geeta" />
              </ListItem>
            )}
          </List>
          {/* {console.log("Current notifications:", notifications)} Debugging */}
        </DialogContent>
</Dialog>



      {/* Manage Users Dialog */}
      <Dialog open={isManageUsersDialogOpen} onClose={() => setManageUsersDialogOpen(false)}>
        <DialogTitle>Manage Users</DialogTitle>
        <DialogContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Username</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Persona</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user, index) => (
                  <TableRow key={index}>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.persona}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => {
                        setUserToDelete(user.email);
                        setDeleteConfirmation(true);
                      }}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box mt={2}>
            <Typography variant="h6" gutterBottom>Add New User</Typography>
            <TextField
              margin="normal"
              id="new-username"
              label="Username"
              type="text"
              value={newUser.username}
              onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
              fullWidth
            />
            <TextField
              margin="normal"
              id="new-email"
              label="Email"
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              fullWidth
            />
            <TextField
              margin="normal"
              id="new-password"
              label="Password"
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              fullWidth
            />
            <TextField
              margin="normal"
              id="new-persona"
              label="Persona"
              select
              fullWidth
              value={newUser.persona}
              onChange={(e) => setNewUser({ ...newUser, persona: e.target.value })}
              >
              
              {['Student', 'Faculty', 'Staff', 'Moderator', 'Administrator'].map((role) => (
                <MenuItem key={role} value={role}>
                  {role}
                </MenuItem>
              ))}
        
            </TextField>
            <Button onClick={handleAddUser}>Add User</Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setManageUsersDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete User Confirmation */}
      {deleteConfirmation && (
        <Dialog open={deleteConfirmation} onClose={() => setDeleteConfirmation(false)}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            Are you sure you want to delete this user?
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteConfirmation(false)}>Cancel</Button>
            <Button
              onClick={() => handleDeleteUser(userToDelete)}
              color="secondary"
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </React.Fragment>
  );
}

Header.propTypes = {
  title: PropTypes.string,
  sections: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      url: PropTypes.string.isRequired,
    })
  ),
};

export default React.memo(Header);


