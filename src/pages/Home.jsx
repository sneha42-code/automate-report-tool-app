import React, { useEffect, useRef } from "react";
import "../styles/Home.css";
import AnalaysisTool from "./AnalaysisTool";
import { animateCounters } from "../utils/animateCounters";
import dashboardImage from "../image/dashboard.png";
import analyticsIcon from "../image/analytics-icon.png";
import demographicsIcon from "../image/demographics-icon.png";
import trendsIcon from "../image/trends-icon.png";
import riskIcon from "../image/risk-icon.png";
import efficiency from "../image/efficiency.png";
import costManagement from "../image/cost-management.png";
import strategicPlanning from "../image/strategic-planning.png";
import riskMitigation from "../image/risk-mitigation.png";

const Home = () => {
  const observerRef = useRef(null);

  useEffect(() => {
    // Intersection Observer for fade-in animations
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("fade-in-visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    const fadeElements = document.querySelectorAll(".fade-in");
    fadeElements.forEach((el) => observerRef.current.observe(el));

    // Initialize counter animations
    animateCounters();

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return (
    <div className="home-page">
      {/* Hero Section with Background Image */}
      <header className="hero-section">
        <div className="hero-background">
          <img
            src={dashboardImage}
            alt="Analytics Dashboard"
            className="hero-image"
            loading="eager"
          />
          <div className="hero-overlay"></div>
        </div>
        <div className="container hero-content">
          <h1 className="hero-title animate-slideDown">
            AI Driven Analytics Platform
          </h1>
          <p className="hero-subtitle animate-slideUp">
            Generate insightful analysis and data-driven reports for your organization
          </p>
          <button
            className="cta-button animate-fadeIn"
            onClick={() => {
              const toolSection = document.querySelector(".tool-section");
              if (toolSection) {
                toolSection.scrollIntoView({ behavior: "smooth" });
              }
            }}
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Enhanced Tool Section */}
      <section className="tool-section">
        <div className="container">
          <div className="tool-header fade-in">
            <h2>Analysis & Reporting Platform</h2>
            <p>Generate comprehensive analytics and reports for your business</p>
          </div>
          <div className="tool-wrapper">
            <AnalaysisTool />
          </div>
        </div>
      </section>

      {/* Animated Capabilities Section */}
      <section className="capabilities-section">
        <div className="container">
          <h2 className="section-title fade-in">Core Capabilities</h2>
          <div className="capabilities-grid">
            <div className="capability-card fade-in">
              <div className="capability-icon">
                <img src={analyticsIcon} alt="Analytics" />
              </div>
              <h3>Data Analysis</h3>
              <p>
                Extract key metrics and trends from your data for actionable insights
              </p>
            </div>
            <div className="capability-card fade-in">
              <div className="capability-icon">
                <img src={demographicsIcon} alt="Demographics" />
              </div>
              <h3>Demographic Insights</h3>
              <p>
                Segment and visualize your data by any category or attribute
              </p>
            </div>
            <div className="capability-card fade-in">
              <div className="capability-icon">
                <img src={trendsIcon} alt="Trends" />
              </div>
              <h3>Trend Identification</h3>
              <p>
                Discover patterns and changes over time with advanced analytics
              </p>
            </div>
            <div className="capability-card fade-in">
              <div className="capability-icon">
                <img src={riskIcon} alt="Risk Assessment" />
              </div>
              <h3>Risk & Opportunity Assessment</h3>
              <p>Identify potential risks and opportunities in your datasets</p>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Value Section with Images */}
      <section className="value-section">
        <div className="container">
          <h2 className="section-title fade-in">Business Impact</h2>
          <div className="value-grid">
            <div className="value-card fade-in">
              <div className="value-image">
                <img src={efficiency} alt="Operational Efficiency" />
              </div>
              <div className="value-content">
                <h3>Operational Efficiency</h3>
                <p>
                  Optimize processes and resource allocation with data-driven insights
                </p>
              </div>
            </div>
            <div className="value-card fade-in">
              <div className="value-image">
                <img src={costManagement} alt="Cost Management" />
              </div>
              <div className="value-content">
                <h3>Cost Management</h3>
                <p>
                  Control expenses and improve ROI through targeted reporting
                </p>
              </div>
            </div>
            <div className="value-card fade-in">
              <div className="value-image">
                <img src={strategicPlanning} alt="Strategic Planning" />
              </div>
              <div className="value-content">
                <h3>Strategic Planning</h3>
                <p>Support evidence-based decision making at every level</p>
              </div>
            </div>
            <div className="value-card fade-in">
              <div className="value-image">
                <img src={riskMitigation} alt="Risk Mitigation" />
              </div>
              <div className="value-content">
                <h3>Opportunity Discovery</h3>
                <p>
                  Uncover new growth areas and business opportunities from your data
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      {/* <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item fade-in">
              <div className="stat-number" data-target="95">0</div>
              <div className="stat-suffix">%</div>
              <div className="stat-label">Accuracy Rate</div>
            </div>
            <div className="stat-item fade-in">
              <div className="stat-number" data-target="500">0</div>
              <div className="stat-suffix">+</div>
              <div className="stat-label">Reports Generated</div>
            </div>
            <div className="stat-item fade-in">
              <div className="stat-number" data-target="50">0</div>
              <div className="stat-suffix">%</div>
              <div className="stat-label">Cost Reduction</div>
            </div>
            <div className="stat-item fade-in">
              <div className="stat-number" data-target="24">0</div>
              <div className="stat-suffix">/7</div>
              <div className="stat-label">Support Available</div>
            </div>
          </div>
        </div>
      </section> */}

      {/* Call to Action Section */}
      {/* <section className="cta-section">
        <div className="container">
          <div className="cta-content fade-in">
            <h2>Ready to Transform Your HR Analytics?</h2>
            <p>Start analyzing your workforce data today</p>
            <button className="cta-button-large">
              Start Free Trial
            </button>
          </div>
        </div>
      </section> */}
    </div>
  );
};

export default Home;