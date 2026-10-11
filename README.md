# Course Management System (MERN Stack)

A modern, full-stack Course Management System built with the **MERN** stack (MongoDB Atlas, Express.js, React, Node.js). The application provides student and public access to browse, search, and view detailed course listings, alongside a secure role-based access control (RBAC) admin dashboard for creating, editing, and deleting courses.

---

## Table of Contents

- [Overview](#overview)
- [Live Deployment](#live-deployment)
- [Assignment Requirements Verification](#assignment-requirements-verification)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Team Contributions](#team-contributions)
- [Project Architecture & Folder Structure](#project-architecture--folder-structure)
- [Environment Variables](#environment-variables)
- [Local Setup & Development Guide](#local-setup--development-guide)
- [API Reference](#api-reference)
- [Testing & Quality Assurance](#testing--quality-assurance)
- [Production Deployment Guide](#production-deployment-guide)
  - [Backend Deployment (Render)](#backend-deployment-render)
  - [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
- [Live Deployment](#live-deployment)

---

## Overview

The **Course Management System** enables educational institutions and instructors to publish course materials while offering students an intuitive catalog to discover and review courses. Built with enterprise-level security practices, it features bcrypt password hashing, stateless JSON Web Token (JWT) authentication, and granular role-based authorization for administrative operations.

---

## Live Deployment

Frontend:
https://course-management-system-jade-pi.vercel.app

Backend:
https://course-management-system-ysac.onrender.com

GitHub:
https://github.com/tusharrr5/course-management-system

---

## Assignment Requirements Verification

This section explicitly maps every core evaluation criterion for Assignment 4 (Project #9: Course Management System) to the verified files in our codebase:

| Rubric Requirement | Verification & Implementation Files | Verification Evidence / Details |
| :--- | :--- | :--- |
| **1. React (Vite) Single Page App** | • `frontend/src/main.jsx`<br>• `frontend/src/App.jsx`<br>• `frontend/vite.config.js` | React 19 SPA bundled with Vite; fast HMR, production build verified (`vite build` completes with 0 errors). |
| **2. Controlled Forms & Client Validation** | • `frontend/src/components/CourseForm.jsx`<br>• `frontend/src/pages/Register.jsx`<br>• `frontend/src/pages/Login.jsx` | Controlled components manage form state (`title`, `description`, `instructor`, `duration`, `price`, `name`, `email`, `password`) with inline validation and sanitized submission. |
| **3. React Hooks & Context State** | • `frontend/src/context/AuthContext.jsx`<br>• `frontend/src/pages/CoursesPage.jsx`<br>• `frontend/src/pages/AdminDashboard.jsx` | `useState`, `useEffect`, `useCallback`, `useParams`, `useNavigate` and custom `useAuth()` hook for centralized session management and token persistence. |
| **4. Client-Side Routing & Route Guards** | • `frontend/src/App.jsx`<br>• `frontend/src/components/ProtectedRoute.jsx`<br>• `frontend/src/components/AdminRoute.jsx` | React Router v7 routes (`/`, `/courses`, `/courses/:id`, `/login`, `/register`, `/admin`). `AdminRoute` restricts administrative actions to `admin` role and displays a 403 access forbidden screen for standard users. |
| **5. Express.js RESTful API Backend** | • `backend/src/server.js`<br>• `backend/src/routes/authRoutes.js`<br>• `backend/src/routes/courseRoutes.js` | Express 5 server with health check (`GET /api/health`), modular router architecture, and JSON parsing middleware. |
| **6. MongoDB Atlas & Mongoose Schemas** | • `backend/src/config/db.js`<br>• `backend/src/models/User.js`<br>• `backend/src/models/Course.js` | Cloud MongoDB Atlas database connection (`course_management`); Mongoose schemas with strict data types, unique email indexes, and role enum validation (`user`, `admin`). |
| **7. Admin Course CRUD Operations** | • `backend/src/controllers/courseController.js`<br>• `frontend/src/pages/AdminDashboard.jsx`<br>• `frontend/src/components/CourseForm.jsx` | Full CRUD API (POST, GET, PUT, DELETE `/api/courses`) and interactive admin UI with Add/Edit modals, delete confirmation dialog, and live catalog summary statistics. |
| **8. Student / Public Course Catalog & Search** | • `frontend/src/pages/CoursesPage.jsx`<br>• `frontend/src/pages/CourseDetailsPage.jsx`<br>• `frontend/src/components/SearchBar.jsx` | Public catalog browsing with real-time title & instructor search, price sorting, empty states, and dynamic course detail viewing (`/courses/:id`). |
| **9. JWT Authentication & Role-Based Security** | • `backend/src/controllers/authController.js`<br>• `backend/src/middleware/auth.js`<br>• `backend/src/models/User.js` | Salted bcrypt password hashing (rounds = 10), signed JWTs with 24h expiration, `authenticateUser` token verification, and `requireAdmin` role enforcement (403 for unauthorized users). Public registration strictly defaults to `user` role. |
| **10. DevOps, Environment Config & Vercel SPA** | • `backend/src/server.js`<br>• `backend/.env.example`<br>• `frontend/.env.example`<br>• `frontend/vercel.json` | Dynamic CORS supporting `http://localhost:5173` and production `FRONTEND_URL`, dynamic port binding (`PORT || 5001`), `.env` templates without secrets, and Vercel rewrite configuration (`/(.*) -> /index.html`) preventing 404s on page refresh. |
| **11. Team Collaboration & GitHub Workflow** | • Git branch history & merged PRs (#11, #12, #17, #18)<br>• Attribution table in README | Clear task separation across 4 teammates with individual feature branches, code reviews, and clean merges into `main`. |

---

## Key Features

### Student & Public Features
- **Browse Course Catalog:** View real-time listings of available courses with title, instructor, duration, and pricing.
- **Course Search & Filter:** Instant client-side search filtering courses across titles and instructor names.
- **Price Sorting:** Sort courses by price (Low to High, High to Low, or Default).
- **Course Details View:** Dedicated course page featuring full descriptions, instructor details, duration, and tuition fee metadata.
- **User Authentication:** Student registration and login with secure JWT token storage in `localStorage`.
- **Responsive Interface:** Modern responsive design with custom CSS styling and fluid layouts.

### Admin Features
- **Role-Based Access Control (RBAC):** Dedicated `admin` authorization guard protecting write/update/delete operations.
- **Admin Dashboard:** Centralized dashboard for managing all catalog items with live summary statistics (total courses, active instructors, average price).
- **Course Creation:** Modal form with strict validation for `title`, `description`, `instructor`, `duration`, and positive `price`.
- **Course Editing:** Pre-populated edit modal allowing selective updates to existing course records.
- **Course Deletion:** One-click course removal with interactive confirmation modal dialogs.
- **Route Guards:** Client-side `AdminRoute` protection redirecting unauthorized users.

---

## Tech Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React 19 (Vite) | Fast, modern component-driven SPA |
| **Routing** | React Router v7 | Declarative client-side routing with route guards |
| **Styling** | Vanilla CSS / CSS Modules | Clean, responsive custom styling with modern dark/light contrast |
| **Backend** | Node.js & Express.js (v5) | RESTful API server with modular routing and middleware |
| **Database** | MongoDB Atlas & Mongoose (v9) | Cloud NoSQL database with schema validation |
| **Auth & Security** | JWT & bcryptjs | Stateless token authentication and salt-hashed passwords |
| **CORS** | Express `cors` middleware | Dynamic cross-origin resource sharing supporting production origins |
| **Code Quality** | Node Test Runner & Oxlint | Native Node.js unit/integration tests and high-speed linting |

---

## Team Contributions

All teammates contributed through dedicated feature branches and GitHub Pull Requests merged into `main`:

| Member | Role | GitHub Profile | Key Contributions | PR Reference |
| :--- | :--- | :--- | :--- | :--- |
| **Tushar** | **Team Leader** | [@tusharrr5](https://github.com/tusharrr5) | • Database setup & MongoDB Atlas connection<br>• User model, bcrypt hashing, JWT auth APIs (`/register`, `/login`, `/me`)<br>• JWT auth middleware & `requireAdmin` RBAC<br>• Frontend `AuthContext` & route guards (`ProtectedRoute`, `AdminRoute`)<br>• Production CORS, dynamic port binding, SPA rewrites, deployment setup & documentation | Issue #1, Issue #2, Issue #3 (PR #12) |
| **Anuj** | **Backend Developer** | [@anujsonkar1526-coder](https://github.com/anujsonkar1526-coder) | • Course schema and Mongoose data model (`Course.js`)<br>• Public Course Read APIs (GET `/api/courses`, GET `/api/courses/:id`)<br>• Course query controllers and error-handling utilities | PR #11 |
| **Divyansh** | **Frontend Developer** | [@divdotdev](https://github.com/divdotdev) | • Course catalog browsing page (`CoursesPage.jsx`)<br>• Real-time search filter component (`SearchBar.jsx`)<br>• Course card representation (`CourseCard.jsx`)<br>• Individual course detail view (`CourseDetailsPage.jsx`) | PR #17 |
| **Naman** | **Full-Stack Developer** | [@namangoyal176-10](https://github.com/namangoyal176-10) | • Admin Dashboard UI and state management (`AdminDashboard.jsx`)<br>• Course creation, edit, and deletion modals (`CourseForm.jsx`)<br>• Integration with protected admin APIs (POST, PUT, DELETE `/api/courses`) | PR #18 |

---

## Project Architecture & Folder Structure

```text
course-management-system/
├── .github/                      # GitHub workflow configurations
├── .gitignore                    # Git ignore file (excludes secrets and dependencies)
├── README.md                     # Root project documentation
├── backend/                      # Express.js REST API
│   ├── .env.example              # Environment template for backend
│   ├── package.json              # Backend scripts and dependencies
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js             # Mongoose connection to MongoDB Atlas
│   │   ├── controllers/
│   │   │   ├── authController.js # Register, login, getMe handlers
│   │   │   └── courseController.js # Course CRUD handlers
│   │   ├── middleware/
│   │   │   └── auth.js           # authenticateUser & requireAdmin middleware
│   │   ├── models/
│   │   │   ├── Course.js         # Course Mongoose schema
│   │   │   └── User.js           # User Mongoose schema with password hashing
│   │   ├── routes/
│   │   │   ├── authRoutes.js     # Auth API routes
│   │   │   └── courseRoutes.js   # Course public & admin routes
│   │   ├── utils/                # Helper utilities
│   │   └── server.js             # Express app entry point & CORS configuration
│   └── tests/                    # Integration & unit test suites
│       ├── authMiddleware.test.js    # Auth & RBAC unit tests
│       ├── courseAdminRoutes.test.js # Admin CRUD validation tests
│       ├── courseRoutes.test.js      # Public course read API tests
│       └── seedDemoCourses.test.js   # Demo course seeding tests
└── frontend/                     # React (Vite) Single Page Application
    ├── .env.example              # Environment template for frontend
    ├── .oxlintrc.json            # Oxlint configuration
    ├── index.html                # Vite HTML entry point
    ├── package.json              # Frontend scripts and dependencies
    ├── vercel.json               # SPA routing rewrite rule for Vercel
    ├── vite.config.js            # Vite configuration
    └── src/
        ├── App.jsx               # Application routing & layout
        ├── App.css               # Global application styling
        ├── auth.css              # Authentication form styles
        ├── courses.css           # Catalog & admin dashboard styles
        ├── index.css             # Base reset & typography
        ├── components/
        │   ├── AdminRoute.jsx    # Guard for admin-only routes
        │   ├── CourseCard.jsx    # Card component for catalog view
        │   ├── CourseForm.jsx    # Modal form for Add/Edit course
        │   ├── Navbar.jsx        # Navigation bar with user status & logout
        │   ├── ProtectedRoute.jsx# Guard for authenticated routes
        │   └── SearchBar.jsx     # Search input component
        ├── context/
        │   └── AuthContext.jsx   # Global authentication state provider
        ├── pages/
        │   ├── AdminDashboard.jsx    # Admin course management console
        │   ├── CourseDetailsPage.jsx # Individual course details view
        │   ├── CoursesPage.jsx       # Public course catalog view
        │   ├── HomePage.jsx          # Landing page
        │   ├── Login.jsx             # User & admin login page
        │   └── Register.jsx          # User registration page
        └── main.jsx              # React application root render
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
| :--- | :---: | :--- | :--- |
| `PORT` | No | `5001` | Server listening port (avoids macOS AirPlay port 5000 conflict). |
| `MONGO_URI` | Yes | — | MongoDB Atlas connection string (`mongodb+srv://...`). |
| `JWT_SECRET` | Yes | — | Secret key used to sign and verify JWT authentication tokens. |
| `FRONTEND_URL` | No | `http://localhost:5173` | Allowed frontend origin for CORS (set to your Vercel URL in production). |

### Frontend (`frontend/.env`)

| Variable | Required | Default | Description |
| :--- | :---: | :--- | :--- |
| `VITE_API_URL` | No | `http://localhost:5001/api` | Base URL for the Express backend API endpoints. |

> **Security Note:** Never commit `.env` files containing live credentials to Git. Both `backend/.env` and `frontend/.env` are ignored by `.gitignore`. Templates are maintained in `backend/.env.example` and `frontend/.env.example`.

---

## Local Setup & Development Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.x or higher)
- [npm](https://www.npmjs.com/) (v9.x or higher)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account (or a local MongoDB instance)

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/tusharrr5/course-management-system.git
cd course-management-system
```

---

### Step 2: Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create your `.env` configuration:
   ```bash
   cp .env.example .env
   ```
4. Fill in your MongoDB connection string and JWT secret in `.env`:
   ```env
   PORT=5001
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/course_management
   JWT_SECRET=my_super_secret_jwt_key
   FRONTEND_URL=http://localhost:5173
   ```
5. Start the backend in development mode:
   ```bash
   npm run dev
   ```
   *The server will start on [http://localhost:5001](http://localhost:5001).*

---

### Step 3: Frontend Setup
1. Open a new terminal window and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create your `.env` configuration:
   ```bash
   cp .env.example .env
   ```
4. Ensure `VITE_API_URL` points to your running backend:
   ```env
   VITE_API_URL=http://localhost:5001/api
   ```
5. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The application will open on [http://localhost:5173](http://localhost:5173).*

---

## API Reference

### Health Check
| Method | Endpoint | Access | Description | Response |
| :--- | :--- | :---: | :--- | :--- |
| `GET` | `/api/health` | Public | Service health verification | `{ success: true, message: "Course Management API is running" }` |

### Authentication APIs (`/api/auth`)
| Method | Endpoint | Access | Request Body | Success Response |
| :--- | :--- | :---: | :--- | :--- |
| `POST` | `/api/auth/register` | Public | `{ "name": "...", "email": "...", "password": "..." }` | `201 Created`<br>`{ success: true, message: "User registered successfully", user: { id, name, email, role } }` |
| `POST` | `/api/auth/login` | Public | `{ "email": "...", "password": "..." }` | `200 OK`<br>`{ success: true, message: "Login successful", token: "...", user: { id, name, email, role } }` |
| `GET` | `/api/auth/me` | Protected (User / Admin) | *Headers:* `Authorization: Bearer <token>` | `200 OK`<br>`{ success: true, user: { id, name, email, role } }` |

### Public Course APIs (`/api/courses`)
| Method | Endpoint | Access | Request Body | Success Response |
| :--- | :--- | :---: | :--- | :--- |
| `GET` | `/api/courses` | Public | None | `200 OK`<br>`{ success: true, courses: [...] }` |
| `GET` | `/api/courses/:id` | Public | None | `200 OK`<br>`{ success: true, course: { ... } }` |

### Admin Course APIs (`/api/courses`)
*All admin endpoints require `Authorization: Bearer <token>` where the token belongs to an `admin` user.*

| Method | Endpoint | Access | Request Body | Success Response |
| :--- | :--- | :---: | :--- | :--- |
| `POST` | `/api/courses` | Admin | `{ "title": "...", "description": "...", "instructor": "...", "duration": "...", "price": 49.99 }` | `201 Created`<br>`{ success: true, message: "Course created successfully", course: { ... } }` |
| `PUT` | `/api/courses/:id` | Admin | Partial or full course fields | `200 OK`<br>`{ success: true, message: "Course updated successfully", course: { ... } }` |
| `DELETE` | `/api/courses/:id` | Admin | None | `200 OK`<br>`{ success: true, message: "Course deleted successfully" }` |

---

## Testing & Quality Assurance

### Backend Automated Test Suite
The backend contains 71 automated tests across 4 test suites covering JWT authentication, role guards, parameter validation, course CRUD logic, and demo seeding using the native Node.js test runner (`node --test`).

Run tests from the `backend/` directory:
```bash
cd backend
npm test
```
**Test Coverage Includes (71 tests passing):**
- `tests/authMiddleware.test.js`: Token presence, malformed header, expired token, invalid secret validation, and `requireAdmin` role checking.
- `tests/courseAdminRoutes.test.js`: RBAC access guards, course creation validation (missing fields, blank strings, non-numeric or negative price), update, and deletion edge cases.
- `tests/courseRoutes.test.js`: Public course listing, single course retrieval, 404 for missing courses, and 400 for invalid ObjectIds.
- `tests/seedDemoCourses.test.js`: Schema validation and deduplication logic for demo courses.

### Frontend Quality & Production Build Verification
Verify code quality and ensure the production bundle builds without errors:
```bash
cd frontend
# Run linter
npm run lint

# Run production build
npm run build
```

---

## Production Deployment Guide

### Backend Deployment (Render)

1. **Sign in to Render:** Go to [Render.com](https://render.com) and create a new **Web Service**.
2. **Connect Repository:** Select `tusharrr5/course-management-system`.
3. **Configure Settings:**
   - **Name:** `course-management-backend`
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. **Environment Variables:** Add the following under the Environment tab:
   - `PORT`: `5001` (or leave default assigned by Render)
   - `MONGO_URI`: `your_mongodb_atlas_connection_string`
   - `JWT_SECRET`: `your_production_jwt_secret`
   - `FRONTEND_URL`: `https://course-management-system-jade-pi.vercel.app`
5. **Deploy:** Click **Create Web Service**. After deployment, note the public URL (`https://course-management-system-ysac.onrender.com`).

---

### Frontend Deployment (Vercel)

1. **Sign in to Vercel:** Go to [Vercel.com](https://vercel.com) and click **Add New Project**.
2. **Import Repository:** Select `tusharrr5/course-management-system`.
3. **Configure Project Settings:**
   - **Framework Preset:** `Vite`
   - **Root Directory:** Click edit and select `frontend`.
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. **Environment Variables:**
   - `VITE_API_URL`: `https://course-management-system-ysac.onrender.com/api`
5. **SPA Routing Configuration:**
   The `frontend/vercel.json` file ensures that all routes (`/login`, `/register`, `/courses`, `/courses/:id`, `/admin`) are served via `/index.html` on direct reload:
   ```json
   {
     "rewrites": [
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```
6. **Deploy:** Click **Deploy**. Vercel will build and host the application.
7. **Cross-Link Origins:** Copy your Vercel deployment URL (`https://course-management-system-jade-pi.vercel.app`) and paste it as `FRONTEND_URL` in your Render backend environment variables.

---

## Live Deployment

- **Frontend (Vercel):** https://course-management-system-jade-pi.vercel.app
- **Backend API health check (Render):** https://course-management-system-ysac.onrender.com/api/health
- **Course API:** https://course-management-system-ysac.onrender.com/api/courses
- **GitHub repository:** https://github.com/tusharrr5/course-management-system

Screenshots are not included in this submission.

---

## License

This project was developed for educational and academic coursework under the Course Management System curriculum.
