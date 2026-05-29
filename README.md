<textarea style="width: 100%; height: 600px; font-family: monospace; padding: 12px; border: 2px solid #000; background: #fff; color: #000;">
# Cart One — Full Stack Project

A minimalistic, high-contrast workspace hardware store built with React and Node.js[cite: 1].

## Installation & Setup

### Backend Setup
cd backend
npm install
npm run dev

### Frontend Setup
cd frontend
npm install
npm run dev

---

## Environment Variables

Create a `.env` file in the `/backend` directory:

| Variable | Purpose | Expected Value |
| :--- | :--- | :--- |
| `JWT_SECRET` | Cryptographic signature key to sign and verify user authentication session tokens. | Any secure string |
| `PORT` | Local network port the backend application listens on. | `5000` |

---

## Technical Approach & Core Architecture
* **Real-time Inventory Invalidation:** Built a custom reactive logic layer that maps database stock limits against the items currently resting in the user's active shopping session bag. This approach physically blocks over-purchasing locally before an invalid API network frame request is even dispatched.
* **Relational Multi-User Isolation:** Leveraged lightweight SQLite schemas rather than volatile in-memory hashes. This guarantees your shopping bags survive full hard browser refreshes and limits SQL query evaluations exclusively to the authenticated profile's session identifiers.

---

## Limitations & Future Enhancements
Given a longer timeline, the following systemic additions would be introduced next:
1. **Atomic DB Transactions:** Wrap cart additions and stock updates into strict transaction blocks (`BEGIN TRANSACTION`) to prevent race conditions during simultaneous item checkouts.
2. **Global Frontend State Manager:** Extract component level props and fetch callbacks out of individual layouts into a dedicated React Context or Zustand store for smoother multi-screen caching.
3. **Comprehensive Test Suite:** Implement integration tests using Jest and Supertest for API routes, and Vitest for checking frontend inventory math edge cases under load.
</textarea>
