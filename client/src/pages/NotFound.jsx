import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="not-found-page">
      <div className="not-found-card">
        <span className="not-found-icon">🚜💨</span>
        <h1 className="not-found-code">404</h1>
        <h2 className="not-found-title">Oops! Off the Farm Path</h2>
        <p className="not-found-desc">
          We couldn't find the page you were looking for. It might have been moved, 
          renamed, or maybe you took a detour into uncharted fields!
        </p>

        <div className="not-found-actions">
          <Link to="/" className="btn-primary">
            🏠 Return Home
          </Link>
          <Link to="/equipment" className="btn-secondary">
            🚜 Browse Equipment
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
