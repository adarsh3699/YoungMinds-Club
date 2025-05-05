import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ requiredRole, redirectPath = "/login" }) => {
  const { user, loading, isAuthenticated } = useAuth();

  // If still loading, show loading indicator or nothing
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  // If no specific role required, just be authenticated
  if (!requiredRole) {
    return <Outlet />;
  }

  // Check if user has required role
  const hasRequiredRole = Array.isArray(requiredRole)
    ? requiredRole.includes(user.role)
    : user.role === requiredRole;

  // If user doesn't have the required role, redirect to homepage
  if (!hasRequiredRole) {
    return <Navigate to="/" replace />;
  }

  // If all checks pass, render the protected content
  return <Outlet />;
};

export default ProtectedRoute;
