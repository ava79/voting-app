# Frontend UI Deployment (React)

This document provides instructions for deploying the React frontend for the Voting DApp.

## Prerequisites
- Node.js & npm (or yarn)
- A Firebase project with a registered Web App. You will need the Firebase Web App configuration details (API key, auth domain, etc.).
- The backend API should be deployed and accessible via a public URL. This URL will be proxied to during local development but needs to be configured for production builds if the frontend directly calls it (or if the proxy setup is only for `npm start`).

## Environment Variables
The React application uses environment variables (prefixed with `REACT_APP_`) to configure Firebase and other settings.

Create a `.env` file in the root of the `frontend` project. For production builds, these variables should typically be set in your deployment platform's build environment settings.

```env
# Firebase Web App Configuration
REACT_APP_FIREBASE_API_KEY="YOUR_FIREBASE_WEB_APP_API_KEY"
REACT_APP_FIREBASE_AUTH_DOMAIN="YOUR_FIREBASE_WEB_APP_AUTH_DOMAIN"
REACT_APP_FIREBASE_PROJECT_ID="YOUR_FIREBASE_WEB_APP_PROJECT_ID"
REACT_APP_FIREBASE_STORAGE_BUCKET="YOUR_FIREBASE_WEB_APP_STORAGE_BUCKET"
REACT_APP_FIREBASE_MESSAGING_SENDER_ID="YOUR_FIREBASE_WEB_APP_MESSAGING_SENDER_ID"
REACT_APP_FIREBASE_APP_ID="YOUR_FIREBASE_WEB_APP_APP_ID"
# REACT_APP_FIREBASE_MEASUREMENT_ID="YOUR_FIREBASE_MEASUREMENT_ID" # Optional: for Google Analytics

# Admin Configuration (for UI elements, security is on backend)
REACT_APP_ADMIN_FIREBASE_UID="THE_FIREBASE_UID_OF_THE_DESIGNATED_ADMIN_USER"

# Backend API URL (Optional - if not using proxy for production builds)
# If your production frontend needs to call the backend directly (not via proxy),
# you might need to set its URL here and adjust fetch requests in your components.
# REACT_APP_BACKEND_API_URL="YOUR_DEPLOYED_BACKEND_API_URL"
```

**Important Notes on Environment Variables:**
-   Replace all placeholder values (`YOUR_...`) with your actual Firebase project configuration details.
-   The `.env` file is for local development. For production deployment, configure these environment variables directly in your hosting platform's settings. Most platforms will automatically make these available during the build process if prefixed correctly (e.g., `REACT_APP_`).
-   The `proxy` setting in `package.json` (`"proxy": "http://localhost:3001"`) is for local development convenience to avoid CORS issues when the frontend dev server (e.g., `localhost:3000`) calls the local backend server (`localhost:3001`). For production, ensure your frontend can reach your deployed backend API. This might involve:
    -   The backend having CORS configured to allow requests from your frontend's domain.
    -   The frontend making requests to the full backend URL (possibly configured via `REACT_APP_BACKEND_API_URL`).
    -   Using a service that hosts both frontend and backend under the same domain or path (e.g., some configurations on Render, or a monorepo setup on Vercel).

## Deployment Platforms

Choose a platform that supports static site hosting or Node.js-based serving for React SPAs.

-   **Netlify / Vercel:**
    1.  Connect your Git repository. These platforms typically auto-detect React applications created with `create-react-app`.
    2.  Set Build Command: `npm run build` (or `CI= npm run build` to treat warnings as errors if desired).
    3.  Set Publish Directory: `build` (this is the default output directory for `create-react-app`).
    4.  Configure all necessary `REACT_APP_` environment variables in the platform's project settings/dashboard.

-   **GitHub Pages:**
    1.  Install `gh-pages`: `npm install --save-dev gh-pages`.
    2.  Add `homepage` to `package.json`: `"homepage": "https://your-username.github.io/your-repo-name"`.
    3.  Add deploy scripts to `package.json`:
        ```json
        "scripts": {
          // ... other scripts
          "predeploy": "npm run build",
          "deploy": "gh-pages -d build"
        }
        ```
    4.  Run `npm run deploy`.
    5.  **Note:** GitHub Pages has limitations with client-side routing (React Router's `BrowserRouter`). You might need to switch to `HashRouter` or implement a custom 404-page redirect solution. Environment variables also need careful handling, often requiring them to be public or managed via GitHub Actions secrets during the build.

-   **AWS S3 & CloudFront / Google Cloud Storage & CDN / Azure Blob Storage & CDN:** These are more manual setups but offer high scalability and control for serving static assets.

## Running Locally for Development
1.  Navigate to the `frontend` directory: `cd frontend`
2.  Install dependencies: `npm install`
3.  Create a `.env` file in the `frontend` directory and populate it with all the required `REACT_APP_` environment variables.
4.  Ensure your backend API server is running locally (typically on `http://localhost:3001` as configured in the `proxy` setting in `package.json`).
5.  Start the React development server: `npm start`
    The application will typically open in your browser at `http://localhost:3000`.
