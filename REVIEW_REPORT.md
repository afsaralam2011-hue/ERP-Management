# Project Codebase Review

## 1. Executive Summary
The project is a web-based **ERP Management System** built with **React** (Frontend) and **Supabase** (Backend as a Service), with a **Legacy/Mock Express Backend** also present.

**Current Status:**
- The application primarily functions as a **Client-Side App** interacting directly with **Supabase**.
- The **Express Backend** (`backend/server.js`) appears to be largely largely unused or redundant, serving mock data with no real database connection.
- **Authentication** is handled via Supabase in the frontend, but the state management is fragmented.

## 2. Architecture Analysis

### Frontend (`/frontend`)
- **Tech Stack:** React, Tailwind CSS, Framer Motion, Axios, Supabase Client.
- **Data Flow:**
  - **Core Data:** Components (e.g., `FlatteningPage.jsx`) fetch data **directly** from Supabase using the `supabase` client.
  - **Secondary Data:** Some services (e.g., `rawMaterialLogService.jsx`) attempt to call a local Express API (`localhost:5000`), which creates a "split-brain" architecture.
- **Authentication:**
  - Configured to use **Supabase Auth**.
  - **Critical Issue:** `AuthContext` exists but is **UNUSED**. Use of `localStorage` for token management is manual and decoupled from the actual Supabase session in many places.

### Backend (`/backend`)
- **Tech Stack:** Express.js, Sequelize (configured but unused mock data).
- **Status:** **Zombie/Mock**.
  - `server.js` contains hundreds of lines of **hardcoded mock data** (e.g., `productionData`, `notifications`).
  - It does **not** connect to a real database for its API endpoints.
  - It does **not** validate authentication tokens (routes are open).
  - The `src/` folder (controllers/models) appears to be dead code or a work-in-progress refactor that isn't helping `server.js`.

### Database
- **Primary:** **Supabase** (PostgreSQL).
- **Secondary:** The backend has dependencies for MySQL and Postgres, but `server.js` doesn't seem to actively use them for the served APIs.

## 3. Key Findings & Issues

### 🔴 Critical Issues
1.  **Syntax Error in `axios.jsx`:**
    ```javascript
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000', 'https://erp-management-8rt3.onrender.com',
    ```
    This is invalid JavaScript syntax at line 4 of `frontend/src/api/axios.jsx`.

2.  **Fragmented Authentication:**
    - `Login.jsx` uses Supabase to sign in.
    - `AuthContext` is defined but **never provided** in `App.jsx`.
    - `ProtectedRoute` manually checks `localStorage` and instantiates a *new* Supabase client internally, leading to potential state sync issues.

3.  **Data Source Confusion:**
    - The app is split between fetching real data from Supabase (e.g., `FlatteningPage`) and trying to fetch data from the local mock backend (e.g., `rawMaterialLogService`). This will break in production if the backend isn't deployed or if it remains a mock.

### 🟡 Code Quality & Structure
-   **Direct Logic in Components:** `FlatteningPage.jsx` contains heavy data fetching and business logic (2500+ lines) that should be moved to a `hooks/` or `services/` layer.
-   **Backend Structure:** The backend has a mix of root-level files and a `src/` directory, which is confusing. The active `server.js` ignores the structured `src/` files.
-   **Context Naming:** `frontend/src/context` vs `frontend/src/contexts`.

## 4. Recommendations

### Immediate Fixes
1.  **Fix `axios.jsx`**: Correct the `baseURL` assignment.
2.  **Decide on Backend Strategy**:
    -   **Option A (Recommended):** Fully embrace **Supabase**. Move any remaining logic from the Express backend to **Supabase Edge Functions** or direct client calls. Delete the Express backend.
    -   **Option B:** If a custom backend is needed, refactor `server.js` to actually use the database and validate Supabase tokens.
3.  **Activate `AuthContext`**: Wrap the specialized `AuthProvider` around the app in `App.jsx` to centralize user state.

### Long-term Improvements
-   **Refactor Components**: Move Supabase calls out of UI components (`FlatteningPage.jsx`) into reusable services or custom hooks.
-   **Clean up Codebase**: Remove the unused `backend` folder if migrating to Supabase, or clean up the `backend/src` structure.
-   **Environment Variables**: Ensure `REACT_APP_API_URL` and Supabase keys are correctly set in all environments.
