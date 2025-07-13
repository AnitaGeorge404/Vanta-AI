import React from 'react';
import { Link } from 'react-router-dom';
import BottomNav from './BottomNav';

function ReportScreen() {
  return (
    <>
      <div style={styles.container}>
        <h2 style={styles.heading}>📤 Report</h2>
        <p style={styles.subtext}>Take action against abuse with quick legal tools.</p>

        <div style={styles.grid}>
          <Link to="/LegalComplaints" style={{ ...styles.card, backgroundColor: '#ffecb3' }}>
            <h3 style={styles.cardTitle}>One-Click Legal Complaints</h3>
            <p style={styles.cardText}>Quickly file abuse reports with prefilled legal forms.</p>
          </Link>

          <Link to="/TakeDownRequests" style={{ ...styles.card, backgroundColor: '#ffe0e0' }}>
            <h3 style={styles.cardTitle}>Automated Takedown Requests</h3>
            <p style={styles.cardText}>Instantly send DMCA/complaints to platforms.</p>
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


export default ReportScreen;
