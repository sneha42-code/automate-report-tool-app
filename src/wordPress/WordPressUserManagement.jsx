import React from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import WordPressAuthService from './wordPressAuthService';
import UserProfile from './WordPressProfile';

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole = null, requiredCapability = null }) => {
  const isAuthenticated = WordPressAuthService.isAuthenticated();
  const currentUser = WordPressAuthService.getCurrentUser();

  if (!isAuthenticated) {
    return <Navigate to="/wpLogin" replace />;
  }

  // Check if user has required role or capability
  if (requiredRole || requiredCapability) {
    const userRoles = currentUser?.roles || [];
    const userCapabilities = Object.keys(currentUser?.capabilities || {});
    
    const hasRequiredRole = !requiredRole || 
                           userRoles.includes(requiredRole) || 
                           userRoles.includes('administrator');
    
    const hasRequiredCapability = !requiredCapability ||
                                 userCapabilities.includes(requiredCapability) ||
                                 userCapabilities.includes('manage_options') ||
                                 userRoles.includes('administrator');
    
    if (!hasRequiredRole || !hasRequiredCapability) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
            <div className="text-red-500 text-6xl mb-4">🚫</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">
              You don't have permission to access this page. 
              {requiredRole && ` Required role: ${requiredRole}.`}
              {requiredCapability && ` Required capability: ${requiredCapability}.`}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Current role: {userRoles.join(', ') || 'None'}
            </p>
            <button
              onClick={() => window.history.back()}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      );
    }
  }

  return children;
};

// User Profile Component


// Main User Management Routes Component
const UserManagementRoutes = () => {
  return (
    <Routes>
      {/* User Management Dashboard - Requires admin or editor role */}
      {/* <Route 
        path="/users" 
        element={
          <ProtectedRoute requiredCapability="edit_users">
            <WordPressUserManagement />
          </ProtectedRoute>
        } 
      /> */}
      
      {/* Edit User - Requires admin or editor role
      <Route 
        path="/users/edit/:userId" 
        element={
          <ProtectedRoute requiredCapability="edit_users">
            <EditUser />
          </ProtectedRoute>
        } 
      />
       */}
      {/* User Profile - Any authenticated user */}
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        } 
      />
      
      {/* Redirect /users/* to /users */}
      <Route path="/users/*" element={<Navigate to="/users" replace />} />
      
      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/users" replace />} />
    </Routes>
  );
};

export default UserManagementRoutes;