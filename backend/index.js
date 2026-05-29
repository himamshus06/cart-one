const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

// --- AUTHENTICATION MIDDLEWARE ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: "Access denied. Token missing." });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Session expired or invalid token." });
    req.user = user; // Contains user id and username
    next();
  });
};

// --- AUTH ROUTES (Register & Login) ---
app.post('/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: "Username and password required." });

  const hashedPassword = bcrypt.hashSync(password, 10);

  db.run("INSERT INTO users (username, password) VALUES (?, ?)", [username, hashedPassword], function(err) {
    if (err) {
      if (err.message.includes("UNIQUE")) return res.status(400).json({ error: "Username already taken." });
      return res.status(500).json({ error: "Registration failed." });
    }
    res.status(201).json({ message: "Registration successful! Please log in." });
  });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
    if (err) return res.status(500).json({ error: "Database error." });
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: "Invalid username or password." });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '2h' });
    res.json({ token, username: user.username });
  });
});

// --- SECURED CART & PRODUCT ROUTES ---
app.get('/products', (req, res) => {
  db.all("SELECT * FROM products", [], (err, rows) => {
    if (err) return res.status(500).json({ error: "Failed to fetch products" });
    res.json(rows);
  });
});

app.get('/cart', authenticateToken, (req, res) => {
  const query = `
    SELECT c.quantity, p.id, p.name, p.price, p.stock, p.description, p.image_url 
    FROM cart c 
    JOIN products p ON c.product_id = p.id 
    WHERE c.user_id = ?`;
  
  db.all(query, [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: "Failed to fetch cart items" });
    const total = rows.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    res.json({ items: rows, totalPrice: total });
  });
});

app.post('/cart/add', authenticateToken, (req, res) => {
  const { productId, quantity } = req.body;
  
  db.get("SELECT * FROM products WHERE id = ?", [productId], (err, product) => {
    if (!product) return res.status(404).json({ error: "Product not found" });
    if (product.stock < quantity) {
      return res.status(400).json({ error: `Insufficient stock. Only ${product.stock} units available.` });
    }

    db.get("SELECT * FROM cart WHERE user_id = ? AND product_id = ?", [req.user.id, productId], (err, cartItem) => {
      if (cartItem) {
        const newQty = cartItem.quantity + quantity;
        if (product.stock < newQty) return res.status(400).json({ error: `Exceeds stock limits.` });
        
        db.run("UPDATE cart SET quantity = ? WHERE id = ?", [newQty, cartItem.id], () => res.json({ message: "Cart updated" }));
      } else {
        db.run("INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)", [req.user.id, productId, quantity], () => {
          res.json({ message: "Item added to cart" });
        });
      }
    });
  });
});

app.patch('/cart/update', authenticateToken, (req, res) => {
  const { productId, quantity } = req.body;

  if (quantity <= 0) {
    db.run("DELETE FROM cart WHERE user_id = ? AND product_id = ?", [req.user.id, productId], () => res.json({ message: "Item removed" }));
    return;
  }

  db.get("SELECT stock FROM products WHERE id = ?", [productId], (err, product) => {
    if (product.stock < quantity) return res.status(400).json({ error: `Exceeds stock.` });
    db.run("UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?", [quantity, req.user.id, productId], () => {
      res.json({ message: "Quantity updated" });
    });
  });
});

app.delete('/cart/remove/:productId', authenticateToken, (req, res) => {
  db.run("DELETE FROM cart WHERE user_id = ? AND product_id = ?", [req.user.id, req.params.productId], () => {
    res.json({ message: "Item removed" });
  });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Secure backend operational on port ${PORT}`));