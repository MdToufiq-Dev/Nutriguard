import { useLoader } from '../contexts/LoaderContext';

export default function Loader() {
    const { isActive } = useLoader();

    return (
        <div className={`loader-overlay ${isActive ? 'active' : ''}`} id="loader">
            <div className="loader-container">
                <div className="bowl">
                    <div className="bowl-rim"></div>
                    <div className="bowl-outer">
                        <div className="bowl-inner"></div>
                    </div>
                </div>
                <div className="veggie">🥕</div>
                <div className="veggie">🥦</div>
                <div className="veggie">🍅</div>
                <div className="veggie">🌽</div>
                <div className="veggie">🥬</div>
                <div className="veggie">🫑</div>
            </div>
        </div>
    );
}
