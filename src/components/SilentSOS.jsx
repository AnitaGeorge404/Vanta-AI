import React, { useState, useEffect, useRef } from 'react';

const encryptData = async (data, password = 'emergency-key-2024') => {
  const encoder = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  const key = await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('salt'),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );

  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(typeof data === 'string' ? data : JSON.stringify(data))
  );

  return {
    encrypted: new Uint8Array(encrypted),
    iv
  };
};

const SilentSOS = () => {
  const [weather] = useState({
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
  });

  const [clickCount, setClickCount] = useState(0);
  const clickTimerRef = useRef(null);
  const [downloadVisible, setDownloadVisible] = useState(false);

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
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        triggerSOS();
      }
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setDownloadVisible((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const triggerSOS = async () => {
    await Promise.all([
      startVideoRecording(),
      startAudioRecording(),
      startScreenRecording(),
      captureLocation()
    ]);
  };

  const startVideoRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        await processAndSave(blob, 'video');
        stream.getTracks().forEach((t) => t.stop());
      };

      recorder.start();
      setTimeout(() => recorder.state === 'recording' && recorder.stop(), 30000);
    } catch {}
  };

  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);

      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        await processAndSave(blob, 'audio');
        stream.getTracks().forEach((t) => t.stop());
      };

      recorder.start();
      setTimeout(() => recorder.state === 'recording' && recorder.stop(), 60000);
    } catch {}
  };

  const startScreenRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);

      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        await processAndSave(blob, 'screen');
      };

      recorder.start();
      stream.getVideoTracks()[0].onended = () => {
        if (recorder.state === 'recording') recorder.stop();
      };
    } catch {}
  };

  const captureLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const data = {
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          acc: pos.coords.accuracy,
          timestamp: new Date().toISOString()
        };
        await processAndSave(data, 'location');
      },
      () => {},
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const processAndSave = async (data, type) => {
    const metadata = {
      type,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    let buffer = data instanceof Blob ? await data.arrayBuffer() : JSON.stringify(data);
    const encrypted = await encryptData(buffer);

    const saveData = {
      metadata,
      encrypted: Array.from(encrypted.encrypted),
      iv: Array.from(encrypted.iv)
    };

    localStorage.setItem(`evidence_${type}`, JSON.stringify(saveData));
  };

  const downloadEvidence = (type) => {
    const saved = localStorage.getItem(`evidence_${type}`);
    if (!saved) return;
    const parsed = JSON.parse(saved);
    const encryptedBytes = new Uint8Array(parsed.encrypted);
    const blob = new Blob([encryptedBytes], {
      type: type === 'audio' ? 'audio/webm' : 'video/webm'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${type}_evidence_${Date.now()}.webm`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getIcon = (condition) => {
    switch (condition.toLowerCase()) {
      case 'sunny': return '☀️';
      case 'partly cloudy': return '⛅';
      case 'cloudy': return '☁️';
      case 'rainy': return '🌧️';
      default: return '⛅';
    }
  };

  return (
    <div className="weather-app">
      <header className="weather-header">
        <h1>WeatherNow</h1>
        <div className="location">{weather.location}</div>
      </header>

      <main className="weather-main">
        <div className="current-weather">
          <div className="temperature">
            <span className="temp-value">{weather.temperature}°</span>
            <div
              className="weather-icon"
              onClick={handleCloudClick}
              style={{ cursor: 'pointer' }}
            >
              {getIcon(weather.condition)}
            </div>
          </div>
          <div className="weather-details">
            <div className="condition">{weather.condition}</div>
            <div className="stats">
              <div className="stat"><span className="label">Humidity</span><span className="value">{weather.humidity}%</span></div>
              <div className="stat"><span className="label">Wind</span><span className="value">{weather.windSpeed} mph</span></div>
            </div>
          </div>
        </div>

        <div className="forecast">
          <h3>3-Day Forecast</h3>
          <div className="forecast-list">
            {weather.forecast.map((day, i) => (
              <div key={i} className="forecast-item">
                <div className="day">{day.day}</div>
                <div className="forecast-icon">{getIcon(day.condition)}</div>
                <div className="temps">
                  <span className="high">{day.high}°</span>
                  <span className="low">{day.low}°</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="weather-tips">
          <h3>Weather Tips</h3>
          <div className="tips-list">
            <div className="tip">🌟 Great day for outdoor activities!</div>
            <div className="tip">🧥 Light jacket recommended for evening</div>
            <div className="tip">☔ Keep an umbrella handy this week</div>
          </div>
        </div>

        {downloadVisible && (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <h3>📥 Download Evidence</h3>
            {['video', 'audio', 'screen'].map((type) => (
              <button
                key={type}
                onClick={() => downloadEvidence(type)}
                style={{
                  margin: '5px',
                  padding: '10px 15px',
                  background: '#fff',
                  color: '#0984e3',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Download {type}
              </button>
            ))}
          </div>
        )}
      </main>

      <footer className="weather-footer">
        Last updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </footer>
    </div>
  );
};

// Inject styles
const styles = `/* full weather-app CSS pasted here from earlier */`;
const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

export default SilentSOS;
