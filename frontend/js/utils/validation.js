// frontend/utils/validation.js

// Utility function to show error message
function showError(inputElement, message) {
    // Get or create error div
    let errorDiv = inputElement.nextElementSibling;
    if (!errorDiv || !errorDiv.classList.contains('error-message')) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        inputElement.parentNode.insertBefore(errorDiv, inputElement.nextSibling);
    }
    
    // Show error message
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    inputElement.classList.add('invalid-input');
    inputElement.classList.remove('valid-input');
}

// Utility function to show success state
function showSuccess(inputElement) {
    // Remove error message if it exists
    const errorDiv = inputElement.nextElementSibling;
    if (errorDiv && errorDiv.classList.contains('error-message')) {
        errorDiv.style.display = 'none';
    }
    
    inputElement.classList.remove('invalid-input');
    inputElement.classList.add('valid-input');
}

// Validate required field
function validateRequired(inputElement) {
    const value = inputElement.value.trim();
    if (!value) {
        showError(inputElement, `${inputElement.name || 'Field'} is required`);
        return false;
    }
    showSuccess(inputElement);
    return true;
}
function isValidImageUrl(url) {
    return url && (
        url.startsWith('https://res.cloudinary.com/') || 
        url.startsWith('http://res.cloudinary.com/')
    );
}

// Validate name (letters and spaces only)
function validateName(inputElement) {
    const value = inputElement.value.trim();
    if (!value) {
        showError(inputElement, 'Name is required');
        return false;
    }
    
    const nameRegex = /^[A-Za-z\s]{2,}$/;
    if (!nameRegex.test(value)) {
        showError(inputElement, 'Please enter a valid name (letters only)');
        return false;
    }
    
    showSuccess(inputElement);
    return true;
}

// Validate visitor name
function validateVisitorName(inputElement) {
    const value = typeof inputElement === 'string' ? inputElement : inputElement.value;
    const element = typeof inputElement === 'string' ? document.getElementById('name') : inputElement;
    
    if (!value || value.length < 2) {
        showError(element, 'Name must be at least 2 characters');
        return false;
    }
    if (!/^[A-Za-z\s]+$/.test(value)) {
        showError(element, 'Name can only contain letters and spaces');
        return false;
    }
    showSuccess(element);
    return true;
}

// Validate date (must be in the future)
function validateDate(inputElement) {
    const selectedDate = new Date(inputElement.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!inputElement.value) {
        showError(inputElement, 'Date is required');
        return false;
    }

    if (selectedDate < today) {
        showError(inputElement, 'Please select a future date');
        return false;
    }

    showSuccess(inputElement);
    return true;
}

// Validate booking date
function validateBookingDate(dateInput) {
    const selectedDate = new Date(dateInput.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
        showError(dateInput, 'Please select a future date');
        return false;
    }
    
    const sixMonthsFromNow = new Date();
    sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
    
    if (selectedDate > sixMonthsFromNow) {
        showError(dateInput, 'Bookings can only be made up to 6 months in advance');
        return false;
    }
    
    showSuccess(dateInput);
    return true;
}

// Main validation function for the booking form
function validateBookingForm(form) {
    const nameValid = validateName(form.querySelector('#name'));
    const dateValid = validateDate(form.querySelector('#date'));
    const timeSlotValid = validateRequired(form.querySelector('#time-slot'));

    return nameValid && dateValid && timeSlotValid;
}

// Export all functions
window.formValidation = {
    validateRequired,
    validateName,
    validateDate,
    validateBookingForm,
    validateVisitorName,
    validateBookingDate
};