// vehicle-rental-frontend/src/main.js
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import './assets/styles/main.scss';

import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

// 1. Construct and initialize Firebase config from environment variables
//    This MUST happen before any other Firebase calls.
const firebaseConfig = {
  apiKey: process.env.VUE_APP_FIREBASE_API_KEY,
  authDomain: process.env.VUE_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VUE_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VUE_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VUE_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VUE_APP_FIREBASE_APP_ID,
};

// 2. Initialize Firebase app only if a valid config is present
let app;
let auth;
if (firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  console.log('Firebase app initialized successfully.');
} else {
  console.error('Firebase configuration is incomplete. Authentication and storage will be unavailable.');
}

// 3. Listen for auth state changes after initialization
//    The onAuthStateChanged listener is now attached to the auth instance.
if (auth) {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      console.log('Firebase Client SDK: User is signed in. UID:', user.uid);
    } else {
      console.log('Firebase Client SDK: User is signed out.');
      store.dispatch('auth/clearAuth');
    }
  });
}

// 4. Create and mount the Vue application
//    This is now the last step, ensuring all dependencies are ready.
createApp(App).use(store).use(router).mount('#app');
