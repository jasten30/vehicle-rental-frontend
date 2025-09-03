// frontend/src/store/modules/auth.js

import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/init'; // Ensure this path is correct
import router from '@/router';
import api from '@/services/api'; // Keep for non-auth actions if needed

const state = () => ({
  user: null, // User profile from Firestore
  isAuthReady: false, // Tracks if the initial auth check is complete
});

const mutations = {
  SET_USER(state, user) {
    state.user = user;
    // Local storage can be a backup but shouldn't be the primary source of truth
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  },
  SET_AUTH_READY(state) {
    state.isAuthReady = true;
  },
  CLEAR_USER(state) {
    state.user = null;
    localStorage.removeItem('user');
  },
};

const actions = {
  /**
   * This is the crucial action that runs when the app starts.
   * It checks with Firebase to see if a user is already logged in.
   */
  initializeAuth({ commit }) {
    return new Promise((resolve) => {
      const auth = getAuth();
      onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          // User is signed in, fetch their profile from Firestore
          await store.dispatch('auth/fetchUserProfile', firebaseUser.uid);
        } else {
          // User is signed out
          commit('CLEAR_USER');
        }
        commit('SET_AUTH_READY'); // Signal that the initial check is done
        resolve();
      });
    });
  },

  /**
   * Fetches a user's profile from your Firestore 'users' collection.
   */
  async fetchUserProfile({ commit }, userId) {
    if (!userId) {
      // This is where your original error was coming from.
      // This check prevents trying to fetch a profile without an ID.
      console.error('No user ID available to fetch profile.');
      commit('CLEAR_USER');
      return;
    }
    try {
      const userProfileRef = doc(db, 'users', userId);
      const userProfileDoc = await getDoc(userProfileRef);

      if (userProfileDoc.exists()) {
        const userProfile = { uid: userId, ...userProfileDoc.data() };
        commit('SET_USER', userProfile);
      } else {
        console.error('User is authenticated, but no profile was found in Firestore!');
        // Handle this case - maybe the user document failed to be created on signup.
        commit('CLEAR_USER');
      }
    } catch (error) {
       console.error('Failed to fetch user profile:', error);
       commit('CLEAR_USER');
    }
  },

  /**
   * Logs a user in with Firebase and then fetches their profile.
   */
  async login({ dispatch }, credentials) {
    try {
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );
      // After successful Firebase login, fetch our custom profile data
      await dispatch('fetchUserProfile', userCredential.user.uid);
      await router.push('/dashboard');
    } catch (error) {
      console.error('[Vuex Auth] Login failed:', error.message);
      throw error;
    }
  },

  async logout({ commit }) {
    const auth = getAuth();
    try {
      await signOut(auth);
      commit('CLEAR_USER');
      router.push('/login');
    } catch (error) {
      console.error('[Vuex Auth] Error signing out from Firebase:', error);
    }
  },

  async register({ _commit }, userData) {
    // Your register action seems to call a custom backend endpoint.
    // Ensure that endpoint also creates a corresponding document
    // in your Firestore 'users' collection.
    try {
      const response = await api.register(userData);
      router.push('/login');
      return response.data;
    } catch (error) {
      console.error('[Vuex Auth] Registration failed:', error.response?.data?.message || error.message);
      throw error;
    }
  },
};

const getters = {
  isAuthenticated: (state) => !!state.user,
  user: (state) => state.user,
  userRole: (state) => state.user?.role || null,
  isAuthReady: (state) => state.isAuthReady,
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};