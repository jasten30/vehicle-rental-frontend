// frontend/src/store/modules/auth.js

import api from "@/views/services/api";
import router from "@/router";
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth'; // Import signInWithEmailAndPassword

const state = () => ({
  authToken: localStorage.getItem("authToken") || null,
  user: JSON.parse(localStorage.getItem("user")) || null,
  isAuthenticated: !!localStorage.getItem("authToken"),
  userRole: localStorage.getItem("userRole") || null,
});

const mutations = {
  SET_AUTH_TOKEN(state, token) {
    state.authToken = token;
    state.isAuthenticated = !!token;
    if (token) {
      localStorage.setItem("authToken", token);
    } else {
      localStorage.removeItem("authToken");
    }
  },
  SET_USER_INFO(state, user) {
    state.user = user;
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
      state.userRole = user.role || "renter";
      localStorage.setItem("userRole", user.role || "renter");
    } else {
      localStorage.removeItem("user");
      state.userRole = null;
      localStorage.removeItem("userRole");
    }
  },
  CLEAR_AUTH(state) {
    state.authToken = null;
    state.user = null;
    state.isAuthenticated = false;
    state.userRole = null;
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    localStorage.removeItem("userRole");
  },
};

const actions = {
  async login({ commit }, credentials) {
    try {
      const auth = getAuth();
      // --- CRUCIAL FIX: Use Firebase's client-side login directly ---
      const userCredential = await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
      const firebaseUser = userCredential.user;

      // Get the ID token, which contains the custom claims
      const idToken = await firebaseUser.getIdToken();
      
      // Get the user's role from the token's claims
      const idTokenResult = await firebaseUser.getIdTokenResult();
      const userRole = idTokenResult.claims.role || 'renter';

      // Fetch the full user profile from the backend using the new ID token
      // You will need to create a new endpoint for this on your backend.
      const backendResponse = await api.getUserProfileByIdToken(idToken);
      const userDetailsFromBackend = backendResponse.data;

      // Update the user info with the role from the token
      userDetailsFromBackend.role = userRole;

      commit("SET_AUTH_TOKEN", idToken);
      commit("SET_USER_INFO", userDetailsFromBackend);

      await router.push("/dashboard");
      return true;
    } catch (error) {
      console.error(
        "[Vuex Auth] Login failed:",
        error.message
      );
      throw error;
    }
  },
  async register({ _commit }, userData) {
    try {
      const response = await api.register(userData);
      router.push("/login");
      return response.data;
    } catch (error) {
      console.error(
        "[Vuex Auth] Registration failed:",
        error.response?.data?.message || error.message
      );
      throw error;
    }
  },
  async logout({ commit }) {
    const auth = getAuth();
    try {
      await signOut(auth);
    } catch (error) {
      console.error('[Vuex Auth] Error signing out from Firebase:', error);
    } finally {
      commit("CLEAR_AUTH");
      router.push("/login");
    }
  },
  async fetchUserProfile({ commit }) {
    try {
      const response = await api.getUserProfile();
      commit('SET_USER_INFO', response.data);
      return response.data;
    } catch (error) {
      console.error('[Vuex Auth] Failed to fetch user profile:', error.response?.data?.message || error.message);
      if (error.response && error.response.status === 401) {
        commit('CLEAR_AUTH');
      }
      throw error;
    }
  },
  async updateUserProfile({ commit }, profileData) {
    try {
      const response = await api.updateUserProfile(profileData);
      commit('SET_USER_INFO', response.data.user);
      return response.data.user;
    } catch (error) {
      console.error('[Vuex Auth] Failed to update user profile:', error.response?.data?.message || error.message);
      throw error;
    }
  },
};

const getters = {
  isAuthenticated: (state) => state.isAuthenticated,
  authToken: (state) => state.authToken,
  user: (state) => state.user,
  userRole: (state) => state.userRole,
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};
