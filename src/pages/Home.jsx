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
          <h1>Attrition Analysis Report Tool</h1>
          <p className="welcome-text">
            Welcome to our Attrition Analysis Tool. Upload your HRIS data and
            create comprehensive attrition reports in minutes. Gain valuable
            insights into employee departure patterns.
          </p>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section">
        <div className="container">
          <h2>About</h2>
          <div className="about-content">
            <p>
              Our Attrition Analysis Tool was created to help HR professionals
              quickly transform their employee data into actionable insights.
              Understand why employees leave, identify concerning patterns, and
              make data-driven decisions to improve retention.
            </p>
            <p>
              We support Excel files containing HRIS data with employee
              information. Our system automatically processes your data and
              generates detailed attrition reports with beautiful visualizations
              that can be downloaded in DOCX format for easy sharing with
              stakeholders.
            </p>
            <div className="about-features">
              <div className="feature">
                <div className="feature-icon">📊</div>
                <h3>Multi-dimensional Analysis</h3>
                <p>Analyze attrition by gender, location, function, and more</p>
              </div>
              <div className="feature">
                <div className="feature-icon">📈</div>
                <h3>Trend Visualization</h3>
                <p>Track quarterly and monthly attrition patterns</p>
              </div>
              <div className="feature">
                <div className="feature-icon">🔍</div>
                <h3>Actionable Insights</h3>
                <p>Discover where to focus your retention efforts</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Report Tool Section */}
      <section className="tool-section">
        <div className="container">
          <h2>Generate Your Attrition Report</h2>
          <p className="tool-intro">
            Follow these simple steps to create your report. Upload your HRIS
            Excel file, generate the analysis, and download the comprehensive
            attrition report with visualizations and insights.
          </p>
          <ReportTool></ReportTool>
        </div>
      </section>
    </div>
  );
};

export default Home;
