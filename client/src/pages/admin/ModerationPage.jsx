import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { format } from "date-fns";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

const ModerationPage = () => {
  const [flaggedItems, setFlaggedItems] = useState({ users: [], events: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFlaggedItems = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/admin/moderation/flagged");
        if (response.data.success) {
          setFlaggedItems(response.data.flaggedItems);
        }
      } catch (error) {
        console.error("Error fetching flagged items:", error);
        setError("Failed to load flagged items. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchFlaggedItems();
  }, []);

  const handleUnflagUser = async (userId) => {
    try {
      const response = await axios.put(`/admin/users/${userId}/flag`, {
        isFlagged: false
      });
      
      if (response.data.success) {
        // Remove the user from the flagged list
        setFlaggedItems({
          ...flaggedItems,
          users: flaggedItems.users.filter(user => user._id !== userId)
        });
      }
    } catch (error) {
      console.error("Error unflagging user:", error);
      setError("Failed to unflag user. Please try again.");
    }
  };

  const handleUnflagEvent = async (eventId) => {
    try {
      const response = await axios.put(`/admin/events/${eventId}/flag`, {
        isFlagged: false
      });
      
      if (response.data.success) {
        // Remove the event from the flagged list
        setFlaggedItems({
          ...flaggedItems,
          events: flaggedItems.events.filter(event => event._id !== eventId)
        });
      }
    } catch (error) {
      console.error("Error unflagging event:", error);
      setError("Failed to unflag event. Please try again.");
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      const response = await axios.delete(`/admin/events/${eventId}`);
      if (response.data.success) {
        // Remove the event from the flagged list
        setFlaggedItems({
          ...flaggedItems,
          events: flaggedItems.events.filter(event => event._id !== eventId)
        });
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      setError("Failed to delete event. Please try again.");
    }
  };

  const handleSuspendUser = async (userId) => {
    try {
      const response = await axios.put(`/admin/users/${userId}/status`, {
        status: 'suspended'
      });
      
      if (response.data.success) {
        // Update the user in the list
        setFlaggedItems({
          ...flaggedItems,
          users: flaggedItems.users.map(user => 
            user._id === userId 
              ? { ...user, status: 'suspended' } 
              : user
          )
        });
      }
    } catch (error) {
      console.error("Error suspending user:", error);
      setError("Failed to suspend user. Please try again.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Content Moderation</h1>
          <a 
            href="/admin/dashboard" 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Back to Dashboard
          </a>
        </div>

        {error && (
          <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-10 text-gray-600 dark:text-gray-400">
            Loading flagged content...
          </div>
        ) : (
          <div className="space-y-8">
            {/* Flagged Users Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-500 mr-2" />
                Flagged Users ({flaggedItems.users.length})
              </h2>
              
              {flaggedItems.users.length > 0 ? (
                <div className="table-scroll overflow-x-auto">
                  <table className="min-w-full bg-white dark:bg-gray-800 border dark:border-gray-700">
                    <thead>
                      <tr className="bg-gray-100 dark:bg-gray-700">
                        <th className="py-2 px-4 border dark:border-gray-600 text-left text-gray-800 dark:text-gray-200">User</th>
                        <th className="py-2 px-4 border dark:border-gray-600 text-left text-gray-800 dark:text-gray-200">Email</th>
                        <th className="py-2 px-4 border dark:border-gray-600 text-left text-gray-800 dark:text-gray-200">Role</th>
                        <th className="py-2 px-4 border dark:border-gray-600 text-left text-gray-800 dark:text-gray-200">Status</th>
                        <th className="py-2 px-4 border dark:border-gray-600 text-left text-gray-800 dark:text-gray-200">Flag Reason</th>
                        <th className="py-2 px-4 border dark:border-gray-600 text-left text-gray-800 dark:text-gray-200">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {flaggedItems.users.map((user) => (
                        <tr key={user._id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 bg-red-50 dark:bg-red-900/30">
                          <td className="py-2 px-4 border dark:border-gray-700 text-gray-800 dark:text-gray-200">
                            {user.name}
                          </td>
                          <td className="py-2 px-4 border dark:border-gray-700 text-gray-800 dark:text-gray-200">
                            {user.email}
                          </td>
                          <td className="py-2 px-4 border dark:border-gray-700 text-gray-800 dark:text-gray-200">
                            {user.role}
                          </td>
                          <td className="py-2 px-4 border dark:border-gray-700">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              user.status === 'active' 
                                ? 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200' 
                                : 'bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200'
                            }`}>
                              {user.status || 'active'}
                            </span>
                          </td>
                          <td className="py-2 px-4 border dark:border-gray-700 text-gray-800 dark:text-gray-200">
                            {user.flagReason || 'No reason provided'}
                          </td>
                          <td className="py-2 px-4 border dark:border-gray-700 space-x-2 whitespace-nowrap">
                            <button
                              onClick={() => handleUnflagUser(user._id)}
                              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                            >
                              Unflag
                            </button>
                            
                            {user.status !== 'suspended' && (
                              <button
                                onClick={() => handleSuspendUser(user._id)}
                                className="px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 transition"
                              >
                                Suspend
                              </button>
                            )}
                            
                            <Link
                              to={`/admin/users`}
                              className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
                            >
                              View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded text-center text-gray-600 dark:text-gray-300">
                  No flagged users found
                </div>
              )}
            </div>

            {/* Flagged Events Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-500 mr-2" />
                Flagged Events ({flaggedItems.events.length})
              </h2>
              
              {flaggedItems.events.length > 0 ? (
                <div className="table-scroll overflow-x-auto">
                  <table className="min-w-full bg-white dark:bg-gray-800 border dark:border-gray-700">
                    <thead>
                      <tr className="bg-gray-100 dark:bg-gray-700">
                        <th className="py-2 px-4 border dark:border-gray-600 text-left text-gray-800 dark:text-gray-200">Event</th>
                        <th className="py-2 px-4 border dark:border-gray-600 text-left text-gray-800 dark:text-gray-200">Organizer</th>
                        <th className="py-2 px-4 border dark:border-gray-600 text-left text-gray-800 dark:text-gray-200">Date</th>
                        <th className="py-2 px-4 border dark:border-gray-600 text-left text-gray-800 dark:text-gray-200">Flag Reason</th>
                        <th className="py-2 px-4 border dark:border-gray-600 text-left text-gray-800 dark:text-gray-200">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {flaggedItems.events.map((event) => (
                        <tr key={event._id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 bg-red-50 dark:bg-red-900/30">
                          <td className="py-2 px-4 border dark:border-gray-700 text-gray-800 dark:text-gray-200">
                            <div className="flex items-center">
                              <img 
                                src={event.poster} 
                                alt={event.title} 
                                className="w-12 h-12 object-cover rounded mr-3"
                                onError={(e) => { e.target.src = 'https://via.placeholder.com/100?text=Event'; }} 
                              />
                              {event.title}
                            </div>
                          </td>
                          <td className="py-2 px-4 border dark:border-gray-700 text-gray-800 dark:text-gray-200">
                            {event.organizer?.name || 'Unknown'}
                          </td>
                          <td className="py-2 px-4 border dark:border-gray-700 text-gray-800 dark:text-gray-200">
                            {format(new Date(event.date), "PPP")}
                          </td>
                          <td className="py-2 px-4 border dark:border-gray-700 text-gray-800 dark:text-gray-200">
                            {event.flagReason || 'No reason provided'}
                          </td>
                          <td className="py-2 px-4 border dark:border-gray-700 space-x-2 whitespace-nowrap">
                            <button
                              onClick={() => handleUnflagEvent(event._id)}
                              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                            >
                              Unflag
                            </button>
                            
                            <button
                              onClick={() => handleDeleteEvent(event._id)}
                              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                            >
                              Delete
                            </button>
                            
                            <Link
                              to={`/event/${event._id}`}
                              className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
                            >
                              View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded text-center text-gray-600 dark:text-gray-300">
                  No flagged events found
                </div>
              )}
            </div>

            {flaggedItems.users.length === 0 && flaggedItems.events.length === 0 && (
              <div className="bg-green-50 dark:bg-green-900 p-6 rounded text-center">
                <p className="text-green-800 dark:text-green-200 text-lg">
                  Great! No flagged content to review.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModerationPage; 