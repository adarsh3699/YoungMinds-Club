import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import {
  UserGroupIcon,
  UserIcon,
  CalendarIcon,
  TicketIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  MegaphoneIcon,
} from "@heroicons/react/24/outline";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrganizers: 0,
    totalEvents: 0,
    totalRegistrations: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/admin/dashboard/stats");
        if (response.data.success) {
          setStats(response.data.stats);
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
        setError("Failed to load dashboard statistics. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const adminSections = [
    {
      title: "Users",
      description: "Manage all users, change roles, and moderate accounts",
      icon: <UserIcon className="h-8 w-8 text-blue-500" />,
      link: "/admin/users",
      count: stats.totalUsers - stats.totalOrganizers,
      bg: "bg-blue-50 dark:bg-blue-900",
      text: "text-blue-700 dark:text-blue-400",
    },
    {
      title: "Organizers",
      description: "View and manage event organizers and their activities",
      icon: <UserGroupIcon className="h-8 w-8 text-green-500" />,
      link: "/admin/organizers",
      count: stats.totalOrganizers,
      bg: "bg-green-50 dark:bg-green-900",
      text: "text-green-700 dark:text-green-400",
    },
    {
      title: "Events",
      description: "Monitor all events, review content, and manage listings",
      icon: <CalendarIcon className="h-8 w-8 text-purple-500" />,
      link: "/admin/events",
      count: stats.totalEvents,
      bg: "bg-purple-50 dark:bg-purple-900",
      text: "text-purple-700 dark:text-purple-400",
    },
    {
      title: "Registrations",
      description: "Track event registrations and attendee metrics",
      icon: <TicketIcon className="h-8 w-8 text-yellow-500" />,
      link: "/admin/analytics",
      count: stats.totalRegistrations,
      bg: "bg-yellow-50 dark:bg-yellow-900",
      text: "text-yellow-700 dark:text-yellow-400",
    },
    {
      title: "Analytics",
      description: "View platform statistics and performance metrics",
      icon: <ChartBarIcon className="h-8 w-8 text-indigo-500" />,
      link: "/admin/analytics",
      bg: "bg-indigo-50 dark:bg-indigo-900",
      text: "text-indigo-700 dark:text-indigo-400",
    },
    {
      title: "Moderation",
      description: "Review flagged content and user reports",
      icon: <ShieldCheckIcon className="h-8 w-8 text-red-500" />,
      link: "/admin/moderation",
      bg: "bg-red-50 dark:bg-red-900",
      text: "text-red-700 dark:text-red-400",
    },
    {
      title: "Announcements",
      description: "Create and manage system-wide announcements",
      icon: <MegaphoneIcon className="h-8 w-8 text-orange-500" />,
      link: "/admin/announcements",
      bg: "bg-orange-50 dark:bg-orange-900",
      text: "text-orange-700 dark:text-orange-400",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
          Admin Control Panel
        </h1>

        {error && (
          <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-100 dark:bg-gray-700 animate-pulse p-6 rounded-lg h-24"
              ></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-blue-50 dark:bg-blue-900 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">
                Total Users
              </h3>
              <p className="text-3xl font-bold text-blue-700 dark:text-blue-400">
                {stats.totalUsers}
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">
                Organizers
              </h3>
              <p className="text-3xl font-bold text-green-700 dark:text-green-400">
                {stats.totalOrganizers}
              </p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">
                Total Events
              </h3>
              <p className="text-3xl font-bold text-purple-700 dark:text-purple-400">
                {stats.totalEvents}
              </p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">
                Registrations
              </h3>
              <p className="text-3xl font-bold text-yellow-700 dark:text-yellow-400">
                {stats.totalRegistrations}
              </p>
            </div>
          </div>
        )}

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

        <div className="border-t dark:border-gray-700 pt-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
            Your Account
          </h2>
          <div className="grid grid-cols-2 gap-4 max-w-md">
            <div>
              <p className="text-gray-600 dark:text-gray-400">Name</p>
              <p className="font-medium text-gray-800 dark:text-white">
                {user?.name}
              </p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">Email</p>
              <p className="font-medium text-gray-800 dark:text-white">
                {user?.email}
              </p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">Role</p>
              <p className="font-medium capitalize text-gray-800 dark:text-white">
                {user?.role}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
