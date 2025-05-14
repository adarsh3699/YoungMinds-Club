import { useState, useEffect } from "react";
import axios from "axios";
import { Modal } from "../../components/common";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

const OrganizersPage = () => {
  const [organizers, setOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [flagModal, setFlagModal] = useState({ isOpen: false, organizerId: null, organizerName: '', isFlagged: false, flagReason: '' });
  const [statusModal, setStatusModal] = useState({ isOpen: false, organizerId: null, organizerName: '', currentStatus: '' });

  useEffect(() => {
    const fetchOrganizers = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/admin/organizers");
        if (response.data.success) {
          setOrganizers(response.data.organizers);
        }
      } catch (error) {
        console.error("Error fetching organizers:", error);
        setError("Failed to load organizers. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizers();
  }, []);

  const confirmStatusChange = (organizerId, organizerName, currentStatus) => {
    setStatusModal({ isOpen: true, organizerId, organizerName, currentStatus });
  };

  const handleStatusChange = async () => {
    try {
      const newStatus = statusModal.currentStatus === 'active' ? 'suspended' : 'active';
      const response = await axios.put(`/admin/users/${statusModal.organizerId}/status`, {
        status: newStatus,
      });
      
      if (response.data.success) {
        // Update the organizer in the list
        setOrganizers(
          organizers.map((organizer) =>
            organizer._id === statusModal.organizerId ? { ...organizer, status: newStatus } : organizer
          )
        );
        setStatusModal({ isOpen: false, organizerId: null, organizerName: '', currentStatus: '' });
      }
    } catch (error) {
      console.error("Error updating organizer status:", error);
      setError("Failed to update organizer status. Please try again.");
    }
  };

  const closeStatusModal = () => {
    setStatusModal({ isOpen: false, organizerId: null, organizerName: '', currentStatus: '' });
  };

  const openFlagModal = (organizerId, organizerName, isFlagged, flagReason = '') => {
    setFlagModal({ isOpen: true, organizerId, organizerName, isFlagged, flagReason });
  };

  const handleFlagOrganizer = async () => {
    try {
      const response = await axios.put(`/admin/users/${flagModal.organizerId}/flag`, {
        isFlagged: !flagModal.isFlagged,
        flagReason: flagModal.flagReason
      });
      
      if (response.data.success) {
        // Update the organizer in the list
        setOrganizers(
          organizers.map((organizer) =>
            organizer._id === flagModal.organizerId 
              ? { 
                  ...organizer, 
                  isFlagged: !flagModal.isFlagged,
                  flagReason: !flagModal.isFlagged ? flagModal.flagReason : null 
                } 
              : organizer
          )
        );
        setFlagModal({ isOpen: false, organizerId: null, organizerName: '', isFlagged: false, flagReason: '' });
      }
    } catch (error) {
      console.error("Error updating organizer flag status:", error);
      setError("Failed to update organizer flag status. Please try again.");
    }
  };

  const closeFlagModal = () => {
    setFlagModal({ isOpen: false, organizerId: null, organizerName: '', isFlagged: false, flagReason: '' });
  };

  const handleFlagReasonChange = (e) => {
    setFlagModal({ ...flagModal, flagReason: e.target.value });
  };

  const changeToUser = async (organizerId) => {
    try {
      const response = await axios.put(`/admin/users/${organizerId}/role`, {
        role: 'user'
      });
      
      if (response.data.success) {
        // Remove the organizer from the list as they're now a user
        setOrganizers(organizers.filter(org => org._id !== organizerId));
      }
    } catch (error) {
      console.error("Error changing organizer to user:", error);
      setError("Failed to change role. Please try again.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Organizer Management</h1>
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
            <div className="text-center py-10 text-gray-600 dark:text-gray-400">Loading organizers...</div>
          ) : (
            <div className="table-scroll overflow-x-auto">
              <table className="min-w-full bg-white dark:bg-gray-800 border dark:border-gray-700">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-700">
                    <th className="py-2 px-4 border dark:border-gray-600 text-left text-gray-800 dark:text-gray-200">Name</th>
                    <th className="py-2 px-4 border dark:border-gray-600 text-left text-gray-800 dark:text-gray-200">Email</th>
                    <th className="py-2 px-4 border dark:border-gray-600 text-left text-gray-800 dark:text-gray-200">Events</th>
                    <th className="py-2 px-4 border dark:border-gray-600 text-left text-gray-800 dark:text-gray-200">Status</th>
                    <th className="py-2 px-4 border dark:border-gray-600 text-left text-gray-800 dark:text-gray-200">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {organizers.map((organizer) => (
                    <tr key={organizer._id} className={`border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 ${organizer.isFlagged ? 'bg-red-50 dark:bg-red-900/30' : ''}`}>
                      <td className="py-2 px-4 border dark:border-gray-700 text-gray-800 dark:text-gray-200">
                        {organizer.name}
                        {organizer.isFlagged && (
                          <span className="ml-2 px-2 py-1 text-xs bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200 rounded-full">
                            Flagged
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-4 border dark:border-gray-700 text-gray-800 dark:text-gray-200">{organizer.email}</td>
                      <td className="py-2 px-4 border dark:border-gray-700 text-gray-800 dark:text-gray-200">
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 rounded-full text-xs">
                          {organizer.eventCount} events
                        </span>
                      </td>
                      <td className="py-2 px-4 border dark:border-gray-700">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          organizer.status === 'active' || !organizer.status
                            ? 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200' 
                            : 'bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200'
                        }`}>
                          {organizer.status || 'active'}
                        </span>
                      </td>
                      <td className="py-2 px-4 border dark:border-gray-700 space-x-2">
                        <button
                          onClick={() => confirmStatusChange(organizer._id, organizer.name, organizer.status || 'active')}
                          className={`px-3 py-1 ${
                            organizer.status === 'suspended' 
                              ? 'bg-green-500 hover:bg-green-600' 
                              : 'bg-orange-500 hover:bg-orange-600'
                          } text-white rounded transition`}
                        >
                          {organizer.status === 'suspended' ? 'Activate' : 'Suspend'}
                        </button>
                        
                        <button
                          onClick={() => openFlagModal(organizer._id, organizer.name, organizer.isFlagged, organizer.flagReason)}
                          className={`px-3 py-1 ${
                            organizer.isFlagged 
                              ? 'bg-blue-500 hover:bg-blue-600' 
                              : 'bg-yellow-500 hover:bg-yellow-600'
                          } text-white rounded transition`}
                        >
                          {organizer.isFlagged ? 'Unflag' : 'Flag'}
                        </button>
                        
                        <button
                          onClick={() => changeToUser(organizer._id)}
                          className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 transition"
                        >
                          Demote to User
                        </button>
                      </td>
                    </tr>
                  ))}

                  {organizers.length === 0 && (
                    <tr>
                      <td
                        colSpan="5"
                        className="py-4 text-center text-gray-500 dark:text-gray-400"
                      >
                        No organizers found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Status Change Modal */}
      <Modal
        isOpen={statusModal.isOpen}
        onClose={closeStatusModal}
        title={statusModal.currentStatus === 'active' ? "Suspend Organizer" : "Activate Organizer"}
        maxWidth="max-w-md"
      >
        <div className="mt-2">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-yellow-100 rounded-full">
            <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600" aria-hidden="true" />
          </div>
          <div className="mt-3 text-center sm:mt-5">
            <p className="text-gray-500 dark:text-gray-400">
              {statusModal.currentStatus === 'active' 
                ? `Are you sure you want to suspend the organizer "${statusModal.organizerName}"? They will not be able to login or manage events until reactivated.`
                : `Are you sure you want to reactivate the organizer "${statusModal.organizerName}"? They will regain access to the platform and their events.`
              }
            </p>
          </div>
        </div>
        <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
          <button
            type="button"
            className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 ${
              statusModal.currentStatus === 'active' 
                ? 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500' 
                : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
            } text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:col-start-2 sm:text-sm`}
            onClick={handleStatusChange}
          >
            {statusModal.currentStatus === 'active' ? 'Suspend' : 'Activate'}
          </button>
          <button
            type="button"
            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:col-start-1 sm:text-sm"
            onClick={closeStatusModal}
          >
            Cancel
          </button>
        </div>
      </Modal>

      {/* Flag Organizer Modal */}
      <Modal
        isOpen={flagModal.isOpen}
        onClose={closeFlagModal}
        title={flagModal.isFlagged ? "Unflag Organizer" : "Flag Organizer"}
        maxWidth="max-w-md"
      >
        <div className="mt-2">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-yellow-100 rounded-full">
            <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600" aria-hidden="true" />
          </div>
          <div className="mt-3 sm:mt-5">
            {flagModal.isFlagged ? (
              <p className="text-gray-500 dark:text-gray-400 text-center">
                Are you sure you want to remove the flag from organizer "{flagModal.organizerName}"?
              </p>
            ) : (
              <>
                <p className="text-gray-500 dark:text-gray-400 mb-4 text-center">
                  Please specify a reason for flagging organizer "{flagModal.organizerName}":
                </p>
                <textarea
                  value={flagModal.flagReason}
                  onChange={handleFlagReasonChange}
                  className="w-full px-3 py-2 border dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  rows={3}
                  placeholder="Enter reason for flagging this organizer..."
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
            onClick={handleFlagOrganizer}
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

export default OrganizersPage; 