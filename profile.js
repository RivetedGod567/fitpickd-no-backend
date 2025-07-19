// Profile page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    checkUserAuthentication();
    loadUserProfile();
    initializeProfileForm();
    initializeMobileMenu();
});

// Check if user is authenticated
function checkUserAuthentication() {
    const customerSession = localStorage.getItem('fitpickd_customer_session');
    if (customerSession !== 'true') {
        // Redirect to sign in if not authenticated
        window.location.href = 'signin.html';
        return;
    }
    
    // Update navigation with user menu
    updateUserMenu();
}

// Update navigation with user menu
function updateUserMenu() {
    const userMenu = document.getElementById('user-menu');
    const customerName = localStorage.getItem('fitpickd_customer_name') || 'User';
    
    userMenu.innerHTML = `
        <a href="wishlist.html" class="text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium transition-colors">
            <i class="fas fa-heart mr-1"></i>Wishlist
        </a>
        <a href="profile.html" class="text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium transition-colors">
            ${customerName}
        </a>
        <button onclick="logout()" class="text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium transition-colors">
            <i class="fas fa-sign-out-alt mr-1"></i>Logout
        </button>
    `;
}

// Load user profile data
function loadUserProfile() {
    const customerId = localStorage.getItem('fitpickd_customer_id');
    const users = JSON.parse(localStorage.getItem('fitpickd_users') || '[]');
    const user = users.find(u => u.id == customerId);
    
    if (!user) {
        showError('User data not found. Please sign in again.');
        return;
    }
    
    // Populate form fields
    document.getElementById('first-name').value = user.firstName || '';
    document.getElementById('email').value = user.email || '';
    document.getElementById('phone').value = user.phone || '';
    
    // Format and display account creation date
    const createdDate = user.createdAt ? new Date(user.createdAt) : new Date();
    const formattedDate = createdDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    document.getElementById('account-created-date').textContent = formattedDate;
}

// Initialize profile form
function initializeProfileForm() {
    const form = document.getElementById('profile-form');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        updateProfile();
    });
}

// Update user profile
function updateProfile() {
    const firstName = document.getElementById('first-name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    
    // Clear previous error
    hideError();
    
    // Validate form
    if (!validateProfileForm(firstName, email, phone)) {
        return;
    }
    
    // Get current user
    const customerId = localStorage.getItem('fitpickd_customer_id');
    const users = JSON.parse(localStorage.getItem('fitpickd_users') || '[]');
    const userIndex = users.findIndex(u => u.id == customerId);
    
    if (userIndex === -1) {
        showError('User data not found. Please sign in again.');
        return;
    }
    
    // Check if email or phone is already taken by another user
    const emailExists = users.some((u, index) => index !== userIndex && u.email === email);
    const phoneExists = users.some((u, index) => index !== userIndex && u.phone === phone);
    
    if (emailExists) {
        showError('This email address is already registered with another account.');
        return;
    }
    
    if (phoneExists) {
        showError('This phone number is already registered with another account.');
        return;
    }
    
    // Update user data
    users[userIndex].firstName = firstName;
    users[userIndex].email = email;
    users[userIndex].phone = phone;
    
    // Save updated users
    localStorage.setItem('fitpickd_users', JSON.stringify(users));
    
    // Update session data
    localStorage.setItem('fitpickd_customer_name', firstName);
    localStorage.setItem('fitpickd_customer_email', email);
    localStorage.setItem('fitpickd_customer_phone', phone);
    
    // Update navigation
    updateUserMenu();
    
    // Show success message
    showSuccess('Profile updated successfully!');
}

// Validate profile form
function validateProfileForm(firstName, email, phone) {
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
    
    return true;
}

// Change password function
function changePassword() {
    // Create a simple password change modal
    const currentPassword = prompt('Enter your current password:');
    if (!currentPassword) return;
    
    // Verify current password
    const customerId = localStorage.getItem('fitpickd_customer_id');
    const users = JSON.parse(localStorage.getItem('fitpickd_users') || '[]');
    const user = users.find(u => u.id == customerId);
    
    if (!user || user.password !== currentPassword) {
        showError('Current password is incorrect.');
        return;
    }
    
    const newPassword = prompt('Enter your new password (minimum 6 characters):');
    if (!newPassword || newPassword.length < 6) {
        showError('New password must be at least 6 characters long.');
        return;
    }
    
    const confirmPassword = prompt('Confirm your new password:');
    if (newPassword !== confirmPassword) {
        showError('Passwords do not match.');
        return;
    }
    
    // Update password
    const userIndex = users.findIndex(u => u.id == customerId);
    users[userIndex].password = newPassword;
    localStorage.setItem('fitpickd_users', JSON.stringify(users));
    
    showSuccess('Password changed successfully!');
}

// Delete account function
function deleteAccount() {
    const confirmDelete = confirm('Are you sure you want to delete your account? This action cannot be undone.');
    if (!confirmDelete) return;
    
    const password = prompt('Enter your password to confirm account deletion:');
    if (!password) return;
    
    // Verify password
    const customerId = localStorage.getItem('fitpickd_customer_id');
    const users = JSON.parse(localStorage.getItem('fitpickd_users') || '[]');
    const user = users.find(u => u.id == customerId);
    
    if (!user || user.password !== password) {
        showError('Password is incorrect.');
        return;
    }
    
    // Remove user from users array
    const updatedUsers = users.filter(u => u.id != customerId);
    localStorage.setItem('fitpickd_users', JSON.stringify(updatedUsers));
    
    // Clear session data
    logout();
    
    showSuccess('Account deleted successfully. Redirecting to homepage...');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 2000);
}

// Logout function
function logout() {
    localStorage.removeItem('fitpickd_customer_session');
    localStorage.removeItem('fitpickd_user_role');
    localStorage.removeItem('fitpickd_customer_name');
    localStorage.removeItem('fitpickd_customer_email');
    localStorage.removeItem('fitpickd_customer_phone');
    localStorage.removeItem('fitpickd_customer_id');
    
    window.location.href = 'index.html';
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
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.add('translate-y-[-100px]', 'opacity-0');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
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