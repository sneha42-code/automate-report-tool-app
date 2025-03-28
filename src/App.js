// App.js
import React from "react";
import Header from "./components/Header";
import ReportTool from "./pages/ReportTool";
import Documentation from "./pages/Documentation";
import Home from "./pages/Home";
import Footer from "./components/Footer";
import BlogManagement from "./pages/BlogManagement";
import BlogView from "./pages/BlogView";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
function App() {
  return (
    <Router>
      <div className="app">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/blog" element={<BlogManagement />} />
            <Route path="/blog/post/:postId" element={<BlogView />} />
            <Route
              path="/blog/category/:category"
              element={<BlogManagement />}
            />

            <Route path="/documentation" element={<Documentation />} />
            <Route path="/tool" element={<ReportTool />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
