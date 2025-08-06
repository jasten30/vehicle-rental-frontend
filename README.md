Vehicle Rental Application - Development Setup Guide
This guide provides step-by-step instructions to set up and run both the frontend and backend components of the Vehicle Rental Application on your local machine.

Prerequisites
Before you begin, ensure you have the following software installed on your system:

Git: For cloning the repositories and managing code versions.

Download Git

Node.js & npm (Node Package Manager): For running JavaScript environments (backend server, frontend build tools). We recommend using the latest LTS (Long Term Support) version.

Download Node.js (npm is included with Node.js)

Firebase Project: You will need access to the Firebase project for this application (Firestore database, Firebase Authentication). Ensure you have the necessary credentials (e.g., a service account key for the backend).

1. Clone the Repositories
First, clone both the frontend and backend repositories from GitHub. Choose a directory on your computer where you want to store the project.

# Navigate to your desired development directory
cd C:\Users\YourName\Projects\

# Clone the frontend repository
git clone https://github.com/YOUR_GITHUB_USERNAME/vehicle-rental-frontend.git

# Clone the backend repository
git clone https://github.com/YOUR_GITHUB_USERNAME/vehicle-rental-backend.git

# Navigate into the frontend directory
cd vehicle-rental-frontend
# (You'll do the same for the backend later)

Remember to replace YOUR_GITHUB_USERNAME with your actual GitHub username and ensure the repository names are correct.

2. Backend Setup
Navigate into the vehicle-rental-backend directory:

cd ../vehicle-rental-backend

2.1. Install Dependencies
Install all the necessary Node.js packages:

npm install

2.2. Environment Variables (.env)
The backend requires environment variables for Firebase configuration and other settings.

Create a file named .env in the root of your vehicle-rental-backend directory.

Populate this file with your Firebase service account key and any other necessary environment variables. Do NOT commit this file to GitHub.

Example .env content (your actual values will come from your Firebase project settings):

# Firebase Admin SDK Configuration (Service Account Key)
# Replace with your actual Firebase project configuration
# This should be the content of your downloaded service account JSON file,
# stringified and escaped. Alternatively, you can put the JSON file
# directly in the backend root and reference its path.
# For simplicity, if you paste the JSON content, make sure it's a single line
# or handle multiline string in your firebase.js utility.

# Option A: Stringified JSON (less common, but works)
FIREBASE_SERVICE_ACCOUNT_KEY='{"type": "service_account", "project_id": "your-project-id", ...}'

# Option B: Path to JSON file (more common and recommended)
# FIREBASE_SERVICE_ACCOUNT_PATH='./path/to/your-service-account-key.json'
# If you use this, place your service-account-key.json file in the backend root.

# Port for the backend server
PORT=5000

# Other potential variables (e.g., for JWT secrets if not using Firebase Auth directly for tokens)
# JWT_SECRET=your_secret_key_here

Important: For FIREBASE_SERVICE_ACCOUNT_KEY, it's generally safer to download the JSON service account file from your Firebase project settings (Project settings -> Service accounts -> Generate new private key) and then either:

Place that JSON file directly in your backend directory (e.g., serviceAccountKey.json) and update your firebase.js to load it via its path (e.g., admin.initializeApp({ credential: admin.credential.cert(require('./serviceAccountKey.json')) });).

Or, if you must use an environment variable, ensure the JSON content is correctly escaped and stringified.

2.3. Start the Backend Server
Once dependencies are installed and .env is configured, you can start the backend server:

npm start
# Or if you have a dev script:
# npm run dev

The server should start, usually on http://localhost:5000 (or the PORT you specified in .env). Check your terminal for confirmation messages.

3. Frontend Setup
Navigate into the vehicle-rental-frontend directory:

cd ../vehicle-rental-frontend

3.1. Install Dependencies
Install all the necessary Node.js packages for the frontend:

npm install

3.2. Environment Variables (.env.local)
The frontend also requires environment variables, typically for Firebase Client SDK configuration.

Create a file named .env.local in the root of your vehicle-rental-frontend directory.

Populate this file with your Firebase client configuration. Do NOT commit this file to GitHub.

Example .env.local content:

VUE_APP_FIREBASE_API_KEY="your-api-key"
VUE_APP_FIREBASE_AUTH_DOMAIN="your-project-id.firebaseapp.com"
VUE_APP_FIREBASE_PROJECT_ID="your-project-id"
VUE_APP_FIREBASE_STORAGE_BUCKET="your-project-id.appspot.com"
VUE_APP_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
VUE_APP_FIREBASE_APP_ID="your-app-id"
VUE_APP_FIREBASE_MEASUREMENT_ID="G-your-measurement-id"

# Your backend API base URL
VUE_APP_API_BASE_URL="http://localhost:5000/api"

Important: The VUE_APP_ prefix is crucial for Vue CLI to expose these variables to your frontend application.

3.3. Start the Frontend Development Server
Once dependencies are installed and .env.local is configured, you can start the frontend development server:

npm run serve

The frontend application should compile and then open in your browser, usually at http://localhost:8080.

4. Running the Application
Ensure your backend server is running (e.g., http://localhost:5000).

Ensure your frontend development server is running (e.g., http://localhost:8080).

Open your web browser and navigate to http://localhost:8080.

You should now be able to interact with the application.

5. Common Issues & Troubleshooting
npm install errors: Check your Node.js and npm versions. Try npm cache clean --force and then npm install again.

403 Forbidden or 401 Unauthorized errors:

Backend: Double-check your .env file for correct Firebase service account key configuration. Ensure your Firebase project is properly set up and your service account has the necessary permissions (e.g., Firestore Data Editor, Firebase Authentication Admin).

Frontend: Double-check your .env.local file for correct Firebase client configuration. Ensure the VUE_APP_API_BASE_URL points to your running backend.

Roles: Verify that the user you are logging in with has the expected role in your Firestore users collection.

Frontend not loading/blank page: Check your browser's console for JavaScript errors. Ensure the backend is running and accessible from the frontend's VUE_APP_API_BASE_URL.

"Cannot read properties of null (reading 'content')" or similar Vue compilation errors: Ensure your Vue component files (.vue) have correct syntax, especially in the <script> and <template> sections. Restarting the frontend dev server often helps.

Caching issues: If changes don't seem to apply, try clearing your browser's cache or opening in an incognito window.

6. Git Workflow for Collaboration
When working with teammates, follow a standard Git workflow:

Pull before you start working:

git pull origin main # or master

Create a new branch for your work:

git checkout -b feature/your-feature-name

Make your changes.

Stage your changes:

git add .

Commit your changes:

git commit -m "feat: Add your feature description"
# Or for a bug fix:
# git commit -m "fix: Resolve bug description"

Push your branch to GitHub:

git push -u origin feature/your-feature-name

Create a Pull Request (PR): Go to your GitHub repository and create a Pull Request from your branch to the main (or master) branch.

Review and Merge: Get your teammates to review your code. Once approved, merge your PR.

Clean up: After merging, you can delete your local and remote feature branches.

This comprehensive guide should give your teammates everything they need to get started!
