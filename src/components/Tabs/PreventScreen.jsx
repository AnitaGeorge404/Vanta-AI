import React from 'react';
import { Link } from 'react-router-dom';
import BottomNav from './BottomNav';

function PreventScreen() {
  return (
    <>
      <div style={styles.container}>
        <h2 style={styles.heading}>🛡️ Prevention</h2>
        <p style={styles.subtext}>Stay ahead. Use tools to prevent misuse before it begins.</p>

        <div style={styles.grid}>
          <Link to="/InAppWarnings" style={{ ...styles.card, backgroundColor: '#ffe4e6' }}>
            <h3 style={styles.cardTitle}>In-App Warnings</h3>
            <p style={styles.cardText}>Real-time alerts when risk is detected during uploads.</p>
          </Link>

          <Link to="/DigitalWatermarking" style={{ ...styles.card, backgroundColor: '#e0f2fe' }}>
            <h3 style={styles.cardTitle}>Digital Watermarking</h3>
            <p style={styles.cardText}>Invisible tracing to prevent image misuse and leaks.</p>
          </Link>
        </div>
      </div>
      <BottomNav />
    </>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    padding: '20px',
    paddingBottom: '80px',
    background: 'linear-gradient(to bottom, #fce8ff, #e0f7fa)',
    fontFamily: 'Segoe UI, sans-serif',
  },
  heading: { fontSize: '24px', fontWeight: 'bold', color: '#7e22ce', marginBottom: '6px' },
  subtext: { fontSize: '14px', color: '#555', marginBottom: '20px' },
  grid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
    justifyContent: 'space-between',
  },
  card: {
    flex: '1 1 calc(50% - 10px)',
    padding: '16px',
    borderRadius: '16px',
    textDecoration: 'none',
    color: 'inherit',
    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
  },
  cardTitle: { fontSize: '16px', fontWeight: 'bold', marginBottom: '4px' },
  cardText: { fontSize: '13px', color: '#333' }
};

export default PreventScreen;
