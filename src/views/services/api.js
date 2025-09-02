import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// A new function to initialize the API service with the store
export const initApi = (store) => {
  api.interceptors.request.use(
    (config) => {
      const token = store.getters.authToken;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('[API Interceptor] Token attached.');
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        console.error('[API Interceptor] Unauthorized response (401). Clearing auth.');
        store.dispatch('auth/clearAuth');
      }
      return Promise.reject(error);
    }
  );
};

// Method to set the auth token directly
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Export the API methods and the new init function
export default {
  initApi,
  setAuthToken,
  // Auth
  login(credentials) {
    return api.post('/auth/login', credentials);
  },
  register(userData) {
    return api.post('/auth/register', userData);
  },

  // Vehicles
  getAllVehicles() {
    return api.get('/vehicles');
  },
  getVehicleById(id) {
    return api.get(`/vehicles/${id}`);
  },
  getVehiclesByOwner() {
    return api.get(`/vehicles/my-listings`);
  },
  addVehicle(vehicleData) {
    return api.post('/vehicles', vehicleData);
  },
  updateVehicle(id, vehicleData) {
    return api.put(`/vehicles/${id}`, vehicleData);
  },
  // Bookings
  createBooking(bookingData) {
    return api.post('/bookings', bookingData);
  },
  checkVehicleAvailability(vehicleId, startDate, endDate) {
    return api.get(`/bookings/availability/${vehicleId}?startDate=${startDate}&endDate=${endDate}`);
  },
  initiateManualPayment(payload) {
    return api.post('/payment/initiate-manual-payment', payload);
  },
  confirmManualQrPayment(bookingId) {
    return api.post('/payment/confirm-manual-qr-payment', { bookingId });
  },
  cancelBooking(bookingId) {
    return api.post('/payment/cancel-booking', { bookingId });
  },
  getPaymentStatus(bookingId) {
    return api.get(`/payment/status/${bookingId}`);
  },
  getBookingsByUser(userId) {
    return api.get(`/bookings/user/${userId}`);
  },
  getBookingById(bookingId) {
    return api.get(`/bookings/${bookingId}`);
  },
  updateBooking(bookingId, updatedData) {
    return api.put(`/bookings/${bookingId}/payment-method`, updatedData);
  },
  // NEW: Admin/Owner action to update booking status
  updateBookingStatusAdmin(bookingId, newStatus) {
    return api.put('/payment/update-status', { bookingId, newStatus });
  },

  // User Profile
  getUserProfile() {
    return api.get('/users/profile');
  },
  updateUserProfile(profileData) {
    return api.put('/users/profile', profileData);
  },
};
