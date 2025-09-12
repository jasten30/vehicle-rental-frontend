/* eslint-disable no-unused-vars */

import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import api from './views/services/api';
import './assets/styles/main.scss';

// Import Firebase instances from the new config file
import { firebaseApp, auth, db, storage } from '@/firebase/config';


// 4. Create and mount the Vue application
createApp(App).use(store).use(router).mount('#app');