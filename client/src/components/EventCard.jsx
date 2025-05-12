import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { formatDate } from '../utils/formatDate';

const EventCard = ({ event, isSaved = false, showActions = true, onSaveToggle }) => {
  const { title, shortDescription, poster, date, location, _id: id, type, tags = [] } = event;
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isEventSaved, setIsEventSaved] = useState(isSaved);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationError, setRegistrationError] = useState(null);

  // Handle saving/unsaving event
  const handleSaveEvent = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/event/${id}` } });
      return;
    }
    
    try {
      const response = await axios.post(`/events/${id}/save`);
      setIsEventSaved(response.data.isSaved);
      
      if (onSaveToggle) {
        onSaveToggle(id, response.data.isSaved);
      }
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };
  
  // Handle event registration
  const handleRegister = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/event/${id}` } });
      return;
    }
    
    setIsRegistering(true);
    setRegistrationError(null);
    
    try {
      await axios.post(`/events/${id}/register`);
      navigate(`/event/${id}?registered=true`);
    } catch (error) {
      setRegistrationError(
        error.response?.data?.message || 'Failed to register. Please try again.'
      );
    } finally {
      setIsRegistering(false);
    }
  };
  
  // Format date for display
  const formattedDate = formatDate(date);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg flex flex-col h-full">
      <Link to={`/event/${id}`} className="block h-48 overflow-hidden relative">
        <img 
          src={poster} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
        <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
          {type}
        </div>
      </Link>
      
      <div className="p-4 flex-grow flex flex-col">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-bold text-gray-800 mb-1 hover:text-blue-600">
            <Link to={`/event/${id}`}>{title}</Link>
          </h3>
          {showActions && (
            <button 
              onClick={handleSaveEvent}
              className="text-gray-400 hover:text-yellow-500 transition-colors"
              title={isEventSaved ? "Remove from saved" : "Save for later"}
            >
              {isEventSaved ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                </svg>
              )}
            </button>
          )}
        </div>
        
        <div className="mb-2 text-sm text-gray-600">
          <div className="flex items-center mb-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{formattedDate}</span>
          </div>
          
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{location.city}, {location.venue}</span>
          </div>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 flex-grow">{shortDescription}</p>
        
        {tags.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1">
            {tags.map((tag, index) => (
              <span 
                key={index}
                className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
        
        {showActions && (
          <div className="mt-auto">
            {registrationError && (
              <p className="text-red-500 text-xs mb-2">{registrationError}</p>
            )}
            <button
              onClick={handleRegister}
              disabled={isRegistering}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
            >
              {isRegistering ? 'Registering...' : 'Register Now'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventCard; 