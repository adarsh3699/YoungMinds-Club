// Notification Types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  timestamp: string;
}

// File Upload Types
export interface FileUploadResponse {
  success: boolean;
  url: string;
  publicId: string;
  message?: string;
}

// Route Types
export interface ProtectedRouteProps {
  requiredRole?: 'user' | 'organizer' | 'admin' | ('user' | 'organizer' | 'admin')[];
  redirectPath?: string;
}

// Message Alert Props (New preferred interface)
export interface MsgAlertProps {
  message: string | null;
  type?: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
  duration?: number;
}

// @deprecated - Use MsgAlertProps instead. Kept for backward compatibility.
export interface ErrorAlertProps {
  error: string | null;
  onClose: () => void;
} 