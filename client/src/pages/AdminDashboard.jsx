import { useState, useEffect, Fragment } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { Switch, Modal, SelectInput } from "../components/common";
import { Dialog, Transition } from "@headlessui/react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, userId: null, userName: '' });

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
    setDeleteModal({ isOpen: true, userId, userName });
  };

  const handleDeleteUser = async () => {
    try {
      const response = await axios.delete(`/admin/users/${deleteModal.userId}`);
      if (response.data.success) {
        // Remove the user from the list
        setUsers(users.filter((user) => user._id !== deleteModal.userId));
        setDeleteModal({ isOpen: false, userId: null, userName: '' });
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      setError("Failed to delete user. Please try again.");
    }
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, userId: null, userName: '' });
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
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Admin Dashboard</h1>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50 dark:bg-blue-900 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Total Users</h3>
            <p className="text-3xl font-bold text-blue-700 dark:text-blue-400">{users.length}</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Organizers</h3>
            <p className="text-3xl font-bold text-green-700 dark:text-green-400">
              {users.filter((u) => u.role === "organizer").length}
            </p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Regular Users</h3>
            <p className="text-3xl font-bold text-purple-700 dark:text-purple-400">
              {users.filter((u) => u.role === "user").length}
            </p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">User Management</h2>

          {error && (
            <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-10 text-gray-600 dark:text-gray-400">Loading users...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white dark:bg-gray-800 border dark:border-gray-700">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-700">
                    <th className="py-2 px-4 border dark:border-gray-600 text-left text-gray-800 dark:text-gray-200">Name</th>
                    <th className="py-2 px-4 border dark:border-gray-600 text-left text-gray-800 dark:text-gray-200">Email</th>
                    <th className="py-2 px-4 border dark:border-gray-600 text-left text-gray-800 dark:text-gray-200">Role</th>
                    <th className="py-2 px-4 border dark:border-gray-600 text-left text-gray-800 dark:text-gray-200">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((userData) => (
                    <tr key={userData._id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="py-2 px-4 border dark:border-gray-700 text-gray-800 dark:text-gray-200">{userData.name}</td>
                      <td className="py-2 px-4 border dark:border-gray-700 text-gray-800 dark:text-gray-200">{userData.email}</td>
                      <td className="py-2 px-4 border dark:border-gray-700 text-gray-800 dark:text-gray-200">
                        <SelectInput
                          value={userData.role}
                          onChange={(e) => handleRoleChange(userData._id, e.target.value)}
                          options={roleOptions}
                          className="py-1 px-2 text-sm"
                        />
                      </td>
                      <td className="py-2 px-4 border dark:border-gray-700">
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
                        colSpan="4"
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
            <p className="text-gray-500 dark:text-gray-400">
              Are you sure you want to delete the user "{deleteModal.userName}"? This action cannot be undone.
            </p>
          </div>
        </div>
        <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
          <button
            type="button"
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:col-start-2 sm:text-sm"
            onClick={handleDeleteUser}
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
    </div>
  );
};

export default AdminDashboard;
