const express = require('express');
const fs = require('fs');
const app = express();
app.use(express.json());

const DB_PRIMARY = './db_primary.json';
const DB_MIRROR = './db_mirror.json';

// Utility: Load DB from primary
function loadDB() {
    const raw = fs.readFileSync(DB_PRIMARY);
    return JSON.parse(raw);
}

// Utility: Save ONLY to primary
function savePrimary(data) {
    fs.writeFileSync(DB_PRIMARY, JSON.stringify(data, null, 2));
}

// Utility: Replicate primary → mirror
function replicateToMirror() {
    const raw = fs.readFileSync(DB_PRIMARY);
    fs.writeFileSync(DB_MIRROR, raw);
}

// Load initial DB
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
    savePrimary(db);
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
    savePrimary(db);
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

    savePrimary(db);
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
    savePrimary(db);
    res.json({ cart: db.carts[userId] });
});

// ==================== REPLICATION ROUTE ====================

app.post('/sync', (req, res) => {
    replicateToMirror();
    res.json({ message: "Replication completed: Primary → Mirror" });
});

// ==================== ROOT ====================

app.get('/', (req, res) => {
    res.send("🔁 Hello from Asynchronous Replication Server");
});

app.listen(3020, () => {
    console.log("🔁 Async Replication running at http://localhost:3020");
});
