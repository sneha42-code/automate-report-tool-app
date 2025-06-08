import React, { useState } from 'react';
import WordPressAuthService from './wordPressAuthService';
import { Helmet } from 'react-helmet';
import '../styles/WordPressProfile.css'; 

const UserProfile = () => {
  const currentUser = WordPressAuthService.getCurrentUser();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await WordPressAuthService.login(username, password);
      setUsername('');
      setPassword('');
      setError('');
      // Refresh the page or update state to reflect login
      window.location.reload(); // Simple reload to update currentUser
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="container mx-auto max-w-4xl py-8">
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-xs mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            {currentUser ? 'User Profile' : 'Login'}
          </h1>

          {currentUser ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
                  <img
                    src={currentUser.avatar || 'https://via.placeholder.com/80'}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-600">{currentUser.displayName || 'Unknown User'}</h2>
                  <p className="text-gray-500 text-sm">@{currentUser.username || 'host'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="roles">
                  <h3 className="font-semibold text-gray-700 mb-2 text-sm">Roles</h3>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs inline-block">
                    {currentUser.roles?.[0] }
                  </span>
                </div>

                <div className="capabilities">
                  <h3 className="font-semibold text-gray-700 mb-2 text-sm">Capabilities</h3>
                  <p className="text-gray-600 text-xs">
                    {Object.keys(currentUser.capabilities || {}).length} capabilities
                  </p>
                  <ul className="text-gray-600 text-xs list-disc pl-4 mt-1">
                    {Object.keys(currentUser.capabilities || {}).map((cap) => (
                      <li key={cap}>{cap}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t mt-4">
                <button
                  onClick={() => WordPressAuthService.logout()}
                  className="bg-red-500 text-white px-4 py-2 rounded text-sm w-full hover:bg-red-600 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your WordPress username"
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your application password"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600 transition-colors"
              >
                Login
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;