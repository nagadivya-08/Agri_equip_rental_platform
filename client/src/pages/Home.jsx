import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SpecularButton from '../components/SpecularButton';
import AudioToggle from '../components/AudioToggle';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);
  const [activeStep, setActiveStep] = useState(null);

  const toggleAudio = () => {
    if (videoRef.current) {
      const nextMuted = !isMuted;
      videoRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
      if (!nextMuted) {
        videoRef.current.play().catch(() => {});
      }
    }
  };

  const steps = [
    {
      number: '1',
      icon: '🔍',
      title: 'Search & Select',
      desc: 'Browse local machinery by type, location, and daily budget. Select rental dates on the availability calendar.',
      tag: '🚜 Easy Selection',
    },
    {
      number: '2',
      icon: '🤝',
      title: 'Approval & Payment',
      desc: 'The owner reviews and approves your request. Pay safely online using credit/debit cards or UPI via Razorpay.',
      tag: '💳 Secure Escrow',
    },
    {
      number: '3',
      icon: '🚜',
      title: 'Work & Review',
      desc: 'Complete your agricultural tasks with top-performing machinery, return it, and share feedback with the community.',
      tag: '⭐ Verified Quality',
    },
  ];

  const categories = [
    { type: 'tractor', name: 'Tractors', icon: '🚜', desc: 'Powerful 40-75 HP utility and 4WD tractors' },
    { type: 'harvester', name: 'Harvesters', icon: '🌾', desc: 'Combine and multi-crop automated harvesters' },
    { type: 'sprayer', name: 'Sprayers', icon: '💧', desc: 'Boom, mist, and tractor-mounted sprayers' },
    { type: 'tiller', name: 'Power Tillers', icon: '⚙️', desc: 'Rotary tillers and cultivators for soil prep' },
    { type: 'drone', name: 'Agri Drones', icon: '🛸', desc: 'Precision aerial spraying and crop mapping' },
  ];

  return (
    <div className="home-page">
      {/* Fixed Background Video spanning entire page scroll to footer */}
      <div className="home-video-bg-container" aria-hidden="true">
        <video
          ref={videoRef}
          className="home-video-bg"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
        >
          <source src="/gemini_generated_video_6f3db13c.mp4" type="video/mp4" />
          <source src="/farm-background.mp4" type="video/mp4" />
        </video>
        <div className="home-video-overlay" />
      </div>

      {/* Floating Audio On / Off Toggle Switch */}
      <AudioToggle isMuted={isMuted} onToggle={toggleAudio} id="homeAudioToggle" />

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
          {user?.role === 'owner' && (
            <div className="owner-cta-action">
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
            </div>
          )}
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
            {steps.map((step) => (
              <div
                key={step.number}
                className="step-book-wrapper"
                onClick={() => setActiveStep(activeStep === step.number ? null : step.number)}
              >
                <div className={`book ${activeStep === step.number ? 'is-open' : ''}`}>
                  {/* Inside page of the book revealed on hover/open */}
                  <div className="book-page-inner">
                    <span className="book-inner-step">STEP 0{step.number}</span>
                    <h4 className="book-inner-title">{step.title}</h4>
                    <p className="book-inner-desc">{step.desc}</p>
                    <span className="book-inner-tag">{step.tag}</span>
                  </div>

                  {/* 3D front cover that hinges open */}
                  <div className="cover">
                    <div className="cover-spine" />
                    <div className="cover-content">
                      <span className="cover-number">{step.number}</span>
                      <span className="cover-icon">{step.icon}</span>
                      <h3 className="cover-title">{step.title}</h3>
                      <span className="cover-hint">Hover to open 📖</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
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
                className="category-tilt-container noselect"
              >
                <div className="canvas">
                  <div className="tracker tr-1" />
                  <div className="tracker tr-2" />
                  <div className="tracker tr-3" />
                  <div className="tracker tr-4" />
                  <div className="tracker tr-5" />
                  <div className="tracker tr-6" />
                  <div className="tracker tr-7" />
                  <div className="tracker tr-8" />
                  <div className="tracker tr-9" />
                  <div className="tracker tr-10" />
                  <div className="tracker tr-11" />
                  <div className="tracker tr-12" />
                  <div className="tracker tr-13" />
                  <div className="tracker tr-14" />
                  <div className="tracker tr-15" />
                  <div className="tracker tr-16" />
                  <div className="tracker tr-17" />
                  <div className="tracker tr-18" />
                  <div className="tracker tr-19" />
                  <div className="tracker tr-20" />
                  <div className="tracker tr-21" />
                  <div className="tracker tr-22" />
                  <div className="tracker tr-23" />
                  <div className="tracker tr-24" />
                  <div className="tracker tr-25" />
                  <div className="tilt-card">
                    <span className="tilt-card-prompt">EXPLORE FLEET</span>
                    <span className="tilt-card-icon">{cat.icon}</span>
                    <h4 className="tilt-card-title">{cat.name}</h4>
                    <p className="tilt-card-desc">{cat.desc}</p>
                    <span className="tilt-card-link-text">Explore {cat.name} →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Translucent Footer Section - Video persists behind */}
      <footer className="home-footer">
        <div className="section-container home-footer-content">
          <div className="home-footer-brand">
            <div className="footer-logo">
              <span className="logo-icon">🌱</span>
              <span className="logo-text">AgriRent</span>
            </div>
            <p className="footer-tagline">
              Connecting farmers with modern, high-yield agricultural machinery directly from local owners.
            </p>
          </div>
          <div className="home-footer-links">
            <div className="footer-col">
              <h4>Platform</h4>
              <Link to="/equipment">Browse Equipment</Link>
              <Link to="/register">Create Account</Link>
              <Link to="/login">Sign In</Link>
            </div>
            <div className="footer-col">
              <h4>Categories</h4>
              <Link to="/equipment?type=tractor">Tractors</Link>
              <Link to="/equipment?type=harvester">Harvesters</Link>
              <Link to="/equipment?type=sprayer">Sprayers</Link>
              <Link to="/equipment?type=drone">Agri Drones</Link>
            </div>
            <div className="footer-col">
              <h4>Trust & Security</h4>
              <span className="footer-badge-item">🛡️ Admin Verified Equipment</span>
              <span className="footer-badge-item">💳 Escrow Protected Payments</span>
              <span className="footer-badge-item">⭐ Peer Reviewed Machinery</span>
            </div>
          </div>
        </div>
        <div className="home-footer-bottom">
          <p>© {new Date().getFullYear()} AgriRent Platform. Modern Agricultural Equipment Sharing.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
