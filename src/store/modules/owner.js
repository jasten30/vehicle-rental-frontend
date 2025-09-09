import api from '@/views/services/api'; // Use your central API service

const state = {
  ownerBookings: [],
  ownerBookingsStatus: 'loading', // 'loading', 'success', 'error'
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
  // This action now uses rootGetters correctly and calls your api service
  async fetchOwnerBookings({ commit, rootGetters }) {
    commit('setOwnerBookingsStatus', 'loading');
    commit('setOwnerBookingsError', null);

    // This will now work because we added the getter in Step 1
    const token = rootGetters.authToken;
    console.log("[Owner Vuex Module] Token obtained from rootGetters:", token ? "Token present" : "Token is NULL or UNDEFINED");

    if (!token) {
      commit('setOwnerBookingsError', 'Authentication token not found.');
      commit('setOwnerBookingsStatus', 'error');
      return;
    }

    try {
      // This now uses your centralized api.js, which already has the auth header
      const response = await api.getOwnerBookings(); 
      commit('setOwnerBookings', response.data);
      commit('setOwnerBookingsStatus', 'success');
    } catch (error) {
      console.error('Error fetching owner bookings:', error);
      const errorMessage = error.response?.data?.message || 'Failed to fetch owner bookings.';
      commit('setOwnerBookingsError', errorMessage);
      commit('setOwnerBookingsStatus', 'error');
    }
  },

  async confirmBookingDownpayment({ _commit }, bookingId) {
    // This action can also be updated to use your api service
    try {
      await api.updateBooking(bookingId, {
        newStatus: 'downpayment_received',
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