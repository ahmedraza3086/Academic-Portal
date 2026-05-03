import { http } from '../core/http.js';

export const authService = {
    login({ email, password }) {
        return http.post('/auth/login', { email, password });
    },

    getProfile() {
        return http.get('/auth/profile');
    }
};
