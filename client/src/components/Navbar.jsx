import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    setMobileMenuOpen(false);
    logout();
    navigate('/login');
  };

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo" onClick={closeMenu}>
          🚜 AgriRent
        </Link>

        {/* Mobile Hamburger Toggle Button */}
        <button
          className={`nav-hamburger-btn ${mobileMenuOpen ? 'open' : ''}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={mobileMenuOpen}
        >
          <span className="hamburger-bar"></span>
          <span className="hamburger-bar"></span>
          <span className="hamburger-bar"></span>
        </button>

        <div className={`nav-links ${mobileMenuOpen ? 'nav-links-mobile-open' : ''}`}>
          <Link to="/equipment" className="nav-link" onClick={closeMenu}>
            Browse Equipment
          </Link>

          {/* Admin Navigation */}
          {user && user.role === 'admin' && (
            <>
              <Link to="/admin" className="nav-link nav-btn-admin" onClick={closeMenu}>
                🛡️ Admin Panel
              </Link>
              <Link to="/admin/pending" className="nav-link" onClick={closeMenu}>
                Pending Approvals
              </Link>
              <Link to="/admin/reports" className="nav-link" onClick={closeMenu}>
                Reports
              </Link>
            </>
          )}

          {/* Owner Navigation */}
          {user && user.role === 'owner' && (
            <>
              <Link to="/my-listings" className="nav-link" onClick={closeMenu}>
                My Listings
              </Link>
              <Link to="/owner-bookings" className="nav-link" onClick={closeMenu}>
                Booking Requests
              </Link>
              <Link to="/add-equipment" className="nav-link nav-btn-primary" onClick={closeMenu}>
                + Add Equipment
              </Link>
            </>
          )}

          {/* Renter Navigation */}
          {user && user.role === 'renter' && (
            <Link to="/my-bookings" className="nav-link" onClick={closeMenu}>
              My Bookings
            </Link>
          )}

          {user ? (
            <div className="nav-user-menu">
              <Link to="/dashboard" className="nav-link user-profile-link" onClick={closeMenu}>
                Dashboard ({user.name})
              </Link>
              <span className={`role-pill role-pill-${user.role}`}>
                {user.role}
              </span>
              <button onClick={handleLogout} className="nav-btn-logout">
                Logout
              </button>
            </div>
          ) : (
            <div className="nav-auth-links">
              <Link to="/login" className="nav-link" onClick={closeMenu}>
                Login
              </Link>
              <Link to="/register" className="nav-link nav-btn-register" onClick={closeMenu}>
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
