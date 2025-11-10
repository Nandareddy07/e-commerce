const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// Data paths
const productsPath = path.join(__dirname, '../data/products.json');
const cartPath = path.join(__dirname, '../data/cart.json');

// Helper functions
function readJSON(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// API Routes

// Get all products
app.get('/api/products', (req, res) => {
  const products = readJSON(productsPath);
  res.json(products);
});

// Get product by ID
app.get('/api/products/:id', (req, res) => {
  const products = readJSON(productsPath);
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

// Get cart
app.get('/api/cart', (req, res) => {
  const cart = readJSON(cartPath);
  res.json(cart);
});

// Add item to cart
app.post('/api/cart', (req, res) => {
  const { productId, quantity } = req.body;
  let cart = readJSON(cartPath);
  const existingItem = cart.find(item => item.productId === productId);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({ productId, quantity });
  }

  writeJSON(cartPath, cart);
  res.json(cart);
});

// Update cart item
app.put('/api/cart/:productId', (req, res) => {
  const { quantity } = req.body;
  let cart = readJSON(cartPath);
  const itemIndex = cart.findIndex(item => item.productId === parseInt(req.params.productId));

  if (itemIndex !== -1) {
    if (quantity > 0) {
      cart[itemIndex].quantity = quantity;
    } else {
      cart.splice(itemIndex, 1);
    }
    writeJSON(cartPath, cart);
    res.json(cart);
  } else {
    res.status(404).json({ error: 'Item not found in cart' });
  }
});

// Remove item from cart
app.delete('/api/cart/:productId', (req, res) => {
  let cart = readJSON(cartPath);
  cart = cart.filter(item => item.productId !== parseInt(req.params.productId));
  writeJSON(cartPath, cart);
  res.json(cart);
});

// Clear cart
app.delete('/api/cart', (req, res) => {
  writeJSON(cartPath, []);
  res.json([]);
});

// Serve index.html for root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
