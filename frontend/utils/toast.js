// frontend/utils/toast.js

const showToast = (message, type = 'success', duration = 5000) => {
    const container = document.getElementById('toast-container');
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // Create message element
    const messageElement = document.createElement('span');
    messageElement.textContent = message;
    
    // Create close button
    const closeButton = document.createElement('button');
    closeButton.className = 'toast-close';
    closeButton.innerHTML = '×';
    closeButton.onclick = () => removeToast(toast);
    
    // Assemble toast
    toast.appendChild(messageElement);
    toast.appendChild(closeButton);
    container.appendChild(toast);
    
    // Auto remove after duration
    setTimeout(() => {
        if (toast.parentElement) {
            removeToast(toast);
        }
    }, duration);
};

const removeToast = (toast) => {
    toast.style.animation = 'slideOut 0.3s ease-in-out forwards';
    setTimeout(() => {
        toast.remove();
    }, 300);
};

// Make functions available globally
window.toast = {
    success: (message) => showToast(message, 'success'),
    error: (message) => showToast(message, 'error')
};