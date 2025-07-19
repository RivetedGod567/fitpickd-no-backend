// Sign-in page JavaScript

// Admin credentials (in real app, this would be server-side)
const ADMIN_CREDENTIALS = {
    username: 'admin123',
    password: 'admin123'
};

// Show login form based on role
function showLoginForm(role) {
    const roleSelection = document.getElementById('role-selection');
    const adminLogin = document.getElementById('admin-login');
    const customerLogin = document.getElementById('customer-login');
    
    // Hide role selection
    roleSelection.classList.add('hidden');
    
    // Show appropriate login form
    if (role === 'admin') {
        adminLogin.classList.remove('hidden');
        customerLogin.classList.add('hidden');
    } else if (role === 'customer') {
        customerLogin.classList.remove('hidden');
        adminLogin.classList.add('hidden');
    }
}

// Show role selection
function showRoleSelection() {
    const roleSelection = document.getElementById('role-selection');
    const adminLogin = document.getElementById('admin-login');
    const customerLogin = document.getElementById('customer-login');
    
    // Show role selection
    roleSelection.classList.remove('hidden');
    
    // Hide login forms
    adminLogin.classList.add('hidden');
    customerLogin.classList.add('hidden');
}

// Handle admin login
function handleAdminLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('admin-username').value;
    const password = document.getElementById('admin-password').value;
    
    // Validate credentials
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        // Store admin session
        localStorage.setItem('fitpickd_admin_session', 'true');
        localStorage.setItem('fitpickd_user_role', 'admin');
        localStorage.setItem('fitpickd_username', username);
        
        // Show success message
        showNotification('Login successful! Redirecting to admin dashboard...', 'success');
        
        // Redirect to admin dashboard
        setTimeout(() => {
            window.location.href = 'admin.html';
        }, 1500);
    } else {
        showNotification('Invalid username or password. Please try again.', 'error');
        document.getElementById('admin-password').value = '';
    }
}

// Handle customer login
function handleCustomerLogin(event) {
    event.preventDefault();
    
    const emailPhone = document.getElementById('customer-email-phone').value.trim();
    const password = document.getElementById('customer-password').value;
    
    // Basic validation
    if (!emailPhone || !password) {
        showNotification('Please fill in all fields.', 'error');
        return;
    }
    
    // Get registered users
    const users = JSON.parse(localStorage.getItem('fitpickd_users') || '[]');
    
    // Find user by email or phone
    const user = users.find(u => u.email === emailPhone || u.phone === emailPhone);
    
    if (!user) {
        showNotification('No account found with this email or phone number. Please sign up first.', 'error');
        return;
    }
    
    // Check password
    if (user.password !== password) {
        showNotification('Incorrect password. Please try again.', 'error');
        document.getElementById('customer-password').value = '';
        return;
    }
    
    // Store customer session
    localStorage.setItem('fitpickd_customer_session', 'true');
    localStorage.setItem('fitpickd_user_role', 'customer');
    localStorage.setItem('fitpickd_customer_name', user.firstName);
    localStorage.setItem('fitpickd_customer_email', user.email);
    localStorage.setItem('fitpickd_customer_phone', user.phone);
    localStorage.setItem('fitpickd_customer_id', user.id);
    
    // Show success message
    showNotification(`Welcome back, ${user.firstName}! Redirecting to homepage...`, 'success');
    
    // Redirect to homepage
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
}

// Show notification
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification fixed top-20 right-4 z-50 p-4 rounded-md shadow-lg max-w-sm transform transition-all duration-300 translate-x-full`;
    
    // Set notification content based on type
    let bgColor, textColor, icon;
    switch (type) {
        case 'success':
            bgColor = 'bg-green-500';
            textColor = 'text-white';
            icon = 'fas fa-check-circle';
            break;
        case 'error':
            bgColor = 'bg-red-500';
            textColor = 'text-white';
            icon = 'fas fa-exclamation-circle';
            break;
        default:
            bgColor = 'bg-blue-500';
            textColor = 'text-white';
            icon = 'fas fa-info-circle';
    }
    
    notification.className += ` ${bgColor} ${textColor}`;
    notification.innerHTML = `
        <div class="flex items-center">
            <i class="${icon} mr-2"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Check if user is already logged in
function checkExistingSession() {
    const adminSession = localStorage.getItem('fitpickd_admin_session');
    const customerSession = localStorage.getItem('fitpickd_customer_session');
    
    if (adminSession === 'true') {
        window.location.href = 'admin.html';
    } else if (customerSession === 'true') {
        window.location.href = 'index.html';
    }
}

// Logout function
function logout() {
    localStorage.removeItem('fitpickd_admin_session');
    localStorage.removeItem('fitpickd_customer_session');
    localStorage.removeItem('fitpickd_user_role');
    localStorage.removeItem('fitpickd_username');
    localStorage.removeItem('fitpickd_customer_name');
    localStorage.removeItem('fitpickd_customer_email');
    
    window.location.href = 'index.html';
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    checkExistingSession();
    
    // Add form validation
    addFormValidation();
    
    // Initialize password toggle for customer form
    initializeCustomerPasswordToggle();
});

// Add form validation
function addFormValidation() {
    const inputs = document.querySelectorAll('input[required]');
    
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        input.addEventListener('input', function() {
            clearFieldError(this);
        });
    });
}

// Initialize password toggle for customer form
function initializeCustomerPasswordToggle() {
    const toggleButton = document.getElementById('toggle-customer-password');
    const passwordInput = document.getElementById('customer-password');
    
    if (toggleButton && passwordInput) {
        toggleButton.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
        });
    }
}

// Validate individual field
function validateField(field) {
    const value = field.value.trim();
    
    if (!value) {
        showFieldError(field, 'This field is required');
        return false;
    }
    
    // Email validation for customer email field
    if (field.id === 'customer-email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        
        if (!emailRegex.test(value) && !phoneRegex.test(value.replace(/\s/g, ''))) {
            showFieldError(field, 'Please enter a valid email or phone number');
            return false;
        }
    }
    
    clearFieldError(field);
    return true;
}

// Show field error
function showFieldError(field, message) {
    clearFieldError(field);
    
    field.classList.add('border-red-500');
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'text-red-500 text-sm mt-1';
    errorDiv.textContent = message;
    errorDiv.id = `${field.id}-error`;
    
    field.parentNode.appendChild(errorDiv);
}

// Clear field error
function clearFieldError(field) {
    field.classList.remove('border-red-500');
    
    const errorDiv = document.getElementById(`${field.id}-error`);
    if (errorDiv) {
        errorDiv.remove();
    }
}

// Export functions for use in other files
window.AuthManager = {
    logout,
    checkExistingSession,
    showNotification
}; 