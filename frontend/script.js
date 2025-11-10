// API base URL
const API_BASE = 'http://localhost:3000/api';

// DOM elements
const productList = document.getElementById('product-list');
const productDetail = document.getElementById('product-detail');
const cartView = document.getElementById('cart-view');
const cartCount = document.getElementById('cart-count');
const homeBtn = document.getElementById('home-btn');
const cartBtn = document.getElementById('cart-btn');
const categoryFilter = document.getElementById('category-filter');

// State management
let products = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Initialize app
async function init() {
    try {
        await loadProducts();
        setupEventListeners();
        updateCartCount();
        showProductList();
    } catch (error) {
        console.error('Failed to initialize app:', error);
    }
}

// Load products from API
async function loadProducts() {
    const response = await fetch(`${API_BASE}/products`);
    products = await response.json();
}

// Setup event listeners
function setupEventListeners() {
    homeBtn.addEventListener('click', showProductList);
    cartBtn.addEventListener('click', showCart);
    categoryFilter.addEventListener('change', filterProducts);
}

// Filter products by category
function filterProducts() {
    const selectedCategory = categoryFilter.value;
    const filteredProducts = selectedCategory ?
        products.filter(product => product.category === selectedCategory) :
        products;
    renderFilteredProducts(filteredProducts);
}

// Render filtered products
function renderFilteredProducts(filteredProducts) {
    productList.innerHTML = '';
    filteredProducts.forEach(product => {
        const productCard = createProductCard(product);
        productList.appendChild(productCard);
    });
}

// Show product list
function showProductList() {
    hideAllViews();
    productList.classList.remove('hidden');
    renderProducts();
}

// Show product detail
function showProductDetail(productId) {
    hideAllViews();
    productDetail.classList.remove('hidden');
    renderProductDetail(productId);
}

// Show cart
function showCart() {
    hideAllViews();
    cartView.classList.remove('hidden');
    renderCart();
}

// Hide all views
function hideAllViews() {
    productList.classList.add('hidden');
    productDetail.classList.add('hidden');
    cartView.classList.add('hidden');
}

// Render products
function renderProducts() {
    productList.innerHTML = '';
    products.forEach(product => {
        const productCard = createProductCard(product);
        productList.appendChild(productCard);
    });
}

// Create product card
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';

    card.innerHTML = `
        <img src="${product.image}" alt="${product.name}" class="product-image">
        <div class="product-info">
            <h3 class="product-name">${product.name}</h3>
            <p class="product-price">$${product.price.toFixed(2)}</p>
            <p class="product-description">${product.description.substring(0, 100)}...</p>
            <button class="add-to-cart-btn" data-product-id="${product.id}">Add to Cart</button>
        </div>
    `;

    card.querySelector('.add-to-cart-btn').addEventListener('click', () => addToCart(product.id));
    card.addEventListener('click', (e) => {
        if (!e.target.classList.contains('add-to-cart-btn')) {
            showProductDetail(product.id);
        }
    });

    return card;
}

// Render product detail
function renderProductDetail(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const cartItem = cart.find(item => item.productId === productId);
    const quantity = cartItem ? cartItem.quantity : 0;

    productDetail.innerHTML = `
        <img src="${product.image}" alt="${product.name}">
        <h2>${product.name}</h2>
        <p class="price">$${product.price.toFixed(2)}</p>
        <p class="description">${product.description}</p>
        <div class="quantity-controls">
            <button id="decrease-qty">-</button>
            <span id="current-qty">${quantity}</span>
            <button id="increase-qty">+</button>
        </div>
        <button id="add-to-cart-detail" class="add-to-cart-btn">Add to Cart</button>
        <button id="back-to-products">Back to Products</button>
    `;

    document.getElementById('decrease-qty').addEventListener('click', () => updateQuantity(productId, -1));
    document.getElementById('increase-qty').addEventListener('click', () => updateQuantity(productId, 1));
    document.getElementById('add-to-cart-detail').addEventListener('click', () => addToCart(productId));
    document.getElementById('back-to-products').addEventListener('click', showProductList);
}

// Update quantity in product detail
function updateQuantity(productId, change) {
    const qtyElement = document.getElementById('current-qty');
    let quantity = parseInt(qtyElement.textContent) + change;
    quantity = Math.max(0, quantity);
    qtyElement.textContent = quantity;
}

// Add to cart
async function addToCart(productId) {
    const qtyElement = document.getElementById('current-qty');
    const quantity = qtyElement ? parseInt(qtyElement.textContent) : 1;

    if (quantity > 0) {
        try {
            const response = await fetch(`${API_BASE}/cart`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId, quantity })
            });
            cart = await response.json();
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCount();
            alert('Item added to cart!');
        } catch (error) {
            console.error('Failed to add to cart:', error);
        }
    }
}

// Update cart count
function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
}

// Render cart
async function renderCart() {
    try {
        const response = await fetch(`${API_BASE}/cart`);
        cart = await response.json();
        localStorage.setItem('cart', JSON.stringify(cart));

        const cartItems = document.getElementById('cart-items');
        cartItems.innerHTML = '';

        if (cart.length === 0) {
            cartItems.innerHTML = '<p>Your cart is empty.</p>';
            document.getElementById('cart-total').style.display = 'none';
            return;
        }

        document.getElementById('cart-total').style.display = 'block';

        let total = 0;
        for (const item of cart) {
            const product = products.find(p => p.id === item.productId);
            if (product) {
                const itemElement = createCartItem(product, item);
                cartItems.appendChild(itemElement);
                total += product.price * item.quantity;
            }
        }

        document.getElementById('total-price').textContent = total.toFixed(2);
    } catch (error) {
        console.error('Failed to load cart:', error);
    }
}

// Create cart item
function createCartItem(product, item) {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'cart-item';

    itemDiv.innerHTML = `
        <img src="${product.image}" alt="${product.name}">
        <div class="cart-item-info">
            <h3>${product.name}</h3>
            <p class="price">$${product.price.toFixed(2)} each</p>
            <div class="quantity">
                <button class="decrease-qty">-</button>
                <span>${item.quantity}</span>
                <button class="increase-qty">+</button>
                <button class="remove-btn">Remove</button>
            </div>
        </div>
    `;

    const decreaseBtn = itemDiv.querySelector('.decrease-qty');
    const increaseBtn = itemDiv.querySelector('.increase-qty');
    const removeBtn = itemDiv.querySelector('.remove-btn');

    decreaseBtn.addEventListener('click', () => updateCartItem(product.id, item.quantity - 1));
    increaseBtn.addEventListener('click', () => updateCartItem(product.id, item.quantity + 1));
    removeBtn.addEventListener('click', () => removeFromCart(product.id));

    return itemDiv;
}

// Update cart item
async function updateCartItem(productId, quantity) {
    try {
        if (quantity > 0) {
            const response = await fetch(`${API_BASE}/cart/${productId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quantity })
            });
            cart = await response.json();
        } else {
            await removeFromCart(productId);
            return;
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        renderCart();
    } catch (error) {
        console.error('Failed to update cart item:', error);
    }
}

// Remove from cart
async function removeFromCart(productId) {
    try {
        const response = await fetch(`${API_BASE}/cart/${productId}`, {
            method: 'DELETE'
        });
        cart = await response.json();
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        renderCart();
    } catch (error) {
        console.error('Failed to remove from cart:', error);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
