import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import api from './views/services/api'; // Corrected import path
import './assets/styles/main.scss';

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.VUE_APP_FIREBASE_API_KEY,
  authDomain: process.env.VUE_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VUE_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VUE_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VUE_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VUE_APP_FIREBASE_APP_ID,
};

let app;
if (firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId) {
  app = initializeApp(firebaseConfig);
  getAuth(app); // Call getAuth to initialize the service, but no need to store the variable.
  console.log('Firebase app initialized successfully.');
} else {
  console.error('Firebase configuration is incomplete. Authentication and storage will be unavailable.');
}

// Initialize the API service with the store instance
if (api.initApi) {
  api.initApi(store);
}

// 4. Create and mount the Vue application
createApp(App).use(store).use(router).mount('#app');
