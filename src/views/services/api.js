import axios from 'axios';

// Create a configured instance of axios
const apiClient = axios.create({
  baseURL: process.env.VUE_APP_API_BASE_URL || 'http://localhost:5001/api', // Fallback for safety
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
  tokenLogin: () => apiClient.post('/auth/token-login'),
  reauthenticate: (password) => apiClient.post('/auth/reauthenticate', { password }),

  // Users
  getUserProfile: () => apiClient.get('/users/profile'),
  updateUserProfile: (profileData) => apiClient.put('/users/profile', profileData),
  getAllUsers: () => apiClient.get('/users/all-users'),
  updateUserRole: (userId, role) => apiClient.put(`/users/update-role/${userId}`, { role }),
  sendEmailVerificationCode: () => apiClient.post('/users/send-email-verification'),
  verifyEmailCode: (code) => apiClient.post('/users/verify-email-code', { code }),
  deleteUser: (userId) => apiClient.delete(`/users/${userId}`),
  
  // Host Applications (for becoming an owner)
  submitHostApplication: (applicationData) => apiClient.post('/users/submit-host-application', applicationData),
  getHostApplications: () => apiClient.get('/users/host-applications'),
  approveHostApplication: (applicationId, userId) => apiClient.put('/users/approve-host-application', { applicationId, userId }),
  declineHostApplication: (applicationId) => apiClient.put('/users/decline-host-application', { applicationId }),

  // Drive Applications (for getting verified to drive)
  submitDriveApplication: (applicationData) => apiClient.post('/users/drive-application', applicationData),
  getDriveApplications: () => apiClient.get('/admin/drive-applications'),
  approveDriveApplication: (applicationId, userId) => apiClient.post(`/admin/drive-applications/approve`, { applicationId, userId }),
  declineDriveApplication: (applicationId, userId) => apiClient.post(`/admin/drive-applications/decline`, { applicationId, userId }),

  // Vehicles
  getAllVehicles: () => apiClient.get('/vehicles'),
  getVehicleById: (vehicleId) => apiClient.get(`/vehicles/${vehicleId}`),
  addVehicle: (vehicleData) => apiClient.post('/vehicles', vehicleData),
  updateVehicle: (vehicleId, vehicleData) => apiClient.put(`/vehicles/${vehicleId}`, vehicleData),
  getVehiclesByOwner: () => apiClient.get('/vehicles/my-listings'),
  deleteVehicle: (vehicleId) => apiClient.delete(`/vehicles/${vehicleId}`),

  // Bookings
  checkVehicleAvailability: (vehicleId, startDate, endDate) => apiClient.get(`/bookings/availability/${vehicleId}?startDate=${startDate}&endDate=${endDate}`),
  createBooking: (bookingData) => apiClient.post('/bookings', bookingData),
  getBookingById: (bookingId) => apiClient.get(`/bookings/${bookingId}`),
  getAllBookings: (params) => apiClient.get('/bookings/all', { params }),
  getOwnerBookings: () => apiClient.get('/bookings/owner'),
  fetchBookingsByUser: (userId) => apiClient.get(`/bookings/user/${userId}`),
  updateBookingStatus: (bookingId, data) => apiClient.put(`/bookings/${bookingId}/status`, data),
  approveBooking: (bookingId) => apiClient.put(`/bookings/${bookingId}/approve`),
  declineBooking: (bookingId) => apiClient.put(`/bookings/${bookingId}/decline`),

  // Chats
  getUserChats: () => apiClient.get('/chats'),
  sendMessage: (chatId, text) => apiClient.post(`/chats/${chatId}/messages`, { text }),
  markChatAsRead: (chatId) => apiClient.put(`/chats/${chatId}/read`),

  // Reviews
  submitReview: (reviewData) => {
    // --- NEW DEBUGGING LOG ---
    console.log('[api.js] Preparing to send POST request to /reviews with data:', reviewData);
    return apiClient.post('/reviews', reviewData);
  },
};

