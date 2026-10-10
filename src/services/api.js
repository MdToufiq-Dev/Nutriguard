/**
 * API client wrapper for future backend integration
 * Currently unused - all services use localStorage via storage.js
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://nutriguard-backend-ilea.onrender.com/api';

/**
 * Generic request wrapper
 * @param {string} path - API endpoint path
 * @param {Object} options - Fetch options
 * @returns {Promise<any>}
 */
export async function request(path, options = {}) {
    const url = `${API_BASE_URL}${path}`;

    const config = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    };

    // Add auth token when available
    // const token = await getAuthToken();
    // if (token) {
    //     config.headers.Authorization = `Bearer ${token}`;
    // }

    try {
        const response = await fetch(url, config);

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || `HTTP ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
}

/**
 * GET request
 */
export async function get(path, params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${path}?${query}` : path;
    return request(url, { method: 'GET' });
}

/**
 * POST request
 */
export async function post(path, body) {
    return request(path, {
        method: 'POST',
        body: JSON.stringify(body),
    });
}

/**
 * PUT request
 */
export async function put(path, body) {
    return request(path, {
        method: 'PUT',
        body: JSON.stringify(body),
    });
}

/**
 * DELETE request
 */
export async function del(path) {
    return request(path, { method: 'DELETE' });
}
