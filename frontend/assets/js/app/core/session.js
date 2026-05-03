import { APP_CONFIG } from './config.js';

export const session = {
    getToken() {
        return localStorage.getItem(APP_CONFIG.TOKEN_KEY);
    },

    getUser() {
        const raw = localStorage.getItem(APP_CONFIG.USER_KEY);
        if (!raw) {
            return null;
        }

        try {
            return JSON.parse(raw);
        } catch (error) {
            return null;
        }
    },

    setSession({ token, user }) {
        localStorage.setItem(APP_CONFIG.TOKEN_KEY, token);
        localStorage.setItem(APP_CONFIG.USER_KEY, JSON.stringify(user));
    },

    clearSession() {
        localStorage.removeItem(APP_CONFIG.TOKEN_KEY);
        localStorage.removeItem(APP_CONFIG.USER_KEY);
    }
};
