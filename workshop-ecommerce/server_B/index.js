const express = require('express');
const app = express();
app.use(express.json());

// In-memory product store
let products = [
    { id: 1, name: "Shirt", description: "Blue cotton shirt", price: 29.99, category: "clothes", inStock: true },
    { id: 2, name: "Sneakers", description: "Running shoes", price: 59.99, category: "shoes", inStock: true }
];

// In-memory order store
let orders = [];

// In-memory cart store: { userId: [ { productId, quantity } ] }
let carts = {};

// ==================== PRODUCT ROUTES ====================

app.get('/products', (req, res) => {
    res.json(products);
});

app.get('/products/:id', (req, res) => {
    const product = products.find(p => p.id === parseInt(req.params.id));
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
});

app.post('/products', (req, res) => {
    const newProduct = {
        id: products.length + 1,
        ...req.body
    };
    products.push(newProduct);
    res.status(201).json(newProduct);
});

app.put('/products/:id', (req, res) => {
    const index = products.findIndex(p => p.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ error: "Product not found" });

    products[index] = { ...products[index], ...req.body };
    res.json(products[index]);
});

app.delete('/products/:id', (req, res) => {
    const index = products.findIndex(p => p.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ error: "Product not found" });

    const deleted = products.splice(index, 1);
    res.json({ message: "Deleted", product: deleted[0] });
});

// ==================== ORDER ROUTES ====================

app.post('/orders', (req, res) => {
    const { userId, items } = req.body; // items = [{ productId, quantity }]
    if (!userId || !Array.isArray(items)) {
        return res.status(400).json({ error: "Missing userId or items array" });
    }

    const orderTotal = items.reduce((total, item) => {
        const product = products.find(p => p.id === item.productId);
        return product ? total + product.price * item.quantity : total;
    }, 0);

    const newOrder = {
        orderId: orders.length + 1,
        userId,
        items,
        total: parseFloat(orderTotal.toFixed(2)),
        status: "confirmed"
    };

    orders.push(newOrder);
    res.status(201).json(newOrder);
});

app.get('/orders/:userId', (req, res) => {
    const userOrders = orders.filter(o => o.userId == req.params.userId);
    res.json(userOrders);
});

// ==================== CART ROUTES ====================

// POST /cart/:userId - Add item to cart
app.post('/cart/:userId', (req, res) => {
    const userId = req.params.userId;
    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
        return res.status(400).json({ error: "Missing productId or quantity" });
    }

    if (!carts[userId]) {
        carts[userId] = [];
    }

    const existing = carts[userId].find(item => item.productId === productId);
    if (existing) {
        existing.quantity += quantity;
    } else {
        carts[userId].push({ productId, quantity });
    }

    res.json({ cart: carts[userId] });
});

// GET /cart/:userId - View cart contents
app.get('/cart/:userId', (req, res) => {
    const userId = req.params.userId;
    const cart = carts[userId] || [];

    const detailedCart = cart.map(item => {
        const product = products.find(p => p.id === item.productId);
        return {
            ...item,
            product: product ? {
                name: product.name,
                price: product.price
            } : null
        };
    });

    const total = detailedCart.reduce((sum, item) => {
        return item.product ? sum + item.product.price * item.quantity : sum;
    }, 0);

    res.json({ items: detailedCart, total: parseFloat(total.toFixed(2)) });
});

// DELETE /cart/:userId/item/:productId - Remove item from cart
app.delete('/cart/:userId/item/:productId', (req, res) => {
    const userId = req.params.userId;
    const productId = parseInt(req.params.productId);

    if (!carts[userId]) {
        return res.status(404).json({ error: "Cart not found" });
    }

    carts[userId] = carts[userId].filter(item => item.productId !== productId);
    res.json({ cart: carts[userId] });
});

// ==================== ROOT ====================

app.get('/', (req, res) => {
    res.send("🛒 Hello from E-Commerce API Server B");
});

app.listen(3002, () => {
    console.log("Server B running on http://localhost:3002");
});
