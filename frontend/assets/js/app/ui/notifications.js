let container = null;

const ensureContainer = () => {
    if (container) {
        return container;
    }

    container = document.createElement('div');
    container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
    container.style.zIndex = '1080';
    document.body.appendChild(container);
    return container;
};

const show = (message, variant = 'info') => {
    const host = ensureContainer();
    const toastEl = document.createElement('div');
    toastEl.className = `toast align-items-center text-white bg-${variant} border-0`;
    toastEl.setAttribute('role', 'alert');
    toastEl.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;

    host.appendChild(toastEl);
    const instance = new bootstrap.Toast(toastEl, { delay: 3500, autohide: true });
    instance.show();
    toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
};

export const notify = {
    info(message) {
        show(message, 'info');
    },
    success(message) {
        show(message, 'success');
    },
    warning(message) {
        show(message, 'warning');
    },
    error(message) {
        show(message, 'danger');
    }
};
