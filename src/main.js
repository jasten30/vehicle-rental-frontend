// vehicle-rental-frontend/src/main.js
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import './assets/styles/main.scss'; // Import global styles

// Debugging: Log the environment variables to ensure they are loaded
console.log('--- Environment Variables Loaded ---');
console.log('VUE_APP_PAYMONGO_PUBLISHABLE_KEY:', process.env.VUE_APP_PAYMONGO_PUBLISHABLE_KEY);
console.log('VUE_APP_API_BASE_URL:', process.env.VUE_APP_API_BASE_URL);
console.log('--- Individual Firebase Env Vars ---'); // New debug header
console.log('VUE_APP_FIREBASE_API_KEY:', process.env.VUE_APP_FIREBASE_API_KEY);
console.log('VUE_APP_FIREBASE_PROJECT_ID:', process.env.VUE_APP_FIREBASE_PROJECT_ID);
console.log('------------------------------------');

createApp(App).use(store).use(router).mount('#app');

// Firebase client SDK initialization
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';

// Construct Firebase config from individual environment variables
let firebaseConfig = {
  apiKey: process.env.VUE_APP_FIREBASE_API_KEY,
  authDomain: process.env.VUE_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VUE_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VUE_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VUE_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VUE_APP_FIREBASE_APP_ID,
  // measurementId: process.env.VUE_APP_FIREBASE_MEASUREMENT_ID, // Uncomment if you have this
};

// Check if any critical Firebase config is missing
if (!firebaseConfig.apiKey || !firebaseConfig.projectId || !firebaseConfig.appId) {
  console.error('Firebase configuration is incomplete or invalid. Please check your .env.development file.');
  // Clear the config to prevent partial initialization
  firebaseConfig = {};
} else {
  console.log('Firebase Config constructed from .env:', firebaseConfig);
}

// Only initialize Firebase if a valid config is present
let app;
let auth;
if (Object.keys(firebaseConfig).length > 0 && firebaseConfig.apiKey) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  console.log('Firebase app initialized with API Key.');
} else {
  console.error('Firebase API Key is missing or config is empty. Firebase services will not be available.');
}

// Listen for auth state changes (if auth is initialized)
if (auth) {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      console.log('Firebase Client SDK: User is signed in. UID:', user.uid);
    } else {
      console.log('Firebase Client SDK: User is signed out. Clearing token.');
      store.dispatch('clearAuth');
    }
  });

  // For local development, we'll sign in anonymously if no user is already logged in
  if (!auth.currentUser) {
    signInAnonymously(auth)
      .then(() => console.log('Firebase Client SDK: Signed in anonymously for local dev.'))
      .catch((error) => console.error('Firebase Client SDK: Error signing in anonymously:', error));
  }
} else {
  console.warn('Firebase Auth not initialized due to missing config. Authentication features may not work.');
}
