import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import EventCard from "../components/events/EventCard";
import CreateEventModal from "../components/organizer/CreateEventModal";
import { 
  CalendarIcon, 
  UsersIcon, 
  CurrencyDollarIcon, 
  PlusIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";

const OrganizerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [events, setEvents] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/organizer/dashboard');
        setDashboardData(response.data.data);
        
        // Fetch events in the same call
        const eventsResponse = await axios.get('/organizer/events');
        setEvents(eventsResponse.data.events);
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError("Failed to load dashboard data. Please try again.");
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [refreshTrigger]);

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    // Trigger refresh of events list
    setRefreshTrigger(prev => prev + 1);
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
      try {
        await axios.delete(`/organizer/events/${eventId}`);
        setEvents(events.filter(event => event._id !== eventId));
      } catch (error) {
        console.error("Error deleting event:", error);
        alert("Failed to delete event. Please try again.");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen dark:bg-gray-900">
        <div className="text-red-500 dark:text-red-400 mb-4">{error}</div>
        <button
          onClick={() => setRefreshTrigger(prev => prev + 1)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Organizer Dashboard</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            <PlusIcon className="h-5 w-5 mr-1" />
            Create Event
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50 dark:bg-blue-900 p-6 rounded-lg flex items-center">
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
          <div className="bg-green-50 dark:bg-green-900 p-6 rounded-lg flex items-center">
            <div className="bg-green-100 dark:bg-green-800 p-3 rounded-full mr-4">
              <UsersIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1 text-gray-800 dark:text-gray-200">Total Attendees</h3>
              <p className="text-3xl font-bold text-green-700 dark:text-green-400">
                {dashboardData?.stats?.attendeeCount || 0}
              </p>
            </div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900 p-6 rounded-lg flex items-center">
            <div className="bg-purple-100 dark:bg-purple-800 p-3 rounded-full mr-4">
              <CurrencyDollarIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1 text-gray-800 dark:text-gray-200">Revenue</h3>
              <p className="text-3xl font-bold text-purple-700 dark:text-purple-400">
                ${dashboardData?.stats?.revenue || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Your Events</h2>
            <button 
              onClick={() => setRefreshTrigger(prev => prev + 1)} 
              className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              <ArrowPathIcon className="h-5 w-5 mr-1" />
              Refresh
            </button>
          </div>
          
          {events.length === 0 ? (
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-10 text-center text-gray-500 dark:text-gray-400">
            <p>You haven't created any events yet.</p>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              >
              Create Your First Event
            </button>
          </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <EventCard 
                  key={event._id} 
                  event={event} 
                  isOrganizer={true}
                  onManage={() => navigate(`/organizer/event/${event._id}`)}
                  onEdit={() => navigate(`/organizer/event/${event._id}/edit`)}
                  onDelete={() => handleDeleteEvent(event._id)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="border-t dark:border-gray-700 pt-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Your Account</h2>
          <div className="grid grid-cols-2 gap-4 max-w-md">
            <div>
              <p className="text-gray-600 dark:text-gray-400">Name</p>
              <p className="font-medium text-gray-800 dark:text-white">{user?.name}</p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">Email</p>
              <p className="font-medium text-gray-800 dark:text-white">{user?.email}</p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">Role</p>
              <p className="font-medium capitalize text-gray-800 dark:text-white">{user?.role}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Create Event Modal */}
      {showCreateModal && (
        <CreateEventModal 
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}
    </div>
  );
};

export default OrganizerDashboard;
