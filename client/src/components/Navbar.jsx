import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          🚜 AgriRent
        </Link>

        <div className="nav-links">
          <Link to="/equipment" className="nav-link">
            Browse Equipment
          </Link>

          {user && user.role === 'owner' && (
            <>
              <Link to="/my-listings" className="nav-link">
                My Listings
              </Link>
              <Link to="/add-equipment" className="nav-link nav-btn-primary">
                + Add Equipment
              </Link>
            </>
          )}

          {user ? (
            <div className="nav-user-menu">
              <Link to="/dashboard" className="nav-link user-profile-link">
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
              <Link to="/login" className="nav-link">
                Login
              </Link>
              <Link to="/register" className="nav-link nav-btn-register">
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
