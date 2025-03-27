// components/Home/Home.js
import React from "react";
import "../styles/Home.css";
import ReportTool from "./ReportTool";

const Home = () => {
  return (
    <div className="home-page">
      {/* Welcome Section */}
      <section className="welcome-section">
        <div className="container">
          <h1>Report Generation Tool</h1>
          <p className="welcome-text">
            Welcome to our Report Generation Tool. Upload your data files and
            create professional reports in minutes. No technical skills needed.
          </p>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section">
        <div className="container">
          <h2>About</h2>
          <div className="about-content">
            <p>
              Our Report Generation Tool was created to help businesses quickly
              transform their data into meaningful reports. Whether you need
              sales reports, financial statements, or performance analytics, our
              tool makes it simple.
            </p>
            <p>
              We support multiple file formats including CSV, Excel, and JSON.
              Our system automatically processes your data and generates clean,
              professional reports that can be downloaded in PDF, DOCX, or HTML
              format.
            </p>
            <div className="about-features">
              <div className="feature">
                <div className="feature-icon">📊</div>
                <h3>Data Visualization</h3>
                <p>Turn complex data into clear charts and graphs</p>
              </div>
              <div className="feature">
                <div className="feature-icon">🔄</div>
                <h3>Automatic Processing</h3>
                <p>Let our system do the hard work for you</p>
              </div>
              <div className="feature">
                <div className="feature-icon">📱</div>
                <h3>Mobile Friendly</h3>
                <p>Access your reports from any device</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Report Tool Section */}
      <section className="tool-section">
        <div className="container">
          <h2>Generate Your Report</h2>
          <p className="tool-intro">
            Follow these simple steps to create your report. Upload your files,
            choose your options, and download the finished report.
          </p>
          <ReportTool></ReportTool>
        </div>
      </section>
    </div>
  );
};

export default Home;
