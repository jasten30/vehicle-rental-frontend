// frontend/src/store/modules/auth.js

import api from "@/views/services/api";
import router from "@/router";
import { getAuth, signInWithCustomToken } from 'firebase/auth';

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
      const backendResponse = await api.login(credentials);
      const customToken = backendResponse.data.token;
      const userDetailsFromBackend = backendResponse.data.user;
      const auth = getAuth();
      const userCredential = await signInWithCustomToken(auth, customToken);
      const firebaseUser = userCredential.user;
      const idToken = await firebaseUser.getIdToken();

      commit("SET_AUTH_TOKEN", idToken);
      commit("SET_USER_INFO", userDetailsFromBackend);
      await router.push("/dashboard");
      return true;
    } catch (error) {
      console.error(
        "[Vuex Auth] Login failed:",
        error.response?.data?.message || error.message
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
      await auth.signOut();
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
