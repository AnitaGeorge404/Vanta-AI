import React, { useState, useEffect, useRef } from 'react';
// CSS is embedded below

// Crypto utilities for encryption
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
    { name: 'AES-GCM', iv: iv },
    key,
    encoder.encode(typeof data === 'string' ? data : JSON.stringify(data))
  );
  
  return {
    encrypted: new Uint8Array(encrypted),
    iv: iv
  };
};

// Firebase stub - replace with actual config
const uploadToFirebase = async (encryptedData, metadata) => {
  console.log('🔒 Encrypted evidence ready for upload:', {
    size: encryptedData.encrypted.length,
    timestamp: metadata.timestamp,
    location: metadata.location
  });
  
  // TODO: Replace with actual Firebase upload
  // const storage = getStorage();
  // const storageRef = ref(storage, `evidence/${Date.now()}`);
  // await uploadBytes(storageRef, encryptedData);
  
  return Promise.resolve({ success: true, id: Date.now() });
};

const SilentSOS = () => {
  // Weather UI state
  const [weather, setWeather] = useState({
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

  // SOS state
  const [sosActive, setSosActive] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [recordings, setRecordings] = useState({});
  
  const mediaRecorderRef = useRef(null);
  const audioRecorderRef = useRef(null);
  const screenRecorderRef = useRef(null);
  const clickTimerRef = useRef(null);

  // Debug mode (set to false for production)
  const DEBUG_MODE = false;

  const debugLog = (...args) => {
    if (DEBUG_MODE) {
      console.log('🕵️ SOS Debug:', ...args);
    }
  };

  // Handle triple-click trigger on cloud icon
  const handleCloudClick = () => {
    setClickCount(prev => prev + 1);
    
    // Reset timer
    clearTimeout(clickTimerRef.current);
    clickTimerRef.current = setTimeout(() => {
      setClickCount(0);
    }, 3000);

    // Check for triple click
    if (clickCount + 1 >= 3) {
      triggerSOS();
      setClickCount(0);
    }
  };

  // Secret keyboard trigger
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'S') {
        event.preventDefault();
        triggerSOS();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Main SOS trigger function
  const triggerSOS = async () => {
    if (sosActive) return;
    
    debugLog('SOS Triggered - Starting stealth evidence collection');
    setSosActive(true);

    try {
      // Collect all evidence simultaneously
      await Promise.all([
        startVideoRecording(),
        startAudioRecording(),
        startScreenRecording(),
        captureLocation()
      ]);
      
      debugLog('All recording streams initiated');
    } catch (error) {
      debugLog('Error during SOS trigger:', error);
    }
  };

  // Video recording
  const startVideoRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      const mediaRecorder = new MediaRecorder(stream);
      const chunks = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        await processAndUpload(blob, 'video');
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      
      // Auto-stop after 30 seconds to avoid suspicion
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        }
      }, 30000);
      
      debugLog('Video recording started');
    } catch (error) {
      debugLog('Video recording failed:', error);
    }
  };

  // Audio recording
  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks = [];
      
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };
      
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        await processAndUpload(blob, 'audio');
        stream.getTracks().forEach(track => track.stop());
      };
      
      audioRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        }
      }, 60000); // 1 minute for audio
      
      debugLog('Audio recording started');
    } catch (error) {
      debugLog('Audio recording failed:', error);
    }
  };

  // Screen recording
  const startScreenRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ 
        video: true, 
        audio: true 
      });
      
      const mediaRecorder = new MediaRecorder(stream);
      const chunks = [];
      
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };
      
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        await processAndUpload(blob, 'screen');
      };
      
      screenRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      
      // Stop when user stops sharing
      stream.getVideoTracks()[0].onended = () => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        }
      };
      
      debugLog('Screen recording started');
    } catch (error) {
      debugLog('Screen recording failed (user may have denied):', error);
    }
  };

  // Location capture
  const captureLocation = () => {
    if (!navigator.geolocation) {
      debugLog('Geolocation not supported');
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const locationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date().toISOString()
        };
        
        await processAndUpload(locationData, 'location');
        debugLog('Location captured:', locationData);
      },
      (error) => {
        debugLog('Location capture failed:', error);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Process and upload evidence
  const processAndUpload = async (data, type) => {
    try {
      const metadata = {
        type,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      };
      
      // Convert blob to arrayBuffer for encryption
      let dataToEncrypt;
      if (data instanceof Blob) {
        dataToEncrypt = await data.arrayBuffer();
      } else {
        dataToEncrypt = data;
      }
      
      // Encrypt the data
      const encrypted = await encryptData(dataToEncrypt);
      
      // Upload to secure storage
      const uploadResult = await uploadToFirebase(encrypted, metadata);
      
      debugLog(`${type} evidence processed and uploaded:`, uploadResult);
      
      setRecordings(prev => ({
        ...prev,
        [type]: {
          encrypted,
          metadata,
          uploadResult
        }
      }));
      
    } catch (error) {
      debugLog(`Failed to process ${type} evidence:`, error);
    }
  };

  // Weather icons based on condition
  const getWeatherIcon = (condition) => {
    switch (condition.toLowerCase()) {
      case 'sunny':
        return '☀️';
      case 'partly cloudy':
        return '⛅';
      case 'cloudy':
        return '☁️';
      case 'rainy':
        return '🌧️';
      default:
        return '⛅';
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
              {getWeatherIcon(weather.condition)}
            </div>
          </div>
          <div className="weather-details">
            <div className="condition">{weather.condition}</div>
            <div className="stats">
              <div className="stat">
                <span className="label">Humidity</span>
                <span className="value">{weather.humidity}%</span>
              </div>
              <div className="stat">
                <span className="label">Wind</span>
                <span className="value">{weather.windSpeed} mph</span>
              </div>
            </div>
          </div>
        </div>

        <div className="forecast">
          <h3>3-Day Forecast</h3>
          <div className="forecast-list">
            {weather.forecast.map((day, index) => (
              <div key={index} className="forecast-item">
                <div className="day">{day.day}</div>
                <div className="forecast-icon">
                  {getWeatherIcon(day.condition)}
                </div>
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
      </main>

      <footer className="weather-footer">
        <div className="last-updated">
          Last updated: {new Date().toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </footer>

      {/* Hidden status indicator for development */}
      {DEBUG_MODE && sosActive && (
        <div className="debug-indicator">
          🚨 SOS Active - Evidence Collection in Progress
        </div>
      )}
    </div>
  );
};

// Inline CSS styles
const styles = `
  .weather-app {
    max-width: 400px;
    margin: 0 auto;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
    min-height: 100vh;
    color: white;
    position: relative;
  }

  .weather-header {
    text-align: center;
    padding: 20px;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
  }

  .weather-header h1 {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
  }

  .location {
    margin-top: 5px;
    opacity: 0.8;
    font-size: 14px;
  }

  .weather-main {
    padding: 20px;
  }

  .current-weather {
    background: rgba(255, 255, 255, 0.15);
    border-radius: 20px;
    padding: 30px 20px;
    text-align: center;
    margin-bottom: 20px;
    backdrop-filter: blur(10px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  }

  .temperature {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;
    margin-bottom: 20px;
  }

  .temp-value {
    font-size: 64px;
    font-weight: 300;
    line-height: 1;
  }

  .weather-icon {
    font-size: 48px;
    transition: transform 0.2s ease;
    user-select: none;
  }

  .weather-icon:hover {
    transform: scale(1.1);
  }

  .weather-icon:active {
    transform: scale(0.95);
  }

  .condition {
    font-size: 18px;
    margin-bottom: 20px;
    opacity: 0.9;
  }

  .stats {
    display: flex;
    justify-content: space-around;
  }

  .stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
  }

  .stat .label {
    font-size: 12px;
    opacity: 0.7;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .stat .value {
    font-size: 16px;
    font-weight: 600;
  }

  .forecast {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 15px;
    padding: 20px;
    margin-bottom: 20px;
    backdrop-filter: blur(10px);
  }

  .forecast h3 {
    margin: 0 0 15px 0;
    font-size: 16px;
    font-weight: 600;
  }

  .forecast-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .forecast-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .forecast-item:last-child {
    border-bottom: none;
  }

  .day {
    font-weight: 500;
    min-width: 80px;
  }

  .forecast-icon {
    font-size: 24px;
    margin: 0 15px;
  }

  .temps {
    display: flex;
    gap: 10px;
    min-width: 60px;
    justify-content: flex-end;
  }

  .high {
    font-weight: 600;
  }

  .low {
    opacity: 0.7;
  }

  .weather-tips {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 15px;
    padding: 20px;
    margin-bottom: 20px;
    backdrop-filter: blur(10px);
  }

  .weather-tips h3 {
    margin: 0 0 15px 0;
    font-size: 16px;
    font-weight: 600;
  }

  .tips-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .tip {
    font-size: 14px;
    opacity: 0.9;
    padding: 8px 0;
  }

  .weather-footer {
    text-align: center;
    padding: 20px;
    opacity: 0.7;
    font-size: 12px;
  }

  .debug-indicator {
    position: fixed;
    top: 10px;
    left: 10px;
    background: rgba(255, 0, 0, 0.8);
    color: white;
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 12px;
    z-index: 1000;
    backdrop-filter: blur(10px);
  }

  /* Responsive design */
  @media (max-width: 480px) {
    .weather-app {
      max-width: 100%;
    }

    .temperature {
      flex-direction: column;
      gap: 10px;
    }

    .temp-value {
      font-size: 48px;
    }

    .weather-icon {
      font-size: 36px;
    }

    .stats {
      gap: 20px;
    }
  }

  /* PWA optimizations */
  @media (display-mode: standalone) {
    .weather-app {
      padding-top: env(safe-area-inset-top);
      padding-bottom: env(safe-area-inset-bottom);
    }
  }

  /* Subtle loading animations */
  .current-weather, .forecast, .weather-tips {
    animation: fadeInUp 0.6s ease-out;
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

export default SilentSOS;