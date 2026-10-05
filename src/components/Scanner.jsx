import ScannerView from '../features/scanner/ScannerView';

export default function Scanner() {
    return (
        <>
            <div className="view-header">
                <h2 className="view-title">Barcode Scanner</h2>
                <p className="view-subtitle">Check nutrition & safety before consuming</p>
            </div>
            <ScannerView />
        </>
    );
}
