import { useState, useEffect, Fragment } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { Modal, SelectInput } from "../../components/common";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

const UsersPage = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ 
    isOpen: false, 
    userId: null, 
    userName: '',
    deleteAllData: true // Default to deleting all data
  });
  const [statusModal, setStatusModal] = useState({ isOpen: false, userId: null, userName: '', currentStatus: '' });
  const [flagModal, setFlagModal] = useState({ isOpen: false, userId: null, userName: '', isFlagged: false, flagReason: '' });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/admin/users");
        if (response.data.success) {
          setUsers(response.data.users);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        setError("Failed to load users. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const response = await axios.put(`/admin/users/${userId}/role`, {
        role: newRole,
      });
      if (response.data.success) {
        // Update the user in the list
        setUsers(
          users.map((user) =>
            user._id === userId ? { ...user, role: newRole } : user
          )
        );
      }
    } catch (error) {
      console.error("Error updating user role:", error);
      setError("Failed to update user role. Please try again.");
    }
  };

  const confirmDeleteUser = (userId, userName) => {
    setDeleteModal({ 
      isOpen: true, 
      userId, 
      userName,
      deleteAllData: true // Default to deleting all data
    });
  };

  const handleDeleteUser = async () => {
    try {
      const response = await axios.delete(`/admin/users/${deleteModal.userId}`, {
        data: { 
          deleteAllData: deleteModal.deleteAllData 
        }
      });
      
      if (response.data.success) {
        // Remove the user from the list
        setUsers(users.filter((user) => user._id !== deleteModal.userId));
        setDeleteModal({ isOpen: false, userId: null, userName: '', deleteAllData: true });
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      setError("Failed to delete user. Please try again.");
    }
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, userId: null, userName: '', deleteAllData: true });
  };

  const toggleDeleteAllData = () => {
    setDeleteModal({
      ...deleteModal,
      deleteAllData: !deleteModal.deleteAllData
    });
  };

  const confirmStatusChange = (userId, userName, currentStatus) => {
    setStatusModal({ isOpen: true, userId, userName, currentStatus });
  };

  const handleStatusChange = async () => {
    try {
      const newStatus = statusModal.currentStatus === 'active' ? 'suspended' : 'active';
      const response = await axios.put(`/admin/users/${statusModal.userId}/status`, {
        status: newStatus,
      });
      
      if (response.data.success) {
        // Update the user in the list
        setUsers(
          users.map((user) =>
            user._id === statusModal.userId ? { ...user, status: newStatus } : user
          )
        );
        setStatusModal({ isOpen: false, userId: null, userName: '', currentStatus: '' });
      }
    } catch (error) {
      console.error("Error updating user status:", error);
      setError("Failed to update user status. Please try again.");
    }
  };

  const closeStatusModal = () => {
    setStatusModal({ isOpen: false, userId: null, userName: '', currentStatus: '' });
  };

  const openFlagModal = (userId, userName, isFlagged, flagReason = '') => {
    setFlagModal({ isOpen: true, userId, userName, isFlagged, flagReason });
  };

  const handleFlagUser = async () => {
    try {
      const response = await axios.put(`/admin/users/${flagModal.userId}/flag`, {
        isFlagged: !flagModal.isFlagged,
        flagReason: flagModal.flagReason
      });
      
      if (response.data.success) {
        // Update the user in the list
        setUsers(
          users.map((user) =>
            user._id === flagModal.userId 
              ? { 
                  ...user, 
                  isFlagged: !flagModal.isFlagged,
                  flagReason: !flagModal.isFlagged ? flagModal.flagReason : null 
                } 
              : user
          )
        );
        setFlagModal({ isOpen: false, userId: null, userName: '', isFlagged: false, flagReason: '' });
      }
    } catch (error) {
      console.error("Error updating user flag status:", error);
      setError("Failed to update user flag status. Please try again.");
    }
  };

  const closeFlagModal = () => {
    setFlagModal({ isOpen: false, userId: null, userName: '', isFlagged: false, flagReason: '' });
  };

  const handleFlagReasonChange = (e) => {
    setFlagModal({ ...flagModal, flagReason: e.target.value });
  };

  const roleOptions = [
    { value: 'user', label: 'User' },
    { value: 'organizer', label: 'Organizer' },
    { value: 'admin', label: 'Admin' }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">User Management</h1>
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
            <div className="text-center py-10 text-gray-600 dark:text-gray-400">Loading users...</div>
          ) : (
            <div className="table-scroll overflow-x-auto">
              <table className="min-w-full bg-white dark:bg-gray-800 border dark:border-gray-700">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-700">
                    <th className="py-2 px-4 border dark:border-gray-600 text-left text-gray-800 dark:text-gray-200">Name</th>
                    <th className="py-2 px-4 border dark:border-gray-600 text-left text-gray-800 dark:text-gray-200">Email</th>
                    <th className="py-2 px-4 border dark:border-gray-600 text-left text-gray-800 dark:text-gray-200">Role</th>
                    <th className="py-2 px-4 border dark:border-gray-600 text-left text-gray-800 dark:text-gray-200">Status</th>
                    <th className="py-2 px-4 border dark:border-gray-600 text-left text-gray-800 dark:text-gray-200">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((userData) => (
                    <tr key={userData._id} className={`border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 ${userData.isFlagged ? 'bg-red-50 dark:bg-red-900/30' : ''}`}>
                      <td className="py-2 px-4 border dark:border-gray-700 text-gray-800 dark:text-gray-200">
                        {userData.name}
                        {userData.isFlagged && (
                          <span className="ml-2 px-2 py-1 text-xs bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200 rounded-full">
                            Flagged
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-4 border dark:border-gray-700 text-gray-800 dark:text-gray-200">{userData.email}</td>
                      <td className="py-2 px-4 border dark:border-gray-700 text-gray-800 dark:text-gray-200">
                        <SelectInput
                          value={userData.role}
                          onChange={(e) => handleRoleChange(userData._id, e.target.value)}
                          options={roleOptions}
                          className="py-1 px-2 text-sm"
                          disabled={userData._id === user?._id} // Can't change your own role
                        />
                      </td>
                      <td className="py-2 px-4 border dark:border-gray-700">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          userData.status === 'active' 
                            ? 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200' 
                            : 'bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200'
                        }`}>
                          {userData.status || 'active'}
                        </span>
                      </td>
                      <td className="py-2 px-4 border dark:border-gray-700 space-x-2">
                        <button
                          onClick={() => confirmStatusChange(userData._id, userData.name, userData.status || 'active')}
                          className={`px-3 py-1 ${
                            userData.status === 'suspended' 
                              ? 'bg-green-500 hover:bg-green-600' 
                              : 'bg-orange-500 hover:bg-orange-600'
                          } text-white rounded transition`}
                          disabled={userData._id === user?._id} // Can't suspend yourself
                        >
                          {userData.status === 'suspended' ? 'Activate' : 'Suspend'}
                        </button>
                        
                        <button
                          onClick={() => openFlagModal(userData._id, userData.name, userData.isFlagged, userData.flagReason)}
                          className={`px-3 py-1 ${
                            userData.isFlagged 
                              ? 'bg-blue-500 hover:bg-blue-600' 
                              : 'bg-yellow-500 hover:bg-yellow-600'
                          } text-white rounded transition`}
                          disabled={userData._id === user?._id} // Can't flag yourself
                        >
                          {userData.isFlagged ? 'Unflag' : 'Flag'}
                        </button>
                        
                        <button
                          onClick={() => confirmDeleteUser(userData._id, userData.name)}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                          disabled={userData._id === user?._id} // Can't delete yourself
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}

                  {users.length === 0 && (
                    <tr>
                      <td
                        colSpan="5"
                        className="py-4 text-center text-gray-500 dark:text-gray-400"
                      >
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add invisible spacer to push footer down */}
      <div className="h-32"></div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        title="Delete User"
        maxWidth="max-w-md"
      >
        <div className="mt-2">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-600" aria-hidden="true" />
          </div>
          <div className="mt-3 text-center sm:mt-5">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Are you sure you want to delete the user "{deleteModal.userName}"? This action cannot be undone.
            </p>
            <div className="flex items-center justify-center space-x-2 mb-4">
              <input
                type="checkbox"
                id="deleteAllData"
                checked={deleteModal.deleteAllData}
                onChange={toggleDeleteAllData}
                className="w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label htmlFor="deleteAllData" className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Also delete all user data (events, registrations, activities, etc.)
              </label>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-md">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                {deleteModal.deleteAllData 
                  ? "All user data will be permanently deleted, including events they've created, registrations, and activity history."
                  : "The user account will be deleted, but their data will remain in the system."}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
          <button
            type="button"
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:col-start-2 sm:text-sm"
            onClick={handleDeleteUser}
          >
            {deleteModal.deleteAllData ? 'Delete Everything' : 'Delete User Only'}
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

      {/* Status Change Modal */}
      <Modal
        isOpen={statusModal.isOpen}
        onClose={closeStatusModal}
        title={statusModal.currentStatus === 'active' ? "Suspend User" : "Activate User"}
        maxWidth="max-w-md"
      >
        <div className="mt-2">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-yellow-100 rounded-full">
            <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600" aria-hidden="true" />
          </div>
          <div className="mt-3 text-center sm:mt-5">
            <p className="text-gray-500 dark:text-gray-400">
              {statusModal.currentStatus === 'active' 
                ? `Are you sure you want to suspend the user "${statusModal.userName}"? They will not be able to login until reactivated.`
                : `Are you sure you want to reactivate the user "${statusModal.userName}"? They will regain access to the platform.`
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

      {/* Flag User Modal */}
      <Modal
        isOpen={flagModal.isOpen}
        onClose={closeFlagModal}
        title={flagModal.isFlagged ? "Unflag User" : "Flag User"}
        maxWidth="max-w-md"
      >
        <div className="mt-2">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-yellow-100 rounded-full">
            <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600" aria-hidden="true" />
          </div>
          <div className="mt-3 sm:mt-5">
            {flagModal.isFlagged ? (
              <p className="text-gray-500 dark:text-gray-400 text-center">
                Are you sure you want to remove the flag from user "{flagModal.userName}"?
              </p>
            ) : (
              <>
                <p className="text-gray-500 dark:text-gray-400 mb-4 text-center">
                  Please specify a reason for flagging user "{flagModal.userName}":
                </p>
                <textarea
                  value={flagModal.flagReason}
                  onChange={handleFlagReasonChange}
                  className="w-full px-3 py-2 border dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  rows={3}
                  placeholder="Enter reason for flagging this user..."
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
            onClick={handleFlagUser}
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

export default UsersPage; 