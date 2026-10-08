import { useState, useEffect, useRef, useCallback } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { useLoader } from '../../contexts/LoaderContext';
import { useToast } from '../../contexts/ToastContext';
import { useCurrentUser } from '../../integration/useCurrentUser';
import { getHealthProfile } from '../../integration/getHealthProfile';
import * as scannerService from '../../services/scannerService';
import * as planService from '../../services/planService';
import { checkProductSafety, getMacroSummary } from '../../utils/safetyChecker';

export default function ScannerView() {
    const { triggerLoader } = useLoader();
    const { showToast } = useToast();
    const user = useCurrentUser();
    const videoRef = useRef(null);
    const codeReaderRef = useRef(null);
    const controlsRef = useRef(null);

    const [mode, setMode] = useState('choice'); // 'choice' | 'camera' | 'manual' | 'result'
    const [isScanning, setIsScanning] = useState(false);
    const isScanningRef = useRef(false);
    const [manualBarcode, setManualBarcode] = useState('');
    const [scannedProduct, setScannedProduct] = useState(null);
    const [safetyCheck, setSafetyCheck] = useState(null);
    const [userConstraints, setUserConstraints] = useState(null);
    const userConstraintsRef = useRef(null);
    const [scanHistory, setScanHistory] = useState([]);

    // Keep refs in sync
    useEffect(() => {
        isScanningRef.current = isScanning;
    }, [isScanning]);

    useEffect(() => {
        userConstraintsRef.current = userConstraints;
    }, [userConstraints]);

    // Load user constraints and history
    useEffect(() => {
        let isMounted = true;
        const loadData = async () => {
            try {
                const profile = await getHealthProfile(user.id);
                const plan = await planService.getActivePlan(user.id);

                if (isMounted) {
                    const constraints = {
                        allergens: profile?.allergens || [],
                        dietType: plan?.dietType || 'any',
                        dislikedFoods: plan?.dislikedFoods || [],
                    };
                    setUserConstraints(constraints);
                    userConstraintsRef.current = constraints;
                }

                const history = await scannerService.getScanHistory(user.id);
                if (isMounted) {
                    const list = Array.isArray(history) ? history : (history?.scans || []);
                    setScanHistory(list.slice(0, 10)); // Last 10 scans
                }
            } catch (err) {
                console.error('Error loading scanner data:', err);
            }
        };
        loadData();
        return () => {
            isMounted = false;
        };
    }, [user.id]);

    const handleBarcodeScanned = useCallback(async (barcode) => {
        if (!barcode) return false;

        let found = false;
        await triggerLoader(async () => {
            try {
                const product = await scannerService.lookupProduct(barcode.trim());

                if (!product) {
                    showToast('Product not found for barcode: ' + barcode, 'warning');
                    return;
                }

                const currentConstraints = userConstraintsRef.current || userConstraints || {};
                const safety = checkProductSafety(product, currentConstraints);
                setScannedProduct(product);
                setSafetyCheck(safety);
                setMode('result');
                found = true;

                showToast(`Scanned: ${product.name}`, 'info');
            } catch (err) {
                console.error('Barcode lookup error:', err);
                showToast('Failed to lookup product', 'error');
            }
        }, 300);

        return found;
    }, [triggerLoader, showToast, userConstraints]);

    // Initialize barcode reader when in camera mode
    useEffect(() => {
        let active = true;

        const stopCamera = () => {
            if (controlsRef.current) {
                try {
                    controlsRef.current.stop();
                } catch (e) {
                    console.warn('Error stopping scanner controls:', e);
                }
                controlsRef.current = null;
            }
            if (codeReaderRef.current) {
                try {
                    codeReaderRef.current.reset();
                } catch (e) {
                    console.warn('Error resetting code reader:', e);
                }
                codeReaderRef.current = null;
            }
            if (videoRef.current && videoRef.current.srcObject) {
                try {
                    const tracks = videoRef.current.srcObject.getTracks();
                    tracks.forEach(track => track.stop());
                    videoRef.current.srcObject = null;
                } catch (e) {
                    console.warn('Error stopping video tracks:', e);
                }
            }
        };

        const initCamera = async () => {
            if (mode !== 'camera' || !videoRef.current) return;

            try {
                const codeReader = new BrowserMultiFormatReader();
                codeReaderRef.current = codeReader;

                // Attempt to decode from video device
                const controls = await codeReader.decodeFromVideoDevice(
                    undefined, // Picks default/back camera
                    videoRef.current,
                    (result, err) => {
                        if (!active) return;
                        if (result && isScanningRef.current) {
                            const barcode = result.getText();
                            isScanningRef.current = false;
                            setIsScanning(false);
                            handleBarcodeScanned(barcode);
                        }
                    }
                );

                if (active) {
                    controlsRef.current = controls;
                } else {
                    if (controls) controls.stop();
                }
            } catch (err) {
                if (!active) return;
                console.error('Camera initialization error:', err);
                showToast('Could not access camera. Please check permissions.', 'error');
            }
        };

        if (mode === 'camera') {
            initCamera();
        } else {
            stopCamera();
        }

        return () => {
            active = false;
            stopCamera();
        };
    }, [mode, handleBarcodeScanned, showToast]);

    const handleManualScan = async () => {
        if (!manualBarcode.trim()) {
            showToast('Enter a barcode', 'warning');
            return;
        }

        const success = await handleBarcodeScanned(manualBarcode);
        if (success) {
            setManualBarcode('');
        }
    };

    const handleConfirmProduct = async () => {
        if (!scannedProduct) return;

        await triggerLoader(async () => {
            try {
                const safetyStatus = safetyCheck?.blocked ? 'blocked' : safetyCheck?.warning ? 'warning' : 'safe';
                await scannerService.recordScan(user.id, scannedProduct.barcode, safetyStatus);

                const history = await scannerService.getScanHistory(user.id);
                const list = Array.isArray(history) ? history : (history?.scans || []);
                setScanHistory(list.slice(0, 10));

                showToast(`Logged: ${scannedProduct.name}`, 'success');

                setMode('choice');
                setScannedProduct(null);
                setSafetyCheck(null);
            } catch (err) {
                console.error('Error recording scan:', err);
                showToast('Failed to log product scan', 'error');
            }
        }, 300);
    };

    const handleRetry = () => {
        setMode('choice');
        setScannedProduct(null);
        setSafetyCheck(null);
        setManualBarcode('');
        setIsScanning(false);
        isScanningRef.current = false;
    };

    const macroSummary = scannedProduct ? getMacroSummary(scannedProduct) : null;

    return (
        <div className="scanner-container">
            {mode === 'choice' && (
                <>
                    <div className="scanner-header">
                        <h3>Scan Product</h3>
                        <p>Check nutrition & safety before consuming</p>
                    </div>

                    <div className="scanner-action-buttons">
                        <button
                            className="btn btn-primary"
                            onClick={() => {
                                setMode('camera');
                                setIsScanning(true);
                                isScanningRef.current = true;
                            }}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
                                <circle cx="12" cy="13" r="3"/>
                            </svg>
                            Open Camera
                        </button>
                        <button
                            className="btn btn-secondary"
                            onClick={() => setMode('manual')}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="10 21 17 13 17 3 7 3 7 13 14 21"/>
                            </svg>
                            Enter Barcode
                        </button>
                    </div>

                    {scanHistory.length > 0 && (
                        <div className="scan-history">
                            <h4>Recent Scans</h4>
                            <div className="history-list">
                                {scanHistory.map(scan => (
                                    <div key={scan.id} className="history-item">
                                        <div>
                                            <div className="history-product">{scan.productName}</div>
                                            <div className="history-meta">{scan.kcal} kcal • {scan.brand}</div>
                                        </div>
                                        <div className={`safety-badge ${scan.safetyStatus}`}>
                                            {scan.safetyStatus === 'safe' && '✓'}
                                            {scan.safetyStatus === 'warning' && '⚠'}
                                            {scan.safetyStatus === 'blocked' && '✕'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}

            {mode === 'camera' && (
                <div className="scanner-camera">
                    <video
                        ref={videoRef}
                        className="video-stream"
                        playsInline
                        muted
                        autoPlay
                        style={{
                            width: '100%',
                            minHeight: '280px',
                            backgroundColor: '#000',
                            borderRadius: '12px',
                            marginBottom: '16px',
                            objectFit: 'cover'
                        }}
                    />
                    <div className="scanner-guide">
                        <p>Position barcode in frame</p>
                    </div>
                    <button
                        className="btn btn-secondary"
                        onClick={() => {
                            setMode('choice');
                            setIsScanning(false);
                            isScanningRef.current = false;
                        }}
                    >
                        Cancel
                    </button>
                </div>
            )}

            {mode === 'manual' && (
                <div className="scanner-manual">
                    <div className="scanner-header">
                        <h3>Enter Barcode</h3>
                        <p>Type or paste the 12-digit barcode</p>
                    </div>

                    <div className="input-group">
                        <input
                            type="text"
                            placeholder="e.g., 012345678901"
                            value={manualBarcode}
                            onChange={(e) => setManualBarcode(e.target.value)}
                            maxLength="20"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleManualScan();
                            }}
                        />
                        <button className="btn btn-primary" onClick={handleManualScan}>
                            Search
                        </button>
                    </div>

                    <button
                        className="btn btn-text"
                        onClick={() => {
                            setMode('choice');
                            setManualBarcode('');
                        }}
                    >
                        ← Back
                    </button>
                </div>
            )}

            {mode === 'result' && scannedProduct && safetyCheck && (
                <div className="scanner-result">
                    <div className={`result-header ${safetyCheck.severity}`}>
                        <h3>{scannedProduct.name}</h3>
                        <p className="brand">{scannedProduct.brand}</p>
                        <div className={`safety-indicator ${safetyCheck.severity}`}>
                            {safetyCheck.safe && '✓ Safe'}
                            {safetyCheck.warning && '⚠ Warning'}
                            {safetyCheck.blocked && '✕ Blocked'}
                        </div>
                    </div>

                    <div className="result-nutrition">
                        <div className="nutr-card">
                            <span className="nutr-label">Calories</span>
                            <span className="nutr-value">{scannedProduct.kcal}</span>
                        </div>
                        <div className="nutr-card">
                            <span className="nutr-label">Protein</span>
                            <span className="nutr-value">{scannedProduct.protein}g</span>
                        </div>
                        <div className="nutr-card">
                            <span className="nutr-label">Carbs</span>
                            <span className="nutr-value">{scannedProduct.carbs}g</span>
                        </div>
                        <div className="nutr-card">
                            <span className="nutr-label">Fat</span>
                            <span className="nutr-value">{scannedProduct.fat}g</span>
                        </div>
                    </div>

                    {macroSummary && macroSummary.tags.length > 0 && (
                        <div className="result-tags">
                            {macroSummary.tags.map(tag => (
                                <span key={tag} className="tag">{tag}</span>
                            ))}
                        </div>
                    )}

                    {safetyCheck.issues.length > 0 && (
                        <div className="result-issues">
                            <h4>Alerts</h4>
                            {safetyCheck.issues.map((issue, idx) => (
                                <div key={idx} className={`issue-item ${issue.severity}`}>
                                    <span className="issue-type">{issue.type}</span>
                                    <span className="issue-message">{issue.message}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    <p className="result-recommendation">{safetyCheck.recommendation}</p>

                    <div className="result-actions">
                        <button
                            className="btn btn-secondary"
                            onClick={handleRetry}
                            disabled={safetyCheck.blocked}
                        >
                            Cancel
                        </button>
                        <button
                            className={`btn ${safetyCheck.blocked ? 'btn-disabled' : 'btn-primary'}`}
                            onClick={handleConfirmProduct}
                            disabled={safetyCheck.blocked}
                        >
                            {safetyCheck.blocked ? 'Not Recommended' : 'Log Product'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
