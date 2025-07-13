import React, { useState, useEffect, useRef } from 'react';

// Convert Blob to base64
const blobToBase64 = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      if (!result) return reject('Empty reader result');
      const base64 = result.split(',')[1];
      base64 ? resolve(base64) : reject('Base64 split failed');
    };
    reader.onerror = (err) => reject('FileReader error: ' + err.message);
    reader.readAsDataURL(blob);
  });

const SilentSOS = () => {
  const [clickCount, setClickCount] = useState(0);
  const [downloadVisible, setDownloadVisible] = useState(false);
  const clickTimerRef = useRef(null);

  const weather = {
    location: 'New York, NY',
    temperature: 72,
    condition: 'Partly Cloudy',
    humidity: 65,
    windSpeed: 8,
    forecast: [
      { day: 'Today', high: 75, low: 62, condition: 'Sunny' },
      { day: 'Tomorrow', high: 78, low: 65, condition: 'Cloudy' },
      { day: 'Wednesday', high: 73, low: 60, condition: 'Rainy' }
    ]
  };

  const handleCloudClick = () => {
    setClickCount((prev) => prev + 1);
    clearTimeout(clickTimerRef.current);
    clickTimerRef.current = setTimeout(() => setClickCount(0), 3000);
    if (clickCount + 1 >= 3) {
      triggerSOS();
      setClickCount(0);
    }
  };

  useEffect(() => {
    const handleKey = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'S') triggerSOS();
      if (e.ctrlKey && e.shiftKey && e.key === 'D') setDownloadVisible((v) => !v);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const triggerSOS = async () => {
    console.log('🔴 SOS Triggered');
    await Promise.all([
      recordMedia({ video: true, audio: true }, 'video', 10000),
      recordMedia({ audio: true }, 'audio', 10000),
      recordScreenRecording(10000),
    ]);
  };

  const recordMedia = async (constraints, type, duration = 10000) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (!stream || stream.getTracks().length === 0) {
        console.warn(`🚫 No ${type} stream available.`);
        return;
      }

      const mimeType = type === 'audio'
        ? 'audio/webm;codecs=opus'
        : 'video/webm;codecs=vp8,opus';

      const recorder = new MediaRecorder(stream, { mimeType });
      const chunks = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = async () => {
        if (chunks.length === 0) {
          console.warn(`⚠️ No chunks captured for ${type}`);
          return;
        }

        const blob = new Blob(chunks, { type: mimeType });

        if (!blob || blob.size === 0) {
          console.warn(`⚠️ ${type} blob is empty`);
          return;
        }

        try {
          const base64 = await blobToBase64(blob);
          if (!base64 || base64 === '') throw new Error('base64 conversion returned empty');
          localStorage.setItem(`evidence_${type}`, JSON.stringify({ base64 }));
          console.log(`✅ ${type} saved successfully`);
        } catch (err) {
          console.error(`❌ Failed to convert ${type} to base64:`, err);
        }

        stream.getTracks().forEach((t) => t.stop());
      };

      recorder.start();
      setTimeout(() => {
        if (recorder.state === 'recording') recorder.stop();
      }, Math.max(duration, 5000));
    } catch (err) {
      console.error(`❌ Failed to record ${type}:`, err.message);
      alert(`Access denied for ${type}. Please allow webcam/mic.`);
    }
  };

  const recordScreenRecording = async (duration = 10000) => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { mediaSource: 'screen' },
        audio: true,
      });

      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp8,opus' });
      const chunks = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = async () => {
        if (chunks.length === 0) {
          console.warn(`⚠️ No chunks captured for screen`);
          return;
        }

        const blob = new Blob(chunks, { type: 'video/webm' });

        try {
          const base64 = await blobToBase64(blob);
          if (!base64 || base64 === '') throw new Error('base64 conversion returned empty');
          localStorage.setItem(`evidence_screen`, JSON.stringify({ base64 }));
          console.log('✅ Screen recording saved');
        } catch (err) {
          console.error('❌ Screen base64 conversion failed:', err);
        }

        stream.getTracks().forEach((t) => t.stop());
      };

      recorder.start();
      setTimeout(() => {
        if (recorder.state === 'recording') recorder.stop();
      }, duration);
    } catch (err) {
      console.error('❌ Screen recording error:', err.message);
    }
  };

  const downloadEvidence = (type) => {
    try {
      const data = localStorage.getItem(`evidence_${type}`);
      if (!data) return alert(`${type} not found`);
      const { base64 } = JSON.parse(data);
      if (!base64 || base64 === '') throw new Error('Missing or invalid base64');
      
      const url = `data:video/webm;base64,${base64}`;
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_${Date.now()}.webm`;
      a.click();
    } catch (err) {
      console.error(`Download error:`, err);
      alert(`Error downloading ${type}: ${err.message}`);
    }
  };

  const getIcon = (cond) => {
    const c = cond.toLowerCase();
    if (c.includes('sun')) return '☀️';
    if (c.includes('cloud')) return '⛅';
    if (c.includes('rain')) return '🌧️';
    return '☁️';
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>WeatherNow</h2>
        <div>{weather.location}</div>
      </div>

      <div style={styles.main}>
        <div style={styles.temperature}>
          <span style={styles.tempText}>{weather.temperature}°</span>
          <span onClick={handleCloudClick} style={styles.icon}>{getIcon(weather.condition)}</span>
        </div>
        <div>{weather.condition}</div>
        <div>Humidity: {weather.humidity}% | Wind: {weather.windSpeed} mph</div>

        <h4>Forecast</h4>
        {weather.forecast.map((f, i) => (
          <div key={i}>
            {f.day}: {getIcon(f.condition)} {f.high}° / {f.low}°
          </div>
        ))}
      </div>

      {downloadVisible && (
        <div style={styles.download}>
          <h4>📥 Download Evidence</h4>
          {['video', 'audio', 'screen'].map((t) => (
            <button key={t} onClick={() => downloadEvidence(t)} style={styles.button}>
              Download {t}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Inline styles
const styles = {
  container: {
    maxWidth: 400,
    margin: '0 auto',
    padding: 20,
    fontFamily: 'Arial, sans-serif',
    background: 'linear-gradient(to bottom right, #74b9ff, #0984e3)',
    color: 'white',
    borderRadius: 10,
    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
    minHeight: '100vh',
  },
  header: {
    textAlign: 'center',
    marginBottom: 20,
  },
  main: {
    background: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    padding: 20,
  },
  temperature: {
    fontSize: 48,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  tempText: {
    fontWeight: 300,
  },
  icon: {
    fontSize: 40,
    cursor: 'pointer',
    userSelect: 'none',
  },
  download: {
    marginTop: 20,
    textAlign: 'center',
  },
  button: {
    margin: '4px 8px',
    padding: '8px 12px',
    background: '#fff',
    color: '#0984e3',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
  },
};

export default SilentSOS;
