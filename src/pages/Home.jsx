import React, { useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../styles/Home.css";
import { animateCounters } from "../utils/animateCounters";
import BrainCircuitVisualization from "../components/BrainCircuitVisualization";
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
  const heroAnimationRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Hero section animations trigger immediately
    const triggerHeroAnimations = () => {
      const heroTitle = document.querySelector('.hero-title');
      const heroSubtitle = document.querySelector('.hero-subtitle');
      const heroActions = document.querySelector('.hero-actions');

      if (heroTitle) heroTitle.classList.add('animate-slideDown');
      if (heroSubtitle) heroSubtitle.classList.add('animate-slideUp');
      if (heroActions) heroActions.classList.add('animate-fadeIn');
    };

    // Trigger hero animations after a short delay
    heroAnimationRef.current = setTimeout(triggerHeroAnimations, 100);

    // Intersection Observer for scroll-based fade-in animations
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("fade-in-visible");
            // Unobserve after animation to improve performance
            observerRef.current.unobserve(entry.target);
          }
        });
      },
      { 
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px' // Start animation slightly before element is fully visible
      }
    );

    // Observe all fade-in elements
    const fadeElements = document.querySelectorAll(".fade-in");
    fadeElements.forEach((el) => observerRef.current.observe(el));

    // Initialize counter animations for stats
    animateCounters();

    // Cleanup function
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (heroAnimationRef.current) {
        clearTimeout(heroAnimationRef.current);
      }
    };
  }, []);

  return (
    <div className="home-page">
      {/* Hero Section - Fixed Animation Triggers */}
      <header className="hero-section">
        <div className="hero-background">
          <BrainCircuitVisualization />
          <div className="hero-overlay"></div>
        </div>
        <div className="container hero-content">
          <h1 className="hero-title">
            Transform HR with AI Analytics
          </h1>
          <p className="hero-subtitle">
            Optimize workforce planning with advanced attrition insights
          </p>
          <div className="hero-actions">
            <button
              className="get-started-btn hero-action-btn"
              onClick={() => navigate("/signup")}
            >
              Try Now
            </button>
            <button
              className="cta-button hero-action-btn"
              onClick={() => navigate("/book-demo")}
            >
              Schedule Demo
            </button>
          </div>
        </div>
      </header>

      {/* Tool Section */}
      <section className="tool-section">
        <div className="container">
          <div className="tool-header fade-in">
            <h2>Explore Our Analytics Platform</h2>
            <p>Unlock powerful workforce insights in minutes</p>
          </div>
          <div className="tool-card fade-in">
            <NavLink to="/analysis" className="btn btn-primary btn-demo-request">
              Launch Analysis Tool
            </NavLink>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content fade-in">
            <h2>Ready to Optimize Your Workforce?</h2>
            <p>Get started with our AI-driven analytics today</p>
            <button
              className="cta-button-large"
              onClick={() => navigate("/signup")}
            >
              Start Free Trial
            </button>
          </div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section className="capabilities-section">
        <div className="container">
          <h2 className="section-title fade-in">Why Choose Us</h2>
          <div className="capabilities-grid">
            <div className="capability-card fade-in">
              <div className="capability-icon">
                <img src={analyticsIcon} alt="Analytics" />
              </div>
              <h3>Attrition Analysis</h3>
              <p>Track employee turnover patterns with precision</p>
            </div>
            <div className="capability-card fade-in">
              <div className="capability-icon">
                <img src={demographicsIcon} alt="Demographics" />
              </div>
              <h3>Demographic Insights</h3>
              <p>Analyze trends by department and location</p>
            </div>
            <div className="capability-card fade-in">
              <div className="capability-icon">
                <img src={trendsIcon} alt="Trends" />
              </div>
              <h3>Trend Identification</h3>
              <p>Spot significant patterns over time</p>
            </div>
            <div className="capability-card fade-in">
              <div className="capability-icon">
                <img src={riskIcon} alt="Risk Assessment" />
              </div>
              <h3>Risk Assessment</h3>
              <p>Identify retention risks proactively</p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section - Currently Commented Out 
      <section className="stats-section">
        <div className="container">
          <h2 className="section-title fade-in">Our Impact</h2>
          <div className="stats-grid">
            <div className="stat-item fade-in">
              <div className="stat-number" data-target="95">
                0
              </div>
              <div className="stat-suffix">%</div>
              <div className="stat-label">Prediction Accuracy</div>
            </div>
            <div className="stat-item fade-in">
              <div className="stat-number" data-target="500">
                0
              </div>
              <div className="stat-suffix">+</div>
              <div className="stat-label">Clients Served</div>
            </div>
            <div className="stat-item fade-in">
              <div className="stat-number" data-target="50">
                0
              </div>
              <div className="stat-suffix">%</div>
              <div className="stat-label">Cost Savings</div>
            </div>
          </div>
        </div>
      </section> */}

      {/* Value Section */}
      <section className="value-section">
        <div className="container">
          <h2 className="section-title fade-in">Business Benefits</h2>
          <div className="value-grid">
            <div className="value-card fade-in">
              <div className="value-image">
                <img src={efficiency} alt="Operational Efficiency" />
              </div>
              <div className="value-content">
                <h3>Operational Efficiency</h3>
                <p>Streamline workforce planning</p>
              </div>
            </div>
            <div className="value-card fade-in">
              <div className="value-image">
                <img src={costManagement} alt="Cost Management" />
              </div>
              <div className="value-content">
                <h3>Cost Management</h3>
                <p>Minimize turnover expenses</p>
              </div>
            </div>
            <div className="value-card fade-in">
              <div className="value-image">
                <img src={strategicPlanning} alt="Strategic Planning" />
              </div>
              <div className="value-content">
                <h3>Strategic Planning</h3>
                <p>Make data-driven decisions</p>
              </div>
            </div>
            <div className="value-card fade-in">
              <div className="value-image">
                <img src={riskMitigation} alt="Risk Mitigation" />
              </div>
              <div className="value-content">
                <h3>Risk Mitigation</h3>
                <p>Prevent talent loss</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section - Currently Commented Out
      <section className="testimonial-section">
        <div className="container">
          <h2 className="section-title fade-in">What Our Clients Say</h2>
          <div className="testimonial-grid">
            <div className="testimonial-card fade-in">
              <p>
                "This platform transformed our HR strategy with actionable
                insights."
              </p>
              <div className="testimonial-author">
                <span>Jane Doe</span>
                <span>HR Director, TechCorp</span>
              </div>
            </div>
            <div className="testimonial-card fade-in">
              <p>
                "The analytics tool saved us millions in turnover costs."
              </p>
              <div className="testimonial-author">
                <span>John Smith</span>
                <span>CEO, Innovate Inc.</span>
              </div>
            </div>
          </div>
        </div>
      </section> */}
    </div>
  );
};

export default Home;