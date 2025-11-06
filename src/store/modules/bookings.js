// frontend/src/store/modules/bookings.js

import api from "@/views/services/api";

const state = () => ({
  // Booking-related state can be added here if needed
});

const mutations = {
  // Booking-related mutations can be added here if needed
};

const actions = {
  async createBooking({ _commit }, bookingData) {
    try {
      const response = await api.createBooking(bookingData);
      return response.data;
    } catch (error) {
      console.error('[Vuex Bookings] Failed to create booking:', error.response?.data?.message || error.message);
      throw error;
    }
  },
  async initiateManualPayment({ _commit }, payload) {
    try {
      const response = await api.initiateManualPayment(payload);
      return response.data;
    } catch (error) {
      console.error('[Vuex Bookings] Failed to initiate manual payment:', error.response?.data?.message || error.message);
      throw error;
    }
  },
  async confirmManualQrPayment({ _commit }, bookingId) {
    try {
      const response = await api.confirmManualQrPayment(bookingId);
      return response.data;
    } catch (error) {
      console.error('[Vuex Bookings] Failed to confirm manual QR payment:', error.response?.data?.message || error.message);
      throw error;
    }
  },
  async cancelBooking({ _commit }, bookingId) {
    try {
      const response = await api.cancelBooking(bookingId);
      return response.data;
    } catch (error) {
      console.error('[Vuex Bookings] Failed to cancel booking:', error.response?.data?.message || error.message);
      throw error;
    }
  },
  async getPaymentStatus({ _commit }, bookingId) {
    try {
      const response = await api.getPaymentStatus(bookingId);
      return response.data;
    } catch (error) {
      console.error('[Vuex Bookings] Failed to get booking status:', error.response?.data?.message || error.message);
      throw error;
    }
  },
  async getBookingById({ _commit }, bookingId) {
    try {
      const response = await api.getBookingById(bookingId);
      return response.data;
    } catch (error) {
      console.error('[Vuex Bookings] Failed to get booking by ID:', error);
      throw error;
    }
  },
  async updateBookingPaymentMethod({ _commit }, { bookingId, paymentMethod, newStatus }) {
    try {
      const response = await api.updateBooking(bookingId, { paymentMethod, newStatus });
      return response.data;
    } catch (error) {
      console.error('[Vuex Bookings] Failed to update booking payment method:', error);
      throw error;
    }
  },
  async updateBookingStatusAdmin({ _commit }, { bookingId, newStatus }) {
    try {
      const response = await api.updateBookingStatusAdmin(bookingId, newStatus);
      return response.data;
    } catch (error) {
      console.error('[Vuex Bookings] Failed to update booking Status (Admin):', error.response?.data?.message || error.message);
      throw error;
    }
  },
  async fetchBookingsByUser({ _commit }, userId) {
    try {
      const response = await api.getBookingsByUser(userId);
      return response.data;
    } catch (error) {
      console.error('[Vuex Bookings] Failed to fetch bookings by user:', error.response?.data?.message || error.message);
      throw error;
    }
  },
  async downloadBookingContract({ _commit }, bookingId) {
    try {
      
      const response = await api.downloadBookingContract(bookingId);

      const disposition = response.headers['content-disposition'];
      let filename = `BookingContract-${bookingId}.pdf`; // Default

      if (disposition && disposition.includes('filename=')) {
        filename = disposition.split('filename=')[1].replace(/"/g, '');
      }

      console.log('Vuex Action: Returning blob and filename:', response.data, filename);
      return { data: response.data, filename: filename };
    } catch (error) {
      console.error('[Vuex Bookings] Failed to download contract:', error);
      throw error;
    }
  },
};

const getters = {
  // Booking-related getters can be added here if needed
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};
