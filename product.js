// Product detail page JavaScript

let currentProduct = null;
let currentImageIndex = 0;
let productImages = [];

document.addEventListener('DOMContentLoaded', function() {
    loadProductDetails();
    initializeImageSlider();
    initializeMobileSwipe();
    updateUserNavigation();
});

// Load product details from URL parameter
function loadProductDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (!productId) {
        window.location.href = 'shop.html';
        return;
    }
    
    // Get product from localStorage
    const products = window.FitPickd.getProducts();
    currentProduct = products.find(p => p.id == productId);
    
    if (!currentProduct) {
        window.location.href = 'shop.html';
        return;
    }
    
    // Set up images (for now using single image, will be updated for multiple images)
    productImages = currentProduct.images || [currentProduct.image];
    
    // Update page content
    updateProductDisplay();
    loadRelatedProducts();
}

// Update product display
function updateProductDisplay() {
    // Update page title
    document.title = `${currentProduct.name} - FitPickd`;
    
    // Update breadcrumb
    document.getElementById('product-category').textContent = currentProduct.category;
    document.getElementById('product-category-badge').textContent = currentProduct.category;
    
    // Update product information
    document.getElementById('product-title').textContent = currentProduct.name;
    document.getElementById('product-price').textContent = `₹${currentProduct.price}`;
    document.getElementById('product-description').textContent = currentProduct.description;
    document.getElementById('sku-value').textContent = `FP-${currentProduct.id.toString().padStart(3, '0')}`;
    
    // Update main image
    updateMainImage(0);
    
    // Update thumbnails
    updateThumbnails();
    
    // Update size options
    updateSizeOptions();
    
    // Update specifications
    updateSpecifications();
    
    // Set up order button
    document.getElementById('order-btn').onclick = () => {
        window.FitPickd.openWhatsApp(currentProduct.name, currentProduct.price);
    };
    
    // Set up wishlist button
    updateWishlistButton();
}

// Update main image
function updateMainImage(index) {
    if (productImages.length === 0) return;
    
    currentImageIndex = index;
    const mainImage = document.getElementById('main-image');
    mainImage.src = productImages[index];
    mainImage.alt = `${currentProduct.name} - Image ${index + 1}`;
    
    // Update counter
    document.getElementById('image-counter').textContent = index + 1;
    document.getElementById('total-images').textContent = productImages.length;
    
    // Update thumbnail selection
    updateThumbnailSelection();
}

// Update thumbnails
function updateThumbnails() {
    const container = document.getElementById('thumbnail-container');
    
    if (productImages.length <= 1) {
        container.style.display = 'none';
        return;
    }
    
    container.style.display = 'grid';
    container.innerHTML = productImages.map((image, index) => `
        <div class="thumbnail-item cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${index === 0 ? 'border-black' : 'border-gray-200'}" 
             onclick="updateMainImage(${index})">
            <img src="${image}" alt="Thumbnail ${index + 1}" class="w-full h-20 object-cover">
        </div>
    `).join('');
}

// Update thumbnail selection
function updateThumbnailSelection() {
    const thumbnails = document.querySelectorAll('.thumbnail-item');
    thumbnails.forEach((thumb, index) => {
        if (index === currentImageIndex) {
            thumb.classList.remove('border-gray-200');
            thumb.classList.add('border-black');
        } else {
            thumb.classList.remove('border-black');
            thumb.classList.add('border-gray-200');
        }
    });
}

// Update size options
function updateSizeOptions() {
    const container = document.getElementById('size-options');
    container.innerHTML = currentProduct.sizes.map(size => `
        <button class="size-option border-2 border-gray-300 py-2 px-4 rounded-md hover:border-black transition-colors" 
                onclick="selectSize('${size}')">
            ${size}
        </button>
    `).join('');
}

// Select size
function selectSize(size) {
    // Remove previous selection
    document.querySelectorAll('.size-option').forEach(btn => {
        btn.classList.remove('border-black', 'bg-black', 'text-white');
        btn.classList.add('border-gray-300');
    });
    
    // Add selection to clicked button
    event.target.classList.remove('border-gray-300');
    event.target.classList.add('border-black', 'bg-black', 'text-white');
}

// Update specifications
function updateSpecifications() {
    // Default specifications (can be enhanced with product-specific data)
    document.getElementById('product-material').textContent = 'Premium Cotton';
    document.getElementById('product-fit').textContent = 'Regular Fit';
    document.getElementById('product-care').textContent = 'Machine wash cold';
    document.getElementById('product-origin').textContent = 'India';
}

// Initialize image slider
function initializeImageSlider() {
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    
    prevBtn.addEventListener('click', () => {
        const newIndex = currentImageIndex > 0 ? currentImageIndex - 1 : productImages.length - 1;
        updateMainImage(newIndex);
    });
    
    nextBtn.addEventListener('click', () => {
        const newIndex = currentImageIndex < productImages.length - 1 ? currentImageIndex + 1 : 0;
        updateMainImage(newIndex);
    });
    
    // Hide navigation if only one image
    if (productImages.length <= 1) {
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
    }
}

