import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SpecularButton from '../components/SpecularButton';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

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
            <SpecularButton
              size="lg"
              radius={14}
              tint="#10b981"
              tintOpacity={0.9}
              textColor="#ffffff"
              lineColor="#6ee7b7"
              baseColor="#047857"
              intensity={1.5}
              shineSize={20}
              shineFade={45}
              thickness={1.5}
              speed={0.4}
              followMouse
              onClick={() => navigate('/equipment')}
            >
              🚜 Browse Equipment
            </SpecularButton>

            {user ? (
              <SpecularButton
                size="lg"
                radius={14}
                tint="#ffffff"
                tintOpacity={0.16}
                blur={12}
                textColor="#ffffff"
                lineColor="#fbbf24"
                baseColor="#334155"
                intensity={1.3}
                shineSize={18}
                shineFade={40}
                thickness={1.2}
                followMouse
                onClick={() => navigate('/dashboard')}
              >
                Go to Dashboard ({user.name}) →
              </SpecularButton>
            ) : (
              <SpecularButton
                size="lg"
                radius={14}
                tint="#ffffff"
                tintOpacity={0.16}
                blur={12}
                textColor="#ffffff"
                lineColor="#fbbf24"
                baseColor="#334155"
                intensity={1.3}
                shineSize={18}
                shineFade={40}
                thickness={1.2}
                followMouse
                onClick={() => navigate('/register')}
              >
                ✨ Join AgriRent Free
              </SpecularButton>
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
              <SpecularButton
                size="lg"
                radius={14}
                tint="#ffffff"
                tintOpacity={0.96}
                textColor="#064e3b"
                lineColor="#10b981"
                baseColor="#d1fae5"
                intensity={1.5}
                shineSize={20}
                shineFade={45}
                thickness={1.5}
                followMouse
                onClick={() => navigate('/add-equipment')}
              >
                + List New Equipment
              </SpecularButton>
            ) : (
              <SpecularButton
                size="lg"
                radius={14}
                tint="#ffffff"
                tintOpacity={0.96}
                textColor="#064e3b"
                lineColor="#10b981"
                baseColor="#d1fae5"
                intensity={1.5}
                shineSize={20}
                shineFade={45}
                thickness={1.5}
                followMouse
                onClick={() => navigate('/register')}
              >
                Register as an Owner
              </SpecularButton>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
