import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();

  const categories = [
    { type: 'tractor', name: 'Tractors', icon: '🚜', desc: 'Powerful 40-75 HP utility and 4WD tractors' },
    { type: 'harvester', name: 'Harvesters', icon: '🌾', desc: 'Combine and multi-crop automated harvesters' },
    { type: 'sprayer', name: 'Sprayers', icon: '💧', desc: 'Boom, mist, and tractor-mounted sprayers' },
    { type: 'tiller', name: 'Power Tillers', icon: '⚙️', desc: 'Rotary tillers and cultivators for soil prep' },
    { type: 'drone', name: 'Agri Drones', icon: '🛸', desc: 'Precision aerial spraying and crop mapping' },
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="home-hero">
        <div className="home-hero-container">
          <div className="home-hero-badge">
            🌱 Modern Agricultural Equipment Sharing
          </div>
          <h1 className="home-hero-title">
            Rent Modern Farming Equipment <br />
            <span className="text-highlight">Directly from Local Owners</span>
          </h1>
          <p className="home-hero-subtitle">
            Power your farming season without the burden of heavy capital machinery loans. 
            Discover verified tractors, harvesters, and precision tools with transparent pricing 
            and secure payments.
          </p>

          <div className="home-hero-actions">
            <Link to="/equipment" className="btn-hero-primary">
              🚜 Browse Equipment
            </Link>
            {user ? (
              <Link to="/dashboard" className="btn-hero-secondary">
                Go to Dashboard ({user.name}) →
              </Link>
            ) : (
              <Link to="/register" className="btn-hero-secondary">
                ✨ Join AgriRent Free
              </Link>
            )}
          </div>

          <div className="hero-trust-metrics">
            <div className="metric-item">
              <span className="metric-icon">🛡️</span>
              <span className="metric-text">Admin Verified Machinery</span>
            </div>
            <div className="metric-item">
              <span className="metric-icon">💳</span>
              <span className="metric-text">Razorpay Escrow Protection</span>
            </div>
            <div className="metric-item">
              <span className="metric-icon">⭐</span>
              <span className="metric-text">Peer Reviewed Quality</span>
            </div>
            <div className="metric-item">
              <span className="metric-icon">📍</span>
              <span className="metric-text">Geospatial Local Search</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="home-section how-it-works-section">
        <div className="section-container">
          <div className="section-header">
            <span className="section-eyebrow">Simple & Reliable</span>
            <h2 className="section-title">How AgriRent Works</h2>
            <p className="section-desc">
              Three seamless steps to get the machinery you need into your fields on time.
            </p>
          </div>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <div className="step-icon">🔍</div>
              <h3>Search & Select</h3>
              <p>
                Browse local machinery by type, location, and daily budget. Select rental dates on the availability calendar.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number">2</div>
              <div className="step-icon">🤝</div>
              <h3>Approval & Payment</h3>
              <p>
                The owner reviews and approves your request. Pay safely online using credit/debit cards or UPI via Razorpay.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number">3</div>
              <div className="step-icon">🚜</div>
              <h3>Work & Review</h3>
              <p>
                Complete your agricultural tasks with top-performing machinery, return it, and share feedback with the community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="home-section categories-section">
        <div className="section-container">
          <div className="section-header">
            <span className="section-eyebrow">Machinery Fleet</span>
            <h2 className="section-title">Explore by Equipment Category</h2>
            <p className="section-desc">
              From land preparation to harvest, find specialized equipment for every crop stage.
            </p>
          </div>

          <div className="categories-grid">
            {categories.map((cat) => (
              <Link
                key={cat.type}
                to={`/equipment?type=${cat.type}`}
                className="category-card"
              >
                <span className="category-icon">{cat.icon}</span>
                <h4 className="category-name">{cat.name}</h4>
                <p className="category-desc">{cat.desc}</p>
                <span className="category-link-text">Explore {cat.name} →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Owner Call to Action */}
      <section className="owner-cta-banner">
        <div className="section-container owner-cta-content">
          <div className="owner-cta-text">
            <h2>Own Farming Machinery? Put It to Work.</h2>
            <p>
              Tractors and equipment sit idle between farming cycles. Turn your machinery into a steady 
              revenue stream by renting it out to nearby farmers. You stay in control of dates, pricing, and approvals.
            </p>
          </div>
          <div className="owner-cta-action">
            {user?.role === 'owner' ? (
              <Link to="/add-equipment" className="btn-cta-white">
                + List New Equipment
              </Link>
            ) : (
              <Link to="/register" className="btn-cta-white">
                Register as an Owner
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
