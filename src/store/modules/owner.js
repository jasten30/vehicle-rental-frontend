// src/store/modules/owner.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const state = {
  ownerBookings: [],
  ownerBookingsStatus: 'loading',
  ownerBookingsError: null,
};

const mutations = {
  setOwnerBookings(state, bookings) {
    state.ownerBookings = bookings;
  },
  setOwnerBookingsStatus(state, status) {
    state.ownerBookingsStatus = status;
  },
  setOwnerBookingsError(state, error) {
    state.ownerBookingsError = error;
  },
};

const actions = {
  async fetchOwnerBookings({ commit, rootGetters }) {
    commit('setOwnerBookingsStatus', 'loading');
    commit('setOwnerBookingsError', null);
    
    const token = rootGetters.authToken; // Correctly accessing authToken
    console.log("[Owner Vuex Module] Token obtained from rootGetters:", token ? "Token present" : "Token is NULL or UNDEFINED");

    if (!token) {
        commit('setOwnerBookingsError', 'Authentication token not found.');
        commit('setOwnerBookingsStatus', 'error');
        return;
    }

    try {
      console.log("[Owner Vuex Module] Attempting to fetch owner bookings from backend...");
      const response = await axios.get(`${API_BASE_URL}/bookings/owner`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      commit('setOwnerBookings', response.data);
      // FIX: Corrected typo here from setOwnerBookagersStatus to setOwnerBookingsStatus
      commit('setOwnerBookingsStatus', 'success'); 
    } catch (error) {
      console.error('Error fetching owner bookings:', error);
      commit('setOwnerBookingsError', error.response?.data?.message || error.message || 'Failed to fetch owner bookings.');
      commit('setOwnerBookingsStatus', 'error');
    }
  },

  async confirmBookingDownpayment({ _commit, rootGetters }, bookingId) {
    const token = rootGetters.authToken; // Correctly accessing authToken
    if (!token) {
        console.error("Token not found. Cannot confirm booking.");
        throw new Error('Authentication token not found.');
    }

    try {
      await axios.put(`${API_BASE_URL}/bookings/${bookingId}/status`, {
        newStatus: 'downpayment_received',
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

    } catch (error) {
      console.error(`Error confirming downpayment for booking ${bookingId}:`, error);
      throw error; 
    }
  },
};

const getters = {
  ownerBookings: (state) => state.ownerBookings,
  ownerBookingsStatus: (state) => state.ownerBookingsStatus,
  ownerBookingsError: (state) => state.ownerBookingsError,
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};
