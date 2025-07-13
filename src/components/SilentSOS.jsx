import React, { useState, useEffect, useRef } from 'react';

// Helper to convert blob to base64
const blobToBase64 = (blob) =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result.split(',')[1]); // remove "data:*/*;base64,"
    };
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
    clickTimerRef.current = setTimeout(() => {
      setClickCount(0);
    }, 3000);
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
    await Promise.all([
      recordMedia({ video: true, audio: true }, 'video', 30000),
      recordMedia({ audio: true }, 'audio', 60000),
      recordScreenRecording(),
    ]);
  };

  const recordMedia = async (constraints, type, duration) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      const recorder = new MediaRecorder(stream);
      const chunks = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: `${type}/webm` });
        const base64 = await blobToBase64(blob);
        localStorage.setItem(`evidence_${type}`, JSON.stringify({ base64 }));
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      setTimeout(() => recorder.state === 'recording' && recorder.stop(), duration);
    } catch (err) {
      console.error(`${type} recording error`, err);
    }
  };

  const recordScreenRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const base64 = await blobToBase64(blob);
        localStorage.setItem('evidence_screen', JSON.stringify({ base64 }));
      };
      recorder.start();
      stream.getVideoTracks()[0].onended = () => recorder.stop();
    } catch (err) {
      console.error('screen recording error', err);
    }
  };

  const downloadEvidence = (type) => {
    const saved = localStorage.getItem(`evidence_${type}`);
    if (!saved) return alert("Not available or missing");
    const parsed = JSON.parse(saved);
    if (!parsed.base64) return alert("Base64 not found");
    const blobURL = `data:${type === 'audio' ? 'audio' : 'video'}/webm;base64,${parsed.base64}`;
    const a = document.createElement('a');
    a.href = blobURL;
    a.download = `${type}_${Date.now()}.webm`;
    a.click();
  };

  const getIcon = (cond) => {
    const c = cond.toLowerCase();
    if (c.includes('sun')) return '☀️';
    if (c.includes('cloudy')) return '⛅';
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

        <div style={{ marginTop: 10 }}>🌟 Tip: Stay safe and aware.</div>
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
    minHeight: '100vh'
  },
  header: {
    textAlign: 'center',
    marginBottom: 20
  },
  main: {
    background: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    padding: 20
  },
  temperature: {
    fontSize: 48,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10
  },
  tempText: {
    fontWeight: 300
  },
  icon: {
    fontSize: 40,
    cursor: 'pointer',
    userSelect: 'none'
  },
  download: {
    marginTop: 20,
    textAlign: 'center'
  },
  button: {
    margin: '4px 8px',
    padding: '8px 12px',
    background: '#fff',
    color: '#0984e3',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer'
  }
};

export default SilentSOS;
