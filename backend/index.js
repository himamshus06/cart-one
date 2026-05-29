const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());


const CURRENT_USER_ID = 1;

app.get('/products', (req, res) => {
  db.all("SELECT * FROM products", [], (err, rows) => {
    if (err) return res.status(500).json({ error: "Failed to fetch products" });
    res.json(rows);
  });
});

app.get('/cart', (req, res) => {
  const query = `
    SELECT c.quantity, p.id, p.name, p.price, p.stock, p.description, p.image_url 
    FROM cart c 
    JOIN products p ON c.product_id = p.id 
    WHERE c.user_id = ?`;
  
  db.all(query, [CURRENT_USER_ID], (err, rows) => {
    if (err) return res.status(500).json({ error: "Failed to fetch cart items" });
    
    const total = rows.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    res.json({ items: rows, totalPrice: total });
  });
});

app.post('/cart/add', (req, res) => {
  const { productId, quantity } = req.body;
  
  db.get("SELECT * FROM products WHERE id = ?", [productId], (err, product) => {
    if (!product) return res.status(404).json({ error: "Product not found" });
    if (product.stock < quantity) {
      return res.status(400).json({ error: `Insufficient stock. Only ${product.stock} units available.` });
    }

    db.get("SELECT * FROM cart WHERE user_id = ? AND product_id = ?", [CURRENT_USER_ID, productId], (err, cartItem) => {
      if (cartItem) {
        const newQty = cartItem.quantity + quantity;
        if (product.stock < newQty) return res.status(400).json({ error: `Cannot add more. Exceeds available stock of ${product.stock}.` });
        
        db.run("UPDATE cart SET quantity = ? WHERE id = ?", [newQty, cartItem.id], () => res.json({ message: "Cart updated successfully" }));
      } else {
        db.run("INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)", [CURRENT_USER_ID, productId, quantity], () => {
          res.json({ message: "Item added to cart" });
        });
      }
    });
  });
});

app.patch('/cart/update', (req, res) => {
  const { productId, quantity } = req.body;

  if (quantity <= 0) {
    db.run("DELETE FROM cart WHERE user_id = ? AND product_id = ?", [CURRENT_USER_ID, productId], () => {
      return res.json({ message: "Item removed from cart" });
    });
    return;
  }

  db.get("SELECT stock FROM products WHERE id = ?", [productId], (err, product) => {
    if (product.stock < quantity) {
      return res.status(400).json({ error: `Requested quantity exceeds available stock of ${product.stock}.` });
    }
    db.run("UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?", [quantity, CURRENT_USER_ID, productId], () => {
      res.json({ message: "Quantity updated successfully" });
    });
  });
});

app.delete('/cart/remove/:productId', (req, res) => {
  const { productId } = req.params;
  db.run("DELETE FROM cart WHERE user_id = ? AND product_id = ?", [CURRENT_USER_ID, productId], function(err) {
    res.json({ message: "Item completely removed from cart" });
  });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Backend spinning on port ${PORT}`));