# AI Coding Agent Instructions for This Project

## Project Overview
This project is organized as a classic Node.js/Express backend (MVC pattern) and a static multi-page frontend. Backend and frontend are separated into their own folders.

## Backend Structure
- **Entry Point:** `backend/index.js`
- **Controllers:** `backend/controller/` — Business logic for each resource (order, product, student, user)
- **Models:** `backend/model/` — Data schemas (likely Mongoose or similar)
- **Routers:** `backend/routers/` — Express routers for each resource
- **Middleware:** `backend/middleware/` — Shared Express middleware (e.g., authentication)

## Frontend Structure
- **HTML/JS/CSS:** `frontend/` — Multi-page app with separate HTML and JS for each view
- **Utils:** `frontend/utils/` — Shared frontend utilities (e.g., file upload)
- **Static Server:** `frontend/server.js` (if present, serves static files)

## Build & Run Commands
- **Install dependencies:** `npm install`
- **Start backend server:** `npm start` or `node backend/index.js`
- **No explicit test commands or test files found.**

## Conventions
- Each resource (user, product, order, student) has its own model, controller, and router.
- Backend follows MVC separation; frontend is organized by page.
- Authentication logic is in backend middleware.

## Pitfalls & Notes
- No test directory or test files present.
- No frontend build tools (vanilla JS, no bundler).
- No .env/config files found; check for hardcoded secrets.
- Ensure proper error handling and security in authentication and file uploads.

## How to Extend
- For new backend endpoints: create model → controller → router.
- For new frontend pages: add HTML/JS file pair in `frontend/`.

---

**If you need more detail on any area, check the relevant folder or ask for clarification.**
