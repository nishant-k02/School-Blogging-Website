import React, { useState, useEffect } from 'react';
import {
  IconButton, Button, Modal, Box, Typography, CircularProgress,
  Card, CardContent
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import {
  GoogleMap, Marker, InfoWindow, useJsApiLoader
} from '@react-google-maps/api';

const icons = {
  restaurant: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
  music: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
  sports: 'http://maps.google.com/mapfiles/ms/icons/orange-dot.png',
  user: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
};

const RecommendationModal = ({ open, onClose }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [suggestedLocation, setSuggestedLocation] = useState('');
  const [weather, setWeather] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: 'your-googlemaps-api-key', // Replace with your API key
  });

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
              lat: parseFloat(event.details.latitude),
              lng: parseFloat(event.details.longitude),
              type: event.type.toLowerCase(),
              details: event.details
            });
          }
          return acc;
        }, []);

        newMarkers.push({
          name: "Your Location",
          lat: currentLocation.lat,
          lng: currentLocation.lng,
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
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', top: 8, right: 8 }}
        >
          <CloseIcon />
        </IconButton>

        <Typography variant="h5" align="center" fontWeight="bold" gutterBottom>
          🎯 Event Recommendations
        </Typography>

        {isLoaded && currentLocation && (
          <GoogleMap
            center={currentLocation}
            zoom={13}
            mapContainerStyle={{ width: '100%', height: '50vh' }}
          >
            {/* Map Legend */}
            <div style={{
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
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                <div style={{ ...legendDot('#3fbf50') }}></div>
                <span>You</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                <div style={{ ...legendDot('#f54242') }}></div>
                <span>Restaurant</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                <div style={{ ...legendDot('#4287f5') }}></div>
                <span>Concert</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ ...legendDot('#ff9800') }}></div>
                <span>Sports</span>
              </div>
            </div>
            {markers.map((marker, idx) => (
              <Marker
                key={idx}
                position={{ lat: marker.lat, lng: marker.lng }}
                icon={icons[marker.type] || icons.user}
                onClick={() => setSelectedMarker(marker)}
              />
            ))}
            {selectedMarker && (
              <InfoWindow
                position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
                onCloseClick={() => setSelectedMarker(null)}
              >
                <div>
                  <strong>{selectedMarker.name}</strong><br />
                  📍 {selectedMarker.details.address}<br />
                  🗂 Type: {selectedMarker.type}<br />
                  📆 {selectedMarker.details.date} ⏰ {selectedMarker.details.time}<br />
                  {selectedMarker.type === 'restaurant' && (
                    <>
                      🕒 Hours:
                      <ul>
                        {Array.isArray(selectedMarker.details.hours)
                          ? selectedMarker.details.hours.map((hr, i) => <li key={i}>{hr}</li>)
                          : <li>{selectedMarker.details.hours}</li>}
                      </ul>
                    </>
                  )}
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
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
              <Card key={index} elevation={4} sx={{
                borderLeft: `6px solid ${
                  event.type === 'restaurant' ? '#f54242' :
                  event.type === 'music' ? '#4287f5' :
                  '#ff9800'
                }`,
                p: 2
              }}>
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
const legendDot = (color) => ({
  width: '12px',
  height: '12px',
  backgroundColor: color,
  borderRadius: '50%',
  marginRight: '8px',
  display: 'inline-block'
});


export default RecommendationModal;
