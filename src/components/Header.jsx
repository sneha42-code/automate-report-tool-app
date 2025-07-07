import React, { useState, useEffect, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";
import "../styles/Header.css";
import logoImg from "../image/logo.svg";
import WordPressAuthService from "../wordPress/wordPressAuthService";
import authService from "../service/AuthService";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  
  // WordPress auth (for blog features)
  const [isWpLoggedIn, setIsWpLoggedIn] = useState(false);
  const [wpCurrentUser, setWpCurrentUser] = useState(null);
  
  // Regular auth (for main app)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  const mobileMenuRef = useRef(null);
  const location = useLocation();

  // Check if current path is blog-related
  const isBlogRelated = location.pathname.startsWith('/blog') || 
                       location.pathname.startsWith('/admin') ||
                       location.pathname === '/wplogin';

  // Check authentication statuses
  useEffect(() => {
    const checkAuthStatus = () => {
      // WordPress Auth
      const wpAuthenticated = WordPressAuthService.isAuthenticated();
      const wpUser = WordPressAuthService.getCurrentUser();
      setIsWpLoggedIn(wpAuthenticated);
      setWpCurrentUser(wpUser);

      // Regular Auth
      const authenticated = authService.isAuthenticated();
      const user = authService.getCurrentUser();
      setIsLoggedIn(authenticated);
      setCurrentUser(user);
    };

    checkAuthStatus();
    const interval = setInterval(checkAuthStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleDropdown = (index) => {
    setActiveDropdown(activeDropdown === index ? null : index);
  };

  const handleWpLogout = async () => {
    await WordPressAuthService.logout();
    setIsWpLoggedIn(false);
    setWpCurrentUser(null);
    setMobileMenuOpen(false);
    setActiveDropdown(null);
  };

  const handleRegularLogout = async () => {
    await authService.logout();
    setIsLoggedIn(false);
    setCurrentUser(null);
    setMobileMenuOpen(false);
    setActiveDropdown(null);
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNavLinkClick = () => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
  };

  // Determine which auth system to use based on context
  const useWordPressAuth = isBlogRelated;
  const contextIsLoggedIn = useWordPressAuth ? isWpLoggedIn : isLoggedIn;
  const contextUser = useWordPressAuth ? wpCurrentUser : currentUser;
  const contextLogout = useWordPressAuth ? handleWpLogout : handleRegularLogout;

  return (
    <header className="header header-fullwidth">
      <div className="container header-container-fullwidth">
        <div className="header-content">
          <div className="logo">
            <NavLink to="/" onClick={handleNavLinkClick}>
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
                  className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
                  onClick={handleNavLinkClick}
                >
                  Home
                </NavLink>
              </li>
              
              <li className={`nav-item dropdown ${activeDropdown === 0 ? "open" : ""}`}>
                <span 
                  className="nav-link dropdown-toggle"
                  onClick={() => toggleDropdown(0)}
                >
                  Product
                </span>
                <ul className="dropdown-menu">
                  <li>
                    <NavLink to="/tool/docs" className="dropdown-item" onClick={handleNavLinkClick}>
                      Docs file format
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/tool/excel" className="dropdown-item" onClick={handleNavLinkClick}>
                      Excel file format
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/tool/html" className="dropdown-item" onClick={handleNavLinkClick}>
                      Html file format
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/tool/slicer" className="dropdown-item" onClick={handleNavLinkClick}>
                      Slicer analysis tool
                    </NavLink>
                  </li>
                   <li>
                    <NavLink to="/tool/predictive-analysis" className="dropdown-item" onClick={handleNavLinkClick}>
                      Predictive analysis tool
                    </NavLink>
                  </li>
                  
                </ul>
              </li>
              
              <li className="nav-item">
                <NavLink
                  to="/blog"
                  className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
                  onClick={handleNavLinkClick}
                >
                  Blog
                </NavLink>
              </li>

              {/* Smart Authentication Section */}
              {contextIsLoggedIn && (
                <li className={`nav-item dropdown ${activeDropdown === 1 ? "open" : ""}`}>
                  <span 
                    className="nav-link dropdown-toggle"
                    onClick={() => toggleDropdown(1)}
                  >
                    <span className="user-avatar">
                      <img 
                        src={contextUser?.avatar || '/default-avatar.png'} 
                        alt={contextUser?.displayName || contextUser?.name || contextUser?.fullName || 'User'}
                        style={{ width: '20px', height: '20px', borderRadius: '50%', marginRight: '5px' }}
                      />
                      {contextUser?.displayName || contextUser?.name || contextUser?.fullName || 'User'}
                      {useWordPressAuth && (
                        <span className="auth-indicator" title="WordPress Account">WP</span>
                      )}
                    </span>
                  </span>
                  <ul className="dropdown-menu">
                    {/* WordPress-specific options (when in blog context) */}
                    {useWordPressAuth && isWpLoggedIn && (
                      <>
                        <li>
                          <NavLink to="/admin/profile" className="dropdown-item" onClick={handleNavLinkClick}>
                            WP Admin Profile
                          </NavLink>
                        </li>
                        {(wpCurrentUser?.roles?.includes('administrator') || 
                          wpCurrentUser?.roles?.includes('editor') ||
                          Object.keys(wpCurrentUser?.capabilities || {}).includes('edit_users')) && (
                          <li>
                            <NavLink to="/admin/users" className="dropdown-item" onClick={handleNavLinkClick}>
                              User Management
                            </NavLink>
                          </li>
                        )}
                        <li>
                          <NavLink to="/blog/create" className="dropdown-item" onClick={handleNavLinkClick}>
                            Create Post
                          </NavLink>
                        </li>
                  
                      </>
                    )}

                    {/* Regular app options (when not in blog context) */}
                    {!useWordPressAuth && isLoggedIn && (
                      <>
                        <li>
                          <NavLink to="/dashboard" className="dropdown-item" onClick={handleNavLinkClick}>
                            Dashboard
                          </NavLink>
                        </li>
                        <li>
                          <NavLink to="/settings" className="dropdown-item" onClick={handleNavLinkClick}>
                            Settings
                          </NavLink>
                        </li>
                      </>
                    )}

                    <li><hr className="dropdown-divider" /></li>

                    <li>
                      <button 
                        onClick={contextLogout}
                        className="dropdown-item logout-btn"
                        style={{ 
                          background: 'none', 
                          border: 'none', 
                          width: '100%', 
                          textAlign: 'left',
                          color: 'inherit',
                          cursor: 'pointer'
                        }}
                      >
                        Logout {useWordPressAuth ? '(WordPress)' : ''}
                      </button>
                    </li>
                  </ul>
                </li>
              )}
            </ul>

            {/* Header Actions - Only show when NOT in blog areas and NOT logged in */}
            {!useWordPressAuth && !isLoggedIn && (
              <div className="header-actions">
                {/* <NavLink 
                  to="/login" 
                  className="btn btn-outline"
                  onClick={handleNavLinkClick}
                >
                  Login
                </NavLink> */}
                <NavLink 
                  to="/book-demo" 
                  className="btn btn-secondary"
                  onClick={handleNavLinkClick}
                >
                  Book a Demo
                </NavLink>
                <NavLink 
                  to="/signup" 
                  className="btn btn-primary"
                  onClick={handleNavLinkClick}
                >
                  Get Started
                </NavLink>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;