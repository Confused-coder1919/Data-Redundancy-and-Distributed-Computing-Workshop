const express = require('express');
const fs = require('fs');
const app = express();
app.use(express.json());

const DB_PRIMARY = './db_primary.json';
const DB_MIRROR = './db_mirror.json';

// Utility: Load DB from file
function loadDB() {
    const raw = fs.readFileSync(DB_PRIMARY);
    return JSON.parse(raw);
}

// Utility: Save to both primary and mirror
function saveDB(data) {
    fs.writeFileSync(DB_PRIMARY, JSON.stringify(data, null, 2));
    fs.writeFileSync(DB_MIRROR, JSON.stringify(data, null, 2));
}

// Load data once at startup
let db = loadDB();

// ==================== PRODUCT ROUTES ====================

app.get('/products', (req, res) => {
    res.json(db.products);
});

app.post('/products', (req, res) => {
    const newProduct = {
        id: db.products.length + 1,
        ...req.body
    };
    db.products.push(newProduct);
    saveDB(db);
    res.status(201).json(newProduct);
});

// ==================== ORDER ROUTES ====================

app.post('/orders', (req, res) => {
    const { userId, items } = req.body;
    if (!userId || !Array.isArray(items)) {
        return res.status(400).json({ error: "Missing userId or items array" });
    }

    const orderTotal = items.reduce((total, item) => {
        const product = db.products.find(p => p.id === item.productId);
        return product ? total + product.price * item.quantity : total;
    }, 0);

    const newOrder = {
        orderId: db.orders.length + 1,
        userId,
        items,
        total: parseFloat(orderTotal.toFixed(2)),
        status: "confirmed"
    };

    db.orders.push(newOrder);
    saveDB(db);
    res.status(201).json(newOrder);
});

app.get('/orders/:userId', (req, res) => {
    const userOrders = db.orders.filter(o => o.userId == req.params.userId);
    res.json(userOrders);
});

// ==================== CART ROUTES ====================

app.post('/cart/:userId', (req, res) => {
    const userId = req.params.userId;
    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
        return res.status(400).json({ error: "Missing productId or quantity" });
    }

    if (!db.carts[userId]) {
        db.carts[userId] = [];
    }

    const existing = db.carts[userId].find(item => item.productId === productId);
    if (existing) {
        existing.quantity += quantity;
    } else {
        db.carts[userId].push({ productId, quantity });
    }

    saveDB(db);
    res.json({ cart: db.carts[userId] });
});

app.get('/cart/:userId', (req, res) => {
    const cart = db.carts[req.params.userId] || [];
    const detailedCart = cart.map(item => {
        const product = db.products.find(p => p.id === item.productId);
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

app.delete('/cart/:userId/item/:productId', (req, res) => {
    const userId = req.params.userId;
    const productId = parseInt(req.params.productId);

    if (!db.carts[userId]) {
        return res.status(404).json({ error: "Cart not found" });
    }

    db.carts[userId] = db.carts[userId].filter(item => item.productId !== productId);
    saveDB(db);
    res.json({ cart: db.carts[userId] });
});

// ==================== ROOT ====================

app.get('/', (req, res) => {
    res.send("🛒 Hello from Synchronous Mirroring Server");
});

app.listen(3010, () => {
    console.log("🧠 Synchronous Mirroring running at http://localhost:3010");
});
