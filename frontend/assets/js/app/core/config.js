export const APP_CONFIG = {
    API_BASE_URL: 'http://localhost:5000/api',
    TOKEN_KEY: 'authToken',
    USER_KEY: 'user',
    REQUEST_TIMEOUT_MS: 15000
};

export const ROLES = {
    ADMIN: 'admin',
    FACULTY: 'faculty',
    STUDENT: 'student'
};

export const ROLE_HOME_PAGE = {
    [ROLES.ADMIN]: 'admin-dashboard.html',
    [ROLES.FACULTY]: 'faculty-dashboard.html',
    [ROLES.STUDENT]: 'student-dashboard.html'
};
