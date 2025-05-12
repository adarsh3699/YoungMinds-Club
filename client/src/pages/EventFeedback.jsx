import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const EventFeedback = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [xpEarned, setXpEarned] = useState(null);
  
  // Form state
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  
  // Check if user is authenticated and has registered for this event
  useEffect(() => {
    const fetchEventDetails = async () => {
      setLoading(true);
      try {
        if (!isAuthenticated) {
          navigate('/login', { state: { from: `/event/${id}/feedback` } });
          return;
        }
        
        // Get the event details
        const eventResponse = await axios.get(`/events/${id}`);
        setEvent(eventResponse.data.event);
        
        // Check if user is registered for this event
        const userEventsResponse = await axios.get('/user/events');
        
        const isRegistered = userEventsResponse.data.registeredEvents.some(
          event => event.id === id
        );
        
        if (!isRegistered) {
          setError('You must be registered for this event to submit feedback.');
        }
        
        // Check if feedback already given
        const hasGivenFeedback = userEventsResponse.data.registeredEvents.some(
          event => event.id === id && event.feedback?.given
        );
        
        if (hasGivenFeedback) {
          setError('You have already submitted feedback for this event.');
        }
      } catch (error) {
        console.error('Error fetching event details:', error);
        setError('Failed to load event details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEventDetails();
  }, [id, isAuthenticated, navigate]);
  
  // Submit feedback
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const response = await axios.post(`/events/${id}/feedback`, {
        rating,
        comment
      });
      
      setSubmitted(true);
      setXpEarned(response.data.xp);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setError(
        error.response?.data?.message || 'Failed to submit feedback. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };
  
  // Handle star rating hover
  const handleRatingHover = (hoveredRating) => {
    setHoverRating(hoveredRating);
  };
  
  // Handle star rating click
  const handleRatingClick = (selectedRating) => {
    setRating(selectedRating);
  };
  
  // Get final rating to display (hover rating or selected rating)
  const displayRating = hoverRating || rating;
  
  // Show loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="w-12 h-12 border-t-4 border-blue-500 border-solid rounded-full animate-spin mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Loading...</h2>
        </div>
      </div>
    );
  }
  
  // Show submitted success state
  if (submitted) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Thank You for Your Feedback!</h1>
            <p className="text-gray-600 mb-6">Your feedback has been submitted successfully and will help improve future events.</p>
            
            <div className="bg-indigo-100 p-4 rounded-lg inline-block">
              <p className="text-indigo-800 font-medium">You earned +5 XP</p>
              <p className="text-indigo-600">Your total XP: {xpEarned}</p>
            </div>
            
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate(`/event/${id}`)}
                className="px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
              >
                Back to Event
              </button>
              
              <button
                onClick={() => navigate('/my-events')}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                View My Events
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Show error state
  if (error || !event) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto bg-red-100 border border-red-400 text-red-700 px-4 py-6 rounded-lg">
          <h1 className="text-2xl font-bold mb-4">Unable to Submit Feedback</h1>
          <p className="mb-4">{error || 'Event not found'}</p>
          <div className="flex gap-4">
            <button
              onClick={() => navigate(`/event/${id}`)}
              className="px-6 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
            >
              Back to Event
            </button>
            
            <button
              onClick={() => navigate('/my-events')}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              My Events
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Rate Your Experience</h1>
          <p className="text-gray-600">Share your thoughts about "{event.title}"</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* Event Summary */}
          <div className="bg-gray-50 p-4 rounded-lg mb-8 flex items-center">
            <div className="w-16 h-16 rounded overflow-hidden mr-4 flex-shrink-0">
              <img 
                src={event.poster} 
                alt={event.title} 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="font-semibold text-gray-800">{event.title}</h2>
              <p className="text-sm text-gray-600">
                {new Date(event.date).toLocaleDateString()} • {event.location.venue}, {event.location.city}
              </p>
            </div>
          </div>
          
          {/* Star Rating */}
          <div className="mb-8">
            <label className="block text-gray-700 font-medium mb-3">
              How would you rate this event? <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => handleRatingHover(star)}
                    onMouseLeave={() => handleRatingHover(0)}
                    onClick={() => handleRatingClick(star)}
                    className="text-4xl focus:outline-none px-1"
                  >
                    <span className={star <= displayRating ? 'text-yellow-400' : 'text-gray-300'}>
                      ★
                    </span>
                  </button>
                ))}
              </div>
              <div className="ml-4 text-gray-600">
                {displayRating === 1 && 'Poor'}
                {displayRating === 2 && 'Fair'}
                {displayRating === 3 && 'Good'}
                {displayRating === 4 && 'Very Good'}
                {displayRating === 5 && 'Excellent'}
              </div>
            </div>
            {rating === 0 && (
              <p className="text-sm text-gray-500 mt-1">Please select a rating</p>
            )}
          </div>
          
          {/* Comment */}
          <div className="mb-8">
            <label htmlFor="comment" className="block text-gray-700 font-medium mb-2">
              Share your experience (optional)
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={5}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="What did you like or dislike? What could be improved?"
            ></textarea>
          </div>
          
          {/* XP Information */}
          <div className="mb-8 bg-blue-50 p-4 rounded-lg">
            <div className="flex items-start">
              <div className="bg-blue-100 p-2 rounded-full mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-blue-800 font-medium">Earn XP for giving feedback!</p>
                <p className="text-blue-600 text-sm">You'll receive 5 XP points when you submit your feedback.</p>
              </div>
            </div>
          </div>
          
          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate(`/event/${id}`)}
              className="px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
              disabled={submitting}
            >
              Cancel
            </button>
            
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
              disabled={submitting || rating === 0}
            >
              {submitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventFeedback; 