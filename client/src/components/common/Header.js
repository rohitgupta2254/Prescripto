import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../utils/helpers';
import '../../styles/Common.css';

const Header = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowDropdown(false);
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            <h1>Prescripto</h1>
          </Link>

          <nav className="nav">
            {currentUser ? (
              <div className="user-nav">
                {currentUser.role === 'patient' && (
                  <>
                    <Link 
                      to="/patient/dashboard" 
                      className={`nav-link ${isActiveRoute('/patient/dashboard') ? 'active' : ''}`}
                    >
                      Dashboard
                    </Link>
                    <Link 
                      to="/patient/doctors" 
                      className={`nav-link ${isActiveRoute('/patient/doctors') ? 'active' : ''}`}
                    >
                      Find Doctors
                    </Link>
                  </>
                )}
                {currentUser.role === 'doctor' && (
                  <>
                    <Link 
                      to="/doctor/dashboard" 
                      className={`nav-link ${isActiveRoute('/doctor/dashboard') ? 'active' : ''}`}
                    >
                      Dashboard
                    </Link>
                    <Link 
                      to="/doctor/profile" 
                      className={`nav-link ${isActiveRoute('/doctor/profile') ? 'active' : ''}`}
                    >
                      Profile
                    </Link>
                  </>
                )}
                
                <div className="user-menu">
                  <button 
                    className="user-avatar"
                    onClick={() => setShowDropdown(!showDropdown)}
                  >
                    <span className="avatar-initials">
                      {getInitials(currentUser.name)}
                    </span>
                    <span className="user-name">{currentUser.name}</span>
                  </button>
                  
                  {showDropdown && (
                    <div className="dropdown-menu">
                      <Link 
                        to={currentUser.role === 'doctor' ? '/doctor/profile' : '/patient/profile'} 
                        className="dropdown-item"
                        onClick={() => setShowDropdown(false)}
                      >
                        Profile
                      </Link>
                      <button 
                        className="dropdown-item logout"
                        onClick={handleLogout}
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="auth-buttons">
                <Link to="/doctor/login" className="btn btn-outline">
                  Doctor Login
                </Link>
                <Link to="/patient/login" className="btn btn-primary">
                  Patient Login
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;