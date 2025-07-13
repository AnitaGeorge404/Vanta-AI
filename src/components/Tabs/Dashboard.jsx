import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, FileText, Search, Heart, AlertTriangle, Bot, Scale, UserX } from 'lucide-react';

function Dashboard() {
  const { pathname } = useLocation();

  const navItems = [
    { path: '/', icon: '🏠', label: 'Home' },
    { path: '/prevent', icon: '🛡️', label: 'Prevention' },
    { path: '/detect', icon: '🔍', label: 'Detection' },
    { path: '/report', icon: '📤', label: 'Reporting' },
    { path: '/support', icon: '💖', label: 'Support' }
  ];

  const cardData = [
    {
      title: 'Prevention Tools',
      description: 'Proactive AI-powered protection to safeguard your digital identity before threats emerge.',
      icon: Shield,
      path: '/prevent'
    },
    {
      title: 'Report Violations',
      description: 'Secure, confidential reporting system to address misuse with one-click submission.',
      icon: FileText,
      path: '/report'
    },
    {
      title: 'Scan & Detect',
      description: 'Advanced scanning technology to identify unauthorized use of your images and videos.',
      icon: Search,
      path: '/detect'
    },
    {
      title: 'Emotional Support',
      description: 'Comprehensive mental health resources and professional counseling support services.',
      icon: Heart,
      path: '/support'
    },
    {
      title: 'Silent SOS',
      description: 'Discreet emergency alert system for immediate assistance in crisis situations.',
      icon: AlertTriangle,
      path: '/sos'
    },
    {
      title: 'AI Harassment Detector',
      description: 'Intelligent monitoring system that identifies and flags potential harassment patterns.',
      icon: Bot,
      path: '/harassment'
    },
    {
      title: 'Legal Support',
      description: 'Expert legal guidance and resources for addressing digital rights violations.',
      icon: Scale,
      path: '/legal'
    },
    {
      title: 'Anonymous Reporting',
      description: 'Completely anonymous reporting channel to ensure your privacy and safety.',
      icon: UserX,
      path: '/anonymous'
    }
  ];

  return (
    <>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>
            Vanta AI <span role="img" aria-label="butterfly">🦋</span>
          </h1>
          <div style={styles.headerIcons}>
            <div style={styles.profileIcon}>
              <span style={styles.profileText}>Profile</span>
            </div>
          </div>
        </div>

        {/* Grid of Cards */}
        <div style={styles.grid}>
          {cardData.map((card, index) => {
            const IconComponent = card.icon;
            return (
              <Link key={index} to={card.path} style={styles.card}>
                <div style={styles.cardContent}>
                  <div style={styles.cardIcon}>
                    <IconComponent size={24} color="#4c1d95" />
                  </div>
                  <h3 style={styles.cardTitle}>{card.title}</h3>
                  <p style={styles.cardText}>{card.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Bottom Nav */}
      <div style={styles.bottomNav}>
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            style={{
              ...styles.navLink,
              color: pathname === item.path ? '#4c1d95' : '#64748b',
              fontWeight: pathname === item.path ? 'bold' : 'normal',
            }}
          >
            <div style={styles.navItem}>
              <span style={styles.navIcon}>{item.icon}</span>
              <span style={styles.navLabel}>{item.label}</span>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}

const styles = {
  container: {
    height: '100vh',
    padding: '16px 12px',
    paddingBottom: '85px',
    background: 'linear-gradient(to bottom, #C2E8FF, #E5C8FF)',
    boxSizing: 'border-box',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  title: {
    fontSize: '26px',
    fontWeight: '700',
    color: '#5b21b6',
    margin: 0,
  },
  headerIcons: {
    display: 'flex',
    alignItems: 'center',
  },
  profileIcon: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 12px',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: '20px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  profileText: {
    fontSize: '14px',
    color: '#5b21b6',
    fontWeight: '500',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gridTemplateRows: 'repeat(4, 1fr)',
    gap: '8px',
    maxWidth: '600px',
    margin: '0 auto',
    height: 'calc(100vh - 140px)',
  },
  card: {
    background: 'linear-gradient(to bottom, #FDD0FA, #EEE5F6)',
    borderRadius: '14px',
    padding: '10px',
    textDecoration: 'none',
    color: 'inherit',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    transition: 'all 0.3s ease',
    border: '1px solid rgba(244, 114, 182, 0.2)',
    backdropFilter: 'blur(10px)',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '0',
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
    }
  },
  cardContent: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  cardIcon: {
    marginBottom: '6px',
    padding: '6px',
    backgroundColor: 'rgba(147, 51, 234, 0.1)',
    borderRadius: '8px',
    width: 'fit-content',
  },
  cardTitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#4c1d95',
    marginBottom: '4px',
    margin: '0 0 4px 0',
  },
  cardText: {
    fontSize: '10px',
    color: '#4c1d95',
    lineHeight: '1.2',
    margin: 0,
    flex: 1,
  },
  bottomNav: {
    position: 'fixed',
    bottom: '0',
    left: '0',
    right: '0',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    borderTop: '1px solid rgba(226, 232, 240, 0.8)',
    padding: '12px 0',
    display: 'flex',
    justifyContent: 'space-around',
    zIndex: 10,
  },
  navLink: {
    textDecoration: 'none',
    transition: 'color 0.2s ease',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: '60px',
  },
  navItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
  },
  navIcon: {
    fontSize: '20px',
  },
  navLabel: {
    fontSize: '12px',
    fontWeight: '500',
  },
};

export default Dashboard;