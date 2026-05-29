# CART One — Full Stack Project

A minimalistic monochrome shopping cart application built using React, Vite, Node.js, Express, and SQLite.

---

# Tech Stack

## Frontend
- React
- Vite
- Tailwind CSS

## Backend
- Node.js
- Express.js

## Database
- SQLite

---

# Installation & Setup

## Backend Setup

```bash
cd backend
npm install
npm run dev
```

Backend runs on:

```txt
http://localhost:5000
```

---

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:

```txt
http://localhost:5173
```

---

# Environment Variables

Create a `.env` file inside the `/backend` directory.

| Variable | Purpose | Example |
|---|---|---|
| `JWT_SECRET` | Secret key used for signing JWT authentication tokens | `supersecretkey` |
| `PORT` | Backend server port | `5000` |

Example:

```env
JWT_SECRET=supersecretkey
PORT=5000
```

---

# Core Features

- Product catalog system
- Persistent cart management
- JWT authentication
- SQLite database persistence
- Real-time stock validation
- Minimal monochrome UI
- Quantity management and cart updates

---

# Technical Approach & Architecture

## Real-Time Inventory Validation

The frontend actively compares inventory stock against the quantity already present in the user's cart before dispatching API requests. This prevents over-purchasing locally and reduces invalid backend operations.

## Persistent Relational Storage

SQLite is used instead of volatile in-memory storage to ensure:
- cart persistence across refreshes
- multi-user separation
- reliable relational querying
- lightweight deployment

## Authentication System

JWT-based authentication is used to isolate cart sessions between users and securely protect cart operations.

---

# Future Improvements

Given additional development time, the following enhancements would be added:

1. **Atomic Database Transactions**
   - Wrap inventory updates and checkout flows inside transaction blocks to prevent race conditions.

2. **Global State Management**
   - Move state handling into React Context or Zustand for cleaner shared state logic.

3. **Testing Infrastructure**
   - Add API integration testing using Jest and Supertest.
   - Add frontend testing using Vitest.

4. **Deployment Pipeline**
   - Docker support
   - CI/CD workflows
   - Production environment configuration

5. **Improved User Experience**
   - Product search and filtering
   - Order history
   - Payment gateway integration
   - Responsive mobile optimization

---

# Author

Himamshu S.
