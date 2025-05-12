import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { formatDate } from '../utils/formatDate';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [xpEarned, setXpEarned] = useState(null);
  const [registrationError, setRegistrationError] = useState(null);
  
  // Check for registration success from URL query
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.get('registered') === 'true') {
      setRegistrationSuccess(true);
      // Clear the URL parameter without refreshing the page
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [location.search]);

  // Fetch event details
  useEffect(() => {
    const fetchEventDetails = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/events/${id}`);
        setEvent(response.data.event);
        
        // If user is authenticated, check if they've saved or registered for this event
        if (isAuthenticated) {
          const userEventsResponse = await axios.get('/user/events');
          
          // Check if event is saved
          const eventIsSaved = userEventsResponse.data.savedEvents.some(
            savedEvent => savedEvent.id === id
          );
          setIsSaved(eventIsSaved);
          
          // Check if event is registered
          const eventIsRegistered = userEventsResponse.data.registeredEvents.some(
            regEvent => regEvent.id === id
          );
          setIsRegistered(eventIsRegistered);
        }
      } catch (error) {
        console.error('Error fetching event details:', error);
        setError('Failed to load event details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEventDetails();
  }, [id, isAuthenticated]);
  
  // Handle saving/unsaving event
  const handleSaveEvent = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/event/${id}` } });
      return;
    }
    
    try {
      const response = await axios.post(`/events/${id}/save`);
      setIsSaved(response.data.isSaved);
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };
  
  // Handle registration
  const handleRegister = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/event/${id}` } });
      return;
    }
    
    setRegistrationError(null);
    
    try {
      const response = await axios.post(`/events/${id}/register`);
      setIsRegistered(true);
      setRegistrationSuccess(true);
      setXpEarned(response.data.xp);
      setRegistrationError(null);
    } catch (error) {
      console.error('Error registering for event:', error);
      setRegistrationError(
        error.response?.data?.message || 'Failed to register. Please try again.'
      );
    }
  };
  
  // Generate Google Calendar link
  const generateGoogleCalendarLink = () => {
    if (!event) return '#';
    
    const startDate = new Date(event.date);
    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 2); // Assume 2 hours duration
    
    const details = `${event.description}\n\nVenue: ${event.location.venue}, ${event.location.address}, ${event.location.city}\n\nOrganized by: ${event.organizer.name}`;
    
    // Format dates for Google Calendar
    const formatForCalendar = (date) => {
      return date.toISOString().replace(/-|:|\.\d+/g, '');
    };
    
    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${formatForCalendar(startDate)}/${formatForCalendar(endDate)}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(`${event.location.venue}, ${event.location.city}`)}&sf=true&output=xml`;
  };
  
  // Generate WhatsApp share link
  const generateWhatsAppLink = () => {
    if (!event) return '#';
    
    const eventDate = formatDate(event.date);
    const shareText = `Check out this event: "${event.title}" on ${eventDate} at ${event.location.venue}, ${event.location.city}. Register here: ${window.location.href}`;
    
    return `https://wa.me/?text=${encodeURIComponent(shareText)}`;
  };
  
  // Show loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="w-12 h-12 border-t-4 border-blue-500 border-solid rounded-full animate-spin mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Loading event details...</h2>
        </div>
      </div>
    );
  }
  
  // Show error state
  if (error || !event) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error || 'Event not found'}</span>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Registration Success Message */}
      {registrationSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-lg mb-8 flex items-start">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="font-bold">Registration Successful!</p>
            <p>You have successfully registered for this event.</p>
            {xpEarned && <p className="mt-1">You earned 10 XP for registering. Keep it up!</p>}
          </div>
        </div>
      )}
      
      {/* Registration Error Message */}
      {registrationError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg mb-8">
          <p className="font-bold">Registration Failed</p>
          <p>{registrationError}</p>
        </div>
      )}
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Event Image */}
        <div className="md:w-1/2 lg:w-2/5">
          <div className="rounded-lg overflow-hidden shadow-lg">
            <img
              src={event.poster}
              alt={event.title}
              className="w-full h-auto object-cover"
            />
          </div>
          
          {/* Action Buttons (Mobile) */}
          <div className="mt-6 flex flex-col gap-3 md:hidden">
            {!isRegistered ? (
              <button
                onClick={handleRegister}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors text-lg"
              >
                Register Now
              </button>
            ) : (
              <div className="w-full bg-green-600 text-white font-bold py-3 px-6 rounded-lg text-center text-lg">
                You're Registered ✓
              </div>
            )}
            
            <div className="flex gap-2">
              <button
                onClick={handleSaveEvent}
                className={`flex-1 flex justify-center items-center gap-2 py-3 px-4 rounded-lg border ${
                  isSaved
                    ? 'border-yellow-500 text-yellow-600 bg-yellow-50'
                    : 'border-gray-300 text-gray-700 bg-white'
                }`}
              >
                {isSaved ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                    </svg>
                    <span>Saved</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    <span>Save</span>
                  </>
                )}
              </button>
              
              <a 
                href={generateGoogleCalendarLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex justify-center items-center gap-2 py-3 px-4 rounded-lg border border-gray-300 text-gray-700 bg-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Calendar</span>
              </a>
            </div>
            
            <a 
              href={generateWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex justify-center items-center gap-2 py-3 px-6 rounded-lg bg-green-500 hover:bg-green-600 text-white transition-colors"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              <span>Share on WhatsApp</span>
            </a>
          </div>
        </div>
        
        {/* Event Details */}
        <div className="md:w-1/2 lg:w-3/5">
          <div className="bg-white p-6 rounded-lg shadow-md">
            {/* Event Type Badge */}
            <div className="mb-3">
              <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {event.type}
              </span>
              {event.category && (
                <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full ml-2">
                  {event.category}
                </span>
              )}
            </div>
            
            {/* Event Title */}
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{event.title}</h1>
            
            {/* Organizer */}
            <p className="text-gray-600 mb-4">
              Organized by <span className="font-medium">{event.organizer.name}</span>
            </p>
            
            {/* Event Details */}
            <div className="border-t border-gray-200 pt-4 mb-6">
              <div className="flex items-start mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400 mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="font-semibold text-gray-700">Date & Time</p>
                  <p className="text-gray-600">{formatDate(event.date, true)}</p>
                </div>
              </div>
              
              <div className="flex items-start mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400 mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <p className="font-semibold text-gray-700">Location</p>
                  <p className="text-gray-600">{event.location.venue}</p>
                  <p className="text-gray-600">{event.location.address}</p>
                  <p className="text-gray-600">{event.location.city}</p>
                </div>
              </div>
              
              {event.registrationCount !== undefined && (
                <div className="flex items-start mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400 mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <div>
                    <p className="font-semibold text-gray-700">Attendees</p>
                    <p className="text-gray-600">
                      {event.registrationCount} registered 
                      {event.capacity && ` (${event.capacity - event.registrationCount} spots left)`}
                    </p>
                  </div>
                </div>
              )}
              
              {event.tags && event.tags.length > 0 && (
                <div className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400 mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <div>
                    <p className="font-semibold text-gray-700">Tags</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {event.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Event Description */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">About This Event</h2>
              <div className="text-gray-600 leading-relaxed whitespace-pre-line">
                {event.description}
              </div>
            </div>
            
            {/* Action Buttons (Desktop) */}
            <div className="hidden md:block">
              <div className="flex flex-col gap-3">
                {!isRegistered ? (
                  <button
                    onClick={handleRegister}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors text-lg"
                  >
                    Register Now
                  </button>
                ) : (
                  <div className="w-full bg-green-600 text-white font-bold py-3 px-6 rounded-lg text-center text-lg">
                    You're Registered ✓
                  </div>
                )}
                
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveEvent}
                    className={`flex-1 flex justify-center items-center gap-2 py-3 px-4 rounded-lg border ${
                      isSaved
                        ? 'border-yellow-500 text-yellow-600 bg-yellow-50'
                        : 'border-gray-300 text-gray-700 bg-white'
                    }`}
                  >
                    {isSaved ? (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                        </svg>
                        <span>Saved</span>
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                        <span>Save</span>
                      </>
                    )}
                  </button>
                  
                  <a 
                    href={generateGoogleCalendarLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex justify-center items-center gap-2 py-3 px-4 rounded-lg border border-gray-300 text-gray-700 bg-white"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Add to Calendar</span>
                  </a>
                </div>
                
                <a 
                  href={generateWhatsAppLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex justify-center items-center gap-2 py-3 px-6 rounded-lg bg-green-500 hover:bg-green-600 text-white transition-colors"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  <span>Share on WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails; 