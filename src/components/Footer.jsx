// components/Footer/Footer.js
import React from "react";
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
            <p className="contact-email"> automatereporting12@gmail.com</p>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="copyright">
            &copy; {currentYear} Automate Reporting. All rights reserved.
          </div>
          <div className="footer-links">
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
