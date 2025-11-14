import React, { useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../styles/Home.css";
import { animateCounters } from "../utils/animateCounters";
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

  // Initialize Simple Tech Background
  const initializeSimpleTechBackground = () => {
    const container = document.querySelector('.animated-background');
    if (!container) return;
    
    container.innerHTML = '';

    // Create particles
    for (let i = 0; i < 50; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.top = Math.random() * 100 + '%';
      particle.style.animationDelay = Math.random() * 6 + 's';
      particle.style.animationDuration = (Math.random() * 4 + 4) + 's';
      container.appendChild(particle);
    }

    // Create flowing lines
    for (let i = 0; i < 8; i++) {
      const line = document.createElement('div');
      line.className = 'line horizontal';
      line.style.top = Math.random() * 100 + '%';
      line.style.animationDelay = Math.random() * 8 + 's';
      container.appendChild(line);
    }

    for (let i = 0; i < 6; i++) {
      const line = document.createElement('div');
      line.className = 'line vertical';
      line.style.left = Math.random() * 100 + '%';
      line.style.animationDelay = Math.random() * 6 + 's';
      container.appendChild(line);
    }

    for (let i = 0; i < 4; i++) {
      const line = document.createElement('div');
      line.className = 'line diagonal';
      line.style.left = Math.random() * 100 + '%';
      line.style.top = Math.random() * 100 + '%';
      line.style.animationDelay = Math.random() * 7 + 's';
      container.appendChild(line);
    }

    // Create hexagons
    for (let i = 0; i < 5; i++) {
      const hexagon = document.createElement('div');
      hexagon.className = 'hexagon';
      hexagon.style.left = Math.random() * 100 + '%';
      hexagon.style.top = Math.random() * 100 + '%';
      hexagon.style.animationDelay = Math.random() * 4 + 's';
      container.appendChild(hexagon);
    }

    // Create data streams
    for (let i = 0; i < 6; i++) {
      const stream = document.createElement('div');
      stream.className = 'data-stream';
      stream.style.top = Math.random() * 100 + '%';
      stream.style.animationDelay = Math.random() * 3 + 's';
      stream.style.animationDuration = (Math.random() * 2 + 2) + 's';
      container.appendChild(stream);
    }

    // Create circuit lines
    for (let i = 0; i < 4; i++) {
      const line = document.createElement('div');
      line.className = 'circuit-line';
      line.style.width = Math.random() * 200 + 100 + 'px';
      line.style.height = '1px';
      line.style.left = Math.random() * 80 + '%';
      line.style.top = Math.random() * 100 + '%';
      line.style.animationDelay = Math.random() * 5 + 's';
      container.appendChild(line);
    }

    for (let i = 0; i < 3; i++) {
      const line = document.createElement('div');
      line.className = 'circuit-line';
      line.style.width = '1px';
      line.style.height = Math.random() * 200 + 100 + 'px';
      line.style.left = Math.random() * 100 + '%';
      line.style.top = Math.random() * 80 + '%';
      line.style.animationDelay = Math.random() * 5 + 's';
      container.appendChild(line);
    }
  };

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

    // Initialize Simple Tech background animation
    setTimeout(initializeSimpleTechBackground, 200);

    // Intersection Observer for scroll-based fade-in animations
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("fade-in-visible");
            observerRef.current.unobserve(entry.target);
          }
        });
      },
      { 
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
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
      {/* Hero Section */}
      <header className="hero-section version1">{/* removed background switching */}
        <div className="hero-background">
          <div className="animated-background"></div>
          <div className="hero-overlay"></div>
        </div>
        <div className="container hero-content">
          <h1 className="hero-title">
            AI-Powered HR Analytics
          </h1>
          <p className="hero-subtitle">
            Transform your workforce decisions with intelligent analytics
          </p>
          <div className="hero-actions">
            <button
              className="get-started-btn hero-action-btn"
              onClick={() => navigate("/signup")}
            >
              Get Started
            </button>
            <button
              className="cta-button hero-action-btn"
              onClick={() => navigate("/book-demo")}
            >
              Book Demo
            </button>
          </div>
        </div>
      </header>

      {/* Main Action Section */}
      <section className="action-section">
        <div className="container">
          <h2 className="section-title fade-in">Start Your AI Journey</h2>
          <p className="section-subtitle fade-in">Choose your path to workforce optimization</p>
          
          <div className="actions-grid">
            <div className="action-card fade-in">
              
              <h3 className="action-title">Analysis Tool</h3>
              <p className="action-description">Launch our comprehensive workforce analytics platform. Analyze attrition patterns, identify trends, and get actionable insights instantly.</p>
              <NavLink to="/analysis" className="action-btn">Launch Tool</NavLink>
            </div>
            
            <div className="action-card fade-in">
             
              <h3 className="action-title">Query for Person</h3>
              <p className="action-description">Search and analyze individual employee data. Get detailed insights on performance, engagement, and retention risk factors.</p>
              <button className="action-btn" onClick={() => navigate("/signup")}>Search People</button>
            </div>
            
            <div className="action-card fade-in">
              
              <h3 className="action-title">Resume GPT</h3>
              <p className="action-description">AI-powered resume analysis and candidate matching. Screen resumes, extract key skills, and find the perfect fit for your roles.</p>
              <button className="action-btn" onClick={() => navigate("/signup")}>Analyze Resume</button>
            </div>
            
            <div className="action-card fade-in">
          
              <h3 className="action-title">Get Started</h3>
              <p className="action-description">Begin your free trial with full access to all features. No credit card required. Start optimizing your workforce today.</p>
              <button className="action-btn" onClick={() => navigate("/signup")}>Start Free Trial</button>
            </div>
          </div>
        </div>
      </section>

      {/* Optional: Keep existing sections if needed */}
      {/* You can uncomment these if you want to keep some of the original sections */}
      
      {/* Capabilities Section - Simplified */}
      <section className="capabilities-section">
        <div className="container">
          <h2 className="section-title fade-in">Platform Capabilities</h2>
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
    </div>
  );
};

export default Home;