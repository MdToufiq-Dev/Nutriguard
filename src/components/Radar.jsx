import RadarView from '../features/radar/RadarView';

export default function Radar() {
    return (
        <>
            <div className="view-header">
                <h2 className="view-title">Nearby Healthy Eats</h2>
                <p className="view-subtitle">Find restaurants matching your dietary constraints</p>
            </div>
            <RadarView />
        </>
    );
}
