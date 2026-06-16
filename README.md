# 🛒 Tech Stock

A full-stack stock-tracking web app built with Node.js/Express (backend) 
and vanilla HTML/CSS/JS (frontend). Browse, search, and purchase 
tech-related products with a full admin dashboard.

🌐 **Live Demo:** https://techstock-ten.vercel.app
📂 **GitHub Repo:** https://github.com/Gihan-Benaragama/techstock

---

## 📸 Screenshots

<img width="1882" height="942" alt="Screenshot (228)" src="https://github.com/user-attachments/assets/a43bfc44-484b-49db-9990-d377b132ee9d" />

<img width="1897" height="826" alt="Screenshot (229)" src="https://github.com/user-attachments/assets/d7881909-fa76-485b-a067-40fde563d19c" />

---

## ✨ Features

- 🛍️ **Public Store** — Browse products, view details, add to cart
- 🔐 **Authentication** — Email/password login or Google OAuth
- 👨‍💼 **Admin Dashboard** — Manage products, orders, and users
- 📦 **Order Processing** — Create orders, view history, update status
- 🔒 **JWT Security** — Protected routes via Bearer token
- 🌐 **CORS Support** — Configured for local and production origins
- ♻️ **Keep-Alive Ping** — Prevents Render free tier from sleeping
- 📱 **Responsive UI** — Glassmorphism, gradients, micro-animations

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Backend | Node.js (v20+) | Express server |
| Database | MongoDB + Mongoose | ODM, schemas, queries |
| Authentication | JWT + Google OAuth | Secure login, protected routes |
| Frontend | HTML5 / CSS3 / JS (ES6) | Multi-page static UI |
| Dev Server | Vite | Local frontend development |
| Deployment | Vercel / Render | Production hosting |
| Config | dotenv | Environment variable management |

---

## 🏗️ Architecture
---
Browser (Vanilla HTML/CSS/JS)

↕ REST API (fetch)

Express Server (Node.js — port 5001)

↕ Mongoose ODM

MongoDB Atlas (Database)
---
- **No frontend framework** — plain HTML/CSS/JS multi-page site
- **MVC pattern** — Models, Controllers, Routers clearly separated
- **JWT auth** — Token sent in `Authorization: Bearer <token>` header

---

## 📁 Project Structure
---

techstock/

│

├── backend/

│   ├── controller/       # Business logic (order, product, user, student)

│   ├── model/            # Mongoose schemas (order, product, user, student)

│   ├── routers/          # Express routers (orderRouter, productRouter, userRouter)

│   ├── middleware/        # authMiddleware.js — JWT verification

│   └── index.js          # Entry point — Express setup, DB connection, CORS

│

├── frontend/

│   ├── utils/            # Reusable client-side helpers

│   ├── *.html            # Pages (index, login, signup, admin, ...)

│   ├── *.js              # Page scripts (login.js, product-detail.js, ...)

│   └── *.css             # Styles (styles.css, admin.css, order-processor.css)

│

├── .env                  # Local environment variables (never commit this)

├── .gitignore

├── package.json

├── vite.config.js        # Vite dev server config

├── vercel.json           # Vercel deployment config

└── README.md
---

---

## 🚀 Getting Started

### Prerequisites
- Node.js v20+ and npm v10+
- MongoDB Atlas account (or local MongoDB)
- Google OAuth credentials (from [Google Cloud Console](https://console.cloud.google.com))

### 1. Clone the repository
```bash
git clone https://github.com/your-username/techstock.git
cd techstock
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
```
Create a `.env` file in the root folder:

MONGODB_URI=your_mongodb_connection_string

PORT=5001

FRONTEND_URL=http://localhost:5173

JWT_SECRET=your_jwt_secret_key

GOOGLE_CLIENT_ID=your_google_client_id

GOOGLE_CLIENT_SECRET=your_google_client_secret

PING_EMAIL=your_ping_email

PING_PASSWORD=your_ping_password
```
### 4. Start the backend
```bash
npm start
# or with nodemon:
npm run dev
```
Backend runs at `http://localhost:5001`

### 5. Start the frontend
```bash
npm run dev
```
Frontend runs at `http://localhost:5173`

> **Tip:** If Vite runs on a different port, add that URL to `allowedOrigins` in `backend/index.js`.

---

## 🔌 API Endpoints

All responses are JSON. Errors follow `{ "message": "<error-text>" }`.  
Protected routes require `Authorization: Bearer <token>` header.

### 👤 Users
| Method | Path | Description | Auth |
|---|---|---|---|
| POST | `/users/` | Register new user | ❌ |
| POST | `/users/login` | Email + password login | ❌ |
| POST | `/users/google-login` | Google OAuth login | ❌ |
| GET | `/api/users` | List all users (admin) | ✅ |

### 📦 Products
| Method | Path | Description | Auth |
|---|---|---|---|
| GET | `/products/` | Get all products | ❌ |
| POST | `/products/` | Create product (admin) | ✅ |
| PUT | `/products/:id` | Update product (admin) | ✅ |
| DELETE | `/products/:id` | Delete product (admin) | ✅ |

### 🧾 Orders
| Method | Path | Description | Auth |
|---|---|---|---|
| POST | `/orders/` | Create new order | ✅ |
| GET | `/orders/` | Get user's orders | ✅ |
| POST | `/orders/:orderId/process` | Process order (admin) | ✅ |

---

## 🌍 Deployment

### Vercel
1. Connect your repo to Vercel — it auto-reads `vercel.json`
2. Add all environment variables in the Vercel dashboard
3. Backend runs as serverless functions, frontend served as static files

### Render
1. Create a Node.js service
2. Set start command: `node backend/index.js`
3. Add all environment variables in Render dashboard
4. The keep-alive ping in `backend/index.js` prevents free tier sleeping

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/awesome-feature`
3. Make your changes and ensure the app still starts
4. Submit a Pull Request with a clear description

**Style guide:** ESM imports, 2-space indentation, semicolons.  
**Commits:** Use conventional commits — `feat: add admin order status endpoint`

---

## 🔮 Planned Features

- [ ] Product search and filtering
- [ ] Payment gateway integration
- [ ] Email notifications for orders
- [ ] Dark / Light theme toggle

---

## 👤 Author

**Syntecxhub**  
🔗 [GitHub](your-github-link-here)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
