// components/Header/Header.jsx
import React, { useState, useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import "../styles/Header.css";
import logoImg from "../image/logo.svg";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const mobileMenuRef = useRef(null);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleDropdown = (index) => {
    if (activeDropdown === index) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(index);
    }
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="header header-fullwidth">
      <div className="container header-container-fullwidth">
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

          <nav 
            className={`main-nav ${mobileMenuOpen ? "open" : ""}`}
            ref={mobileMenuRef}
          >
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
              
              <li className={`nav-item dropdown ${activeDropdown === 0 ? "open" : ""}`}>
                <span 
                  className="nav-link dropdown-toggle"
                  onClick={() => toggleDropdown(0)}
                >
                  Tools
                </span>
                <ul className="dropdown-menu">
                  <li>
                    <NavLink to="/tool/docs" className="dropdown-item">
                    Docs file format
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/tool/excel" className="dropdown-item">
                      Excel file format
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/tool/html" className="dropdown-item">
                      Html file format
                    </NavLink>
                  </li>
                   <li>
                    <NavLink to="/tool/slicer" className="dropdown-item">
                    slicer analysis tool

                    </NavLink>
                  </li>
                </ul>
              </li>
              <li className="nav-item">
                <NavLink
                  to="/predictive-analysis"
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                >
                  predictive analysis
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
              
              {/* <li className={`nav-item dropdown ${activeDropdown === 1 ? "open" : ""}`}>
                <span 
                  className="nav-link dropdown-toggle"
                  onClick={() => toggleDropdown(1)}
                >
                  Resources
                </span>
                <ul className="dropdown-menu">
                  <li>
                    <NavLink to="/documentation" className="dropdown-item">
                      Documentation
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/blog" className="dropdown-item">
                      Blog
                    </NavLink>
                  </li>
                </ul>
              </li> */}
            </ul>
            
            <div className="header-actions">
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