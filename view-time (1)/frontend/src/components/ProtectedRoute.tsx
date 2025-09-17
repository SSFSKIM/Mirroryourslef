import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from 'utils/AuthContext';

interface Props {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: Props) {
  const { isAuthenticated, isInitialized } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Initialize Firebase on component mount
    import("utils/auth").then(() => {
      console.log("Firebase authentication initialized in ProtectedRoute");
    });
  }, []);

  // If auth is still initializing, show loading
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If not authenticated, redirect to home page
  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // If authenticated, render children
  return <>{children}</>;
}
