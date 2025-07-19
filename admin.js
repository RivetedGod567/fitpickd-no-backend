// Admin Dashboard JavaScript

let currentProducts = [];

document.addEventListener('DOMContentLoaded', function() {
    checkAdminAuth();
    initializeAdmin();
    // Manage Accounts button
    const manageAccountsBtn = document.getElementById('manage-accounts-btn');
    if (manageAccountsBtn) {
        manageAccountsBtn.addEventListener('click', openAccountsModal);
    }
});

// Check admin authentication
function checkAdminAuth() {
    const adminSession = localStorage.getItem('fitpickd_admin_session');
    if (adminSession !== 'true') {
        window.location.href = 'signin.html';
        return;
    }
    
    // Set admin name
    const adminName = localStorage.getItem('fitpickd_username') || 'Admin';
    document.getElementById('admin-name').textContent = adminName;
}

// Initialize admin dashboard
function initializeAdmin() {
    loadProducts();
    initializeForms();
    initializeSearch();
    initializeFilters();
    updateStats();
}

// Load products
function loadProducts() {
    currentProducts = window.FitPickd.getProducts();
    displayProductsTable();
}

// Display products in table
function displayProductsTable() {
    const tableBody = document.getElementById('products-table-body');
    
    if (currentProducts.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="px-6 py-4 text-center text-gray-500">
                    No products found. Add your first product above.
                </td>
            </tr>
        `;
        return;
    }
    
    tableBody.innerHTML = currentProducts.map(product => `
        <tr class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <div class="h-10 w-10 flex-shrink-0">
                        <img class="h-10 w-10 rounded object-cover" src="${product.image}" alt="${product.name}">
                    </div>
                    <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">${product.name}</div>
                        <div class="text-sm text-gray-500">${product.description.substring(0, 50)}...</div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                             ${product.category === 'shirts' ? 'bg-blue-100 text-blue-800' : 
                               product.category === 'polo-tshirt' ? 'bg-green-100 text-green-800' : 
                               'bg-purple-100 text-purple-800'}">
                    ${product.category === 'trousers' ? 'Trouser' : product.category === 'shirts' ? 'Shirt' : product.category === 'polo-tshirt' ? 'Polo' : product.category}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ₹${product.price}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${product.sizes.join(', ')}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button onclick="toggleFeatured(${product.id})" 
                        class="mr-3" title="Toggle Featured">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="${isProductFeatured(product.id) ? '#FFD700' : '#fff'}" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-star">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                </button>
                <button onclick="editProduct(${product.id})" 
                        class="text-indigo-600 hover:text-indigo-900 mr-3">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button onclick="deleteProduct(${product.id})" 
                        class="text-red-600 hover:text-red-900">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </td>
        </tr>
    `).join('');
}

// Initialize forms
function initializeForms() {
    // Add product form
    const addForm = document.getElementById('add-product-form');
    addForm.addEventListener('submit', handleAddProduct);
    
    // Edit product form
    const editForm = document.getElementById('edit-product-form');
    editForm.addEventListener('submit', handleEditProduct);
    
    // Initialize image upload handlers
    initializeImageUploads();
}

// Handle add product
function handleAddProduct(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const product = {
        name: formData.get('product-name') || document.getElementById('product-name').value,
        category: formData.get('product-category') || document.getElementById('product-category').value,
        price: parseInt(formData.get('product-price') || document.getElementById('product-price').value),
        description: formData.get('product-description') || document.getElementById('product-description').value,
        images: getUploadedImages(), // Get uploaded images
        sizes: (formData.get('product-sizes') || document.getElementById('product-sizes').value).split(',').map(s => s.trim())
    };
    
    // Validate product
    if (!validateProduct(product)) {
        return;
    }
    
    // Add product
    const newProduct = window.FitPickd.addProduct(product);
    currentProducts.push(newProduct);
    
    // Update display
    displayProductsTable();
    updateStats();
    
    // Reset form
    event.target.reset();
    clearImagePreviews();
    
    // Show success message
    showNotification('Product added successfully!', 'success');
}

// Handle edit product
function handleEditProduct(event) {
    event.preventDefault();
    
    const productId = parseInt(document.getElementById('edit-product-id').value);
    const updates = {
        name: document.getElementById('edit-product-name').value,
        category: document.getElementById('edit-product-category').value,
        price: parseInt(document.getElementById('edit-product-price').value),
        description: document.getElementById('edit-product-description').value,
        images: getEditUploadedImages(), // Get uploaded images for edit
        sizes: document.getElementById('edit-product-sizes').value.split(',').map(s => s.trim())
    };
    
    // Validate product
    if (!validateProduct(updates)) {
        return;
    }
    
    // Update product
    const updatedProduct = window.FitPickd.updateProduct(productId, updates);
    if (updatedProduct) {
        const index = currentProducts.findIndex(p => p.id === productId);
        if (index !== -1) {
            currentProducts[index] = updatedProduct;
        }
        
        // Update display
        displayProductsTable();
        updateStats();
        
        // Close modal
        closeEditModal();
        
        // Show success message
        showNotification('Product updated successfully!', 'success');
    }
}

// Validate product data
function validateProduct(product) {
    if (!product.name || !product.category || !product.price || !product.description || !product.sizes.length) {
        showNotification('Please fill in all fields.', 'error');
        return false;
    }
    
    if (product.price <= 0) {
        showNotification('Price must be greater than 0.', 'error');
        return false;
    }
    
    if (!product.images || product.images.length === 0) {
        showNotification('Please upload at least one image.', 'error');
        return false;
    }
    
    return true;
}

// Edit product
function editProduct(productId) {
    const product = currentProducts.find(p => p.id === productId);
    if (!product) return;
    
    // Fill edit form
    document.getElementById('edit-product-id').value = product.id;
    document.getElementById('edit-product-name').value = product.name;
    document.getElementById('edit-product-category').value = product.category;
    document.getElementById('edit-product-price').value = product.price;
    document.getElementById('edit-product-description').value = product.description;
    document.getElementById('edit-product-sizes').value = product.sizes.join(', ');
    
    // Show current images
    const currentImages = product.images || [product.image];
    showCurrentImages(currentImages);
    
    // Clear edit uploaded images
    editUploadedImages = [];
    updateEditImagePreviews();
    
    // Show modal
    document.getElementById('edit-modal').classList.remove('hidden');
}

// Close edit modal
function closeEditModal() {
    document.getElementById('edit-modal').classList.add('hidden');
}

// Delete product
function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        window.FitPickd.deleteProduct(productId);
        currentProducts = currentProducts.filter(p => p.id !== productId);
        
        // Update display
        displayProductsTable();
        updateStats();
        
        // Show success message
        showNotification('Product deleted successfully!', 'success');
    }
}

// Initialize search
function initializeSearch() {
    const searchInput = document.getElementById('search-products');
    let searchTimeout;
    
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const query = this.value.trim();
            filterProducts(query);
        }, 300);
    });
}

// Initialize filters
function initializeFilters() {
    const filterSelect = document.getElementById('filter-category');
    filterSelect.addEventListener('change', function() {
        const category = this.value;
        filterProducts('', category);
    });
}

// Filter products
function filterProducts(query = '', category = 'all') {
    let filtered = [...currentProducts];
    
    // Filter by search query
    if (query) {
        filtered = filtered.filter(product => 
            product.name.toLowerCase().includes(query.toLowerCase()) ||
            product.description.toLowerCase().includes(query.toLowerCase())
        );
    }
    
    // Filter by category
    if (category !== 'all') {
        filtered = filtered.filter(product => product.category === category);
    }
    
    // Update table with filtered products
    displayFilteredProducts(filtered);
}

// Display filtered products
function displayFilteredProducts(filteredProducts) {
    const tableBody = document.getElementById('products-table-body');
    
    if (filteredProducts.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="px-6 py-4 text-center text-gray-500">
                    No products found matching your criteria.
                </td>
            </tr>
        `;
        return;
    }
    
    tableBody.innerHTML = filteredProducts.map(product => `
        <tr class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <div class="h-10 w-10 flex-shrink-0">
                        <img class="h-10 w-10 rounded object-cover" src="${product.image}" alt="${product.name}">
                    </div>
                    <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">${product.name}</div>
                        <div class="text-sm text-gray-500">${product.description.substring(0, 50)}...</div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                             ${product.category === 'shirts' ? 'bg-blue-100 text-blue-800' : 
                               product.category === 'polo-tshirt' ? 'bg-green-100 text-green-800' : 
                               'bg-purple-100 text-purple-800'}">
                    ${product.category === 'trousers' ? 'Trouser' : product.category === 'shirts' ? 'Shirt' : product.category === 'polo-tshirt' ? 'Polo' : product.category}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ₹${product.price}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${product.sizes.join(', ')}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button onclick="editProduct(${product.id})" 
                        class="text-indigo-600 hover:text-indigo-900 mr-3">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button onclick="deleteProduct(${product.id})" 
                        class="text-red-600 hover:text-red-900">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </td>
        </tr>
    `).join('');
}

