// Main JavaScript for FitPickd Website

// Sample product data
const products = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeMobileMenu();
    loadProducts();
    initializeLazyLoading();
    addScrollEffects();
    updateUserNavigation();
});

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

// Load products on homepage
function loadProducts() {
    const featuredProductsContainer = document.getElementById('featured-products');
    if (!featuredProductsContainer) return;

    // Load products from localStorage or use default
    const storedProducts = localStorage.getItem('fitpickd_products');
    const currentProducts = storedProducts ? JSON.parse(storedProducts) : products;

    // Get featured product IDs from localStorage
    const featuredIds = JSON.parse(localStorage.getItem('fitpickd_featured') || '[]');
    let featuredProducts = [];
    if (featuredIds.length === 3) {
        featuredProducts = featuredIds.map(id => currentProducts.find(p => p.id === id)).filter(Boolean);
    } else {
        // fallback: show first 3 products
        featuredProducts = currentProducts.slice(0, 3);
    }
    
    featuredProductsContainer.innerHTML = featuredProducts.map(product => `
        <div class="product-card bg-white rounded-lg shadow-md overflow-hidden hover-lift">
            <div class="relative">
                <img src="${product.images ? product.images[0] : product.image}" alt="${product.name}" 
                     class="w-full h-64 object-cover lazy-image cursor-pointer" loading="lazy">
                <span class="absolute top-4 left-4 bg-yellow-400 text-white text-xs font-bold px-3 py-1 rounded-full shadow">Featured</span>
            </div>
            <div class="p-4">
                <h3 class="text-lg font-semibold text-black mb-2">${product.name}</h3>
                <p class="text-gray-600 text-sm mb-4 line-clamp-2">${product.description}</p>
                <div class="flex items-center justify-between">
                    <span class="text-lg font-bold text-black">₹${product.price}</span>
                    <a href="product.html?id=${product.id}" class="bg-black text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors">View</a>
                </div>
            </div>
        </div>
    `).join('');
}

// Initialize lazy loading for images
function initializeLazyLoading() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.classList.remove('lazy-image');
                    img.src = img.src;
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }
}

// Add scroll effects
function addScrollEffects() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animateElements = document.querySelectorAll('.product-card, .fade-in-up');
    animateElements.forEach(el => observer.observe(el));
}

// WhatsApp integration
function openWhatsApp(productName, price) {
    const message = `Hi! I'm interested in ordering the ${productName} for ₹${price}. Can you help me with the details?`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappURL = `https://wa.me/919876543210?text=${encodedMessage}`;
    window.open(whatsappURL, '_blank');
}

// Utility function to format price
function formatPrice(price) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0
    }).format(price);
}

// Save products to localStorage
function saveProducts(products) {
    localStorage.setItem('fitpickd_products', JSON.stringify(products));
}

// Get products from localStorage
function getProducts() {
    const stored = localStorage.getItem('fitpickd_products');
    return stored ? JSON.parse(stored) : products;
}

// Add new product (for admin)
function addProduct(product) {
    const currentProducts = getProducts();
    const newProduct = {
        ...product,
        id: Date.now() // Simple ID generation
    };
    currentProducts.push(newProduct);
    saveProducts(currentProducts);
    return newProduct;
}

// Update product (for admin)
function updateProduct(id, updates) {
    const currentProducts = getProducts();
    const index = currentProducts.findIndex(p => p.id === id);
    if (index !== -1) {
        currentProducts[index] = { ...currentProducts[index], ...updates };
        saveProducts(currentProducts);
        return currentProducts[index];
    }
    return null;
}

// Delete product (for admin)
function deleteProduct(id) {
    const currentProducts = getProducts();
    const filteredProducts = currentProducts.filter(p => p.id !== id);
    saveProducts(filteredProducts);
}

// Search products
function searchProducts(query) {
    const currentProducts = getProducts();
    return currentProducts.filter(product => 
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase())
    );
}

// Filter products by category
function filterProductsByCategory(category) {
    const currentProducts = getProducts();
    if (category === 'all') return currentProducts;
    return currentProducts.filter(product => product.category === category);
}

