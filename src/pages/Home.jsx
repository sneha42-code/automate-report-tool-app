import React, { useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../styles/Home.css";
import { animateCounters } from "../utils/animateCounters";
import BrainCircuitVisualization from "../components/BrainCircuitVisualization";
import  analyticsIcon  from "../image/analytics-icon.png";
import  demographicsIcon  from "../image/demographics-icon.png";
import  trendsIcon from "../image/trends-icon.png"
import  riskIcon from "../image/risk-icon.png"
import  efficiency  from "../image/efficiency.png"
import  costManagement from "../image/cost-management.png"
import  strategicPlanning from "../image/strategic-planning.png"
import  riskMitigation from "../image/risk-mitigation.png"

const Home = () => {
  const observerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Intersection Observer for fade-in animations
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    const fadeElements = document.querySelectorAll('.fade-in');
    fadeElements.forEach(el => observerRef.current.observe(el));

    // Initialize counter animations
    animateCounters();

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return (
    <div className="home-page" style={{ background: '#000' }}>
      {/* Hero Section with Background Image */}
      <header className="hero-section">
        <div className="hero-background">
          <BrainCircuitVisualization />
          <div className="hero-overlay"></div>
        </div>
        <div className="container hero-content">
          <h1 className="hero-title animate-slideDown">
            AI Driven Workforce Analytics
          </h1>
          <p className="hero-subtitle animate-slideUp">
            Advanced attrition analysis for human capital management
          </p>
          <div className="hero-actions">
            <button className="get-started-btn animate-fadeIn hero-action-btn" onClick={() => navigate('/signup')}>
              Get Started
            </button>
            <button className="cta-button animate-fadeIn hero-action-btn" onClick={() => navigate('/book-demo')}>
              Book a Demo
            </button>
          </div>
        </div>
      </header>

      {/* Enhanced Tool Section */}
      <section className="tool-section" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div className="tool-header fade-in">
            <h2>Attrition Analytics Platform</h2>
            <p>Generate comprehensive workforce analytics for your organization</p>
          </div>
          <div className="tool-wrapper tool-demo-center">
            <NavLink to="/analysis" className="btn btn-primary btn-demo-request">
              Analysis Tool
            </NavLink>
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
              <h3>Attrition Analysis</h3>
              <p>
                Comprehensive metrics for employee departure patterns and trends
              </p>
            </div>
            <div className="capability-card fade-in">
              <div className="capability-icon">
                <img src={demographicsIcon} alt="Demographics" />
              </div>
              <h3>Demographic Insights</h3>
              <p>
                Detailed breakdown by department, tenure, grade and location
              </p>
            </div>
            <div className="capability-card fade-in">
              <div className="capability-icon">
                <img src={trendsIcon} alt="Trends" />
              </div>
              <h3>Trend Identification</h3>
              <p>
                Quarterly and annual patterns with statistical significance markers
              </p>
            </div>
            <div className="capability-card fade-in">
              <div className="capability-icon">
                <img src={riskIcon} alt="Risk Assessment" />
              </div>
              <h3>Risk Assessment</h3>
              <p>Proactive identification of retention vulnerabilities</p>
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
                  Identify root causes of turnover to optimize workforce planning
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
                  Reduce replacement and training expenditures through targeted retention
                </p>
              </div>
            </div>
            <div className="value-card fade-in">
              <div className="value-image">
                <img src={strategicPlanning} alt="Strategic Planning" />
              </div>
              <div className="value-content">
                <h3>Strategic Planning</h3>
                <p>Evidence-based insights for talent management decisions</p>
              </div>
            </div>
            <div className="value-card fade-in">
              <div className="value-image">
                <img src={riskMitigation} alt="Risk Mitigation" />
              </div>
              <div className="value-content">
                <h3>Risk Mitigation</h3>
                <p>
                  Early identification of attrition trends across key segments
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