// Initialize mobile swipe
function initializeMobileSwipe() {
    const mainImage = document.getElementById('main-image');
    let startX = 0;
    let endX = 0;
    
    mainImage.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
    });
    
    mainImage.addEventListener('touchend', (e) => {
        endX = e.changedTouches[0].clientX;
        handleSwipe();
    });
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = startX - endX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe left - next image
                const newIndex = currentImageIndex < productImages.length - 1 ? currentImageIndex + 1 : 0;
                updateMainImage(newIndex);
            } else {
                // Swipe right - previous image
                const newIndex = currentImageIndex > 0 ? currentImageIndex - 1 : productImages.length - 1;
                updateMainImage(newIndex);
            }
        }
    }
}

// Load related products
function loadRelatedProducts() {
    const products = window.FitPickd.getProducts();
    const relatedProducts = products
        .filter(p => p.category === currentProduct.category && p.id !== currentProduct.id)
        .slice(0, 4);
    
    const container = document.getElementById('related-products');
    
    if (relatedProducts.length === 0) {
        container.innerHTML = '<p class="text-gray-500 col-span-full text-center">No related products found.</p>';
        return;
    }
    
    container.innerHTML = relatedProducts.map(product => `
        <div class="product-card bg-white rounded-lg shadow-md overflow-hidden hover-lift">
            <div class="relative">
                <img src="${product.image}" alt="${product.name}" 
                     class="w-full h-48 object-cover" 
                     loading="lazy">
                <div class="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                    SALE
                </div>
            </div>
            <div class="p-4">
                <h3 class="text-lg font-semibold mb-2">${product.name}</h3>
                <p class="text-gray-600 text-sm mb-3">${product.description.substring(0, 60)}...</p>
                <div class="flex justify-between items-center">
                    <span class="text-xl font-bold">₹${product.price}</span>
                    <button onclick="window.location.href='product.html?id=${product.id}'" 
                            class="bg-black text-white px-3 py-1 rounded text-sm hover:bg-gray-800 transition-colors">
                        View
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (productImages.length <= 1) return;
    
    if (e.key === 'ArrowLeft') {
        const newIndex = currentImageIndex > 0 ? currentImageIndex - 1 : productImages.length - 1;
        updateMainImage(newIndex);
    } else if (e.key === 'ArrowRight') {
        const newIndex = currentImageIndex < productImages.length - 1 ? currentImageIndex + 1 : 0;
        updateMainImage(newIndex);
    }
});

// Wishlist functionality for product detail page
function handleProductWishlistClick() {
    if (!currentProduct) return;
    
    const isLoggedIn = localStorage.getItem('fitpickd_user_session') === 'true' || 
                      localStorage.getItem('fitpickd_admin_session') === 'true';
    
    if (!isLoggedIn) {
        showProductNotification('Please log-in to use this feature', 'info');
        return;
    }
    
    // Add to wishlist functionality
    const wishlist = JSON.parse(localStorage.getItem('fitpickd_wishlist') || '[]');
    const existingIndex = wishlist.findIndex(item => item.id === currentProduct.id);
    
    if (existingIndex === -1) {
        wishlist.push(currentProduct);
        showProductNotification('Added to wishlist!', 'success');
    } else {
        wishlist.splice(existingIndex, 1);
        showProductNotification('Removed from wishlist!', 'success');
    }
    
    localStorage.setItem('fitpickd_wishlist', JSON.stringify(wishlist));
    updateWishlistButton();
}

// Custom notification function for product page
function showProductNotification(message, type = 'info') {
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

// Update wishlist button appearance
function updateWishlistButton() {
    if (!currentProduct) return;
    
    const wishlistBtn = document.getElementById('wishlist-btn');
    const wishlist = JSON.parse(localStorage.getItem('fitpickd_wishlist') || '[]');
    const isInWishlist = wishlist.some(item => item.id === currentProduct.id);
    
    if (isInWishlist) {
        wishlistBtn.innerHTML = '<i class="fas fa-heart mr-2 text-red-500"></i>In Wishlist';
        wishlistBtn.classList.add('bg-red-50', 'border-red-500', 'text-red-500');
        wishlistBtn.classList.remove('border-black', 'text-black');
    } else {
        wishlistBtn.innerHTML = '<i class="fas fa-heart mr-2"></i>Wishlist';
        wishlistBtn.classList.remove('bg-red-50', 'border-red-500', 'text-red-500');
        wishlistBtn.classList.add('border-black', 'text-black');
    }
}

// Export functions for use in other files
window.ProductDetail = {
    updateMainImage,
    selectSize,
    loadProductDetails,
    handleProductWishlistClick
}; 