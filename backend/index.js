import { setDefaultResultOrder, setServers } from 'dns';

setDefaultResultOrder('ipv4first');
setServers(['8.8.8.8', '8.8.4.4']);

import express from "express";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import studentRouter from "./routers/studentRouter.js";
import userRouter from "./routers/userRouter.js";
import authenticateUser from "./middleware/authentication.js";
import productRouter from "./routers/productRouter.js";
import orderRouter from "./routers/orderRouter.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDir = path.resolve(__dirname, "../frontend");

function go() {
    console.log("Started..")
}


const mongoURI = "mongodb+srv://admin:1234@cluster0.ldaaoqa.mongodb.net/?appName=Cluster0"



mongoose.connect(mongoURI)

    .then(() => {
        console.log("Connected to MongoDB");
        go();
    })
    .catch((err) => {
        console.log("Error connecting to MongoDB:", err);
    });

app.use(express.json());

// Enable CORS middleware for robust local development cross-origin requests
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }
    next();
});


// Middleware to serve HTML shell for JSX files requested by browser navigation on backend port 5001
app.get('/frontend/:page.jsx', (req, res, next) => {
  const acceptHeader = req.headers.accept || '';
  if (acceptHeader.includes('text/html')) {
    const pageName = req.params.page;
    res.setHeader('Content-Type', 'text/html');
    return res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Checkout - SmartBox</title>
  <!-- Google Fonts: Inter -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="${pageName}.css" />
  <!-- React and Babel CDN -->
  <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body>
  <div id="root"></div>
  <!-- Load the component -->
  <script type="text/babel" src="${pageName}.jsx"></script>
  <script type="text/babel">
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<OrderProcessor />);
  </script>
</body>
</html>`);
  }
  next();
});

// Serve frontend static files under /frontend path BEFORE authentication middleware
app.use('/frontend', express.static(frontendDir));
// Public user routes (signup and login) - no auth required
app.use('/users', userRouter);
// Apply authentication middleware for protected routes
app.use(authenticateUser);
// Protected routes
app.use('/students', studentRouter);
app.use('/products', productRouter);
app.use('/api/users', userRouter); // if needed for other user APIs
app.use('/orders', orderRouter);

app.get("/", (req, res) => {
    res.sendFile(path.join(frontendDir, "login.html"));
});


// Error handling middleware for malformed JSON bodies
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    console.error('Bad JSON payload:', err);
    return res.status(400).json({ message: 'Invalid JSON payload' });
  }
  next(err);
});


app.listen(5001, '0.0.0.0', () => {
    console.log("Server is running on port 5001");
});


//    "email": "admin@example.com",
//    "password": "Admin@1234",

//user@gmail.com 12345

//66330843638-bq7pa53vc6taj0kugr1dbjs8i88tr7ef.apps.googleusercontent.com