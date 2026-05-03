import { APP_CONFIG } from './config.js';
import { session } from './session.js';

export class ApiError extends Error {
    constructor(message, status, payload = null) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.payload = payload;
    }
}

const buildUrl = (path, query = null) => {
    const base = `${APP_CONFIG.API_BASE_URL}${path}`;
    if (!query || Object.keys(query).length === 0) {
        return base;
    }

    const queryString = new URLSearchParams(
        Object.entries(query).reduce((acc, [key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                acc[key] = value;
            }
            return acc;
        }, {})
    ).toString();

    return queryString ? `${base}?${queryString}` : base;
};

const parseResponse = async (response) => {
    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
        return response.json();
    }

    const text = await response.text();
    return text ? { message: text } : {};
};

export const http = {
    async request(path, options = {}) {
        const {
            method = 'GET',
            body,
            query,
            headers = {},
            auth = true
        } = options;

        const finalHeaders = {
            'Content-Type': 'application/json',
            ...headers
        };

        if (auth) {
            const token = session.getToken();
            if (token) {
                finalHeaders.Authorization = `Bearer ${token}`;
            }
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), APP_CONFIG.REQUEST_TIMEOUT_MS);

        try {
            const response = await fetch(buildUrl(path, query), {
                method,
                headers: finalHeaders,
                body: body !== undefined ? JSON.stringify(body) : undefined,
                signal: controller.signal
            });

            const payload = await parseResponse(response);

            if (!response.ok) {
                const message = payload?.message || `Request failed with status ${response.status}`;

                if (response.status === 401) {
                    session.clearSession();
                    window.dispatchEvent(new CustomEvent('app:unauthorized', { detail: { message } }));
                }

                throw new ApiError(message, response.status, payload);
            }

            return payload;
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new ApiError('Request timed out. Please try again.', 408);
            }

            if (error instanceof ApiError) {
                throw error;
            }

            throw new ApiError('Network error. Please check your connection.', 0);
        } finally {
            clearTimeout(timeout);
        }
    },

    get(path, query) {
        return this.request(path, { method: 'GET', query });
    },

    post(path, body) {
        return this.request(path, { method: 'POST', body });
    },

    put(path, body) {
        return this.request(path, { method: 'PUT', body });
    },

    delete(path) {
        return this.request(path, { method: 'DELETE' });
    }
};
