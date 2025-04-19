// components/Home/Home.js
import React from "react";
import "../styles/Home.css";
import ReportTool from "./ReportTool";

const Home = () => {
  return (
    <div className="home-page">
      {/* Header Section */}
      <header className="header-section">
        <div className="container">
          <h1>Enterprise Workforce Analytics</h1>
          <p className="subtitle">
            Advanced attrition analysis for human capital management
          </p>
        </div>
      </header>

      {/* Analysis Tool Section */}
      <section className="tool-section">
        <div className="container">
          <div className="tool-header">
            <h2>Attrition Analytics Platform</h2>
            <p>
              Generate comprehensive workforce analytics for you
            </p>
          </div>
          <ReportTool />
        </div>
      </section>

      {/* Core Capabilities Section */}
      <section className="capabilities-section">
        <div className="container">
          <h2>Core Capabilities</h2>
          <div className="capabilities-grid">
            <div className="capability-item">
              <h3>Attrition Analysis</h3>
              <p>
                Comprehensive metrics for employee departure patterns and trends
              </p>
            </div>
            <div className="capability-item">
              <h3>Demographic Insights</h3>
              <p>
                Detailed breakdown by department, tenure, grade and location
              </p>
            </div>
            <div className="capability-item">
              <h3>Trend Identification</h3>
              <p>
                Quarterly and annual patterns with statistical significance
                markers
              </p>
            </div>
            <div className="capability-item">
              <h3>Risk Assessment</h3>
              <p>Proactive identification of retention vulnerabilities</p>
            </div>
          </div>
        </div>
      </section>

      {/* Business Value Section */}
      <section className="value-section">
        <div className="container">
          <h2>Business Impact</h2>
          <div className="value-grid">
            <div className="value-item">
              <h3>Operational Efficiency</h3>
              <p>
                Identify root causes of turnover to optimize workforce planning
              </p>
            </div>
            <div className="value-item">
              <h3>Cost Management</h3>
              <p>
                Reduce replacement and training expenditures through targeted
                retention
              </p>
            </div>
            <div className="value-item">
              <h3>Strategic Planning</h3>
              <p>Evidence-based insights for talent management decisions</p>
            </div>
            <div className="value-item">
              <h3>Risk Mitigation</h3>
              <p>
                Early identification of attrition trends across key segments
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
