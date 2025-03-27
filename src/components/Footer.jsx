// components/Footer/Footer.js
import React from "react";
import "../styles/Footer.css";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section about">
            <h3 className="footer-title">Report Generator</h3>
            <p className="footer-description">
              Professional report generation tools to help you create beautiful,
              data-driven reports from your spreadsheets and databases.
            </p>
            {/* <div className="social-links">
              <a
                href="https://twitter.com"
                className="social-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="social-icon twitter">Twitter</i>
              </a>
              <a
                href="https://linkedin.com"
                className="social-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="social-icon linkedin">LinkedIn</i>
              </a>
              <a
                href="https://github.com"
                className="social-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="social-icon github">GitHub</i>
              </a>
            </div> */}
          </div>

          {/* <div className="footer-section links">
            <h3 className="footer-title">Quick Links</h3>
            <ul className="footer-links">
              <li>
                <a href="/">Home</a>
              </li>
              <li>
                <a href="/templates">Report Templates</a>
              </li>
              <li>
                <a href="/examples">Examples</a>
              </li>
              <li>
                <a href="/pricing">Pricing</a>
              </li>
              <li>
                <a href="/blog">Blog</a>
              </li>
            </ul>
          </div> */}

          <div className="footer-section contact">
            <h3 className="footer-title">Contact Us</h3>
            <ul className="contact-details">
              <li className="contact-item">
                <i className="contact-icon email"></i>
                <span>support@reportgenerator.com</span>
              </li>
              {/* <li className="contact-item">
                <i className="contact-icon phone"></i>
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="contact-item">
                <i className="contact-icon address"></i>
                <span>123 Report Street, Data City, CA 94043</span>
              </li> */}
            </ul>
          </div>

          {/* <div className="footer-section newsletter">
            <h3 className="footer-title">Subscribe to Our Newsletter</h3>
            <p className="newsletter-description">
              Get the latest updates, tips and new features directly to your
              inbox.
            </p>
            <form className="newsletter-form">
              <input
                type="email"
                className="newsletter-input"
                placeholder="Enter your email"
                required
              />
              <button type="submit" className="newsletter-button">
                Subscribe
              </button>
            </form>
          </div> */}
        </div>

        <div className="footer-bottom">
          <div className="copyright">
            &copy; {currentYear} Report Generator. All rights reserved.
          </div>
          <div className="footer-bottom-links">
            <a href="/terms">Terms of Service</a>
            <a href="/privacy">Privacy Policy</a>
            <a href="/cookies">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
