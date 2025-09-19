import api from '@/views/services/api';

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
    
    const token = rootGetters.authToken;
    if (!token) {
      commit('setOwnerBookingsError', 'Authentication token not found.');
      commit('setOwnerBookingsStatus', 'error');
      return;
    }

    try {
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
    try {
      await api.updateBooking(bookingId, {
        newStatus: 'downpayment_received',
      });
    } catch (error) {
      console.error(`Error confirming downpayment for booking ${bookingId}:`, error);
      throw error;
    }
  },

  async approveBooking({ commit }, bookingId) {
    try {
      const response = await api.approveBooking(bookingId);
      
      if (response.data && response.data.updatedOwner) {
        commit('SET_USER', response.data.updatedOwner, { root: true });
      } else {
        console.warn('[Vuex owner.js] API response did NOT contain updatedOwner.');
      }
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

