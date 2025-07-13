import React, { useState, useEffect, useRef } from 'react';

// -- Crypto helpers --
const bufferToBase64 = (buffer) => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

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
    data
  );
  return {
    encrypted: new Uint8Array(encrypted),
    iv
  };
};

// -- Local storage uploader --
const saveToLocalStorage = async (encryptedData, metadata) => {
  const id = `evidence-${metadata.type}-${Date.now()}`;
  const payload = {
    metadata,
    iv: bufferToBase64(encryptedData.iv),
    encrypted: bufferToBase64(encryptedData.encrypted)
  };
  localStorage.setItem(id, JSON.stringify(payload));
  return { success: true, id };
};

const SilentSOS = () => {
  const [clickCount, setClickCount] = useState(0);
  const [sosActive, setSosActive] = useState(false);
  const [error, setError] = useState('');
  const clickTimerRef = useRef(null);

  // Triple click triggers SOS
  const handleCloudClick = () => {
    setClickCount(prev => prev + 1);
    clearTimeout(clickTimerRef.current);
    clickTimerRef.current = setTimeout(() => setClickCount(0), 3000);
    if (clickCount + 1 >= 3) {
      triggerSOS();
      setClickCount(0);
    }
  };

  // Keyboard shortcut: Ctrl+Shift+S triggers SOS
  useEffect(() => {
    const keyHandler = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        triggerSOS();
      }
    };
    window.addEventListener('keydown', keyHandler);
    return () => window.removeEventListener('keydown', keyHandler);
  }, []);

  // Main SOS trigger
  const triggerSOS = async () => {
    if (sosActive) return;
    setSosActive(true);
    setError('');
    try {
      await Promise.all([
        startVideoRecording(),
        startAudioRecording(),
        startScreenRecording(),
        captureLocation()
      ]);
    } catch (e) {
      setError('SOS Error: ' + e.message);
      setSosActive(false);
    }
  };

  // Video recording
  const startVideoRecording = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasVideo = devices.some(d => d.kind === 'videoinput');
      if (!hasVideo) {
        setError('No camera found.');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      const recorder = new window.MediaRecorder(stream);
      const chunks = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        await processAndStore(blob, 'video');
        stream.getTracks().forEach(t => t.stop());
      };
      recorder.start();
      setTimeout(() => recorder.state === 'recording' && recorder.stop(), 30000);
    } catch (e) {
      setError('Video recording failed: ' + e.message);
    }
  };

  // Audio recording
  const startAudioRecording = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasAudio = devices.some(d => d.kind === 'audioinput');
      if (!hasAudio) {
        setError('No microphone found.');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new window.MediaRecorder(stream);
      const chunks = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        await processAndStore(blob, 'audio');
        stream.getTracks().forEach(t => t.stop());
      };
      recorder.start();
      setTimeout(() => recorder.state === 'recording' && recorder.stop(), 60000);
    } catch (e) {
      setError('Audio recording failed: ' + e.message);
    }
  };

  // Screen recording
  const startScreenRecording = async () => {
    try {
      if (!navigator.mediaDevices.getDisplayMedia) {
        setError('Screen recording not supported in this browser.');
        return;
      }
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      const recorder = new window.MediaRecorder(stream);
      const chunks = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        await processAndStore(blob, 'screen');
        stream.getTracks().forEach(t => t.stop());
      };
      recorder.start();
      stream.getVideoTracks()[0].onended = () => {
        recorder.state === 'recording' && recorder.stop();
      };
    } catch (e) {
      setError('Screen recording denied: ' + e.message);
    }
  };

  // Location capture
  const captureLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const locationData = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: new Date().toISOString()
        };
        await processAndStore(locationData, 'location');
      },
      (err) => setError('Location error: ' + err.message),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Encrypt and store evidence
  const processAndStore = async (data, type) => {
    const metadata = {
      type,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    let buffer;
    if (data instanceof Blob) {
      buffer = await data.arrayBuffer();
    } else if (typeof data === 'object') {
      buffer = new TextEncoder().encode(JSON.stringify(data));
    } else if (typeof data === 'string') {
      buffer = new TextEncoder().encode(data);
    } else {
      buffer = data;
    }
    const encrypted = await encryptData(buffer);
    await saveToLocalStorage(encrypted, metadata);
  };

  return (
    <div>
      <div style={{ fontSize: 40, cursor: 'pointer' }} onClick={handleCloudClick} title="Triple-click or press Ctrl+Shift+S for SOS">
        ⛅
      </div>
      <div style={{ marginTop: 10 }}>
        <span>Triple-click the icon or press <b>Ctrl+Shift+S</b> to activate Silent SOS.</span>
      </div>
      {sosActive && <div style={{ color: 'red', marginTop: 20 }}>SOS Activated! Evidence is being recorded and stored.</div>}
      {error && <div style={{ color: 'orange', marginTop: 20 }}>{error}</div>}
    </div>
  );
};

export default SilentSOS;
