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
    login: (credentials) => apiClient.post('/auth/login', credentials), // Accepts { idToken }
    register: (userData) => apiClient.post('/auth/register', userData),
    tokenLogin: () => apiClient.post('/auth/token-login'),
    reauthenticate: (password) => apiClient.post('/auth/reauthenticate', { password }),
    forgotPassword: (email) => apiClient.post('/auth/forgot-password', { email }),
    sendContactForm: (data) => apiClient.post('/auth/contact', data),

    // Users
    getUserProfile: () => apiClient.get('/users/profile'),
    updateUserProfile: (profileData) => apiClient.put('/users/profile', profileData),
    getAllUsers: () => apiClient.get('/users/all-users'),
    updateUserRole: (userId, role) => apiClient.put(`/users/update-role/${userId}`, { role }),
    deleteUser: (userId) => apiClient.delete(`/users/${userId}`),
    
    // User Verification
    sendEmailVerificationCode: () => apiClient.post('/users/send-email-verification'),
    verifyEmailCode: (code) => apiClient.post('/users/verify-email-code', { code }),
    submitDriveApplication: (applicationData) => apiClient.post('/users/drive-application', applicationData),

    // Favorites
    toggleFavoriteVehicle: (data) => apiClient.post('/users/me/favorites/toggle', data),

    // Host Applications (for becoming an owner)
    submitHostApplication: (applicationData) => apiClient.post('/users/submit-host-application', applicationData),
    getHostApplications: () => apiClient.get('/users/host-applications'), // This might be an admin route
    
    // Admin
    approveHostApplication: (applicationId, userId) => apiClient.put('/admin/approve-host-application', { applicationId, userId }),
    declineHostApplication: (applicationId) => apiClient.put('/admin/decline-host-application', { applicationId }),
    getDriveApplications: () => apiClient.get('/admin/drive-applications'),
    approveDriveApplication: (applicationId, userId) => apiClient.post(`/admin/drive-applications/approve`, { applicationId, userId }),
    declineDriveApplication: (applicationId, userId) => apiClient.post(`/admin/drive-applications/decline`, { applicationId, userId }),
    getBookingReports: () => apiClient.get('/admin/reports'),
    resolveBookingReport: (reportId) => apiClient.put(`/admin/reports/${reportId}/resolve`),
    findOrCreateAdminUserChat: (payload) => apiClient.post('/admin/chats/find-or-create', payload),

    // Vehicles
    getAllVehicles: () => apiClient.get('/vehicles'),
    getVehicleById: (vehicleId) => apiClient.get(`/vehicles/${vehicleId}`),
    addVehicle: (vehicleData) => apiClient.post('/vehicles', vehicleData),
    updateVehicle: (vehicleId, updates) => apiClient.put(`/vehicles/${vehicleId}`, { updates }), // Ensure updates are nested
    getVehiclesByOwner: () => apiClient.get('/vehicles/my-listings'),
    getPublicVehiclesByOwner: (userId) => apiClient.get(`/vehicles/owner/${userId}`),
    deleteVehicle: (vehicleId) => apiClient.delete(`/vehicles/${vehicleId}`),

    // Bookings
    checkVehicleAvailability: (vehicleId, startDate, endDate) => apiClient.get(
        `/bookings/availability/${vehicleId}`,
        {
          params: {
            startDate: startDate,
            endDate: endDate,
          }
        }
    ),
    createBooking: (bookingData) => apiClient.post('/bookings', bookingData),
    getBookingById: (bookingId) => apiClient.get(`/bookings/${bookingId}`),
    getAllBookings: (params) => apiClient.get('/bookings/all', { params }),
    getOwnerBookings: () => apiClient.get('/bookings/owner'),
    fetchBookingsByUser: (userId) => apiClient.get(`/bookings/user/${userId}`),
    updateBookingStatus: (bookingId, data) => apiClient.put(`/bookings/${bookingId}/status`, data),
    approveBooking: (bookingId) => apiClient.put(`/bookings/${bookingId}/approve`),
    declineBooking: (bookingId) => apiClient.put(`/bookings/${bookingId}/decline`),
    cancelBooking: (bookingId) => apiClient.put(`/bookings/${bookingId}/cancel`),
    submitBookingReport: (reportData) => apiClient.post(`/bookings/${reportData.bookingId}/report`, reportData),
    downloadBookingContract: (bookingId) => apiClient.get(
      `/bookings/${bookingId}/contract`,
      { responseType: 'blob' }
    ),

    // Booking Payment
    getPaymentStatus: (bookingId) => apiClient.get(`/payment/status/${bookingId}`), // Example route, adjust as needed
    updateBookingPaymentMethod: (bookingId, data) => apiClient.put(`/bookings/${bookingId}/payment-method`, data),
    confirmDownpaymentByUser: (bookingId, data) => apiClient.post(`/bookings/${bookingId}/confirm-downpayment-by-user`, data),
    confirmOwnerPayment: (bookingId) => apiClient.post(`/bookings/${bookingId}/confirm-owner-payment`),
    confirmBookingPayment: (bookingId) => apiClient.put(`/bookings/${bookingId}/confirm-payment`), // This seems duplicated by confirmOwnerPayment
    
    // Booking Extension
    requestBookingExtension: (bookingId, data) => apiClient.post(`/bookings/${bookingId}/request-extension`, data),
    confirmExtensionPayment: (bookingId, data) => apiClient.post(`/bookings/${bookingId}/confirm-extension`, data),
    deferExtensionPayment: (bookingId, data) => apiClient.post(`/bookings/${bookingId}/defer-extension`, data),

    // Chats
    getUserChats: () => apiClient.get('/chats'),
    sendMessage: (chatId, payload) => apiClient.post(`/chats/${chatId}/messages`, payload),
    markChatAsRead: (chatId) => apiClient.put(`/chats/${chatId}/read`),

    // Reviews
    submitReview: (reviewData) => apiClient.post('/reviews', reviewData),
    getReviewsForHost: (hostId) => apiClient.get(`/reviews/host/${hostId}`),
    submitReviewReply: (reviewId, data) => apiClient.post(`/reviews/${reviewId}/reply`, data),

    // Notifications
    getNotifications: () => apiClient.get('/notifications'),
    markNotificationAsRead: (notificationId) => apiClient.post(`/notifications/${notificationId}/mark-read`),
    markAllNotificationsAsRead: () => apiClient.post('/notifications/mark-all-read'),
};