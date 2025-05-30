import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { format } from "date-fns";
import { Modal } from "../../components/common";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, eventId: null, eventTitle: '' });
  const [flagModal, setFlagModal] = useState({ isOpen: false, eventId: null, eventTitle: '', isFlagged: false, flagReason: '' });

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/admin/events");
        if (response.data.success) {
          setEvents(response.data.events);
        }
      } catch (error) {
        console.error("Error fetching events:", error);
        setError("Failed to load events. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const confirmDeleteEvent = (eventId, eventTitle) => {
    setDeleteModal({ isOpen: true, eventId, eventTitle });
  };

  const handleDeleteEvent = async () => {
    try {
      const response = await axios.delete(`/admin/events/${deleteModal.eventId}`);
      if (response.data.success) {
        // Remove the event from the list
        setEvents(events.filter((event) => event._id !== deleteModal.eventId));
        setDeleteModal({ isOpen: false, eventId: null, eventTitle: '' });
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      setError("Failed to delete event. Please try again.");
    }
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, eventId: null, eventTitle: '' });
  };

  const openFlagModal = (eventId, eventTitle, isFlagged, flagReason = '') => {
    setFlagModal({ isOpen: true, eventId, eventTitle, isFlagged, flagReason });
  };

  const handleFlagEvent = async () => {
    try {
      const response = await axios.put(`/admin/events/${flagModal.eventId}/flag`, {
        isFlagged: !flagModal.isFlagged,
        flagReason: flagModal.flagReason
      });
      
      if (response.data.success) {
        // Update the event in the list
        setEvents(
          events.map((event) =>
            event._id === flagModal.eventId 
              ? { 
                  ...event, 
                  isFlagged: !flagModal.isFlagged,
                  flagReason: !flagModal.isFlagged ? flagModal.flagReason : null 
                } 
              : event
          )
        );
        setFlagModal({ isOpen: false, eventId: null, eventTitle: '', isFlagged: false, flagReason: '' });
      }
    } catch (error) {
      console.error("Error updating event flag status:", error);
      setError("Failed to update event flag status. Please try again.");
    }
  };

  const closeFlagModal = () => {
    setFlagModal({ isOpen: false, eventId: null, eventTitle: '', isFlagged: false, flagReason: '' });
  };

  const handleFlagReasonChange = (e) => {
    setFlagModal({ ...flagModal, flagReason: e.target.value });
  };

  return (
    <div className="max-w-6xl mx-auto p-6 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Event Management</h1>
          <a 
            href="/admin/dashboard" 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Back to Dashboard
          </a>
        </div>

        <div className="mb-8">
          {error && (
            <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-10 text-gray-600 dark:text-gray-400">Loading events...</div>
          ) : (
            <div className="table-scroll overflow-x-auto">
              <table className="min-w-full bg-white dark:bg-gray-800 border dark:border-gray-700">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-700">
                    <th className="py-2 px-4 border dark:border-gray-600 text-left text-gray-800 dark:text-gray-200">Event Title</th>
                    <th className="py-2 px-4 border dark:border-gray-600 text-left text-gray-800 dark:text-gray-200">Date</th>
                    <th className="py-2 px-4 border dark:border-gray-600 text-left text-gray-800 dark:text-gray-200">Organizer</th>
                    <th className="py-2 px-4 border dark:border-gray-600 text-left text-gray-800 dark:text-gray-200">Category</th>
                    <th className="py-2 px-4 border dark:border-gray-600 text-left text-gray-800 dark:text-gray-200">Status</th>
                    <th className="py-2 px-4 border dark:border-gray-600 text-left text-gray-800 dark:text-gray-200">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr key={event._id} className={`border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 ${event.isFlagged ? 'bg-red-50 dark:bg-red-900/30' : ''}`}>
                      <td className="py-2 px-4 border dark:border-gray-700 text-gray-800 dark:text-gray-200">
                        <div className="flex items-center">
                          <img 
                            src={event.poster} 
                            alt={event.title} 
                            className="w-12 h-12 object-cover rounded mr-3"
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/100?text=Event'; }} 
                          />
                          <div>
                            <Link 
                              to={`/event/${event._id}`} 
                              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                            >
                              {event.title}
                            </Link>
                            {event.isFlagged && (
                              <span className="ml-2 px-2 py-1 text-xs bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200 rounded-full">
                                Flagged
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-2 px-4 border dark:border-gray-700 text-gray-800 dark:text-gray-200">
                        {format(new Date(event.date), "PPP")}
                      </td>
                      <td className="py-2 px-4 border dark:border-gray-700 text-gray-800 dark:text-gray-200">
                        {event.organizer?.name || "Unknown"}
                      </td>
                      <td className="py-2 px-4 border dark:border-gray-700 text-gray-800 dark:text-gray-200">
                        {event.category}
                      </td>
                      <td className="py-2 px-4 border dark:border-gray-700">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          event.isPublished 
                            ? 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200' 
                            : 'bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200'
                        }`}>
                          {event.isPublished ? 'Published' : 'Draft'}
                        </span>
                        {event.isFeatured && (
                          <span className="ml-2 px-2 py-1 text-xs bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-200 rounded-full">
                            Featured
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-4 border dark:border-gray-700 space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => openFlagModal(event._id, event.title, event.isFlagged, event.flagReason)}
                          className={`px-3 py-1 ${
                            event.isFlagged 
                              ? 'bg-blue-500 hover:bg-blue-600' 
                              : 'bg-yellow-500 hover:bg-yellow-600'
                          } text-white rounded transition`}
                        >
                          {event.isFlagged ? 'Unflag' : 'Flag'}
                        </button>
                        
                        <button
                          onClick={() => confirmDeleteEvent(event._id, event.title)}
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

                  {events.length === 0 && (
                    <tr>
                      <td
                        colSpan="6"
                        className="py-4 text-center text-gray-500 dark:text-gray-400"
                      >
                        No events found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        title="Delete Event"
        maxWidth="max-w-md"
      >
        <div className="mt-2">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-600" aria-hidden="true" />
          </div>
          <div className="mt-3 text-center sm:mt-5">
            <p className="text-gray-500 dark:text-gray-400">
              Are you sure you want to delete the event "{deleteModal.eventTitle}"? This will also delete all registrations for this event. This action cannot be undone.
            </p>
          </div>
        </div>
        <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
          <button
            type="button"
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:col-start-2 sm:text-sm"
            onClick={handleDeleteEvent}
          >
            Delete
          </button>
          <button
            type="button"
            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:col-start-1 sm:text-sm"
            onClick={closeDeleteModal}
          >
            Cancel
          </button>
        </div>
      </Modal>

      {/* Flag Event Modal */}
      <Modal
        isOpen={flagModal.isOpen}
        onClose={closeFlagModal}
        title={flagModal.isFlagged ? "Unflag Event" : "Flag Event"}
        maxWidth="max-w-md"
      >
        <div className="mt-2">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-yellow-100 rounded-full">
            <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600" aria-hidden="true" />
          </div>
          <div className="mt-3 sm:mt-5">
            {flagModal.isFlagged ? (
              <p className="text-gray-500 dark:text-gray-400 text-center">
                Are you sure you want to remove the flag from event "{flagModal.eventTitle}"?
              </p>
            ) : (
              <>
                <p className="text-gray-500 dark:text-gray-400 mb-4 text-center">
                  Please specify a reason for flagging event "{flagModal.eventTitle}":
                </p>
                <textarea
                  value={flagModal.flagReason}
                  onChange={handleFlagReasonChange}
                  className="w-full px-3 py-2 border dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  rows={3}
                  placeholder="Enter reason for flagging this event..."
                />
              </>
            )}
          </div>
        </div>
        <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
          <button
            type="button"
            className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 ${
              flagModal.isFlagged 
                ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500' 
                : 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
            } text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:col-start-2 sm:text-sm`}
            onClick={handleFlagEvent}
            disabled={!flagModal.isFlagged && !flagModal.flagReason.trim()}
          >
            {flagModal.isFlagged ? 'Unflag' : 'Flag'}
          </button>
          <button
            type="button"
            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:col-start-1 sm:text-sm"
            onClick={closeFlagModal}
          >
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default EventsPage; 