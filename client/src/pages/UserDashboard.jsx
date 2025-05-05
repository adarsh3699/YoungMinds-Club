import { useAuth } from "../context/AuthContext";

const UserDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Welcome, {user?.name}</h1>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>

        <div className="p-4 bg-blue-50 rounded-lg mb-6">
          <h2 className="text-lg font-semibold mb-2">Your Profile</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Name</p>
              <p className="font-medium">{user?.name}</p>
            </div>
            <div>
              <p className="text-gray-600">Email</p>
              <p className="font-medium">{user?.email}</p>
            </div>
            <div>
              <p className="text-gray-600">Role</p>
              <p className="font-medium capitalize">{user?.role}</p>
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <h2 className="text-xl font-semibold mb-4">Your Events</h2>
          <div className="bg-gray-100 rounded-lg p-10 text-center text-gray-500">
            <p>You haven't registered for any events yet.</p>
            <button className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
              Browse Events
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
