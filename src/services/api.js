/**
 * API client wrapper for backend integration.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function getAuthToken() {
    return localStorage.getItem('nutri_token');
}

/**
 * Generic request wrapper
 * @param {string} path - API endpoint path
 * @param {Object} options - Fetch options
 * @returns {Promise<any>}
 */
export async function request(path, options = {}) {
    const url = `${API_BASE_URL}${path}`;
    const token = getAuthToken();

    const config = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    };

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    try {
        const response = await fetch(url, config);
        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('nutri_token');
                localStorage.removeItem('nutri_user');
                window.dispatchEvent(new CustomEvent('nutri:unauthorized'));
            }
            const message = payload?.error?.message || payload?.error || payload?.message || `HTTP ${response.status}`;
            const error = new Error(message);
            error.status = response.status;
            error.code = payload?.error?.code;
            throw error;
        }

        return payload;
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
}

export async function get(path, params = {}) {
    const query = new URLSearchParams(params).toString();
    return request(query ? `${path}?${query}` : path, { method: 'GET' });
}

export async function post(path, body) {
    return request(path, {
        method: 'POST',
        body: JSON.stringify(body),
    });
}

export async function put(path, body) {
    return request(path, {
        method: 'PUT',
        body: JSON.stringify(body),
    });
}

export async function patch(path, body) {
    return request(path, {
        method: 'PATCH',
        body: JSON.stringify(body),
    });
}

export async function del(path) {
    return request(path, { method: 'DELETE' });
}
