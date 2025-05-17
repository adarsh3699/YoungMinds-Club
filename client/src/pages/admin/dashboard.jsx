import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import {
  UserGroupIcon,
  UserIcon,
  CalendarIcon,
  TicketIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  MegaphoneIcon,
  FlagIcon,
  StarIcon
} from "@heroicons/react/24/outline";

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrganizers: 0,
    totalEvents: 0,
    totalRegistrations: 0,
    flaggedItems: 0
  });
  const [topOrganizers, setTopOrganizers] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [flaggedContent, setFlaggedContent] = useState([]);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [announcement, setAnnouncement] = useState({
    title: '',
    message: '',
    type: 'info',
    target: 'all'
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Get basic stats
        const statsResponse = await axios.get("/admin/dashboard/stats");
        if (statsResponse.data.success) {
          setStats(statsResponse.data.stats);
        }
        
        // Get top organizers
        const organizersResponse = await axios.get("/admin/top-organizers?limit=5");
        if (organizersResponse.data.success && Array.isArray(organizersResponse.data.organizers)) {
          setTopOrganizers(organizersResponse.data.organizers);
        } else {
          setTopOrganizers([]);
        }
        
        // Get most active users
        const usersResponse = await axios.get("/admin/active-users?limit=5");
        if (usersResponse.data.success && Array.isArray(usersResponse.data.users)) {
          setActiveUsers(usersResponse.data.users);
        } else {
          setActiveUsers([]);
        }
        
        // Get flagged content
        const flaggedResponse = await axios.get("/admin/flagged-content?limit=5");
        if (flaggedResponse.data.success && Array.isArray(flaggedResponse.data.items)) {
          setFlaggedContent(flaggedResponse.data.items);
        } else {
          setFlaggedContent([]);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError("Failed to load dashboard data. Please try again later.");
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleAnnouncementChange = (e) => {
    const { name, value } = e.target;
    setAnnouncement({ ...announcement, [name]: value });
  };

  const submitAnnouncement = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("/admin/announcements", announcement);
      if (response.data.success) {
        // Reset form and hide it
        setAnnouncement({
          title: '',
          message: '',
          type: 'info',
          target: 'all'
        });
        setShowAnnouncementForm(false);
        
        // Show success message
        alert("Announcement sent successfully!");
      }
    } catch (error) {
      console.error("Error sending announcement:", error);
      alert("Failed to send announcement. Please try again.");
    }
  };

  // Admin section cards data
  const adminSections = [
    {
      title: "Users",
      description: "Manage all users, change roles, and moderate accounts",
      icon: <UserIcon className="h-8 w-8 text-blue-500" />,
      link: "/admin/users",
      count: stats.totalUsers - stats.totalOrganizers,
      bg: "bg-blue-50 dark:bg-blue-900/30",
      text: "text-blue-700 dark:text-blue-400",
    },
    {
      title: "Organizers",
      description: "View and manage event organizers and their activities",
      icon: <UserGroupIcon className="h-8 w-8 text-green-500" />,
      link: "/admin/organizers",
      count: stats.totalOrganizers,
      bg: "bg-green-50 dark:bg-green-900/30",
      text: "text-green-700 dark:text-green-400",
    },
    {
      title: "Events",
      description: "Monitor all events, review content, and manage listings",
      icon: <CalendarIcon className="h-8 w-8 text-purple-500" />,
      link: "/admin/events",
      count: stats.totalEvents,
      bg: "bg-purple-50 dark:bg-purple-900/30",
      text: "text-purple-700 dark:text-purple-400",
    },
    {
      title: "Registrations",
      description: "Track event registrations and attendee metrics",
      icon: <TicketIcon className="h-8 w-8 text-yellow-500" />,
      link: "/admin/analytics",
      count: stats.totalRegistrations,
      bg: "bg-yellow-50 dark:bg-yellow-900/30",
      text: "text-yellow-700 dark:text-yellow-400",
    },
    {
      title: "Analytics",
      description: "View platform statistics and performance metrics",
      icon: <ChartBarIcon className="h-8 w-8 text-indigo-500" />,
      link: "/admin/analytics",
      bg: "bg-indigo-50 dark:bg-indigo-900/30",
      text: "text-indigo-700 dark:text-indigo-400",
    },
    {
      title: "Moderation",
      description: "Review flagged content and user reports",
      icon: <ShieldCheckIcon className="h-8 w-8 text-red-500" />,
      link: "/admin/moderation",
      count: stats.flaggedItems,
      bg: "bg-red-50 dark:bg-red-900/30",
      text: "text-red-700 dark:text-red-400",
    },
    {
      title: "Announcements",
      description: "Create and manage system-wide announcements",
      icon: <MegaphoneIcon className="h-8 w-8 text-orange-500" />,
      link: "/admin/announcements",
      bg: "bg-orange-50 dark:bg-orange-900/30",
      text: "text-orange-700 dark:text-orange-400",
    },
  ];

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

  return (
    <div className="container mx-auto px-4 py-8">
      {error && (
        <div className="bg-red-100 dark:bg-red-800 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded relative mb-6">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
          Admin Control Panel
        </h1>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-blue-50 dark:bg-blue-900/30 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">
              Total Users
            </h3>
            <p className="text-3xl font-bold text-blue-700 dark:text-blue-400">
              {stats.totalUsers}
            </p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/30 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">
              Organizers
            </h3>
            <p className="text-3xl font-bold text-green-700 dark:text-green-400">
              {stats.totalOrganizers}
            </p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/30 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">
              Total Events
            </h3>
            <p className="text-3xl font-bold text-purple-700 dark:text-purple-400">
              {stats.totalEvents}
            </p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/30 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">
              Registrations
            </h3>
            <p className="text-3xl font-bold text-yellow-700 dark:text-yellow-400">
              {stats.totalRegistrations}
            </p>
          </div>
        </div>

        {/* Admin Sections */}
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
          Admin Sections
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {adminSections.map((section, index) => (
            <Link
              key={index}
              to={section.link}
              className={`${section.bg} hover:shadow-lg transition-shadow duration-300 p-6 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col`}
            >
              <div className="flex items-center mb-3">
                {section.icon}
                <h3 className="text-lg font-semibold ml-2 text-gray-800 dark:text-gray-200">
                  {section.title}
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-3">
                {section.description}
              </p>
              {section.count !== undefined && (
                <p className={`text-xl font-bold mt-auto ${section.text}`}>
                  {section.count}
                </p>
              )}
            </Link>
          ))}
        </div>

        {/* Send Announcement Section */}
        {showAnnouncementForm ? (
          <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                Send Announcement
              </h2>
              <button
                onClick={() => setShowAnnouncementForm(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={submitAnnouncement}>
              <div className="mb-4">
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Announcement Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={announcement.title}
                  onChange={handleAnnouncementChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  value={announcement.message}
                  onChange={handleAnnouncementChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label
                    htmlFor="type"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Announcement Type
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={announcement.type}
                    onChange={handleAnnouncementChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="info">Information</option>
                    <option value="success">Success</option>
                    <option value="warning">Warning</option>
                    <option value="error">Error</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="target"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Target Audience
                  </label>
                  <select
                    id="target"
                    name="target"
                    value={announcement.target}
                    onChange={handleAnnouncementChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="all">All Users</option>
                    <option value="users">Regular Users</option>
                    <option value="organizers">Organizers</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition flex items-center"
                >
                  <MegaphoneIcon className="h-5 w-5 mr-2" />
                  Send Announcement
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="flex justify-center mb-8">
            <button
              onClick={() => setShowAnnouncementForm(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition flex items-center"
            >
              <MegaphoneIcon className="h-5 w-5 mr-2" />
              Send Announcement
            </button>
          </div>
        )}

        {/* Top Organizers and Active Users */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Top Organizers */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              Top Organizers
            </h2>

            {topOrganizers.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No data available</p>
            ) : (
              <div className="space-y-4">
                {topOrganizers.map((organizer) => (
                  <div
                    key={organizer._id}
                    className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-3 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center">
                      {organizer.profilePicture ? (
                        <img
                          src={organizer.profilePicture}
                          alt={organizer.name}
                          className="w-10 h-10 rounded-full mr-3 object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-3">
                          <span className="text-gray-500 dark:text-gray-400">
                            {organizer.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div>
                        <h3 className="font-medium text-gray-800 dark:text-gray-200">
                          {organizer.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {organizer.organizationName || "Individual Organizer"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">{organizer.eventsCount}</span> events
                      </p>
                      <div className="flex items-center justify-end mt-1">
                        {[...Array(5)].map((_, index) => (
                          <StarIcon
                            key={index}
                            className={`h-4 w-4 ${
                              index < Math.floor(organizer.rating || 0)
                                ? "text-yellow-500 fill-current"
                                : "text-gray-300 dark:text-gray-600"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 text-right">
              <Link
                to="/admin/organizers"
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
              >
                View All Organizers →
              </Link>
            </div>
          </div>

          {/* Most Active Users */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              Most Active Users
            </h2>

            {activeUsers.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No data available</p>
            ) : (
              <div className="space-y-4">
                {activeUsers.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-3 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center">
                      {user.profilePicture ? (
                        <img
                          src={user.profilePicture}
                          alt={user.name}
                          className="w-10 h-10 rounded-full mr-3 object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-3">
                          <span className="text-gray-500 dark:text-gray-400">
                            {user.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div>
                        <h3 className="font-medium text-gray-800 dark:text-gray-200">
                          {user.name}
                        </h3>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <span className="inline-block px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 rounded text-xs mr-2">
                            {user.badge}
                          </span>
                          <span>{user.xp} XP</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">{user.eventsAttended}</span> events
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {user.lastActive
                          ? `Last active: ${new Date(user.lastActive).toLocaleDateString()}`
                          : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 text-right">
              <Link
                to="/admin/users"
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
              >
                View All Users →
              </Link>
            </div>
          </div>
        </div>

        {/* Flagged Content Section */}
        {flaggedContent.length > 0 && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm mb-8">
            <div className="flex items-center mb-4">
              <FlagIcon className="h-5 w-5 text-red-500 mr-2" />
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                Recently Flagged Items
              </h2>
            </div>

            <div className="space-y-4">
              {flaggedContent.map((item) => (
                <div
                  key={item._id}
                  className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-100 dark:border-red-800"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center">
                        <span className="inline-block px-2 py-0.5 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300 rounded text-xs mr-2">
                          {item.type}
                        </span>
                        <h3 className="font-medium text-gray-800 dark:text-gray-200">
                          {item.title}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {item.reason}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-500">
                      {new Date(item.reportedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="mt-3 flex justify-end space-x-2">
                    <Link
                      to={`/admin/moderation/${item.type}/${item._id}`}
                      className="px-3 py-1 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    >
                      Review
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 text-right">
              <Link
                to="/admin/moderation"
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
              >
                View All Flagged Content →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 