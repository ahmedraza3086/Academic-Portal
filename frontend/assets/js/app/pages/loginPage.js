import { authService } from '../services/authService.js';
import { authState } from '../core/auth.js';
import { store } from '../core/store.js';
import { Validators } from '../utils/validators.js';
import { notify } from '../ui/notifications.js';
import { formUi } from '../ui/forms.js';

const selectors = {
    form: document.getElementById('loginForm'),
    email: document.getElementById('email'),
    password: document.getElementById('password'),
    submit: document.getElementById('loginSubmitButton'),
    error: document.getElementById('loginError')
};

const setInlineError = (message = '') => {
    if (!selectors.error) {
        return;
    }

    selectors.error.textContent = message;
    selectors.error.classList.toggle('d-none', !message);
};

const validateLoginForm = ({ email, password }) => {
    const errors = {};

    if (!Validators.isEmail(email)) {
        errors.email = 'Please enter a valid email address.';
    }

    if (!Validators.hasMinLength(password, 6)) {
        errors.password = 'Password must be at least 6 characters long.';
    }

    return errors;
};

const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
        email: selectors.email?.value?.trim() || '',
        password: selectors.password?.value || ''
    };

    const errors = validateLoginForm(payload);
    if (Object.keys(errors).length > 0) {
        formUi.showErrors(selectors.form, errors);
        return;
    }

    formUi.clearErrors(selectors.form);
    setInlineError('');
    formUi.setSubmitting(selectors.submit, true, 'Signing in...');
    store.setSlice('auth', { loading: true, error: null });

    try {
        const response = await authService.login(payload);
        authState.setAuthenticatedSession({ token: response.token, user: response.user });
        notify.success('Login successful. Redirecting...');
        authState.redirectToRoleHome(response.user.role);
    } catch (error) {
        const message = error?.message || 'Login failed. Please try again.';
        setInlineError(message);
        store.setSlice('auth', { error: message });
    } finally {
        formUi.setSubmitting(selectors.submit, false);
        store.setSlice('auth', { loading: false });
    }
};

export const initLoginPage = () => {
    const { user, isAuthenticated } = authState.hydrate();

    if (isAuthenticated && user?.role) {
        authState.redirectToRoleHome(user.role);
        return;
    }

    if (!selectors.form) {
        return;
    }

    selectors.form.addEventListener('submit', handleSubmit);
};
