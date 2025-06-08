// src/App.js
import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import WordPressAuthService from "./wordPress/wordPressAuthService";
import Header from "./components/Header";
import ReportToolDocs from "./pages/ReportToolDocs";
import ReportToolExcel from "./pages/ReportToolExcel";
import ReportToolHtml from "./pages/ReportToolHtml";
import Documentation from "./pages/Documentation";
import SlicerAnalysisTool from "./pages/SlicerAnalysisTool";
import Home from "./pages/Home";
import Footer from "./components/Footer";
import BlogManagement from "./wordPress/BlogManagementPage";
import BlogView from "./wordPress/BlogView";
import BlogCreatePage from "./wordPress/BlogCreatePage";
import WordPressLogin from "./wordPress/WordPressLogin";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ResetPassword from "./pages/ResetPassword";
import DashboardViewer from "./pages/DashboardViewer";
import PredictiveDashboad from "./pages/PredictiveDashboad";
import UserManagementRoutes from "./wordPress/UserManagementRoutes";

import { Helmet } from "react-helmet";
import "./App.css";

// Protected Route component to restrict access to authenticated users
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = WordPressAuthService.isAuthenticated();
  const location = useLocation();
  return isAuthenticated ? children : (
    <Navigate to="/wplogin" state={{ from: location }} replace />
  );
};

// Main App component for routing and layout
function App() {
  // Clear stale tokens on app mount
  useEffect(() => {
    if (!WordPressAuthService.isAuthenticated()) {
      WordPressAuthService.logout();
    }
  }, []);

  return (
    <Router>
      <div className="app">
        <Helmet>
          {/* Set page title and meta tags for SEO and social sharing */}
          <title>Automate Reporting | automatereporting.com</title>
          <meta name="description" content="World's first HR AI agent to automate reporting and summaries" />
          {/* Open Graph tags for better social sharing */}
          <meta property="og:title" content="Automate Reporting | automatereporting.com" />
          <meta property="og:description" content="Advanced attrition analysis for human capital management" />
          <meta property="og:url" content="https://automatereporting.com" />
        </Helmet>
        <Header />
        {/* Main content area with route definitions */}
        <main className="main-content">
          <Routes>
            {/* Home page */}
            <Route path="/" element={<Home />} />
            
            {/* Blog management and views */}
            <Route path="/blog" element={<BlogManagement />} />
            <Route path="/blog/category/:category" element={<BlogManagement />} />
            <Route path="/blog/tag/:tag" element={<BlogManagement />} />
            <Route path="/blog/:id" element={<BlogView />} />
            
            {/* WordPress Authentication Routes - Fixed path consistency */}
            <Route path="/wplogin" element={<WordPressLogin />} />
            <Route path="/wpLogin" element={<Navigate to="/wplogin" replace />} /> {/* Redirect for backward compatibility */}
            
            {/* Protected Blog Creation Route */}
            <Route
              path="/blog/create"
              element={
                <ProtectedRoute>
                  <BlogCreatePage />
                </ProtectedRoute>
              }
            />
            
            {/* User Management Routes (Protected) */}
            <Route path="/admin/*" element={<UserManagementRoutes />} /> 
            {/* <Route path="/wpsignup" element={<WpSignup />} /> */}
            
            {/* Tools Routes - Fixed path consistency */}
            <Route path="/tool/docs" element={<ReportToolDocs />} />
            <Route path="/tool/Docs" element={<Navigate to="/tool/docs" replace />} /> {/* Redirect for backward compatibility */}
            <Route path="/tool/excel" element={<ReportToolExcel />} />
            <Route path="/tool/html" element={<ReportToolHtml />} />
            <Route path="/tool/slicer" element={<SlicerAnalysisTool />} />
            
            {/* Dashboard and Analysis Routes */}
            <Route path="/dashboard/view/:fileId/:filename" element={<DashboardViewer />} />
            <Route path="/predictive-analysis" element={<PredictiveDashboad />} />
            
            {/* Documentation */}
            <Route path="/documentation" element={<Documentation />} />
            
            {/* Auth pages */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* Fallback for unmatched routes */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

// Export the App component as default
export default App;