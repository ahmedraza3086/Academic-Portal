import { ROLE_HOME_PAGE } from './config.js';
import { session } from './session.js';
import { store } from './store.js';

const getCurrentPage = () => window.location.pathname.split('/').pop();

export const authState = {
    hydrate() {
        const token = session.getToken();
        const user = session.getUser();

        store.setSlice('auth', {
            token,
            user,
            isAuthenticated: Boolean(token && user),
            loading: false,
            error: null
        });

        return { token, user };
    },

    setAuthenticatedSession({ token, user }) {
        session.setSession({ token, user });
        store.setSlice('auth', {
            token,
            user,
            isAuthenticated: true,
            loading: false,
            error: null
        });
    },

    clearSession() {
        session.clearSession();
        store.setSlice('auth', {
            token: null,
            user: null,
            isAuthenticated: false,
            loading: false,
            error: null
        });
    },

    logout() {
        this.clearSession();
        if (getCurrentPage() !== 'login.html') {
            window.location.href = 'login.html';
        }
    },

    redirectToRoleHome(role) {
        const target = ROLE_HOME_PAGE[role];
        if (target && getCurrentPage() !== target) {
            window.location.href = target;
        }
    },

    requireAuth(allowedRoles = []) {
        const { user, isAuthenticated } = store.getState().auth;

        if (!isAuthenticated || !user) {
            window.location.href = 'login.html';
            return false;
        }

        if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
            this.logout();
            return false;
        }

        return true;
    }
};

window.addEventListener('app:unauthorized', () => {
    authState.logout();
});
