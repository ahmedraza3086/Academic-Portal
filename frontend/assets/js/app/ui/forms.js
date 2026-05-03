export const formUi = {
    setSubmitting(button, isSubmitting, submittingText = 'Saving...') {
        if (!button) {
            return;
        }

        if (isSubmitting) {
            button.dataset.originalText = button.innerHTML;
            button.disabled = true;
            button.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>${submittingText}`;
            return;
        }

        button.disabled = false;
        if (button.dataset.originalText) {
            button.innerHTML = button.dataset.originalText;
        }
    },

    clearErrors(formElement) {
        if (!formElement) {
            return;
        }

        formElement.querySelectorAll('.invalid-feedback').forEach((node) => node.remove());
        formElement.querySelectorAll('.is-invalid').forEach((node) => node.classList.remove('is-invalid'));
    },

    showErrors(formElement, errors) {
        this.clearErrors(formElement);
        Object.entries(errors).forEach(([field, message]) => {
            const input = formElement.querySelector(`[name="${field}"]`);
            if (!input) {
                return;
            }

            input.classList.add('is-invalid');
            const feedback = document.createElement('div');
            feedback.className = 'invalid-feedback';
            feedback.textContent = message;
            input.parentElement?.appendChild(feedback);
        });
    }
};
