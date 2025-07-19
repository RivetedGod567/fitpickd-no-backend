// Sign-up page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initializeSignupForm();
    initializePasswordToggles();
    initializeMobileMenu();
});

// Initialize sign-up form
function initializeSignupForm() {
    const form = document.getElementById('signup-form');
    const errorMessage = document.getElementById('error-message');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const firstName = document.getElementById('first-name').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        const terms = document.getElementById('terms').checked;
        
        // Clear previous error
        hideError();
        
        // Validate form
        if (!validateForm(firstName, email, phone, password, confirmPassword, terms)) {
            return;
        }
        
        // Check if user already exists
        if (userExists(email, phone)) {
            showError('An account with this email or phone number already exists.');
            return;
        }
        
        // Create user account
        const user = {
            id: Date.now(),
            firstName: firstName,
            email: email,
            phone: phone,
            password: password, // In a real app, this should be hashed
            createdAt: new Date().toISOString()
        };
        
        // Save user to localStorage
        saveUser(user);
        
        // Show success message and redirect
        showSuccess('Account created successfully! Redirecting to sign in...');
        
        setTimeout(() => {
            window.location.href = 'signin.html';
        }, 2000);
    });
}

// Validate form data
function validateForm(firstName, email, phone, password, confirmPassword, terms) {
    // First name validation
    if (!firstName || firstName.length < 2) {
        showError('First name must be at least 2 characters long.');
        return false;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        showError('Please enter a valid email address.');
        return false;
    }
    
    // Phone validation
    const phoneRegex = /^[0-9]{10}$/;
    if (!phone || !phoneRegex.test(phone)) {
        showError('Please enter a valid 10-digit phone number.');
        return false;
    }
    
    // Password validation
    if (!password || password.length < 6) {
        showError('Password must be at least 6 characters long.');
        return false;
    }
    
    // Confirm password validation
    if (password !== confirmPassword) {
        showError('Passwords do not match.');
        return false;
    }
    
    // Terms validation
    if (!terms) {
        showError('Please agree to the Terms of Service and Privacy Policy.');
        return false;
    }
    
    return true;
}

// Check if user already exists
function userExists(email, phone) {
    const users = JSON.parse(localStorage.getItem('fitpickd_users') || '[]');
    return users.some(user => user.email === email || user.phone === phone);
}

// Save user to localStorage
function saveUser(user) {
    const users = JSON.parse(localStorage.getItem('fitpickd_users') || '[]');
    users.push(user);
    localStorage.setItem('fitpickd_users', JSON.stringify(users));
}

// Initialize password toggle functionality
function initializePasswordToggles() {
    const togglePassword = document.getElementById('toggle-password');
    const toggleConfirmPassword = document.getElementById('toggle-confirm-password');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    
    togglePassword.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        this.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
    });
    
    toggleConfirmPassword.addEventListener('click', function() {
        const type = confirmPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        confirmPasswordInput.setAttribute('type', type);
        this.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
    });
}

// Show error message
function showError(message) {
    const errorMessage = document.getElementById('error-message');
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
}

// Hide error message
function hideError() {
    const errorMessage = document.getElementById('error-message');
    errorMessage.classList.add('hidden');
}

// Show success message
function showSuccess(message) {
    // Create success notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 z-50 p-4 rounded-lg shadow-lg max-w-sm bg-green-100 text-green-800 transition-all duration-300 translate-y-[-100px] opacity-0';
    notification.innerHTML = `
        <div class="flex items-center">
            <i class="fas fa-check-circle mr-2"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.remove('translate-y-[-100px]', 'opacity-0');
    }, 100);
}

// Mobile menu functionality
function initializeMobileMenu() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!mobileMenuButton.contains(event.target) && !mobileMenu.contains(event.target)) {
                mobileMenu.classList.add('hidden');
            }
        });
    }
}

// Export functions for potential use
window.SignupManager = {
    validateForm,
    userExists,
    saveUser
}; 