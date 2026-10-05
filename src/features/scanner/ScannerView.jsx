import { useState, useEffect, useRef } from 'react';
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

    const [mode, setMode] = useState('choice'); // 'choice' | 'camera' | 'manual' | 'result'
    const [isScanning, setIsScanning] = useState(false);
    const [manualBarcode, setManualBarcode] = useState('');
    const [scannedProduct, setScannedProduct] = useState(null);
    const [safetyCheck, setSafetyCheck] = useState(null);
    const [userConstraints, setUserConstraints] = useState(null);
    const [scanHistory, setScanHistory] = useState([]);

    // Load user constraints and history
    useEffect(() => {
        const loadData = async () => {
            const profile = await getHealthProfile(user.id);
            const plan = await planService.getActivePlan(user.id);

            setUserConstraints({
                allergens: profile?.allergens || [],
                dietType: plan?.dietType || 'any',
                dislikedFoods: plan?.dislikedFoods || [],
            });

            const history = await scannerService.getScanHistory(user.id);
            setScanHistory(history.slice(0, 10)); // Last 10 scans
        };
        loadData();
    }, [user.id]);

    // Initialize barcode reader
    useEffect(() => {
        if (mode === 'camera' && videoRef.current && !codeReaderRef.current) {
            const codeReader = new BrowserMultiFormatReader();
            codeReaderRef.current = codeReader;

            codeReader.decodeFromVideoElement(videoRef.current, async (result, err) => {
                if (result && isScanning) {
                    const barcode = result.getText();
                    await handleBarcodeScanned(barcode);
                    setIsScanning(false);
                }
            });

            codeReader.listVideoInputDevices().then(devices => {
                if (devices.length > 0) {
                    codeReader.decodeFromVideoDevice(devices[0].deviceId, videoRef.current, async (result, err) => {
                        if (result && isScanning) {
                            const barcode = result.getText();
                            await handleBarcodeScanned(barcode);
                            setIsScanning(false);
                        }
                    });
                }
            });
        }

        return () => {
            if (codeReaderRef.current) {
                codeReaderRef.current.reset();
            }
        };
    }, [mode, isScanning]);

    const handleBarcodeScanned = async (barcode) => {
        await triggerLoader(async () => {
            const product = await scannerService.lookupProduct(barcode);

            if (!product) {
                showToast('Product not found', 'warning');
                return;
            }

            const safety = checkProductSafety(product, userConstraints);
            setScannedProduct(product);
            setSafetyCheck(safety);
            setMode('result');

            showToast(`Scanned: ${product.name}`, 'info');
        }, 300);
    };

    const handleManualScan = async () => {
        if (!manualBarcode.trim()) {
            showToast('Enter a barcode', 'warning');
            return;
        }

        await handleBarcodeScanned(manualBarcode);
        setManualBarcode('');
        setMode('result');
    };

    const handleConfirmProduct = async () => {
        await triggerLoader(async () => {
            const safetyStatus = safetyCheck?.blocked ? 'blocked' : safetyCheck?.warning ? 'warning' : 'safe';
            const scan = await scannerService.recordScan(user.id, scannedProduct.barcode, safetyStatus);

            const history = await scannerService.getScanHistory(user.id);
            setScanHistory(history.slice(0, 10));

            showToast(`Logged: ${scannedProduct.name}`, 'success');

            setMode('choice');
            setScannedProduct(null);
            setSafetyCheck(null);
        }, 300);
    };

    const handleRetry = () => {
        setMode('choice');
        setScannedProduct(null);
        setSafetyCheck(null);
        setManualBarcode('');
        setIsScanning(true);
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
                        style={{
                            width: '100%',
                            borderRadius: '12px',
                            marginBottom: '16px',
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
                            onKeyPress={(e) => {
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
