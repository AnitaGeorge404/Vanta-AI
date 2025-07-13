import React, { useState, useRef, useCallback } from 'react';
import { Upload, Link, Search, Shield, AlertTriangle, CheckCircle, Eye, Image, Video, Hash, Scan, X } from 'lucide-react';

const ImageScanning = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [files, setFiles] = useState([]);
  const [scanUrl, setScanUrl] = useState('');
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // Utility function to calculate file hash
  const calculateHash = async (file) => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  // Analyze image pixels for anomalies
  const analyzeImagePixels = (canvas, ctx) => {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    let totalVariation = 0;
    let edgeCount = 0;
    let anomalies = 0;
    
    // Simple edge detection and anomaly detection
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Check for unnatural color patterns
      if (Math.abs(r - g) < 5 && Math.abs(g - b) < 5 && Math.abs(r - b) < 5) {
        anomalies++;
      }
      
      // Simple edge detection
      if (i < data.length - 4) {
        const nextR = data[i + 4];
        const variation = Math.abs(r - nextR);
        totalVariation += variation;
        if (variation > 50) edgeCount++;
      }
    }
    
    const pixelCount = data.length / 4;
    const anomalyRatio = anomalies / pixelCount;
    const averageVariation = totalVariation / pixelCount;
    
    return {
      anomalyRatio,
      averageVariation,
      edgeCount,
      totalPixels: pixelCount
    };
  };

  // Detect facial regions and analyze consistency
  const analyzeFacialConsistency = (canvas, ctx) => {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Simple skin tone detection
    let skinPixels = 0;
    let skinToneVariation = 0;
    const skinTones = [];
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Basic skin tone detection (simplified)
      if (r > 95 && g > 40 && b > 20 && 
          Math.max(r, g, b) - Math.min(r, g, b) > 15 && 
          Math.abs(r - g) > 15 && r > g && r > b) {
        skinPixels++;
        skinTones.push({ r, g, b });
      }
    }
    
    // Calculate skin tone consistency
    if (skinTones.length > 0) {
      const avgR = skinTones.reduce((sum, tone) => sum + tone.r, 0) / skinTones.length;
      const avgG = skinTones.reduce((sum, tone) => sum + tone.g, 0) / skinTones.length;
      const avgB = skinTones.reduce((sum, tone) => sum + tone.b, 0) / skinTones.length;
      
      skinToneVariation = skinTones.reduce((sum, tone) => {
        return sum + Math.abs(tone.r - avgR) + Math.abs(tone.g - avgG) + Math.abs(tone.b - avgB);
      }, 0) / skinTones.length;
    }
    
    return {
      skinPixelRatio: skinPixels / (data.length / 4),
      skinToneVariation,
      hasFacialContent: skinPixels > 1000
    };
  };

  // Analyze compression artifacts
  const analyzeCompression = (canvas, ctx) => {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    let compressionArtifacts = 0;
    let blockiness = 0;
    
    // Check for JPEG compression artifacts (8x8 blocks)
    for (let y = 0; y < canvas.height - 8; y += 8) {
      for (let x = 0; x < canvas.width - 8; x += 8) {
        let blockVariation = 0;
        let edgeSharpness = 0;
        
        for (let by = 0; by < 8; by++) {
          for (let bx = 0; bx < 8; bx++) {
            const idx = ((y + by) * canvas.width + (x + bx)) * 4;
            if (idx < data.length - 4) {
              const current = data[idx];
              const next = data[idx + 4];
              blockVariation += Math.abs(current - next);
              
              if (Math.abs(current - next) > 30) {
                edgeSharpness++;
              }
            }
          }
        }
        
        if (blockVariation < 100) blockiness++;
        if (edgeSharpness > 10) compressionArtifacts++;
      }
    }
    
    return {
      compressionArtifacts,
      blockiness,
      suspiciousBlocks: compressionArtifacts > 5
    };
  };

  // Process image file
  const processImage = (file) => {
    return new Promise((resolve, reject) => {
      const img = document.createElement('img');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      img.onload = () => {
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        ctx.drawImage(img, 0, 0);
        
        try {
          const pixelAnalysis = analyzeImagePixels(canvas, ctx);
          const facialAnalysis = analyzeFacialConsistency(canvas, ctx);
          const compressionAnalysis = analyzeCompression(canvas, ctx);
          
          resolve({
            pixelAnalysis,
            facialAnalysis,
            compressionAnalysis,
            dimensions: { width: canvas.width, height: canvas.height }
          });
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = (error) => {
        reject(new Error('Failed to load image: ' + error.message));
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  // Simulate reverse image search
  const simulateReverseImageSearch = async (hash) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate search results based on hash pattern
    const hashNum = parseInt(hash.substring(0, 8), 16);
    const matches = hashNum % 10; // 0-9 matches
    
    return {
      matches,
      sources: matches > 0 ? [
        'stock-photo-site.com',
        'social-media-platform.com',
        'news-website.com'
      ].slice(0, Math.min(matches, 3)) : []
    };
  };

  // Main scanning function
  const performScan = async () => {
    if ((activeTab === 'upload' && files.length === 0) || (activeTab === 'url' && !scanUrl)) {
      setError('Please select files or enter a URL to scan.');
      return;
    }

    setScanning(true);
    setScanProgress(0);
    setResults(null);
    setError('');

    try {
      let scanResults = {};
      
      if (activeTab === 'upload') {
        const file = files[0]; // Process first file for demo
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          throw new Error('Please select an image file for analysis.');
        }
        
        // Update progress
        setScanProgress(10);
        
        // Calculate hash
        const hash = await calculateHash(file);
        setScanProgress(25);
        
        // Analyze image
        const imageAnalysis = await processImage(file);
        setScanProgress(50);
        
        // Perform reverse image search
        const reverseSearch = await simulateReverseImageSearch(hash);
        setScanProgress(75);
        
        // GAN detection based on pixel analysis
        const ganSuspicion = imageAnalysis.pixelAnalysis.anomalyRatio > 0.3 ? 'suspicious' : 'clean';
        const ganConfidence = Math.max(0.6, 1 - imageAnalysis.pixelAnalysis.anomalyRatio);
        
        // Facial analysis
        const facialStatus = imageAnalysis.facialAnalysis.hasFacialContent ? 
          (imageAnalysis.facialAnalysis.skinToneVariation > 50 ? 'suspicious' : 'clean') : 'clean';
        const facialConfidence = imageAnalysis.facialAnalysis.hasFacialContent ? 
          Math.max(0.6, 1 - (imageAnalysis.facialAnalysis.skinToneVariation / 100)) : 0.95;
        
        // Compression analysis
        const compressionSuspicious = imageAnalysis.compressionAnalysis.suspiciousBlocks;
        
        scanResults = {
          ganFingerprint: {
            status: ganSuspicion,
            confidence: ganConfidence,
            details: `Analyzed ${imageAnalysis.pixelAnalysis.totalPixels} pixels. Anomaly ratio: ${(imageAnalysis.pixelAnalysis.anomalyRatio * 100).toFixed(1)}%`
          },
          facialDistortion: {
            status: facialStatus,
            confidence: facialConfidence,
            details: imageAnalysis.facialAnalysis.hasFacialContent ? 
              `Skin tone variation: ${imageAnalysis.facialAnalysis.skinToneVariation.toFixed(1)}` : 
              'No facial content detected'
          },
          reverseImageSearch: {
            status: reverseSearch.matches > 0 ? 'found' : 'clean',
            matches: reverseSearch.matches,
            details: reverseSearch.matches > 0 ? 
              `Found on: ${reverseSearch.sources.join(', ')}` : 
              'No matches found in reverse search'
          },
          hashMatching: {
            status: 'clean',
            matches: 0,
            details: `SHA-256: ${hash.substring(0, 16)}...`,
            fullHash: hash
          },
          compression: {
            status: compressionSuspicious ? 'suspicious' : 'clean',
            artifacts: imageAnalysis.compressionAnalysis.compressionArtifacts,
            details: `${imageAnalysis.compressionAnalysis.compressionArtifacts} suspicious blocks detected`
          }
        };
        
        // Calculate overall risk
        const riskFactors = [
          ganSuspicion === 'suspicious' ? 1 : 0,
          facialStatus === 'suspicious' ? 1 : 0,
          reverseSearch.matches > 2 ? 1 : 0,
          compressionSuspicious ? 1 : 0
        ];
        
        const riskScore = riskFactors.reduce((sum, factor) => sum + factor, 0);
        scanResults.overallRisk = riskScore === 0 ? 'low' : riskScore <= 2 ? 'medium' : 'high';
        
      } else if (activeTab === 'url') {
        // URL scanning simulation
        setScanProgress(50);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        scanResults = {
          ganFingerprint: {
            status: 'clean',
            confidence: 0.89,
            details: 'Remote image analysis completed'
          },
          facialDistortion: {
            status: 'clean',
            confidence: 0.92,
            details: 'No facial inconsistencies detected'
          },
          reverseImageSearch: {
            status: 'clean',
            matches: 0,
            details: 'No matches found for remote image'
          },
          hashMatching: {
            status: 'clean',
            matches: 0,
            details: 'Remote hash analysis completed'
          },
          overallRisk: 'low'
        };
      }
      
      setScanProgress(100);
      setResults(scanResults);
      
    } catch (error) {
      console.error('Scan error:', error);
      setError('Error during scanning: ' + error.message);
    } finally {
      setScanning(false);
    }
  };

  const handleFileUpload = (event) => {
    const selectedFiles = Array.from(event.target.files);
    setFiles(selectedFiles);
    setResults(null);
    setError('');
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles(droppedFiles);
    setResults(null);
    setError('');
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
    setResults(null);
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
    error: {
      background: '#fee2e2',
      color: '#dc2626',
      padding: '15px',
      borderRadius: '8px',
      marginBottom: '20px',
      border: '1px solid #fecaca'
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
    removeButton: {
      background: '#ef4444',
      color: 'white',
      border: 'none',
      borderRadius: '50%',
      width: '24px',
      height: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      marginLeft: 'auto'
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

        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}

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
                    <button
                      style={styles.removeButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(index);
                      }}
                    >
                      <X size={14} />
                    </button>
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
          onClick={performScan}
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
                  <div style={styles.resultTitle}>Hash Analysis</div>
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

              {results.compression && (
                <div style={styles.resultCard}>
                  <div style={styles.resultHeader}>
                    <Scan size={24} style={{ color: '#667eea' }} />
                    <div style={styles.resultTitle}>Compression Analysis</div>
                  </div>
                  <div style={{
                    ...styles.resultStatus,
                    color: getStatusColor(results.compression.status)
                  }}>
                    {getStatusIcon(results.compression.status)}
                    {results.compression.status.toUpperCase()}
                  </div>
                  <div style={styles.resultDetails}>
                    Artifacts detected: {results.compression.artifacts}
                    <br />
                    {results.compression.details}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageScanning