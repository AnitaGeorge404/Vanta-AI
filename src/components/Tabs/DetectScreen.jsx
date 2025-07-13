import React from 'react';
import { Link } from 'react-router-dom';
import BottomNav from './BottomNav';

function DetectScreen() {
  return (
    <>
      <div style={styles.container}>
        <h2 style={styles.heading}>🔍 Detect</h2>
        <p style={styles.subtext}>AI tools to uncover and analyze image-based threats.</p>

        <div style={styles.grid}>
          <Link to="/DeepfakeDetection" style={{ ...styles.card, backgroundColor: '#f3e8ff' }}>
            <h3 style={styles.cardTitle}>Deepfake Detection</h3>
            <p style={styles.cardText}>AI to spot facial manipulation and video tampering.</p>
          </Link>

          <Link to="/ImageScanning" style={{ ...styles.card, backgroundColor: '#dbf4ff' }}>
            <h3 style={styles.cardTitle}>AI Image Scanning</h3>
            <p style={styles.cardText}>Analyze photos for signs of nudity, edits, or misuse.</p>
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


export default DetectScreen;
