import { setDefaultResultOrder, setServers } from 'dns';

setDefaultResultOrder('ipv4first');
setServers(['8.8.8.8', '8.8.4.4']);

import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import studentRouter from "./routers/studentRouter.js";
import userRouter from "./routers/userRouter.js";
import { getAllUsers } from "./controller/userController.js";
import authenticateUser from "./middleware/authentication.js";

import productRouter from "./routers/productRouter.js";
import orderRouter from "./routers/orderRouter.js";

const app = express();

function go() {
    console.log("Started..")
}


const mongoURI = process.env.MONGODB_URI || "mongodb+srv://admin:1234@cluster0.ldaaoqa.mongodb.net/?appName=Cluster0";



mongoose.connect(mongoURI)

    .then(() => {
        console.log("Connected to MongoDB");
        go();
    })
    .catch((err) => {
        console.log("Error connecting to MongoDB:", err);
    });

app.use(express.json());

// Log incoming requests for debugging
app.use((req, res, next) => {
    console.log(`[REQUEST] ${req.method} ${req.url}`);
    next();
});

// Enable CORS middleware for robust local development and production cross-origin requests
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5001",
  "http://127.0.0.1:5173",
  process.env.FRONTEND_URL
].filter(Boolean);

app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin) {
        const isAllowed = allowedOrigins.includes(origin) || 
                          origin.endsWith(".vercel.app") || 
                          origin.startsWith("http://localhost:") || 
                          origin.startsWith("http://127.0.0.1:");
                          
        if (isAllowed) {
            res.setHeader("Access-Control-Allow-Origin", origin);
        }
    }
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }
    next();
});


// Public user routes (signup and login) - no auth required
app.use('/users', userRouter);
app.use('/products', productRouter); // public route
// Apply authentication middleware for protected routes
// Authentication middleware applied after public routes
app.use(authenticateUser);
// Protected routes
app.use('/students', studentRouter);
app.get('/api/users', getAllUsers);
app.use('/api/users', userRouter); // if needed for other user APIs
app.use('/orders', orderRouter);

app.get("/", (req, res) => {
    res.json({ status: "API Running" });
});


// Error handling middleware for malformed JSON bodies
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    console.error('Bad JSON payload:', err);
    return res.status(400).json({ message: 'Invalid JSON payload' });
  }
  next(err);
});


const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Keep Render awake by pinging login endpoint every 14 minutes
setInterval(() => {
  fetch('https://techstock-kxtz.onrender.com/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'ping@ping.com', password: 'ping' })
  }).catch(() => {});
}, 14 * 60 * 1000);

export default app;


//    "email": "admin@example.com",
//    "password": "Admin@1234",

//user@gmail.com 12345

//66330843638-bq7pa53vc6taj0kugr1dbjs8i88tr7ef.apps.googleusercontent.com