// UserManagementRoute.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import WordPressAuthService from './wordPressAuthService';

// Import your user management components
// import UserManagement from './UserManagement';
// import UserProfile from './UserProfile';

// For now, we'll use the main component we created
import UserManagement from './WordPressUserManagement';

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
const UserProfile = () => {
  const currentUser = WordPressAuthService.getCurrentUser();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="container mx-auto max-w-4xl py-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">User Profile</h1>
          
          {currentUser ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-4 mb-6">
                <img
                  src={currentUser.avatar}
                  alt="Profile"
                  className="w-20 h-20 rounded-full"
                />
                <div>
                  <h2 className="text-xl font-semibold">{currentUser.displayName}</h2>
                  <p className="text-gray-600">@{currentUser.username}</p>
                  <p className="text-gray-600">{currentUser.email}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Roles</h3>
                  <div className="flex flex-wrap gap-2">
                    {currentUser.roles?.map(role => (
                      <span
                        key={role}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Capabilities</h3>
                  <div className="text-sm text-gray-600">
                    {Object.keys(currentUser.capabilities || {}).length} capabilities
                  </div>
                   <div className="text-sm text-gray-600">
                    {Object.keys(currentUser.capabilities)?.map(i  => (
                    <li>
              {i} capabilities
                    </li>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <button
                  onClick={() => WordPressAuthService.logout()}
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <p>No user data available</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Main User Management Routes Component
const UserManagementRoutes = () => {
  return (
    <Routes>
      {/* User Management Dashboard - Requires admin or editor role */}
      <Route 
        path="/users" 
        element={
          <ProtectedRoute requiredCapability="edit_users">
            <UserManagement />
          </ProtectedRoute>
        } 
      />
      
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
                           