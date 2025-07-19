// Wishlist page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    checkUserAuthentication();
    loadWishlist();
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

// Load wishlist items
function loadWishlist() {
    const wishlistLoading = document.getElementById('wishlist-loading');
    const wishlistEmpty = document.getElementById('wishlist-empty');
    const wishlistItems = document.getElementById('wishlist-items');
    const wishlistGrid = document.getElementById('wishlist-grid');
    const wishlistCount = document.getElementById('wishlist-count');
    
    // Get wishlist from localStorage
    const wishlist = JSON.parse(localStorage.getItem('fitpickd_wishlist') || '[]');
    
    // Hide loading state
    wishlistLoading.classList.add('hidden');
    
    if (wishlist.length === 0) {
        // Show empty state
        wishlistEmpty.classList.remove('hidden');
        return;
    }
    
    // Get all products
    const products = JSON.parse(localStorage.getItem('fitpickd_products') || '[]');
    
    // Filter products that are in wishlist
    const wishlistProducts = products.filter(product => wishlist.includes(product.id));
    
    // Update count
    wishlistCount.textContent = wishlistProducts.length;
    
    // Show wishlist items
    wishlistItems.classList.remove('hidden');
    
    // Clear grid
    wishlistGrid.innerHTML = '';
    
    // Add products to grid
    wishlistProducts.forEach(product => {
        const productCard = createWishlistProductCard(product);
        wishlistGrid.appendChild(productCard);
    });
}

// Create wishlist product card
function createWishlistProductCard(product) {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300';
    
    // Get first image from images array
    const productImage = product.images && product.images.length > 0 ? product.images[0] : product.image;
    
    card.innerHTML = `
        <div class="relative">
            <div class="aspect-[3/5] overflow-hidden">
                <img src="${productImage}" alt="${product.name}" 
                     class="w-full h-full object-cover transition-transform duration-300 hover:scale-105">
            </div>
            <button onclick="removeFromWishlist(${product.id})" 
                    class="absolute top-3 right-3 bg-white rounded-full p-2 shadow-lg hover:bg-red-50 transition-colors">
                <i class="fas fa-heart text-red-500"></i>
            </button>
        </div>
        <div class="p-4">
            <h3 class="font-semibold text-black mb-2 line-clamp-2">${product.name}</h3>
            <div class="flex items-center justify-between mb-2">
                <span class="text-lg font-bold text-black">₹${product.price}</span>
                <span class="text-xs px-2 py-1 rounded-full ${getCategoryBadgeColor(product.category)}">
                    ${product.category}
                </span>
            </div>
            <p class="text-gray-600 text-sm mb-4 line-clamp-2">${product.description}</p>
            <div class="flex space-x-2">
                <a href="product.html?id=${product.id}" 
                   class="flex-1 bg-black text-white text-center py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors text-sm">
                    View Details
                </a>
                <button onclick="addToCart(${product.id})" 
                        class="bg-gray-100 text-black py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                    <i class="fas fa-shopping-cart"></i>
                </button>
            </div>
        </div>
    `;
    
    return card;
}

// Remove item from wishlist
function removeFromWishlist(productId) {
    // Get current wishlist
    let wishlist = JSON.parse(localStorage.getItem('fitpickd_wishlist') || '[]');
    
    // Remove product from wishlist
    wishlist = wishlist.filter(id => id !== productId);
    localStorage.setItem('fitpickd_wishlist', JSON.stringify(wishlist));
    
    // Reload wishlist
    loadWishlist();
    
    // Show notification
    showNotification('Item removed from wishlist', 'success');
}

// Clear all wishlist items
function clearWishlist() {
    const confirmClear = confirm('Are you sure you want to clear your entire wishlist?');
    if (!confirmClear) return;
    
    // Clear wishlist
    localStorage.removeItem('fitpickd_wishlist');
    
    // Reload wishlist
    loadWishlist();
    
    // Show notification
    showNotification('Wishlist cleared', 'success');
}

// Add to cart function (placeholder)
function addToCart(productId) {
    showNotification('Add to cart functionality coming soon!', 'info');
}

// Get category badge color
function getCategoryBadgeColor(category) {
    switch (category) {
        case 'Shirt':
            return 'bg-blue-100 text-blue-800';
        case 'Polo T-Shirt':
            return 'bg-green-100 text-green-800';
        case 'Pant':
            return 'bg-purple-100 text-purple-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
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

// Show notification
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification fixed top-20 left-1/2 transform -translate-x-1/2 z-50 p-4 rounded-lg shadow-lg max-w-sm transition-all duration-300 translate-y-[-100px] opacity-0`;
    
    // Set notification content based on type
    let bgColor, textColor, icon;
    switch (type) {
        case 'success':
            bgColor = 'bg-green-100';
            textColor = 'text-green-800';
            icon = 'fas fa-check-circle';
            break;
        case 'error':
            bgColor = 'bg-red-100';
            textColor = 'text-red-800';
            icon = 'fas fa-exclamation-circle';
            break;
        default:
            bgColor = 'bg-blue-100';
            textColor = 'text-blue-800';
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