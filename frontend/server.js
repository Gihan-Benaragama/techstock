import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5173; // Updated to match Google Developer Console javascript origin (5173)

// Serve all static files from the frontend directory (parent of server.js)
const staticDir = path.resolve(__dirname);

// Log all requests for debugging
app.use((req, res, next) => {
  console.log('Request:', req.method, req.url);
  next();
});

// Middleware to serve HTML wrapper for JSX files if requested by browser navigation
app.get('/:page.jsx', (req, res, next) => {
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

// Serve static files from the frontend directory
app.use(express.static(staticDir, { index: false }));

// Serve login.html as the default page


// Serve the main landing page as the default route
app.get('/', (req, res) => {
  res.sendFile(path.join(staticDir, 'user-dashboard.html'));
});

// Serve a generic index page with navigation links
app.get('/home', (req, res) => {
  res.sendFile(path.join(staticDir, 'user-dashboard.html'));
});

// Place the 404 handler AFTER static and all routes
app.use((req, res) => {
  const acceptHeader = req.headers.accept || '';
  if (acceptHeader.includes('text/html')) {
    // Serve the premium 404 page using the PageNotFound component
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>404 - Page Not Found</title>
  <link rel="stylesheet" href="/pageNotFound.css" />
</head>
<body>
  <div id="root"></div>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script type="text/babel" src="/pageNotFound.jsx"></script>
  <script type="text/babel">
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<PageNotFound />);
  </script>
</body>
</html>`;
    res.status(404).send(html);
    return;
  }
  // Default plain‑text 404 for API or asset requests
  res.status(404).send('404 Not Found: ' + req.url);
});

// Catch-all for 404s
app.use((req, res) => {
  res.status(404).send('404 Not Found: ' + req.url);
});

app.listen(PORT, () => {
  console.log(`Frontend running at http://localhost:${PORT}`);
});
