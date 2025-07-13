import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Dashboard() {
  const { pathname } = useLocation();

  const navItems = [
    { path: '/', icon: '🏠' },
    { path: '/prevent', icon: '🛡️' },
    { path: '/detect', icon: '🔍' },
    { path: '/report', icon: '📤' },
    { path: '/support', icon: '💖' }
  ];

  return (
    <>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>
            Vanta AI <span role="img" aria-label="butterfly">🦋</span>
          </h1>
          <div style={styles.icons}>
            <span style={styles.icon}>⚙️</span>
            <span style={styles.icon}>👤</span>
          </div>
        </div>

        {/* Grid of Cards */}
        <div style={styles.grid}>
          <Link to="/prevent" style={{ ...styles.card, backgroundColor: '#fbd5d5' }}>
            <div style={styles.cardIcon}>🛡️</div>
            <h3 style={styles.cardTitle}>Prevention tools</h3>
            <p style={styles.cardText}>Scan risk before damage strikes. Use AI to stop misuse before it starts.</p>
          </Link>

          <Link to="/report" style={{ ...styles.card, backgroundColor: '#d9f1f0' }}>
            <div style={styles.cardIcon}>📤</div>
            <h3 style={styles.cardTitle}>Report</h3>
            <p style={styles.cardText}>Raise complaints with one click — securely and fast.</p>
          </Link>

          <Link to="/detect" style={{ ...styles.card, backgroundColor: '#ffffff', border: '2px solid #60a5fa' }}>
            <div style={styles.cardIcon}>🔍</div>
            <h3 style={styles.cardTitle}>Scan & Detect</h3>
            <p style={styles.cardText}>Scan, analyze, and uncover any misuse of your images or videos effortlessly.</p>
          </Link>

          <Link to="/support" style={{ ...styles.card, backgroundColor: '#fbd7ef' }}>
            <div style={styles.cardIcon}>💖</div>
            <h3 style={styles.cardTitle}>Emotional Support</h3>
            <p style={styles.cardText}>Legal aid, mental health, and resource collection all in one place.</p>
          </Link>

          <div style={{ ...styles.card, backgroundColor: '#fbefff' }}></div>
          <div style={{ ...styles.card, backgroundColor: '#f5ddff' }}></div>
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
              color: pathname === item.path ? '#7e22ce' : '#666',
              fontWeight: pathname === item.path ? 'bold' : 'normal',
            }}
          >
            {item.icon}
          </Link>
        ))}
      </div>
    </>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    padding: '20px',
    paddingBottom: '80px',
    background: 'linear-gradient(to bottom, #e1e9ff, #fce8ff)',
    boxSizing: 'border-box',
    fontFamily: 'Segoe UI, sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#5b21b6',
  },
  icons: {
    display: 'flex',
    gap: '16px',
    fontSize: '18px',
  },
  icon: {
    cursor: 'pointer',
  },
  grid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
    justifyContent: 'space-between',
  },
  card: {
    flex: '1 1 calc(50% - 10px)',
    padding: '14px',
    borderRadius: '16px',
    minHeight: '140px',
    boxSizing: 'border-box',
    textDecoration: 'none',
    color: 'inherit',
    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s ease',
  },
  cardIcon: {
    fontSize: '24px',
    marginBottom: '8px',
  },
  cardTitle: {
    fontSize: '14px',
    marginBottom: '4px',
  },
  cardText: {
    fontSize: '12px',
    color: '#555',
  },
  bottomNav: {
    position: 'fixed',
    bottom: '0',
    left: '0',
    right: '0',
    backgroundColor: 'white',
    borderTop: '1px solid #ddd',
    padding: '10px 0',
    display: 'flex',
    justifyContent: 'space-around',
    zIndex: 10,
  },
  navLink: {
    fontSize: '18px',
    textDecoration: 'none',
    transition: 'color 0.2s ease',
  },

  // Add responsive media query manually
  '@media (max-width: 600px)': {
    card: {
      flex: '1 1 100%',
    }
  }
};

export default Dashboard;
