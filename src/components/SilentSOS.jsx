import React, { useState, useEffect, useRef } from 'react';

// 🔐 Encryption function (used only for sensitive data)
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

const blobToBase64 = (blob) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(',')[1]);
    reader.readAsDataURL(blob);
  });
};

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
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'S') {
        triggerSOS();
      }
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        setDownloadVisible((v) => !v);
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
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const base64 = await blobToBase64(blob);
        localStorage.setItem('evidence_video', JSON.stringify({ base64 }));
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      setTimeout(() => recorder.stop(), 30000);
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
        const base64 = await blobToBase64(blob);
        localStorage.setItem('evidence_audio', JSON.stringify({ base64 }));
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      setTimeout(() => recorder.stop(), 60000);
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
        const base64 = await blobToBase64(blob);
        localStorage.setItem('evidence_screen', JSON.stringify({ base64 }));
      };
      recorder.start();
      stream.getVideoTracks()[0].onended = () => recorder.stop();
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
        const encrypted = await encryptData(data);
        localStorage.setItem(
          'evidence_location',
          JSON.stringify({
            encrypted: Array.from(encrypted.encrypted),
            iv: Array.from(encrypted.iv)
          })
        );
      },
      () => {},
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const downloadEvidence = (type) => {
    const saved = localStorage.getItem(`evidence_${type}`);
    if (!saved) return;
    const { base64 } = JSON.parse(saved);
    if (!base64) return alert('Not available or encrypted.');
    const link = document.createElement('a');
    link.href = `data:${type.includes('audio') ? 'audio/webm' : 'video/webm'};base64,${base64}`;
    link.download = `${type}_evidence_${Date.now()}.webm`;
    link.click();
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
      <h1>WeatherNow</h1>
      <div>{weather.location}</div>
      <div style={{ fontSize: '48px', cursor: 'pointer' }} onClick={handleCloudClick}>
        {getIcon(weather.condition)} {weather.temperature}°
      </div>
      <p>{weather.condition}</p>
      <p>Humidity: {weather.humidity}% | Wind: {weather.windSpeed} mph</p>

      {weather.forecast.map((d, i) => (
        <div key={i}>
          {d.day}: {getIcon(d.condition)} {d.high}°/{d.low}°
        </div>
      ))}

      <p>🌟 Great day for outdoor activities!</p>

      {downloadVisible && (
        <div style={{ marginTop: 20 }}>
          <h3>📥 Download Evidence</h3>
          {['video', 'audio', 'screen'].map((t) => (
            <button key={t} onClick={() => downloadEvidence(t)} style={{ margin: 4 }}>
              Download {t}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SilentSOS;
