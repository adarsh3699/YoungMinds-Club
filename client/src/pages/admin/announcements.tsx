import React, { useState, useEffect } from "react";
import axios, { AxiosResponse } from "axios";
import { format } from "date-fns";
import { Modal } from "../../components/common";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import {
  AdminAnnouncement,
  AnnouncementFormData,
  DeleteModalState,
  AdminAnnouncementsApiResponse,
  CreateAnnouncementApiResponse,
  DeleteAnnouncementApiResponse,
  UpdateAnnouncementApiResponse
} from '@/types';

const AnnouncementsPage: React.FC = () => {
  const [announcements, setAnnouncements] = useState<AdminAnnouncement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<DeleteModalState>({ isOpen: false, announcementId: null, title: '' });
  const [formData, setFormData] = useState<AnnouncementFormData>({
    title: '',
    message: '',
    type: 'info',
    expiresAt: ''
  });
  const [isFormSubmitting, setIsFormSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>('');

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async (): Promise<void> => {
    try {
      setLoading(true);
      const response: AxiosResponse<AdminAnnouncementsApiResponse> = await axios.get("/admin/announcements");
      if (response.data.success) {
        setAnnouncements(response.data.announcements);
      }
    } catch (error) {
      console.error("Error fetching announcements:", error);
      setError("Failed to load announcements. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setFormError('');

    if (!formData.title.trim()) {
      setFormError('Title is required');
      return;
    }

    if (!formData.message.trim()) {
      setFormError('Message is required');
      return;
    }

    try {
      setIsFormSubmitting(true);
      const response: AxiosResponse<CreateAnnouncementApiResponse> = await axios.post("/admin/announcements", formData);
      
      if (response.data.success) {
        // Add the new announcement to the list
        setAnnouncements([response.data.announcement, ...announcements]);
        
        // Reset the form
        setFormData({
          title: '',
          message: '',
          type: 'info',
          expiresAt: ''
        });
      }
    } catch (error) {
      console.error("Error creating announcement:", error);
      setFormError("Failed to create announcement. Please try again.");
    } finally {
      setIsFormSubmitting(false);
    }
  };

  const confirmDeleteAnnouncement = (announcementId: string, title: string): void => {
    setDeleteModal({ isOpen: true, announcementId, title });
  };

  const handleDeleteAnnouncement = async (): Promise<void> => {
    try {
      const response: AxiosResponse<DeleteAnnouncementApiResponse> = await axios.delete(`/admin/announcements/${deleteModal.announcementId}`);
      if (response.data.success) {
        // Remove the announcement from the list
        setAnnouncements(announcements.filter((a) => a._id !== deleteModal.announcementId));
        setDeleteModal({ isOpen: false, announcementId: null, title: '' });
      }
    } catch (error) {
      console.error("Error deleting announcement:", error);
      setError("Failed to delete announcement. Please try again.");
    }
  };

  const closeDeleteModal = (): void => {
    setDeleteModal({ isOpen: false, announcementId: null, title: '' });
  };

  const toggleAnnouncementStatus = async (announcementId: string, currentStatus: boolean): Promise<void> => {
    try {
      const response: AxiosResponse<UpdateAnnouncementApiResponse> = await axios.put(`/admin/announcements/${announcementId}`, {
        isActive: !currentStatus
      });
      
      if (response.data.success) {
        // Update the announcement in the list
        setAnnouncements(
          announcements.map((announcement) =>
            announcement._id === announcementId 
              ? { ...announcement, isActive: !currentStatus } 
              : announcement
          )
        );
      }
    } catch (error) {
      console.error("Error updating announcement status:", error);
      setError("Failed to update announcement status. Please try again.");
    }
  };

  const getAnnouncementTypeStyles = (type: 'info' | 'warning' | 'success' | 'error'): string => {
    switch (type) {
      case 'info':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">System Announcements</h1>
          <a 
            href="/admin/dashboard" 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Back to Dashboard
          </a>
        </div>

        {/* Create announcement form */}
        <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Create New Announcement</h2>
          
          {formError && (
            <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4">
              {formError}
            </div>
          )}
          
          <form onSubmit={handleFormSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="title">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  placeholder="Announcement title"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="type">
                  Type
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                >
                  <option value="info">Information</option>
                  <option value="warning">Warning</option>
                  <option value="success">Success</option>
                  <option value="error">Error</option>
                </select>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="message">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                placeholder="Announcement message"
              ></textarea>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="expiresAt">
                Expiry Date (optional)
              </label>
              <input
                type="datetime-local"
                id="expiresAt"
                name="expiresAt"
                value={formData.expiresAt}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              />
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isFormSubmitting}
                className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition ${
                  isFormSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isFormSubmitting ? 'Creating...' : 'Create Announcement'}
              </button>
            </div>
          </form>
        </div>

        {/* List of announcements */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">All Announcements</h2>
          
          {error && (
            <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          {loading ? (
            <div className="text-center py-10 text-gray-600 dark:text-gray-400">Loading announcements...</div>
          ) : (
            <div className="space-y-4">
              {announcements.length > 0 ? (
                <div className="table-scroll overflow-x-auto">
                  <table className="min-w-full bg-white dark:bg-gray-800 border dark:border-gray-700">
                    <thead>
                      <tr className="bg-gray-100 dark:bg-gray-700">
                        <th className="py-2 px-4 border dark:border-gray-600 text-left text-gray-800 dark:text-gray-200">Title</th>
                        <th className="py-2 px-4 border dark:border-gray-600 text-left text-gray-800 dark:text-gray-200">Message</th>
                        <th className="py-2 px-4 border dark:border-gray-600 text-left text-gray-800 dark:text-gray-200">Type</th>
                        <th className="py-2 px-4 border dark:border-gray-600 text-left text-gray-800 dark:text-gray-200">Created</th>
                        <th className="py-2 px-4 border dark:border-gray-600 text-left text-gray-800 dark:text-gray-200">Expires</th>
                        <th className="py-2 px-4 border dark:border-gray-600 text-left text-gray-800 dark:text-gray-200">Status</th>
                        <th className="py-2 px-4 border dark:border-gray-600 text-left text-gray-800 dark:text-gray-200">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {announcements.map((announcement) => (
                        <tr key={announcement._id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="py-2 px-4 border dark:border-gray-700 text-gray-800 dark:text-gray-200 font-medium">
                            {announcement.title}
                          </td>
                          <td className="py-2 px-4 border dark:border-gray-700 text-gray-800 dark:text-gray-200">
                            <div className="line-clamp-2">
                              {announcement.message}
                            </div>
                          </td>
                          <td className="py-2 px-4 border dark:border-gray-700">
                            <span className={`px-2 py-1 rounded-full text-xs ${getAnnouncementTypeStyles(announcement.type)}`}>
                              {announcement.type}
                            </span>
                          </td>
                          <td className="py-2 px-4 border dark:border-gray-700 text-gray-800 dark:text-gray-200">
                            {format(new Date(announcement.createdAt), "PPP")}
                          </td>
                          <td className="py-2 px-4 border dark:border-gray-700 text-gray-800 dark:text-gray-200">
                            {announcement.expiresAt 
                              ? format(new Date(announcement.expiresAt), "PPP") 
                              : 'No expiry'
                            }
                          </td>
                          <td className="py-2 px-4 border dark:border-gray-700">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              announcement.isActive 
                                ? 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200' 
                                : 'bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200'
                            }`}>
                              {announcement.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="py-2 px-4 border dark:border-gray-700 space-x-2 whitespace-nowrap">
                            <button
                              onClick={() => toggleAnnouncementStatus(announcement._id, announcement.isActive)}
                              className={`px-3 py-1 ${
                                announcement.isActive 
                                  ? 'bg-orange-500 hover:bg-orange-600' 
                                  : 'bg-green-500 hover:bg-green-600'
                              } text-white rounded transition`}
                            >
                              {announcement.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            
                            <button
                              onClick={() => confirmDeleteAnnouncement(announcement._id, announcement.title)}
                              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded text-center text-gray-600 dark:text-gray-300">
                  No announcements found
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        title="Delete Announcement"
        maxWidth="max-w-md"
      >
        <div className="mt-2">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-600" aria-hidden="true" />
          </div>
          <div className="mt-3 text-center sm:mt-5">
            <p className="text-gray-500 dark:text-gray-400">
              Are you sure you want to delete the announcement "{deleteModal.title}"? This action cannot be undone.
            </p>
          </div>
        </div>
        <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
          <button
            type="button"
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:col-start-2 sm:text-sm"
            onClick={handleDeleteAnnouncement}
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

export default AnnouncementsPage; 