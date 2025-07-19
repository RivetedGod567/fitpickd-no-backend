// Category page JavaScript (for shirts.html and trousers.html)

let currentProducts = [];
let filteredProducts = [];
let currentCategory = '';

document.addEventListener('DOMContentLoaded', function() {
    initializeCategory();
});

// Initialize category page
function initializeCategory() {
    // Determine current category from page title
    const pageTitle = document.title.toLowerCase();
    if (pageTitle.includes('shirts')) {
        currentCategory = 'shirts';
    } else if (pageTitle.includes('trousers')) {
        currentCategory = 'trousers';
    }
    
    // Load products
    currentProducts = window.FitPickd.getProducts();
    filteredProducts = currentProducts.filter(product => product.category === currentCategory);
    
    // Initialize search
    initializeSearch();
    
    // Display products
    displayProducts();
    updateProductsCount();
}

// Initialize search functionality
function initializeSearch() {
    const searchInput = document.getElementById('search-input');
    let searchTimeout;
    
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const query = this.value.trim();
            searchProducts(query);
        }, 300);
    });
}

// Search products within category
function searchProducts(query) {
    if (!query) {
        filteredProducts = currentProducts.filter(product => product.category === currentCategory);
    } else {
        const searchResults = window.FitPickd.searchProducts(query);
        filteredProducts = searchResults.filter(product => product.category === currentCategory);
    }
    
    displayProducts();
    updateProductsCount();
}

// Display products in grid
function displayProducts() {
    const productsGrid = document.getElementById('products-grid');
    const noProducts = document.getElementById('no-products');
    
    if (filteredProducts.length === 0) {
        productsGrid.classList.add('hidden');
        noProducts.classList.remove('hidden');
        return;
    }
    
    productsGrid.classList.remove('hidden');
    noProducts.classList.add('hidden');
    
    productsGrid.innerHTML = filteredProducts.map(product => `
        <div class="product-card bg-white rounded-lg shadow-md overflow-hidden hover-lift group">
            <div class="relative">
                <img src="${product.images ? product.images[0] : product.image}" alt="${product.name}" 
                     class="w-full h-[500px] object-cover lazy-image cursor-pointer transition-transform duration-300 group-hover:scale-105" 
                     loading="lazy"
                     onclick="window.location.href='product.html?id=${product.id}'">
                <!-- Wishlist Heart Icon -->
                <button onclick="handleWishlistClick(${product.id})" class="absolute top-4 right-4 bg-white rounded-full p-2 shadow-md hover:bg-red-50 transition-colors">
                    <svg class="w-5 h-5 text-gray-400 hover:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                    </svg>
                </button>
            </div>
            <div class="p-4">
                <!-- Brand Name -->
                <p class="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">ASCOT</p>
                
                <!-- Product Name -->
                <h3 class="text-sm font-medium text-black mb-2 cursor-pointer hover:text-gray-600 transition-colors line-clamp-2" 
                    onclick="window.location.href='product.html?id=${product.id}'">${product.name}</h3>
                
                <!-- Price -->
                <div class="flex justify-between items-center">
                    <span class="text-lg font-semibold text-black">₹ ${product.price.toFixed(2)}</span>
                    <button onclick="window.FitPickd.openWhatsApp('${product.name}', ${product.price})" 
                            class="bg-black text-white px-3 py-1.5 rounded text-sm hover:bg-gray-800 transition-colors">
                        Order
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    // Reinitialize lazy loading for new images
    if (window.initializeLazyLoading) {
        window.initializeLazyLoading();
    }
}

// Update products count
function updateProductsCount() {
    const productsCount = document.getElementById('products-count');
    const totalProducts = currentProducts.filter(product => product.category === currentCategory).length;
    const showingProducts = filteredProducts.length;
    
    if (showingProducts === totalProducts) {
        productsCount.textContent = `Showing all ${currentCategory}`;
    } else {
        productsCount.textContent = `Showing ${showingProducts} of ${totalProducts} ${currentCategory}`;
    }
}

// Sort products by price
function sortProducts(sortBy) {
    const sortedProducts = [...filteredProducts];
    
    switch(sortBy) {
        case 'price-low':
            sortedProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            sortedProducts.sort((a, b) => b.price - a.price);
            break;
        case 'name':
            sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
        default:
            break;
    }
    
    filteredProducts = sortedProducts;
    displayProducts();
}

// Filter products by price range
function filterByPriceRange(minPrice, maxPrice) {
    filteredProducts = currentProducts.filter(product => 
        product.category === currentCategory &&
        product.price >= minPrice && 
        product.price <= maxPrice
    );
    
    displayProducts();
    updateProductsCount();
}

// Export functions for potential use
window.CategoryManager = {
    searchProducts,
    sortProducts,
    filterByPriceRange,
    displayProducts
}; 