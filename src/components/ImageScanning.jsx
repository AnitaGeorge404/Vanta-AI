import React, { useState, useRef } from 'react';
import { Upload, Link, Search, Shield, AlertTriangle, CheckCircle, Eye, Image, Video, Hash, Scan } from 'lucide-react';

const AIScanner = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [files, setFiles] = useState([]);
  const [scanUrl, setScanUrl] = useState('');
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState(null);
  const [scanProgress, setScanProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleFileUpload = (event) => {
    const selectedFiles = Array.from(event.target.files);
    setFiles(selectedFiles);
    setResults(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles(droppedFiles);
    setResults(null);
  };

  const simulateScanning = () => {
    setScanning(true);
    setScanProgress(0);
    setResults(null);

    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setScanning(false);
          
          // Simulate scan results
          const mockResults = {
            ganFingerprint: {
              status: 'clean',
              confidence: 0.92,
              details: 'No GAN artifacts detected'
            },
            facialDistortion: {
              status: 'suspicious',
              confidence: 0.78,
              details: 'Minor facial inconsistencies detected'
            },
            reverseImageSearch: {
              status: 'found',
              matches: 3,
              details: 'Found 3 similar images online'
            },
            hashMatching: {
              status: 'clean',
              matches: 0,
              details: 'No hash matches in database'
            },
            overallRisk: 'medium'
          };
          
          setResults(mockResults);
          return 100;
        }
        return prev + 2;
      });
    }, 50);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'clean': return '#10b981';
      case 'suspicious': return '#f59e0b';
      case 'found': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'clean': return <CheckCircle size={20} />;
      case 'suspicious': return <AlertTriangle size={20} />;
      case 'found': return <AlertTriangle size={20} />;
      default: return <Shield size={20} />;
    }
  };

  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh'
    },
    card: {
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      borderRadius: '16px',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
      padding: '30px',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    },
    header: {
      textAlign: 'center',
      marginBottom: '30px'
    },
    title: {
      fontSize: '2.5rem',
      fontWeight: '700',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      marginBottom: '10px'
    },
    subtitle: {
      color: '#6b7280',
      fontSize: '1.1rem',
      marginBottom: '0'
    },
    tabContainer: {
      display: 'flex',
      gap: '10px',
      marginBottom: '30px',
      background: '#f8fafc',
      padding: '5px',
      borderRadius: '12px'
    },
    tab: {
      flex: 1,
      padding: '12px 20px',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '1rem',
      fontWeight: '500',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px'
    },
    tabActive: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      transform: 'translateY(-2px)',
      boxShadow: '0 5px 15px rgba(102, 126, 234, 0.3)'
    },
    tabInactive: {
      background: 'transparent',
      color: '#6b7280'
    },
    uploadArea: {
      border: '2px dashed #d1d5db',
      borderRadius: '12px',
      padding: '40px',
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      background: 'linear-gradient(45deg, #f8fafc 0%, #e2e8f0 100%)'
    },
    uploadAreaActive: {
      borderColor: '#667eea',
      background: 'linear-gradient(45deg, #eff6ff 0%, #dbeafe 100%)',
      transform: 'scale(1.02)'
    },
    uploadIcon: {
      fontSize: '3rem',
      color: '#667eea',
      marginBottom: '20px'
    },
    uploadText: {
      fontSize: '1.2rem',
      color: '#374151',
      fontWeight: '500',
      marginBottom: '10px'
    },
    uploadSubtext: {
      color: '#6b7280',
      fontSize: '0.9rem'
    },
    urlInput: {
      width: '100%',
      padding: '15px',
      border: '2px solid #e5e7eb',
      borderRadius: '12px',
      fontSize: '1rem',
      outline: 'none',
      transition: 'border-color 0.3s ease',
      marginBottom: '20px'
    },
    urlInputFocus: {
      borderColor: '#667eea'
    },
    scanButton: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      border: 'none',
      padding: '15px 30px',
      borderRadius: '12px',
      fontSize: '1.1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      width: '100%',
      justifyContent: 'center'
    },
    scanButtonHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 10px 25px rgba(102, 126, 234, 0.3)'
    },
    scanButtonDisabled: {
      background: '#9ca3af',
      cursor: 'not-allowed'
    },
    progressBar: {
      width: '100%',
      height: '8px',
      background: '#e5e7eb',
      borderRadius: '4px',
      overflow: 'hidden',
      marginBottom: '20px'
    },
    progressFill: {
      height: '100%',
      background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
      transition: 'width 0.3s ease',
      borderRadius: '4px'
    },
    resultsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '20px',
      marginTop: '30px'
    },
    resultCard: {
      background: '#f8fafc',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      padding: '20px',
      transition: 'all 0.3s ease'
    },
    resultCardHover: {
      transform: 'translateY(-5px)',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
    },
    resultHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      marginBottom: '15px'
    },
    resultTitle: {
      fontSize: '1.1rem',
      fontWeight: '600',
      color: '#374151'
    },
    resultStatus: {
      display: 'flex',
      alignItems: 'center',
      gap: '5px',
      fontSize: '0.9rem',
      fontWeight: '500',
      marginBottom: '10px'
    },
    confidenceBar: {
      width: '100%',
      height: '6px',
      background: '#e5e7eb',
      borderRadius: '3px',
      overflow: 'hidden',
      marginBottom: '10px'
    },
    confidenceFill: {
      height: '100%',
      borderRadius: '3px',
      transition: 'width 0.5s ease'
    },
    resultDetails: {
      color: '#6b7280',
      fontSize: '0.9rem',
      lineHeight: '1.5'
    },
    fileList: {
      marginTop: '20px'
    },
    fileItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '10px',
      background: '#f8fafc',
      borderRadius: '8px',
      marginBottom: '10px'
    },
    riskBadge: {
      display: 'inline-block',
      padding: '5px 15px',
      borderRadius: '20px',
      fontSize: '0.8rem',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    riskLow: {
      background: '#d1fae5',
      color: '#065f46'
    },
    riskMedium: {
      background: '#fef3c7',
      color: '#92400e'
    },
    riskHigh: {
      background: '#fee2e2',
      color: '#991b1b'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>AI Content Scanner</h1>
          <p style={styles.subtitle}>
            Advanced detection system for deepfakes, manipulated media, and unauthorized content
          </p>
        </div>

        <div style={styles.tabContainer}>
          <button
            style={{
              ...styles.tab,
              ...(activeTab === 'upload' ? styles.tabActive : styles.tabInactive)
            }}
            onClick={() => setActiveTab('upload')}
          >
            <Upload size={20} />
            Upload Files
          </button>
          <button
            style={{
              ...styles.tab,
              ...(activeTab === 'url' ? styles.tabActive : styles.tabInactive)
            }}
            onClick={() => setActiveTab('url')}
          >
            <Link size={20} />
            Scan URL
          </button>
        </div>

        {activeTab === 'upload' && (
          <div>
            <div
              style={{
                ...styles.uploadArea,
                ...(files.length > 0 ? styles.uploadAreaActive : {})
              }}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div style={styles.uploadIcon}>
                <Upload size={60} />
              </div>
              <div style={styles.uploadText}>
                Drag & drop files here or click to browse
              </div>
              <div style={styles.uploadSubtext}>
                Supports images (JPG, PNG, GIF) and videos (MP4, MOV, AVI)
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </div>

            {files.length > 0 && (
              <div style={styles.fileList}>
                {files.map((file, index) => (
                  <div key={index} style={styles.fileItem}>
                    {file.type.startsWith('image/') ? <Image size={20} /> : <Video size={20} />}
                    <span>{file.name}</span>
                    <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'url' && (
          <div>
            <input
              type="url"
              placeholder="Enter image or video URL to scan..."
              value={scanUrl}
              onChange={(e) => setScanUrl(e.target.value)}
              style={styles.urlInput}
            />
          </div>
        )}

        {scanning && (
          <div>
            <div style={styles.progressBar}>
              <div 
                style={{
                  ...styles.progressFill,
                  width: `${scanProgress}%`
                }}
              />
            </div>
            <p style={{ textAlign: 'center', color: '#6b7280' }}>
              Scanning... {scanProgress}%
            </p>
          </div>
        )}

        <button
          style={{
            ...styles.scanButton,
            ...(scanning ? styles.scanButtonDisabled : {})
          }}
          onClick={simulateScanning}
          disabled={scanning || (activeTab === 'upload' && files.length === 0) || (activeTab === 'url' && !scanUrl)}
        >
          {scanning ? <Scan className="animate-spin" size={20} /> : <Search size={20} />}
          {scanning ? 'Scanning...' : 'Start Scan'}
        </button>

        {results && (
          <div>
            <div style={{ textAlign: 'center', marginTop: '30px', marginBottom: '20px' }}>
              <h3 style={{ color: '#374151', marginBottom: '10px' }}>Scan Results</h3>
              <span style={{
                ...styles.riskBadge,
                ...(results.overallRisk === 'low' ? styles.riskLow :
                   results.overallRisk === 'medium' ? styles.riskMedium : styles.riskHigh)
              }}>
                {results.overallRisk} Risk
              </span>
            </div>

            <div style={styles.resultsGrid}>
              <div style={styles.resultCard}>
                <div style={styles.resultHeader}>
                  <Eye size={24} style={{ color: '#667eea' }} />
                  <div style={styles.resultTitle}>GAN Fingerprinting</div>
                </div>
                <div style={{
                  ...styles.resultStatus,
                  color: getStatusColor(results.ganFingerprint.status)
                }}>
                  {getStatusIcon(results.ganFingerprint.status)}
                  {results.ganFingerprint.status.toUpperCase()}
                </div>
                <div style={styles.confidenceBar}>
                  <div style={{
                    ...styles.confidenceFill,
                    width: `${results.ganFingerprint.confidence * 100}%`,
                    background: getStatusColor(results.ganFingerprint.status)
                  }} />
                </div>
                <div style={styles.resultDetails}>
                  Confidence: {(results.ganFingerprint.confidence * 100).toFixed(1)}%
                  <br />
                  {results.ganFingerprint.details}
                </div>
              </div>

              <div style={styles.resultCard}>
                <div style={styles.resultHeader}>
                  <Shield size={24} style={{ color: '#667eea' }} />
                  <div style={styles.resultTitle}>Facial Analysis</div>
                </div>
                <div style={{
                  ...styles.resultStatus,
                  color: getStatusColor(results.facialDistortion.status)
                }}>
                  {getStatusIcon(results.facialDistortion.status)}
                  {results.facialDistortion.status.toUpperCase()}
                </div>
                <div style={styles.confidenceBar}>
                  <div style={{
                    ...styles.confidenceFill,
                    width: `${results.facialDistortion.confidence * 100}%`,
                    background: getStatusColor(results.facialDistortion.status)
                  }} />
                </div>
                <div style={styles.resultDetails}>
                  Confidence: {(results.facialDistortion.confidence * 100).toFixed(1)}%
                  <br />
                  {results.facialDistortion.details}
                </div>
              </div>

              <div style={styles.resultCard}>
                <div style={styles.resultHeader}>
                  <Search size={24} style={{ color: '#667eea' }} />
                  <div style={styles.resultTitle}>Reverse Image Search</div>
                </div>
                <div style={{
                  ...styles.resultStatus,
                  color: getStatusColor(results.reverseImageSearch.status)
                }}>
                  {getStatusIcon(results.reverseImageSearch.status)}
                  {results.reverseImageSearch.matches} MATCHES
                </div>
                <div style={styles.resultDetails}>
                  {results.reverseImageSearch.details}
                </div>
              </div>

              <div style={styles.resultCard}>
                <div style={styles.resultHeader}>
                  <Hash size={24} style={{ color: '#667eea' }} />
                  <div style={styles.resultTitle}>Hash Matching</div>
                </div>
                <div style={{
                  ...styles.resultStatus,
                  color: getStatusColor(results.hashMatching.status)
                }}>
                  {getStatusIcon(results.hashMatching.status)}
                  {results.hashMatching.status.toUpperCase()}
                </div>
                <div style={styles.resultDetails}>
                  Database matches: {results.hashMatching.matches}
                  <br />
                  {results.hashMatching.details}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIScanner;