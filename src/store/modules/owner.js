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
    
    const token = rootGetters.authToken;
    if (!token) {
      commit('setOwnerBookingsError', 'Authentication token not found.');
      commit('setOwnerBookingsStatus', 'error');
      return;
    }

    try {
      // Your api service will automatically use the token
      const response = await api.getOwnerBookings();
      commit('setOwnerBookings', response.data);
      commit('setOwnerBookingsStatus', 'success');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch bookings.';
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

  async approveBooking({ _commit }, bookingId) {
    try {
      const response = await api.approveBooking(bookingId);
      return response.data;
    } catch (error) {
      console.error('Failed to approve booking:', error);
      throw error;
    }
  },
  async declineBooking({ _commit }, bookingId) {
    try {
      const response = await api.declineBooking(bookingId);
      return response.data;
    } catch (error) {
      console.error('Failed to decline booking:', error);
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