import React, { useState, useRef, useEffect } from 'react';

// Watermark Utility Functions
const WatermarkUtil = {
  generateWatermarkId: () => {
    return `wm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  embedWatermark: (imageFile, watermarkId) => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        
        ctx.drawImage(img, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        const watermarkBinary = watermarkId.split('').map(char => 
          char.charCodeAt(0).toString(2).padStart(8, '0')
        ).join('');
        
        let bitIndex = 0;
        for (let i = 0; i < data.length && bitIndex < watermarkBinary.length; i += 4) {
          const bit = parseInt(watermarkBinary[bitIndex]);
          data[i] = (data[i] & 0xFE) | bit;
          bitIndex++;
        }
        
        const endMarker = '11111110';
        for (let i = 0; i < endMarker.length && bitIndex < data.length / 4; i++) {
          const pixelIndex = (bitIndex + watermarkBinary.length) * 4;
          if (pixelIndex < data.length) {
            const bit = parseInt(endMarker[i]);
            data[pixelIndex] = (data[pixelIndex] & 0xFE) | bit;
          }
        }
        
        ctx.putImageData(imageData, 0, 0);
        
        canvas.toBlob((blob) => {
          resolve({
            watermarkedImage: blob,
            watermarkId: watermarkId,
            originalSize: imageFile.size,
            watermarkedSize: blob.size
          });
        }, 'image/png');
      };
      
      img.onerror = reject;
      img.src = URL.createObjectURL(imageFile);
    });
  },

  extractWatermark: (imageFile) => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        let binaryString = '';
        for (let i = 0; i < data.length; i += 4) {
          binaryString += (data[i] & 1).toString();
        }
        
        let extractedText = '';
        for (let i = 0; i < binaryString.length; i += 8) {
          const byte = binaryString.substr(i, 8);
          if (byte.length === 8) {
            const charCode = parseInt(byte, 2);
            if (charCode === 254) break;
            if (charCode > 0) {
              extractedText += String.fromCharCode(charCode);
            }
          }
        }
        
        if (extractedText.startsWith('wm_')) {
          resolve(extractedText);
        } else {
          resolve(null);
        }
      };
      
      img.onerror = reject;
      img.src = URL.createObjectURL(imageFile);
    });
  },

  // Mock function to simulate tracking watermarked images across the internet
  trackImageUsage: async (watermarkId) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock data for demonstration
    const mockUsageData = [
      {
        id: 1,
        url: 'https://example-blog.com/post/123',
        title: 'Amazing Photography Blog',
        dateFound: '2025-06-28',
        status: 'Unauthorized',
        thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRkY2B0I5Ii8+CjwvZXQ+',
        description: 'Used in blog post without attribution'
      },
      {
        id: 2,
        url: 'https://social-media.com/user/456',
        title: 'Social Media Profile',
        dateFound: '2025-06-25',
        status: 'Authorized',
        thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjMTBCOTgxIi8+CjwvZXQ+',
        description: 'Properly credited usage'
      },
      {
        id: 3,
        url: 'https://marketplace.com/listing/789',
        title: 'Online Marketplace',
        dateFound: '2025-06-20',
        status: 'Unauthorized',
        thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRkY2B0I5Ii8+CjwvZXQ+',
        description: 'Commercial use without license'
      }
    ];
    
    return {
      watermarkId,
      totalUsages: mockUsageData.length,
      unauthorizedUsages: mockUsageData.filter(item => item.status === 'Unauthorized').length,
      usageDetails: mockUsageData
    };
  }
};

// Main App Component
const DigitalWatermarking = () => {
  const [currentView, setCurrentView] = useState('upload');
  const [originalImage, setOriginalImage] = useState(null);
  const [watermarkedImage, setWatermarkedImage] = useState(null);
  const [watermarkEnabled, setWatermarkEnabled] = useState(true);
  const [watermarkId, setWatermarkId] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [alertData, setAlertData] = useState(null);
  const [trackingData, setTrackingData] = useState(null);
  const [trackingImage, setTrackingImage] = useState(null);
  const fileInputRef = useRef(null);
  const trackingInputRef = useRef(null);

  const handleImageUpload = async (file) => {
    setOriginalImage(file);
    setWatermarkedImage(null);
    setWatermarkId(null);

    if (watermarkEnabled) {
      setProcessing(true);
      try {
        const id = WatermarkUtil.generateWatermarkId();
        const result = await WatermarkUtil.embedWatermark(file, id);
        setWatermarkedImage(result.watermarkedImage);
        setWatermarkId(result.watermarkId);
      } catch (error) {
        console.error('Protection embedding failed:', error);
        alert('Failed to add protection to your image');
      }
      setProcessing(false);
    }
  };

  const handleTrackingUpload = async (file) => {
    setTrackingImage(file);
    setTrackingData(null);
    setProcessing(true);
    
    try {
      const extractedId = await WatermarkUtil.extractWatermark(file);
      if (extractedId) {
        const trackingResult = await WatermarkUtil.trackImageUsage(extractedId);
        setTrackingData(trackingResult);
      } else {
        setAlertData({
          type: 'no-watermark',
          message: 'No watermark detected in this image'
        });
      }
    } catch (error) {
      console.error('Tracking failed:', error);
      alert('Unable to track this image');
    }
    setProcessing(false);
  };

  const handleDownload = () => {
    if (!watermarkedImage) return;
    
    const url = URL.createObjectURL(watermarkedImage);
    const link = document.createElement('a');
    link.href = url;
    link.download = `protected_${originalImage?.name || 'image'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #E6F3FF 0%, #F0E6FF 50%, #FFE6F3 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: '1rem',
      '@media (min-width: 768px)': {
        padding: '2rem'
      }
    },
    header: {
      textAlign: 'center',
      marginBottom: '2rem',
      padding: '2rem 1rem',
      background: 'rgba(255, 255, 255, 0.9)',
      borderRadius: '24px',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
    },
    title: {
      fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
      fontWeight: '700',
      background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      marginBottom: '0.5rem'
    },
    subtitle: {
      color: '#6B7280',
      fontSize: 'clamp(0.875rem, 2vw, 1.125rem)',
      fontWeight: '400'
    },
    tabContainer: {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: '2rem',
      gap: '0.5rem',
      flexWrap: 'wrap'
    },
    tab: {
      padding: '0.75rem 1.5rem',
      borderRadius: '50px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '0.875rem',
      fontWeight: '600',
      transition: 'all 0.3s ease',
      background: 'rgba(255, 255, 255, 0.7)',
      color: '#6B7280',
      backdropFilter: 'blur(10px)',
      '@media (max-width: 768px)': {
        padding: '0.5rem 1rem',
        fontSize: '0.75rem'
      }
    },
    activeTab: {
      background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
      color: 'white',
      boxShadow: '0 4px 16px rgba(139, 92, 246, 0.3)'
    },
    card: {
      background: 'rgba(255, 255, 255, 0.9)',
      borderRadius: '24px',
      padding: '2rem',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      maxWidth: '800px',
      margin: '0 auto',
      '@media (max-width: 768px)': {
        padding: '1.5rem',
        borderRadius: '20px'
      }
    },
    uploadArea: {
      border: '3px dashed #E5E7EB',
      borderRadius: '20px',
      padding: '3rem 2rem',
      textAlign: 'center',
      background: 'linear-gradient(135deg, #F8FAFF 0%, #F3E8FF 100%)',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      marginBottom: '1.5rem',
      '@media (max-width: 768px)': {
        padding: '2rem 1rem'
      }
    },
    uploadIcon: {
      fontSize: 'clamp(2rem, 6vw, 3rem)',
      marginBottom: '1rem'
    },
    uploadText: {
      fontSize: 'clamp(1rem, 3vw, 1.25rem)',
      fontWeight: '600',
      color: '#6B46C1',
      marginBottom: '0.5rem'
    },
    uploadSubtext: {
      color: '#9CA3AF',
      fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
      marginBottom: '1.5rem'
    },
    button: {
      background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
      color: 'white',
      border: 'none',
      padding: '0.875rem 2rem',
      borderRadius: '50px',
      cursor: 'pointer',
      fontSize: '1rem',
      fontWeight: '600',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 16px rgba(139, 92, 246, 0.3)',
      '@media (max-width: 768px)': {
        padding: '0.75rem 1.5rem',
        fontSize: '0.875rem'
      }
    },
    secondaryButton: {
      background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
      boxShadow: '0 4px 16px rgba(245, 158, 11, 0.3)'
    },
    cancelButton: {
      background: 'linear-gradient(135deg, #FF6B94 0%, #FF8FA3 100%)',
      boxShadow: '0 4px 16px rgba(255, 107, 148, 0.3)'
    },
    proceedButton: {
      background: 'linear-gradient(135deg, #06B6D4 0%, #0EA5E9 100%)',
      boxShadow: '0 4px 16px rgba(6, 182, 212, 0.3)'
    },
    toggle: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1.5rem',
      background: 'linear-gradient(135deg, #F8FAFF 0%, #F3E8FF 100%)',
      borderRadius: '16px',
      border: '1px solid rgba(139, 92, 246, 0.1)',
      marginBottom: '1.5rem'
    },
    toggleSwitch: {
      position: 'relative',
      width: '60px',
      height: '30px',
      background: watermarkEnabled 
        ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)' 
        : '#E5E7EB',
      borderRadius: '15px',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    toggleSlider: {
      position: 'absolute',
      top: '2px',
      left: watermarkEnabled ? '32px' : '2px',
      width: '26px',
      height: '26px',
      backgroundColor: 'white',
      borderRadius: '50%',
      transition: 'all 0.3s ease',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
    },
    imagePreview: {
      width: '100%',
      maxHeight: '400px',
      objectFit: 'contain',
      borderRadius: '16px',
      marginBottom: '1rem',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
    },
    trackingResults: {
      marginTop: '2rem'
    },
    usageItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      padding: '1rem',
      background: 'rgba(255, 255, 255, 0.7)',
      borderRadius: '12px',
      marginBottom: '0.75rem',
      border: '1px solid rgba(0, 0, 0, 0.05)',
      '@media (max-width: 768px)': {
        flexDirection: 'column',
        textAlign: 'center',
        gap: '0.75rem'
      }
    },
    statusBadge: {
      padding: '0.25rem 0.75rem',
      borderRadius: '20px',
      fontSize: '0.75rem',
      fontWeight: '600',
      color: 'white'
    },
    unauthorizedBadge: {
      background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)'
    },
    authorizedBadge: {
      background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
    },
    processing: {
      textAlign: 'center',
      padding: '3rem 2rem',
      color: '#8B5CF6',
      fontSize: '1.125rem',
      '@media (max-width: 768px)': {
        padding: '2rem 1rem'
      }
    },
    processingIcon: {
      fontSize: '3rem',
      marginBottom: '1rem',
      animation: 'spin 1s linear infinite'
    },
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    },
    modalContent: {
      background: 'white',
      borderRadius: '24px',
      padding: '2rem',
      maxWidth: '400px',
      width: '100%',
      textAlign: 'center',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '1rem',
      marginTop: '1rem'
    },
    buttonGroup: {
      display: 'flex',
      gap: '0.75rem',
      justifyContent: 'center',
      flexWrap: 'wrap',
      marginTop: '1.5rem'
    }
  };

  const UploadView = () => (
    <div style={styles.card}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem', color: '#374151' }}>
        🛡️ Watermark Protection
      </h2>
      
      <div style={styles.toggle}>
        <div>
          <div style={{ fontWeight: '600', color: '#374151' }}>Invisible Protection</div>
          <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>
            {watermarkEnabled ? 'Your image will be protected' : 'Protection disabled'}
          </div>
        </div>
        <div 
          style={styles.toggleSwitch}
          onClick={() => setWatermarkEnabled(!watermarkEnabled)}
        >
          <div style={styles.toggleSlider}></div>
        </div>
      </div>

      <div 
        style={styles.uploadArea}
        onClick={() => fileInputRef.current?.click()}
      >
        <div style={styles.uploadIcon}>📸</div>
        <div style={styles.uploadText}>Drop Image Here</div>
        <div style={styles.uploadSubtext}>-or-</div>
        <div style={styles.uploadSubtext}>Click to Browse</div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => e.target.files[0] && handleImageUpload(e.target.files[0])}
          style={{ display: 'none' }}
        />
      </div>

      {processing && (
        <div style={styles.processing}>
          <div style={styles.processingIcon}>⚡</div>
          <div>Adding protection...</div>
        </div>
      )}

      {originalImage && !processing && (
        <div>
          <img
            src={URL.createObjectURL(originalImage)}
            alt="Original"
            style={styles.imagePreview}
          />
          <div style={styles.buttonGroup}>
            <button style={styles.button} onClick={handleDownload}>
              📥 Download Protected
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const TrackingView = () => (
    <div style={styles.card}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem', color: '#374151' }}>
        🔍 Track Image Usage
      </h2>
      
      <div 
        style={styles.uploadArea}
        onClick={() => trackingInputRef.current?.click()}
      >
        <div style={styles.uploadIcon}>🔍</div>
        <div style={styles.uploadText}>Upload Image to Track</div>
        <div style={styles.uploadSubtext}>-or-</div>
        <div style={styles.uploadSubtext}>Click to Browse</div>
        <input
          ref={trackingInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => e.target.files[0] && handleTrackingUpload(e.target.files[0])}
          style={{ display: 'none' }}
        />
      </div>

      {processing && (
        <div style={styles.processing}>
          <div style={styles.processingIcon}>🔍</div>
          <div>Scanning for watermark...</div>
        </div>
      )}

      {trackingData && !processing && (
        <div style={styles.trackingResults}>
          <div style={{ 
            padding: '1.5rem', 
            background: 'linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%)', 
            borderRadius: '16px',
            marginBottom: '1.5rem',
            border: '1px solid rgba(34, 197, 94, 0.2)'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.75rem', color: '#059669' }}>
              📊 Usage Statistics
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#059669' }}>
                  {trackingData.totalUsages}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>Total Uses</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#DC2626' }}>
                  {trackingData.unauthorizedUsages}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>Unauthorized</div>
              </div>
            </div>
          </div>

          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#374151' }}>
            🌐 Found Locations
          </h3>
          
          {trackingData.usageDetails.map((usage) => (
            <div key={usage.id} style={styles.usageItem}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '8px',
                background: usage.status === 'Unauthorized' ? '#EF4444' : '#10B981',
                flexShrink: 0
              }}></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: '600', color: '#374151', marginBottom: '0.25rem' }}>
                  {usage.title}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.25rem' }}>
                  {usage.description}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>
                  Found: {usage.dateFound}
                </div>
              </div>
              <div style={{ flexShrink: 0 }}>
                <div style={{
                  ...styles.statusBadge,
                  ...(usage.status === 'Unauthorized' ? styles.unauthorizedBadge : styles.authorizedBadge)
                }}>
                  {usage.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
          .container { padding: 1rem !important; }
          .card { padding: 1.5rem !important; }
          .upload-area { padding: 2rem 1rem !important; }
        }
      `}</style>
      
      <div style={styles.header}>
        <h1 style={styles.title}>Image Protection</h1>
        <p style={styles.subtitle}>Invisible watermarks & usage tracking</p>
      </div>

      <div style={styles.tabContainer}>
        <button 
          style={{
            ...styles.tab,
            ...(currentView === 'upload' ? styles.activeTab : {})
          }}
          onClick={() => setCurrentView('upload')}
        >
          🛡️ Protect
        </button>
        <button 
          style={{
            ...styles.tab,
            ...(currentView === 'track' ? styles.activeTab : {})
          }}
          onClick={() => setCurrentView('track')}
        >
          🔍 Track Usage
        </button>
      </div>

      {currentView === 'upload' ? <UploadView /> : <TrackingView />}

      {alertData && (
        <div style={styles.modal} onClick={() => setAlertData(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
              {alertData.type === 'no-watermark' ? '❌' : '⚠️'}
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
              {alertData.type === 'no-watermark' ? 'No Watermark Found' : 'Alert'}
            </h3>
            <p style={{ color: '#6B7280', marginBottom: '1.5rem' }}>
              {alertData.message}
            </p>
            <button 
              style={styles.button}
              onClick={() => setAlertData(null)}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DigitalWatermarking;