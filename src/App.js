import React from "react";
import Header from "./components/Header";
import ReportToolDocs from "./pages/ReportToolDocs";
import ReportToolExcel from "./pages/ReportToolExcel";
import ReportToolHtml from "./pages/ReportToolHtml"
import Documentation from "./pages/Documentation";
import Dashboard from './pages/Dashboard';
import Home from "./pages/Home";
import Footer from "./components/Footer";
import BlogManagement from "./pages/BlogManagementPage";
import BlogView from "./pages/BlogView";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import BlogCreatePage from "./pages/BlogCreatePage";
import NotFound from "./pages/NotFound";
import { Helmet } from 'react-helmet';

import "./App.css";
function App() {
  return (
    <Router>
      <div className="app">
        <Helmet>

          <title>Automate Reporting | automatereporting.com</title>
          <meta name="description" content="World's first HR AI agent to automate reporting and summaries" />
          {/* Open Graph tags for better social sharing */}
          <meta property="og:title" content="Automate Reporting | automatereporting.com" />
          <meta property="og:description" content="Advanced attrition analysis for human capital management" />
          <meta property="og:url" content="https://automatereporting.com" />
        </Helmet>
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/blog" element={<BlogManagement />} />
            <Route path="/blog/create" element={<BlogCreatePage />} />
            <Route path="/blog/:postId" element={<BlogView />} />
            <Route path="/blog/category/:category" element={<BlogManagement />} />
            <Route path="/documentation" element={<Documentation />} />
            <Route path="/tool/Docs" element={<ReportToolDocs />} />
            <Route path="/tool/excel" element={<ReportToolExcel />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/tool/html" element={<ReportToolHtml />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
