export const Validators = {
    isEmail(value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
    },

    hasMinLength(value, min) {
        return String(value || '').length >= min;
    },

    required(value) {
        return value !== undefined && value !== null && String(value).trim() !== '';
    },

    positiveNumber(value) {
        const num = Number(value);
        return Number.isFinite(num) && num > 0;
    },

    nonNegativeNumber(value) {
        const num = Number(value);
        return Number.isFinite(num) && num >= 0;
    }
};
