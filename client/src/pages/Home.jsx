import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import SpecularButton from '../components/SpecularButton';
import AudioToggle from '../components/AudioToggle';
import ThemeSwitch from '../components/ThemeSwitch';

const Home = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
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

  // Autoplay video smoothly whenever theme switches or muted toggles
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
      videoRef.current.play().catch(() => {});
    }
  }, [isDark, isMuted]);

  const steps = [
    {
      number: '1',
      icon: '🔍',
      title: t('home.step1Title') || 'Search & Select',
      desc: t('home.step1Desc') || 'Browse local machinery by type, location, and daily budget. Select rental dates on the availability calendar.',
      tag: t('home.step1Tag') || '🚜 Easy Selection',
    },
    {
      number: '2',
      icon: '🤝',
      title: t('home.step2Title') || 'Approval & Payment',
      desc: t('home.step2Desc') || 'The owner reviews and approves your request. Pay safely online using credit/debit cards or UPI via Razorpay.',
      tag: t('home.step2Tag') || '💳 Secure Escrow',
    },
    {
      number: '3',
      icon: '🚜',
      title: t('home.step3Title') || 'Work & Review',
      desc: t('home.step3Desc') || 'Complete your agricultural tasks with top-performing machinery, return it, and share feedback with the community.',
      tag: t('home.step3Tag') || '⭐ Verified Quality',
    },
  ];

  const categories = [
    {
      type: 'tractor',
      name: t('home.catTractors') || 'Tractors',
      icon: '🚜',
      desc: t('home.catTractorsDesc') || 'Powerful 40-75 HP utility and 4WD tractors',
    },
    {
      type: 'harvester',
      name: t('home.catHarvesters') || 'Harvesters',
      icon: '🌾',
      desc: t('home.catHarvestersDesc') || 'Combine and multi-crop automated harvesters',
    },
    {
      type: 'sprayer',
      name: t('home.catSprayers') || 'Sprayers',
      icon: '💧',
      desc: t('home.catSprayersDesc') || 'Boom, mist, and tractor-mounted sprayers',
    },
    {
      type: 'tiller',
      name: t('home.catTillers') || 'Power Tillers',
      icon: '⚙️',
      desc: t('home.catTillersDesc') || 'Rotary tillers and cultivators for soil prep',
    },
    {
      type: 'drone',
      name: t('home.catDrones') || 'Agri Drones',
      icon: '🛸',
      desc: t('home.catDronesDesc') || 'Precision aerial spraying and crop mapping',
    },
  ];

  return (
    <div className={`home-page ${isDark ? 'theme-dark' : 'theme-light'}`}>
      {/* Fixed Background Video spanning entire page scroll to footer */}
      <div className="home-video-bg-container" aria-hidden="true">
        <video
          key={isDark ? 'home-dark-theme-video' : 'home-light-theme-video'}
          ref={videoRef}
          className="home-video-bg"
          autoPlay
          loop
          muted={isMuted}
          playsInline
          preload="auto"
        >
          <source src={isDark ? '/dark_theme.mp4' : '/light_theme.mp4'} type="video/mp4" />
        </video>
        <div className="home-video-overlay" />
      </div>

      {/* Floating Theme Switch (Light / Dark Theme) */}
      <div className="home-theme-toggle-container">
        <ThemeSwitch isDark={isDark} onToggle={toggleTheme} id="homeThemeSwitch" />
      </div>

      {/* Floating Audio On / Off Toggle Switch */}
      <AudioToggle isMuted={isMuted} onToggle={toggleAudio} id="homeAudioToggle" />

      {/* Hero Section */}
      <section className="home-hero">
        <div className="home-hero-container">
          <div className="home-hero-badge">
            {t('home.badge') || '🌱 Modern Agricultural Equipment Sharing'}
          </div>

          <h1 className="home-hero-title">
            {t('home.heroTitle') || 'Rent Modern Farming Equipment'} <br />
            <span className="text-highlight">
              {t('home.heroTitleHighlight') || 'Directly from Local Owners'}
            </span>
          </h1>

          <p className="home-hero-subtitle">
            {t('home.heroSubtitle') ||
              'Power your farming season without the burden of heavy capital machinery loans. Discover verified tractors, harvesters, and precision tools with transparent pricing and secure payments.'}
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
              {t('home.browseBtn') || '🚜 Browse Equipment'}
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
                {t('home.dashboardBtn') || 'Go to Dashboard'} ({user.name}) →
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
                {t('home.joinBtn') || '✨ Join AgriRent Free'}
              </SpecularButton>
            )}
          </div>

          <div className="hero-trust-metrics">
            <div className="metric-item">
              <span className="metric-icon">🛡️</span>
              <span className="metric-text">
                {t('home.verifiedMachinery') || 'Admin Verified Machinery'}
              </span>
            </div>
            <div className="metric-item">
              <span className="metric-icon">💳</span>
              <span className="metric-text">
                {t('home.securePayments') || 'Secure Online Payments'}
              </span>
            </div>
            <div className="metric-item">
              <span className="metric-icon">⚡</span>
              <span className="metric-text">
                {t('home.fastBooking') || 'Instant Booking System'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Owner Call to Action */}
      <section className="owner-cta-banner">
        <div className="section-container owner-cta-content">
          <div className="owner-cta-text">
            <h2>{t('home.ownerBannerTitle') || 'Own Farming Machinery? Put It to Work.'}</h2>
            <p>
              {t('home.ownerBannerSubtitle') ||
                'Tractors and equipment sit idle between farming cycles. Turn your machinery into a steady revenue stream by renting it out to nearby farmers.'}
            </p>
          </div>
          {user?.role === 'owner' ? (
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
                {t('nav.addEquipment') || '+ List New Equipment'}
              </SpecularButton>
            </div>
          ) : (
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
                onClick={() => navigate('/register')}
              >
                {t('home.listEquipmentBtn') || '🚜 List Your Equipment Today'}
              </SpecularButton>
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="home-section how-it-works-section">
        <div className="section-container">
          <div className="section-header">
            <span className="section-eyebrow">{t('home.howItWorksTitle') || 'How It Works'}</span>
            <h2 className="section-title">{t('home.howItWorksTitle') || 'How AgriRent Works'}</h2>
            <p className="section-desc">
              {t('home.howItWorksSubtitle') ||
                'Three seamless steps to get the machinery you need into your fields on time.'}
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
                      <span className="cover-hint">Hover / Click 📖</span>
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
            <span className="section-eyebrow">
              {t('home.categoriesTitle') || 'Machinery Fleet'}
            </span>
            <h2 className="section-title">
              {t('home.categoriesTitle') || 'Explore by Equipment Category'}
            </h2>
            <p className="section-desc">
              {t('home.categoriesSubtitle') ||
                'From land preparation to harvest, find specialized equipment for every crop stage.'}
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
                    <span className="tilt-card-prompt">
                      {t('home.exploreFleet') || 'EXPLORE FLEET'}
                    </span>
                    <span className="tilt-card-icon">{cat.icon}</span>
                    <h4 className="tilt-card-title">{cat.name}</h4>
                    <p className="tilt-card-desc">{cat.desc}</p>
                    <span className="tilt-card-link-text">
                      {cat.name} →
                    </span>
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
              {t('home.copyright') ||
                'Connecting farmers with modern, high-yield agricultural machinery directly from local owners.'}
            </p>
          </div>
          <div className="home-footer-links">
            <div className="footer-col">
              <h4>{t('nav.browse') || 'Platform'}</h4>
              <Link to="/equipment">{t('nav.browse') || 'Browse Equipment'}</Link>
              <Link to="/register">{t('nav.register') || 'Create Account'}</Link>
              <Link to="/login">{t('nav.login') || 'Sign In'}</Link>
            </div>
            <div className="footer-col">
              <h4>{t('home.categoriesTitle') || 'Categories'}</h4>
              <Link to="/equipment?type=tractor">{t('home.catTractors') || 'Tractors'}</Link>
              <Link to="/equipment?type=harvester">{t('home.catHarvesters') || 'Harvesters'}</Link>
              <Link to="/equipment?type=sprayer">{t('home.catSprayers') || 'Sprayers'}</Link>
              <Link to="/equipment?type=drone">{t('home.catDrones') || 'Agri Drones'}</Link>
            </div>
            <div className="footer-col">
              <h4>{t('home.verifiedMachinery') || 'Trust & Security'}</h4>
              <span className="footer-badge-item">🛡️ {t('home.verifiedMachinery') || 'Admin Verified Machinery'}</span>
              <span className="footer-badge-item">💳 {t('home.securePayments') || 'Secure Online Payments'}</span>
              <span className="footer-badge-item">⚡ {t('home.fastBooking') || 'Instant Booking System'}</span>
            </div>
          </div>
        </div>
        <div className="home-footer-bottom">
          <p>© {new Date().getFullYear()} AgriRent Platform. {t('home.copyright') || 'Modern Agricultural Equipment Sharing.'}</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
