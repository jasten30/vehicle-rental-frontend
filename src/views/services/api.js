// frontend/src/views/services/api.js
import axios from 'axios';
import store from '../../store'; // Corrected path: go up two levels to src/, then into store

const API_BASE_URL = 'http://localhost:5000/api'; // Your backend API base URL

const api = axios.create({ // This 'api' variable is what should be used
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach Authorization header
api.interceptors.request.use(
  (config) => {
    const token = store.getters.authToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('[API Interceptor] Token attached:', config.headers.Authorization.substring(0, 30) + '...');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors (e.g., 401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error('[API Interceptor] Unauthorized response (401). Clearing auth.');
      store.dispatch('logout'); // Automatically log out user
    }
    return Promise.reject(error);
  }
);

// Export the API methods
export default {
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
  // NEW: Method to create a booking (initial pending state)
  createBooking(bookingData) {
    return api.post('/bookings', bookingData); // This hits your backend's bookingRoutes.js POST / endpoint
  },
  checkVehicleAvailability(vehicleId, startDate, endDate) {
    return api.get(`/bookings/availability/${vehicleId}?startDate=${startDate}&endDate=${endDate}`);
  },
  // initiateManualPayment will now be called from BookingPaymentView, not VehicleDetailView
  initiateManualPayment(payload) { // This is for the payment controller's endpoint
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
    return api.put(`/bookings/${bookingId}/payment-method`, updatedData); // Use the specific payment-method endpoint
  },

  // User Profile
  getUserProfile() {
    return api.get('/users/profile');
  },
  updateUserProfile(profileData) {
    return api.put('/users/profile', profileData);
  },
};
