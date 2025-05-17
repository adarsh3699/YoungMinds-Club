import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { 
  CalendarIcon, 
  UsersIcon, 
  CurrencyDollarIcon, 
  PlusIcon,
  ArrowPathIcon,
  ChartBarIcon,
  StarIcon
} from "@heroicons/react/24/outline";
import { Tabs, SelectInput } from "../../components/common";
import EventCard from "../../components/organizer/EventCard";
import CreateEventModal from "../../components/organizer/CreateEventModal";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [events, setEvents] = useState([]);
  const [feedbackSummary, setFeedbackSummary] = useState(null);
  const [eventFilter, setEventFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/organizer/dashboard');
        setDashboardData(response.data.data);
        
        // Fetch events in the same call
        const eventsResponse = await axios.get('/organizer/events');
        setEvents(Array.isArray(eventsResponse.data.events) ? eventsResponse.data.events : []);
        
        // Fetch feedback summary
        const feedbackResponse = await axios.get('/organizer/feedback/summary');
        if (feedbackResponse.data.success) {
          setFeedbackSummary(feedbackResponse.data.summary);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError("Failed to load dashboard data. Please try again.");
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const toggleCreateModal = () => {
    setShowCreateModal(!showCreateModal);
  };

  const handleEventCreated = (newEvent) => {
    // Add the new event to the events list
    setEvents([newEvent, ...events]);
    setShowCreateModal(false);
  };

  const filterOptions = [
    { value: 'all', label: 'All Events' },
    { value: 'upcoming', label: 'Upcoming Events' },
    { value: 'past', label: 'Past Events' },
    { value: 'draft', label: 'Draft Events' }
  ];

  // Filter events based on selection
  const getFilteredEvents = () => {
    const now = new Date();
    
    if (eventFilter === 'upcoming') {
      return events.filter(event => new Date(event.date) >= now && event.status !== 'draft');
    } else if (eventFilter === 'past') {
      return events.filter(event => new Date(event.date) < now && event.status !== 'draft');
    } else if (eventFilter === 'draft') {
      return events.filter(event => event.status === 'draft');
    }
    
    return events;
  };

  const filteredEvents = getFilteredEvents();
  
  // Calculate total registrations from events as a fallback
  const calculatedTotalRegistrations = events.reduce((sum, event) => sum + (event.registrationCount || 0), 0);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="w-12 h-12 border-t-4 border-blue-500 border-solid rounded-full animate-spin mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 ml-4">Loading dashboard...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 dark:bg-red-800 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded relative">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/40">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-5xl mx-auto overflow-hidden">
            <CreateEventModal 
              onClose={toggleCreateModal} 
              onSuccess={handleEventCreated} 
            />
          </div>
        </div>
      )}
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Organizer Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your events and engage with attendees</p>
        </div>
        <button
          onClick={toggleCreateModal}
          className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Create New Event
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center">
          <div className="bg-blue-100 dark:bg-blue-800 p-3 rounded-full mr-4">
            <CalendarIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-1 text-gray-800 dark:text-gray-200">Total Events</h3>
            <p className="text-3xl font-bold text-blue-700 dark:text-blue-400">
              {dashboardData?.stats?.eventCount || 0}
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center">
          <div className="bg-green-100 dark:bg-green-800 p-3 rounded-full mr-4">
            <UsersIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-1 text-gray-800 dark:text-gray-200">Total Registrations</h3>
            <p className="text-3xl font-bold text-green-700 dark:text-green-400">
              {dashboardData?.stats?.attendeeCount || calculatedTotalRegistrations || 0}
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center">
          <div className="bg-amber-100 dark:bg-amber-800 p-3 rounded-full mr-4">
            <StarIcon className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-1 text-gray-800 dark:text-gray-200">Total Feedback</h3>
            <p className="text-3xl font-bold text-amber-700 dark:text-amber-400">
              {feedbackSummary?.overallStats?.totalFeedback || 0}
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center">
          <div className="bg-purple-100 dark:bg-purple-800 p-3 rounded-full mr-4">
            <StarIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-1 text-gray-800 dark:text-gray-200">Average Rating</h3>
            <p className="text-3xl font-bold text-purple-700 dark:text-purple-400">
              {feedbackSummary?.overallStats?.averageRating ? `${feedbackSummary.overallStats.averageRating.toFixed(1)}/5` : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Event Registration Chart */}
      {events.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
            <ChartBarIcon className="h-5 w-5 mr-2 text-blue-500" />
            Registration Per Event
          </h2>
          <div className="mt-4">
            {events.slice(0, 5).map(event => (
              <div key={event._id} className="mb-4">
                <div className="flex justify-between mb-1">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">{event.title}</span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {event.registrationCount || 0} / {event.capacity || '∞'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 dark:bg-blue-500 h-2.5 rounded-full" 
                    style={{ 
                      width: event.capacity 
                        ? `${Math.min(100, (event.registrationCount / event.capacity) * 100)}%` 
                        : `${Math.min(100, event.registrationCount)}%` 
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          {events.length > 5 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Showing top 5 events. View all in the events section below.
            </p>
          )}
        </div>
      )}

      {/* Feedback Summary */}
      {feedbackSummary && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Feedback Summary</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
            <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
              <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Average Rating</h3>
              <div className="flex items-baseline">
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {feedbackSummary.overallStats?.averageRating ? feedbackSummary.overallStats.averageRating.toFixed(1) : 'N/A'}
                </span>
                <span className="text-gray-600 dark:text-gray-400 ml-1">/5</span>
              </div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
              <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Positive Comments</h3>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {feedbackSummary.data?.positiveCount || 0}
              </div>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/30 p-4 rounded-lg">
              <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Total Feedback</h3>
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {feedbackSummary.overallStats?.totalFeedback || 0}
              </div>
            </div>
          </div>
          
          {feedbackSummary.recentFeedback && feedbackSummary.recentFeedback.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-3">Recent Feedback</h3>
              <div className="space-y-3">
                {feedbackSummary.recentFeedback.slice(0, 3).map((feedback, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-gray-700 dark:text-gray-300 font-medium">{feedback.eventTitle}</span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon 
                            key={i} 
                            className={`h-4 w-4 ${i < feedback.rating ? 'text-yellow-500 fill-current' : 'text-gray-300 dark:text-gray-600'}`} 
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{feedback.comment}</p>
                  </div>
                ))}
              </div>
              <Link to="/organizer/feedback" className="text-blue-600 dark:text-blue-400 text-sm mt-4 inline-block hover:underline">
                View all feedback →
              </Link>
            </div>
          )}
        </div>
      )}

      {/* My Events Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="p-6 pb-0">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">My Events</h2>
            <div className="flex space-x-4 items-center">
              <div className="w-48">
                <SelectInput
                  value={eventFilter}
                  onChange={(e) => setEventFilter(e.target.value)}
                  options={filterOptions}
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400 mb-4">You don't have any {eventFilter !== 'all' ? eventFilter : ''} events yet.</p>
              <button 
                onClick={toggleCreateModal}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Create Your First Event
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map(event => (
                <div key={event._id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition">
                  {event.poster ? (
                    <img 
                      src={event.poster} 
                      alt={event.title} 
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <CalendarIcon className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                    </div>
                  )}
                  
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">{event.title}</h3>
                      {event.status === 'draft' && (
                        <span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 text-xs px-2 py-1 rounded">
                          Draft
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                      {new Date(event.date).toLocaleDateString()} at {event.time}
                    </p>
                    
                    <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mb-4">
                      <UsersIcon className="h-4 w-4 mr-1" />
                      <span>{event.registrationCount || 0} registrations</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <Link 
                        to={`/organizer/event/${event._id}`}
                        className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
                      >
                        Manage Event
                      </Link>
                      
                      <Link 
                        to={`/event/${event._id}`}
                        className="text-gray-600 dark:text-gray-400 hover:underline text-sm"
                      >
                        View Event
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 