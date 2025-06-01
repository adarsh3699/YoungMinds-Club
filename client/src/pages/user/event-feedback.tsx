import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios, { AxiosResponse } from 'axios';
import { RadioGroup } from '@headlessui/react';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';
import {
  EventFeedbackData,
  FeedbackApiResponse,
  UserEventsApiResponse,
  ApiResponse
} from '@/types';

const EventFeedback: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [event, setEvent] = useState<EventFeedbackData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [xpEarned, setXpEarned] = useState<number | null>(null);
  
  // Form state
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  
  // Rating options for RadioGroup
  const ratingOptions: number[] = [1, 2, 3, 4, 5];
  
  // Check if user is authenticated and has registered for this event
  useEffect(() => {
    const fetchEventDetails = async (): Promise<void> => {
      setLoading(true);
      try {
        if (!isAuthenticated) {
          navigate('/login', { state: { from: `/event/${id}/feedback` } });
          return;
        }
        
        // Get the event details
        const eventResponse: AxiosResponse<ApiResponse<{ event: EventFeedbackData }>> = await axios.get(`/events/${id}`);
        setEvent(eventResponse.data.data?.event || null);
        
        // Check if user is registered for this event
        const userEventsResponse: AxiosResponse<UserEventsApiResponse> = await axios.get('/user/events');
        
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
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const response: AxiosResponse<FeedbackApiResponse> = await axios.post(`/events/${id}/feedback`, {
        rating,
        comment
      });
      
      setSubmitted(true);
      setXpEarned(response.data.xp || null);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setError(
        (error as any).response?.data?.message || 'Failed to submit feedback. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };
  
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
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                View Dashboard
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
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Dashboard
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
              <h2 className="font-semibold text-gray-700">{event.title}</h2>
              <p className="text-sm text-gray-500">
                {event.organizer.name} • {new Date(event.date).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          {/* Rating */}
          <div className="mb-8">
            <label className="block text-gray-700 font-semibold mb-2">
              Rate this event (required)
            </label>
            
            <RadioGroup value={rating} onChange={setRating} className="mt-2">
              <RadioGroup.Label className="sr-only">Rating</RadioGroup.Label>
              <div className="flex items-center space-x-3">
                {ratingOptions.map((option) => (
                  <RadioGroup.Option
                    key={option}
                    value={option}
                    className={({ active }) => `
                      ${active ? 'ring-2 ring-offset-2 ring-blue-500' : ''}
                      relative rounded-md p-1 cursor-pointer focus:outline-none
                    `}
                  >
                    {({ checked }) => (
                      <>
                        <div className="flex items-center justify-center">
                          {checked ? (
                            <StarIcon className="w-8 h-8 text-yellow-400" />
                          ) : (
                            <StarOutlineIcon className="w-8 h-8 text-gray-400 hover:text-yellow-400" />
                          )}
                        </div>
                      </>
                    )}
                  </RadioGroup.Option>
                ))}
              </div>
              <div className="flex justify-between mt-1 text-xs text-gray-500">
                <span>Poor</span>
                <span>Excellent</span>
              </div>
            </RadioGroup>
          </div>
          
          {/* Comment */}
          <div className="mb-8">
            <label htmlFor="comment" className="block text-gray-700 font-semibold mb-2">
              Additional comments (optional)
            </label>
            <textarea
              id="comment"
              name="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="What did you like or dislike about this event?"
            ></textarea>
          </div>
          
          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || rating === 0}
              className={`bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors ${
                (submitting || rating === 0) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
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