// Update statistics
function updateStats() {
    const totalProducts = currentProducts.length;
    const totalShirts = currentProducts.filter(p => p.category === 'shirts').length;
    const totalPoloTshirts = currentProducts.filter(p => p.category === 'polo-tshirt').length;
    const totalTrousers = currentProducts.filter(p => p.category === 'trousers').length;
    
    document.getElementById('total-products').textContent = totalProducts;
    document.getElementById('total-shirts').textContent = totalShirts;
    document.getElementById('total-polos').textContent = totalPoloTshirts;
    document.getElementById('total-pants').textContent = totalTrousers;
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

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        // Clear admin session
        localStorage.removeItem('fitpickd_admin_session');
        localStorage.removeItem('fitpickd_username');
        
        // Redirect to login page
        window.location.href = 'signin.html';
    }
}

// Image upload functionality
let uploadedImages = [];
let editUploadedImages = [];

function initializeImageUploads() {
    const imageInput = document.getElementById('product-images');
    const editImageInput = document.getElementById('edit-product-images');
    
    imageInput.addEventListener('change', handleImageUpload);
    editImageInput.addEventListener('change', handleEditImageUpload);
}

function handleImageUpload(event) {
    const files = Array.from(event.target.files);
    uploadedImages = [];
    
    if (files.length > 4) {
        showNotification('Please select maximum 4 images.', 'error');
        return;
    }
    
    files.forEach((file, index) => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                uploadedImages.push(e.target.result);
                updateImagePreviews();
            };
            reader.readAsDataURL(file);
        }
    });
}

function handleEditImageUpload(event) {
    const files = Array.from(event.target.files);
    editUploadedImages = [];
    
    if (files.length > 4) {
        showNotification('Please select maximum 4 images.', 'error');
        return;
    }
    
    files.forEach((file, index) => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                editUploadedImages.push(e.target.result);
                updateEditImagePreviews();
            };
            reader.readAsDataURL(file);
        }
    });
}

function updateImagePreviews() {
    const container = document.getElementById('image-preview-container');
    container.innerHTML = uploadedImages.map((image, index) => `
        <div class="relative">
            <img src="${image}" alt="Preview ${index + 1}" class="w-full h-24 object-cover rounded border">
            <button onclick="removeImage(${index})" class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                ×
            </button>
        </div>
    `).join('');
}