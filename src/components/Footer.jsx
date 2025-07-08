// components/Footer/Footer.js
import React from "react";
import { Link } from "react-router-dom";
import "../styles/Footer.css";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer footer-fullwidth">
      <div className="container footer-container-fullwidth">
        <div className="footer-top"></div>
        <div className="footer-sections">
          <div className="footer-section">
            <h2 className="footer-title">Automate Reporting</h2>
            <p className="footer-description">
              Professional tools to help you automate analysis and create beautiful,
              data-driven reports from your spreadsheets and databases.
            </p>
          </div>

          <div className="footer-section">
            <h2 className="footer-title">Contact Us</h2>
            <p className="contact-email">sales@automatereporting.com</p>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="copyright">
            &copy; {currentYear} Automate Reporting. All rights reserved.
          </div>
          <div className="footer-links">
            <Link to="/terms">Terms of Service</Link>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/cookies">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
