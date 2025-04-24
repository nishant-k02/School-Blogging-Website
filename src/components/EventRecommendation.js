import React, { useState, useEffect } from 'react';
import {
  IconButton, Button, Modal, Box, Typography, CircularProgress,
  Card, CardContent
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

function createColoredIcon(color) {
  const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 
    9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5 14.5 7.62 14.5 9 13.38 11.5 12 11.5z"/>
  </svg>`;
  return new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(svgIcon),
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    shadowSize: [41, 41]
  });
}

const icons = {
  restaurant: createColoredIcon('#f54242'),
  music: createColoredIcon('#4287f5'),
  sports: createColoredIcon('#ff9800'),
  user: createColoredIcon('#3fbf50')
};

const RecommendationModal = ({ open, onClose }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [suggestedLocation, setSuggestedLocation] = useState('');
  const [weather, setWeather] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (err) => {
        console.error('Geolocation error:', err);
        setError('Unable to retrieve your location.');
      }
    );
  }, []);

  useEffect(() => {
    if (currentLocation) {
      fetchRecommendations();
    }
    // eslint-disable-next-line
  }, [currentLocation]);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.post('http://localhost:3009/api/recommendations', {
        latitude: currentLocation.lat,
        longitude: currentLocation.lng
      });

      if (response.data) {
        setWeather(response.data.weather);
        setSuggestedLocation(response.data.suggestedLocation);

        const newMarkers = response.data.events.reduce((acc, event) => {
          if (event.details?.latitude && event.details?.longitude) {
            acc.push({
              name: event.name,
              latitude: event.details.latitude,
              longitude: event.details.longitude,
              type: event.type.toLowerCase(),
              details: event.details
            });
          }
          return acc;
        }, []);

        newMarkers.push({
          name: "Your Location",
          latitude: currentLocation.lat,
          longitude: currentLocation.lng,
          type: 'user',
          details: {
            address: 'Current location',
            date: '',
            time: '',
            hours: []
          }
        });

        setMarkers(newMarkers);
        setRecommendations(response.data.events);
      } else {
        setError('No recommendations found');
      }
    } catch (err) {
      console.error('Failed to fetch recommendations:', err);
      setError(`Failed to fetch recommendations: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Box sx={{
        width: '80vw',
        maxHeight: '90vh',
        overflow: 'auto',
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 4,
        borderRadius: 2,
        position: 'relative'
      }}>
        {/* ✅ Close Button */}
        <IconButton
          aria-label="close"
          onClick={() => {
            onClose();
          }}
          sx={{ position: 'absolute', top: 8, right: 8 }}
        >
          <CloseIcon />
        </IconButton>

        <Typography variant="h5" align="center" fontWeight="bold" gutterBottom>
          🎯 Event Recommendations
        </Typography>

        {currentLocation && (
          <Box sx={{ position: 'relative' }}>
            <MapContainer center={[currentLocation.lat, currentLocation.lng]} zoom={13} style={{ width: '100%', height: '50vh' }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
              />
              {markers.map((marker, index) => (
                <Marker
                  key={index}
                  position={[marker.latitude, marker.longitude]}
                  icon={icons[marker.type] || icons.user}
                >
                  <Popup>
                    <div>
                      <strong>{marker.name}</strong><br />
                      📍 {marker.details.address}<br />
                      🗂 Type: {marker.type}<br />
                      📆 {marker.details.date} ⏰ {marker.details.time}<br />
                      {marker.type === 'restaurant' && (
                        <>
                          🕒 Hours:
                          <ul>
                            {Array.isArray(marker.details.hours)
                              ? marker.details.hours.map((hr, i) => <li key={i}>{hr}</li>)
                              : <li>{marker.details.hours}</li>}
                          </ul>
                        </>
                      )}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>

            {/* Legend */}
            <Box sx={{
              position: 'absolute',
              top: 10,
              right: 10,
              backgroundColor: 'white',
              padding: '10px',
              borderRadius: '6px',
              boxShadow: '0px 0px 10px rgba(0,0,0,0.2)',
              fontSize: '12px',
              zIndex: 1000
            }}>
              <div><span style={legendDot('#3fbf50')}></span>You</div>
              <div><span style={legendDot('#f54242')}></span>Restaurant</div>
              <div><span style={legendDot('#4287f5')}></span>Concert</div>
              <div><span style={legendDot('#ff9800')}></span>Sports</div>
            </Box>
          </Box>
        )}

        <Box mt={2} textAlign="center">
          <Button variant="contained" color="primary" onClick={fetchRecommendations}>
            🔄 Regenerate
          </Button>
        </Box>

        {weather && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2">📍 Location: {suggestedLocation}</Typography>
            <Typography variant="body2">🌦️ Weather: {weather.description}, {weather.temperature}°C</Typography>
          </Box>
        )}

        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            {recommendations.map((event, index) => (
              <Card
                key={index}
                elevation={4}
                sx={{
                  borderLeft: `6px solid ${
                    event.type === 'restaurant' ? '#f54242' :
                    event.type === 'music' ? '#4287f5' :
                    '#ff9800'
                  }`,
                  p: 2
                }}
              >
                <CardContent>
                  <Typography variant="h6" fontWeight="bold">{event.name}</Typography>
                  <Typography variant="body2" color="textSecondary">{event.type.toUpperCase()} Event</Typography>
                  <Typography variant="body1">📍 {event.details.address}</Typography>
                  <Typography variant="body2">📆 {event.details.date} ⏰ {event.details.time}</Typography>
                  {event.type === 'restaurant' && (
                    <>
                      <Typography variant="body2">🕒 Opening Hours:</Typography>
                      <ul style={{ paddingLeft: '20px' }}>
                        {Array.isArray(event.details.hours)
                          ? event.details.hours.map((hour, i) => <li key={i}>{hour}</li>)
                          : <li>{event.details.hours}</li>}
                      </ul>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Box>
    </Modal>
  );
};

// Helper for colored dots
const legendDot = (color) => ({
  display: 'inline-block',
  width: 12,
  height: 12,
  backgroundColor: color,
  borderRadius: '50%',
  marginRight: 6
});

export default RecommendationModal;
