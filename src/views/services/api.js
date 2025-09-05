import axios from 'axios';

// Create a configured instance of axios
const apiClient = axios.create({
  baseURL: 'http://localhost:5001/api', // Your backend's base URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Function to set the authentication token for all subsequent requests
export const setAuthToken = (token) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

// Define all your API calls in this exported object
export default {
  // Auth
  login: (credentials) => apiClient.post('/auth/login', credentials),
  register: (userData) => apiClient.post('/auth/register', userData),

  // Users
  getUserProfile: () => apiClient.get('/users/profile'),
  updateUserProfile: (profileData) => apiClient.put('/users/profile', profileData),
  getAllUsers: () => apiClient.get('/users/all-users'),
  updateUserRole: (userId, role) => apiClient.put(`/users/update-role/${userId}`, { role }),

  // Vehicles
  getAllVehicles: () => apiClient.get('/vehicles'),
  getVehicleById: (vehicleId) => apiClient.get(`/vehicles/${vehicleId}`),
  addVehicle: (vehicleData) => apiClient.post('/vehicles', vehicleData),
  updateVehicle: (vehicleId, vehicleData) => apiClient.put(`/vehicles/${vehicleId}`, vehicleData),

  // Bookings
  checkVehicleAvailability: (vehicleId, startDate, endDate) =>
    apiClient.get(`/bookings/availability/${vehicleId}?startDate=${startDate}&endDate=${endDate}`),
  createBooking: (bookingData) => apiClient.post('/bookings', bookingData),
  getBookingById: (bookingId) => apiClient.get(`/bookings/${bookingId}`),
  updateBooking: (bookingId, updateData) => apiClient.put(`/bookings/${bookingId}`, updateData),
  
  // NEW: Function to get all bookings for the admin panel
  getAllBookings: () => apiClient.get('/bookings/all'),
};