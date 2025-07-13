import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function BottomNav() {
  const { pathname } = useLocation();

  const navItems = [
    { path: '/', icon: '🏠' },
    { path: '/prevent', icon: '🛡️' },
    { path: '/detect', icon: '🔍' },
    { path: '/report', icon: '📤' },
    { path: '/support', icon: '💖' }
  ];

  return (
    <div style={styles.navbar}>
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          style={{
            ...styles.navItem,
            color: pathname === item.path ? '#7e22ce' : '#666',
            fontWeight: pathname === item.path ? 'bold' : 'normal',
          }}
        >
          {item.icon}
        </Link>
      ))}
    </div>
  );
}

const styles = {
  navbar: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTop: '1px solid #ddd',
    padding: '10px 0',
    display: 'flex',
    justifyContent: 'space-around',
    zIndex: 100,
  },
  navItem: {
    fontSize: '18px',
    textDecoration: 'none',
    transition: 'color 0.2s ease',
  }
};

export default BottomNav;
