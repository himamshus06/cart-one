const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

db.serialize(() => {
  
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price INTEGER NOT NULL,
    stock INTEGER NOT NULL,
    description TEXT,
    image_url TEXT
  )`);

  
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  )`);

  
  db.run(`CREATE TABLE IF NOT EXISTS cart (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    product_id INTEGER,
    quantity INTEGER,
    FOREIGN KEY(product_id) REFERENCES products(id)
  )`);

  // Seed Data Check
  db.get("SELECT COUNT(*) as count FROM products", [], (err, row) => {
    if (row.count === 0) {
      const stmt = db.prepare("INSERT INTO products (name, price, stock, description, image_url) VALUES (?, ?, ?, ?, ?)");
      
      const seedProducts = [
        ['Wireless Headphones', 1299, 10, 'Over-ear, noise cancelling', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'],
        ['Mechanical Keyboard', 2499, 5, 'TKL, RGB backlight', 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500'],
        ['USB-C Hub', 899, 20, '7-in-1, 4K HDMI', 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=500'],
        ['Webcam 1080p', 1599, 8, 'Auto-focus, built-in mic', 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80'],
        ['Desk Mat XL', 499, 15, '90x40cm, non-slip base', 'https://images.unsplash.com/photo-1616440347437-b1c73416efc2?w=500']
      ];

      seedProducts.forEach(p => stmt.run(p));
      stmt.finalize();
      console.log("Database seeded successfully.");
    }
  });
});

module.exports = db;