// Wishlist functionality
function handleWishlistClick(productId) {
    const isLoggedIn = localStorage.getItem('fitpickd_user_session') === 'true' || 
                      localStorage.getItem('fitpickd_admin_session') === 'true';
    
    if (!isLoggedIn) {
        showNotification('Please log-in to use this feature', 'info');
        return;
    }
    
    // Add to wishlist functionality here
    const wishlist = JSON.parse(localStorage.getItem('fitpickd_wishlist') || '[]');
    const product = getProducts().find(p => p.id === productId);
    
    if (product) {
        const existingIndex = wishlist.findIndex(item => item.id === productId);
        if (existingIndex === -1) {
            wishlist.push(product);
            showNotification('Added to wishlist!', 'success');
            // Change heart icon to pink and fill
            const heartBtn = document.querySelector(`button[onclick="handleWishlistClick(${productId})"] svg`);
            if (heartBtn) {
                heartBtn.classList.remove('text-gray-400', 'hover:text-red-500');
                heartBtn.classList.add('text-pink-500');
                heartBtn.setAttribute('fill', '#ec4899'); // Tailwind pink-500
                heartBtn.setAttribute('stroke', '#ec4899');
            }
        } else {
            wishlist.splice(existingIndex, 1);
            showNotification('Removed from wishlist!', 'success');
            // Revert heart icon color and fill
            const heartBtn = document.querySelector(`button[onclick="handleWishlistClick(${productId})"] svg`);
            if (heartBtn) {
                heartBtn.classList.remove('text-pink-500');
                heartBtn.classList.add('text-gray-400', 'hover:text-red-500');
                heartBtn.setAttribute('fill', 'none');
                heartBtn.setAttribute('stroke', 'currentColor');
            }
        }
        localStorage.setItem('fitpickd_wishlist', JSON.stringify(wishlist));
    }
}

// Custom notification function
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.custom-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `custom-notification fixed top-20 left-1/2 transform -translate-x-1/2 z-50 p-4 rounded-lg shadow-lg max-w-sm transition-all duration-300 translate-y-[-100px] opacity-0`;
    
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
            bgColor = 'bg-gray-100';
            textColor = 'text-gray-800';
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

// Export functions for use in other files
window.FitPickd = {
    openWhatsApp,
    formatPrice,
    addProduct,
    updateProduct,
    deleteProduct,
    searchProducts,
    filterProductsByCategory,
    getProducts,
    saveProducts,
    handleWishlistClick,
    showNotification
};

// Update user navigation based on authentication status
function updateUserNavigation() {
    const userMenu = document.getElementById('user-menu');
    if (!userMenu) return;
    
    const customerSession = localStorage.getItem('fitpickd_customer_session');
    const adminSession = localStorage.getItem('fitpickd_admin_session');
    
    if (customerSession === 'true') {
        // Customer is logged in
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
    } else if (adminSession === 'true') {
        // Admin is logged in
        const username = localStorage.getItem('fitpickd_username') || 'Admin';
        userMenu.innerHTML = `
            <a href="admin.html" class="text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                <i class="fas fa-cog mr-1"></i>Dashboard
            </a>
            <span class="text-white px-3 py-2 text-sm font-medium">${username}</span>
            <button onclick="logout()" class="text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                <i class="fas fa-sign-out-alt mr-1"></i>Logout
            </button>
        `;
    } else {
        // No user logged in
        userMenu.innerHTML = `
            <a href="signin.html" class="bg-white text-black px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors">
                Sign In
            </a>
        `;
    }
}

// Logout function
function logout() {
    localStorage.removeItem('fitpickd_customer_session');
    localStorage.removeItem('fitpickd_admin_session');
    localStorage.removeItem('fitpickd_user_role');
    localStorage.removeItem('fitpickd_username');
    localStorage.removeItem('fitpickd_customer_name');
    localStorage.removeItem('fitpickd_customer_email');
    localStorage.removeItem('fitpickd_customer_phone');
    localStorage.removeItem('fitpickd_customer_id');
    
    // Update navigation
    updateUserNavigation();
    
    // Redirect to homepage
    window.location.href = 'index.html';
} 