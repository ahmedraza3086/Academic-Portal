export const formatters = {
    date(value) {
        if (!value) {
            return '-';
        }
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return '-';
        }
        return date.toLocaleDateString();
    },

    fullName(firstName, lastName) {
        return `${firstName || ''} ${lastName || ''}`.trim() || '-';
    },

    percent(numerator, denominator) {
        const num = Number(numerator);
        const den = Number(denominator);
        if (!Number.isFinite(num) || !Number.isFinite(den) || den <= 0) {
            return '0%';
        }
        return `${Math.round((num / den) * 100)}%`;
    }
};
