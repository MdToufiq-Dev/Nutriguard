import { useState, useEffect } from 'react';
import { useLoader } from '../../contexts/LoaderContext';
import { useToast } from '../../contexts/ToastContext';
import { useCurrentUser } from '../../integration/useCurrentUser';
import { getHealthProfile } from '../../integration/getHealthProfile';
import * as planService from '../../services/planService';
import * as deliveryService from '../../services/deliveryService';

export default function RadarView() {
    const { triggerLoader } = useLoader();
    const { showToast } = useToast();
    const user = useCurrentUser();

    const [restaurants, setRestaurants] = useState([]);
    const [selectedRestaurant, setSelectedRestaurant] = useState(null);
    const [activeOrders, setActiveOrders] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [filters, setFilters] = useState({
        maxDistance: 3,
        sortBy: 'distance',
    });
    const [userConstraints, setUserConstraints] = useState(null);

    // Load user constraints and data
    useEffect(() => {
        const loadData = async () => {
            const profile = await getHealthProfile(user.id);
            const plan = await planService.getActivePlan(user.id);

            setUserConstraints({
                dietType: plan?.dietType || 'any',
                allergens: profile?.allergens || [],
            });

            // Load restaurants
            const results = await deliveryService.searchRestaurants({
                dietType: plan?.dietType || 'any',
                allergens: profile?.allergens || [],
                ...filters,
            });
            setRestaurants(results);

            // Load active orders and favorites
            const orders = await deliveryService.getActiveDeliveryOrders(user.id);
            setActiveOrders(orders);

            const favs = await deliveryService.getFavoriteRestaurants(user.id);
            setFavorites(favs);
        };

        loadData();
    }, [user.id, filters]);

    const handleRestaurantSelect = (restaurant) => {
        setSelectedRestaurant(restaurant);
    };

    const handleAddToFavorites = async (restaurant) => {
        await triggerLoader(async () => {
            await deliveryService.saveFavoriteRestaurant(user.id, restaurant.id);
            const favs = await deliveryService.getFavoriteRestaurants(user.id);
            setFavorites(favs);
            showToast(`${restaurant.name} added to favorites`, 'success');
        }, 300);
    };

    const handleRemoveFromFavorites = async (restaurant) => {
        await triggerLoader(async () => {
            await deliveryService.removeFavoriteRestaurant(user.id, restaurant.id);
            const favs = await deliveryService.getFavoriteRestaurants(user.id);
            setFavorites(favs);
            showToast(`${restaurant.name} removed from favorites`, 'info');
        }, 300);
    };

    const isFavorite = (restaurant) => favorites.some(f => f.id === restaurant.id);

    return (
        <div className="radar-container">
            {/* Map Section */}
            <div className="map-container">
                <div className="map-placeholder">
                    <div className="map-icon">🗺️</div>
                    <p>Delivery Map</p>
                    <p className="map-subtitle">{restaurants.length} restaurants nearby</p>
                    <div className="radar-visualization">
                        {restaurants.map((r, idx) => (
                            <div
                                key={r.id}
                                className="radar-dot"
                                style={{
                                    width: `${20 + idx * 15}px`,
                                    height: `${20 + idx * 15}px`,
                                    animation: `pulse 2s ease-in-out infinite`,
                                    animationDelay: `${idx * 0.2}s`,
                                }}
                                title={`${r.name} - ${r.distance}km`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Restaurants List */}
            <div className="restaurants-panel">
                {/* Active Orders */}
                {activeOrders.length > 0 && (
                    <div className="orders-section">
                        <h4>Active Orders</h4>
                        <div className="orders-list">
                            {activeOrders.map(order => (
                                <div key={order.id} className="order-card">
                                    <div className="order-header">
                                        <span className="order-restaurant">{order.restaurantName}</span>
                                        <span className={`order-status ${order.status}`}>
                                            {order.status === 'confirmed' && '📦 Confirmed'}
                                            {order.status === 'preparing' && '👨‍🍳 Preparing'}
                                            {order.status === 'out-for-delivery' && '🚗 Out for Delivery'}
                                        </span>
                                    </div>
                                    <div className="order-eta">
                                        ETA: {new Date(order.eta).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                    <div className="order-meals">{order.mealCount} items • ${order.totalWithFee.toFixed(2)}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="filter-section">
                    <h4>Filter & Sort</h4>
                    <div className="filter-group">
                        <label>
                            <input
                                type="radio"
                                name="sort"
                                value="distance"
                                checked={filters.sortBy === 'distance'}
                                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                            />
                            Nearest
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="sort"
                                value="rating"
                                checked={filters.sortBy === 'rating'}
                                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                            />
                            Top Rated
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="sort"
                                value="delivery-time"
                                checked={filters.sortBy === 'delivery-time'}
                                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                            />
                            Fastest
                        </label>
                    </div>
                </div>

                {/* Restaurants List */}
                <div className="restaurants-list">
                    {restaurants.map(restaurant => (
                        <div
                            key={restaurant.id}
                            className={`restaurant-card ${selectedRestaurant?.id === restaurant.id ? 'selected' : ''}`}
                            onClick={() => handleRestaurantSelect(restaurant)}
                        >
                            <div className="restaurant-header">
                                <div>
                                    <div className="restaurant-name">{restaurant.name}</div>
                                    <div className="restaurant-cuisine">{restaurant.cuisine}</div>
                                </div>
                                <button
                                    className="btn-favorite"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (isFavorite(restaurant)) {
                                            handleRemoveFromFavorites(restaurant);
                                        } else {
                                            handleAddToFavorites(restaurant);
                                        }
                                    }}
                                    title={isFavorite(restaurant) ? 'Remove from favorites' : 'Add to favorites'}
                                >
                                    {isFavorite(restaurant) ? '❤️' : '🤍'}
                                </button>
                            </div>

                            <div className="restaurant-meta">
                                <span className="meta-badge">
                                    ⭐ {restaurant.rating.toFixed(1)}
                                </span>
                                <span className="meta-badge">
                                    📍 {restaurant.distance}km
                                </span>
                                <span className="meta-badge">
                                    ⏱️ {restaurant.deliveryTime}
                                </span>
                            </div>

                            <div className="restaurant-cost">
                                Min: ${restaurant.minOrder} • Delivery: ${restaurant.deliveryFee.toFixed(2)}
                            </div>

                            <div className="restaurant-tags">
                                {restaurant.dietSupport.map(tag => (
                                    <span key={tag} className="tag">{tag}</span>
                                ))}
                            </div>

                            {selectedRestaurant?.id === restaurant.id && (
                                <div className="restaurant-detail">
                                    <h5>Popular Meals</h5>
                                    <div className="meals-list">
                                        {restaurant.popularMeals.map(meal => (
                                            <div key={meal.id} className="meal-item">
                                                <div className="meal-name">{meal.name}</div>
                                                <div className="meal-info">
                                                    <span>{meal.kcal} kcal</span>
                                                    <span className="meal-price">${meal.price}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <button className="btn btn-primary" style={{ width: '100%', marginTop: '12px' }}>
                                        Order Now
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {restaurants.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                        <p>No restaurants match your filters</p>
                        <p style={{ fontSize: '12px', marginTop: '8px' }}>Try adjusting distance or sort options</p>
                    </div>
                )}
            </div>
        </div>
    );
}
