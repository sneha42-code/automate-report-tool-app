// components/Header/Header.js
import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import "../styles/Header.css";
import logoImg from "../image/logo.svg";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="logo">
            <NavLink to="/">
              <img src={logoImg} alt="Automate Reporting" className="logo-img" />
              <span className="logo-text">Automate Reporting</span>
            </NavLink>
          </div>

          <button
            className="mobile-menu-toggle"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>

          <nav className={`main-nav ${mobileMenuOpen ? "open" : ""}`}>
            <ul className="nav-list">
              <li className="nav-item">
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                >
                  Home
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  to="/tool"
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                >
                  Tool
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  to="/blog"
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                >
                  Blog
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  to="/documentation"
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                >
                  Documentation
                </NavLink>
              </li>
            </ul>
            <div className="header-actions">
              <NavLink to="/login" className="btn btn-secondary">
                Log In
              </NavLink>
              <NavLink to="/signup" className="btn btn-primary">
                Sign Up
              </NavLink>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
