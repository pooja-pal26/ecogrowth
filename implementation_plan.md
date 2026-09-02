# EcoGrowth MERN Migration Implementation Plan

This document outlines the migration plan for rebuilding the EcoGrowth PHP/Zend application into the new MERN stack.

## User Review Required

Please review the authentication strategy. The existing PHP application uses `sha1(md5(password))` for hashing passwords. For a seamless migration without forcing users to reset their passwords, we will initially implement this same hashing strategy in the Node.js backend. Once migrated, we can implement a gradual upgrade to `bcrypt`.

Also, please note that the existing PHP app uses MySQL, but Phase 1 initialized a MongoDB (Mongoose) connection as requested. We will map the MySQL tables (e.g., tbl_user) to Mongoose schemas.

## Phase 1: Authentication & Login Module (Current Focus)

### Existing PHP Feature/Module
- **Module:** Authentication / Login
- **Current functionality:** 
  - Validates user credentials against the 	bl_user table (columns: email_id, password).
  - Hashing mechanism: sha1(md5($password)).
  - Session management via Zend_Auth_Storage_Session.
  - Redirects to /home (Dashboard) upon successful login.

### MERN Migration Mapping

1. **React Login Page (client/src/pages/Login.jsx)**
   - A modern, responsive login form using Tailwind CSS.
   - Captures email and password and sends a POST request to the Express API.

2. **Express API Endpoint (server/routes/authRoutes.js)**
   - POST /api/auth/login

3. **Controller (server/controllers/authController.js)**
   - **User Validation:** Query the MongoDB User collection.
   - Hash the provided password using the legacy sha1(md5()) method and compare it to the database record.

4. **Database Model/Schema (server/models/User.js)**
   - Mongoose Schema representing the old 	bl_user.
   - Fields: email_id (String, unique), password (String), 
ame (String), etc.

5. **Authentication/Authorization Approach**
   - **JWT/Cookie Authentication:** Upon successful validation, generate a JSON Web Token (JWT).
   - Send the JWT to the client via an HTTP-Only secure cookie (or return it to be stored in localStorage).

6. **Authentication Middleware (server/middleware/authMiddleware.js)**
   - Intercepts requests to protected API routes.
   - Verifies the JWT signature.
   - Attaches the decoded user payload to eq.user.

7. **Protected API Routes**
   - Example: GET /api/dashboard/stats
   - Routes that provide data to the Dashboard will use the auth middleware.

8. **Protected React Routes (client/src/routes/ProtectedRoute.jsx)**
   - A React Router wrapper component that checks for authentication state.
   - Redirects unauthenticated users back to the /login page.

9. **Dashboard (client/src/pages/Dashboard.jsx)**
   - Replaces the PHP HomeController.php.
   - Fetches data from protected API routes to display overview widgets.

### Migration Priority
- **High / P0:** Authentication is the foundation for all other modules.

### Implementation Steps

1. **Database:** Define the Mongoose User schema in server/models/User.js.
2. **Backend Auth Route:** Implement POST /api/auth/login in uthRoutes.js and uthController.js using jsonwebtoken.
3. **Backend Middleware:** Implement uthMiddleware.js to protect routes.
4. **Frontend Login UI:** Build Login.jsx using React and Tailwind CSS.
5. **Frontend Auth Context:** Implement React Context (AuthContext.jsx) to manage global user state.
6. **Frontend Routing:** Set up React Router with ProtectedRoute wrappers.
7. **Frontend Dashboard UI:** Build a basic Dashboard.jsx layout that is only accessible after login.

---

*Note: Further modules (Site Allocation, Expenses, Inventory) will be analyzed and added to this plan in subsequent phases after the Authentication module is completed and verified.*
