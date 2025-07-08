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

  // Enhanced blog context detection
  const isBlogContext = location.pathname.startsWith('/blog') || 
                       location.pathname.startsWith('/admin') ||
                       location.pathname === '/wplogin';

  // Check if we're specifically in a blog management area (not just viewing)
  const isBlogManagementContext = location.pathname.startsWith('/blog/create') ||
                                 location.pathname.startsWith('/blog/edit') ||
                                 location.pathname.startsWith('/admin');

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

  // WordPress Login Button Component
  const WordPressLoginButton = () => (
    <NavLink 
      to="/wplogin" 
      className="btn btn-outline"
      onClick={handleNavLinkClick}
    >
      WP Login
    </NavLink>
  );

  // WordPress User Dropdown Component
  const WordPressUserDropdown = () => (
    <li className={`nav-item dropdown ${activeDropdown === 1 ? "open" : ""}`}>
      <span 
        className="nav-link dropdown-toggle"
        onClick={() => toggleDropdown(1)}
      >
        <span className="user-avatar">
          <img 
            src={wpCurrentUser?.avatar || '/default-avatar.png'} 
            alt={wpCurrentUser?.displayName || wpCurrentUser?.name || 'User'}
            style={{ width: '20px', height: '20px', borderRadius: '50%', marginRight: '5px' }}
          />
          {wpCurrentUser?.displayName || wpCurrentUser?.name || 'User'}
          <span className="auth-indicator" title="WordPress Account">WP</span>
        </span>
      </span>
      <ul className="dropdown-menu">
        <li>
          <NavLink to="/admin/profile" className="dropdown-item" onClick={handleNavLinkClick}>
            Profile
          </NavLink>
        </li>
        
        {/* Admin/Editor specific options */}
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
        
        {/* Show edit option only when viewing a specific blog post */}
        {location.pathname.startsWith('/blog/') && 
         !location.pathname.startsWith('/blog/create') && 
         !location.pathname.startsWith('/blog/edit') && 
         location.pathname !== '/blog' && (
          <li>
            <NavLink 
              to={`/blog/edit/${location.pathname.split('/').pop()}`} 
              className="dropdown-item" 
              onClick={handleNavLinkClick}
            >
              Edit This Post
            </NavLink>
          </li>
        )}

        <li><hr className="dropdown-divider" /></li>

        <li>
          <button 
            onClick={handleWpLogout}
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
            Logout (WordPress)
          </button>
        </li>
      </ul>
    </li>
  );

  // Regular User Dropdown Component
  const RegularUserDropdown = () => (
    <li className={`nav-item dropdown ${activeDropdown === 1 ? "open" : ""}`}>
      <span 
        className="nav-link dropdown-toggle"
        onClick={() => toggleDropdown(1)}
      >
        <span className="user-avatar">
          <img 
            src={currentUser?.avatar || '/default-avatar.png'} 
            alt={currentUser?.fullName || currentUser?.name || 'User'}
            style={{ width: '20px', height: '20px', borderRadius: '50%', marginRight: '5px' }}
          />
          {currentUser?.fullName || currentUser?.name || 'User'}
        </span>
      </span>
      <ul className="dropdown-menu">
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
        <li><hr className="dropdown-divider" /></li>
        <li>
          <button 
            onClick={handleRegularLogout}
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
            Logout
          </button>
        </li>
      </ul>
    </li>
  );

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

              {/* CONDITIONAL USER INTERFACE LOGIC */}
              
              {/* WordPress Context: Show WP login/user based on auth status */}
              {isBlogContext && !isWpLoggedIn && (
                <li className="nav-item wp-login-item">
                  <WordPressLoginButton />
                </li>
              )}
              
              {isBlogContext && isWpLoggedIn && (
                <WordPressUserDropdown />
              )}

              {/* Regular App Context: Show regular user menu when not in blog areas */}
              {!isBlogContext && isLoggedIn && (
                <RegularUserDropdown />
              )}
            </ul>

            {/* Header Actions - Only show for main app when NOT logged in and NOT in blog context */}
            {!isBlogContext && !isLoggedIn && (
              <div className="header-actions">
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