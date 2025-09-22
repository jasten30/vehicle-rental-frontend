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
  updateUserRole: (userId, role) =>
    apiClient.put(`/users/update-role/${userId}`, { role }),
  sendEmailVerificationCode: () => apiClient.post('/users/send-email-verification'),
  verifyEmailCode: (code) => apiClient.post('/users/verify-email-code', { code }),

  // Vehicles
  getAllVehicles: () => apiClient.get('/vehicles'),
  getVehicleById: (vehicleId) => apiClient.get(`/vehicles/${vehicleId}`),
  addVehicle: (vehicleData) => apiClient.post('/vehicles', vehicleData),
  updateVehicle: (vehicleId, vehicleData) =>
    apiClient.put(`/vehicles/${vehicleId}`, vehicleData),
  getVehiclesByOwner: () => apiClient.get('/vehicles/my-listings'),

  // Bookings
  checkVehicleAvailability: (vehicleId, startDate, endDate) =>
    apiClient.get(
      `/bookings/availability/${vehicleId}?startDate=${startDate}&endDate=${endDate}`
    ),
  createBooking: (bookingData) => apiClient.post('/bookings', bookingData),
  getBookingById: (bookingId) => apiClient.get(`/bookings/${bookingId}`),
  getAllBookings: (params) => apiClient.get('/bookings/all', { params }),
  getOwnerBookings: () => apiClient.get('/bookings/owner'),
  
  // Specific booking update functions
  updateBookingStatus: (bookingId, data) =>
    apiClient.put(`/bookings/${bookingId}/status`, data),
  updateBookingPaymentMethod: (bookingId, data) =>
    apiClient.put(`/bookings/${bookingId}/payment-method`, data),

  // Function to fetch bookings for specific user
  fetchBookingsByUser: (userId) => apiClient.get(`/bookings/user/${userId}`),

  // Function for phone-based login
  tokenLogin: () => apiClient.post('/auth/token-login'),

  reauthenticate: (password) => apiClient.post('/auth/reauthenticate', { password }),

  confirmBookingPayment: (bookingId) =>
    apiClient.put(`/bookings/${bookingId}/confirm-payment`),

  approveBooking: (bookingId) => apiClient.put(`/bookings/${bookingId}/approve`),
  declineBooking: (bookingId) => apiClient.put(`/bookings/${bookingId}/decline`),

  // Host Applications
  submitHostApplication: (applicationData) => apiClient.post('/users/submit-host-application', applicationData),
  getHostApplications: () => apiClient.get('/users/host-applications'),
  approveHostApplication: (applicationId, userId) => apiClient.put('/users/approve-host-application', { applicationId, userId }),
  declineHostApplication: (applicationId) => apiClient.put('/users/decline-host-application', { applicationId }),

  // Chats
  getUserChats: () => apiClient.get('/chats'),
  sendMessage: (chatId, text) => apiClient.post(`/chats/${chatId}/messages`, { text }),
  markChatAsRead: (chatId) => apiClient.put(`/chats/${chatId}/read`),

  // Drive Application Endpoints
  submitDriveApplication: (applicationData) => apiClient.post('/users/drive-application', applicationData),
  getDriveApplications: () => apiClient.get('/admin/drive-applications'),
  approveDriveApplication: (applicationId, userId) => apiClient.post('/admin/drive-applications/approve', { applicationId, userId }),
  declineDriveApplication: (applicationId, userId) => apiClient.post('/admin/drive-applications/decline', { applicationId, userId }),
};

