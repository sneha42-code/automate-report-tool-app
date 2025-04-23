// App.js with updated routes
import React from "react";
import Header from "./components/Header";
import ReportTool from "./pages/ReportTool";
import Documentation from "./pages/Documentation";
import Home from "./pages/Home";
import Footer from "./components/Footer";
import BlogManagement from "./pages/BlogManagement.Page";
import BlogView from "./pages/BlogView";
// import Login from "./pages/Login";
// import Signup from "./pages/Signup";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import BlogCreatePage from "./pages/BlogCreatePage";
import NotFound from "./pages/NotFound";
function App() {
  return (
    <Router>
      <div className="app">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/blog" element={<BlogManagement />} />
            <Route path="/blog/create" element={<BlogCreatePage />} />
            <Route path="/blog/:postId" element={<BlogView />} />
            <Route
              path="/blog/category/:category"
              element={<BlogManagement />}
            />
            <Route path="/documentation" element={<Documentation />} />
            <Route path="/tool" element={<ReportTool />} />
            {/* <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} /> */}

            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
