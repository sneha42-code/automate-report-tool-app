// src/App.js - Modified for GitHub Pages
import React, { useEffect, useState } from "react";
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
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
import BlogEditPage from "./wordPress/BlogEditPage";
import WordPressLogin from "./wordPress/WordPressLogin";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ResetPassword from "./pages/ResetPassword";
import DashboardViewer from "./pages/DashboardViewer";
import PredictiveDashboad from "./pages/PredictiveDashboad";
import UserManagementRoutes from "./wordPress/UserManagementRoutes";
import RequestDemo from "./pages/RequestDemo";

import { Helmet } from "react-helmet";
import "./App.css";
import AnalysisTool from "./pages/AnalaysisTool";

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          minHeight: '50vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <h2>Something went wrong</h2>
          <p>We're having trouble loading this page.</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#007cba',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              margin: '1rem auto',
              maxWidth: '200px'
            }}
          >
            Reload Page
          </button>
          <button
            onClick={() => window.location.href = '#/'}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#666',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              margin: '0.5rem auto',
              maxWidth: '200px'
            }}
          >
            Go Home
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = WordPressAuthService.isAuthenticated();
  const location = useLocation();
  return isAuthenticated ? children : (
    <Navigate to="/wplogin" state={{ from: location }} replace />
  );
};

// Route Logger for debugging
const RouteLogger = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    console.log('Route changed:', {
      pathname: location.pathname,
      search: location.search,
      hash: location.hash,
      state: location.state
    });
  }, [location]);

  return children;
};

// Main App component for GitHub Pages
function App() {
  // Clear stale tokens on app mount
  useEffect(() => {
    if (!WordPressAuthService.isAuthenticated()) {
      WordPressAuthService.logout();
    }

    // Log GitHub Pages specific info
    console.log('GitHub Pages App initialized:', {
      environment: process.env.NODE_ENV,
      hostname: window.location.hostname,
      pathname: window.location.pathname,
      hash: window.location.hash,
      href: window.location.href
    });
  }, []);

  return (
    <ErrorBoundary>
      <Router>
        <RouteLogger>
          <div className="app">
            <Helmet>
              <title>Automate Reporting | automatereporting.com</title>
              <meta name="description" content="World's first HR AI agent to automate reporting and summaries" />
              <meta property="og:title" content="Automate Reporting | automatereporting.com" />
              <meta property="og:description" content="Advanced attrition analysis for human capital management" />
              <meta property="og:url" content="https://automatereporting.com" />
              <meta name="viewport" content="width=device-width, initial-scale=1" />

              {/* GitHub Pages specific meta tags */}
              <link rel="canonical" href={`https://automatereporting.com${window.location.pathname}`} />
            </Helmet>

            <Header />

            <main className="main-content">
              <ErrorBoundary>
                <Routes>
                  {/* Home page */}
                  <Route path="/" element={<Home />} />

                  {/* Blog routes - Order is crucial! */}
                  <Route path="/blog" element={<BlogManagement />} />
                  <Route path="/blog/category/:category" element={<BlogManagement />} />
                  <Route path="/blog/tag/:tag" element={<BlogManagement />} />

                  {/* Protected Blog Creation Route - BEFORE dynamic slug */}
                  <Route
                    path="/blog/create"
                    element={
                      <ProtectedRoute>
                        <BlogCreatePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/blog/edit"
                    element={
                      <ProtectedRoute>
                        <BlogEditPage />
                      </ProtectedRoute>
                    }
                  />


                  {/* Dynamic blog post route - MUST BE LAST */}
                  <Route path="/blog/:slug" element={<BlogView />} />

                  {/* WordPress Authentication */}
                  <Route path="/wplogin" element={<WordPressLogin />} />
                  <Route path="/wpLogin" element={<Navigate to="/wplogin" replace />} />

                  {/* User Management */}
                  <Route path="/admin/*" element={<UserManagementRoutes />} />

                  <Route path="/product-tools" element={<AnalysisTool />} />

                  {/* Tools */}
                  <Route path="/tool/docs" element={<ReportToolDocs />} />
                  <Route path="/tool/Docs" element={<Navigate to="/tool/docs" replace />} />
                  <Route path="/tool/excel" element={<ReportToolExcel />} />
                  <Route path="/tool/html" element={<ReportToolHtml />} />
                  <Route path="/tool/slicer" element={<SlicerAnalysisTool />} />
                  <Route path="/tool/predictive-analysis" element={<PredictiveDashboad />} />
                  <Route path="/tool/analysis" element={<AnalysisTool />} />


                  {/* Dashboard and Analysis */}
                  <Route path="/dashboard/view/:fileId/:filename" element={<DashboardViewer />} />


                  {/* Documentation */}
                  <Route path="/documentation" element={<Documentation />} />
                  <Route path= "/book-demo" element={<RequestDemo />} />
                  {/* Auth pages */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/reset-password" element={<ResetPassword />} />

                  {/* Request Demo */}
                  <Route path="/request-demo" element={<RequestDemo />} />

                  {/* Fallback */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </ErrorBoundary>
            </main>

            <Footer />
          </div>
        </RouteLogger>
      </Router>
    </ErrorBoundary>
  );
}

export default App;