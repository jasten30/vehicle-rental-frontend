import axios from 'axios';
import store from '../../store';
import { getAuth } from "firebase/auth";

// Create a configured instance of axios
const apiClient = axios.create({
    baseURL: process.env.VUE_APP_API_BASE_URL || 'http://localhost:5001/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to add token
apiClient.interceptors.request.use(
    async (config) => { // Make this ASYNC
        let token = store.getters.authToken;

        // CHECK FIREBASE DIRECTLY
        const auth = getAuth();
        const user = auth.currentUser;

        if (user) {
            // Force fetch a new token from Firebase
            // true = force refresh
            token = await user.getIdToken(true);
            console.log("🔥 [Axios] Got fresh token from Firebase");
        }

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Function to set the authentication token manually
export const setAuthToken = (token) => {
    if (token) {
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete apiClient.defaults.headers.common['Authorization'];
    }
};

// Define all your API calls in this exported object
export default {
    // --- AUTH ---
    login: (credentials) => apiClient.post('/auth/login', credentials),
    register: (userData) => apiClient.post('/auth/register', userData),
    tokenLogin: () => apiClient.post('/auth/token-login'),
    reauthenticate: (password) => apiClient.post('/auth/reauthenticate', { password }),
    forgotPassword: (email) => apiClient.post('/auth/forgot-password', { email }),
    sendContactForm: (data) => apiClient.post('/auth/contact', data),

    // --- USERS ---
    getUserProfile: () => apiClient.get('/users/profile'),
    updateUserProfile: (profileData) => apiClient.put('/users/profile', profileData),
    getAllUsers: () => apiClient.get('/users/all-users'),
    updateUserRole: (userId, role) => apiClient.put(`/users/update-role/${userId}`, { role }),
    deleteUser: (userId) => apiClient.delete(`/users/${userId}`),

    // --- USER VERIFICATION ---
    sendEmailVerificationCode: () => apiClient.post('/users/send-email-verification'),
    verifyEmailCode: (code) => apiClient.post('/users/verify-email-code', { code }),
    submitDriveApplication: (applicationData) => apiClient.post('/users/drive-application', applicationData),

    // --- FAVORITES ---
    toggleFavoriteVehicle: (data) => apiClient.post('/users/me/favorites/toggle', data),

    // --- HOST APPLICATIONS ---
    submitHostApplication: (applicationData) => apiClient.post('/users/submit-host-application', applicationData),
    getHostApplications: () => apiClient.get('/users/host-applications'),

    // --- ADMIN ---
    approveHostApplication: (applicationId, userId) => apiClient.put('/admin/approve-host-application', { applicationId, userId }),
    declineHostApplication: (applicationId) => apiClient.put('/admin/decline-host-application', { applicationId }),
    getDriveApplications: () => apiClient.get('/admin/drive-applications'),
    approveDriveApplication: (applicationId, userId) => apiClient.post(`/admin/drive-applications/approve`, { applicationId, userId }),
    declineDriveApplication: (applicationId, userId) => apiClient.post(`/admin/drive-applications/decline`, { applicationId, userId }),
    getBookingReports: () => apiClient.get('/admin/reports'),
    resolveBookingReport: (reportId) => apiClient.put(`/admin/reports/${reportId}/resolve`),
    findOrCreateAdminUserChat: (payload) => apiClient.post('/admin/chats/find-or-create', payload),
    toggleUserSuspension: (userId, isSuspended) =>
        apiClient.put(`/users/update-suspension/${userId}`, { isSuspended }),

    // --- VEHICLES ---
    getAllVehicles: () => apiClient.get('/vehicles'),
    getVehicleById: (vehicleId) => apiClient.get(`/vehicles/${vehicleId}`),
    addVehicle: (vehicleData) => apiClient.post('/vehicles', vehicleData),
    updateVehicle: (vehicleId, updates) => apiClient.put(`/vehicles/${vehicleId}`, { updates }),
    getVehiclesByOwner: () => apiClient.get('/vehicles/my-listings'),
    getPublicVehiclesByOwner: (userId) => apiClient.get(`/vehicles/owner/${userId}`),
    deleteVehicle: (vehicleId) => apiClient.delete(`/vehicles/${vehicleId}`),

    // --- BOOKINGS ---
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

    // --- BOOKING PAYMENT ---
    getPaymentStatus: (bookingId) => apiClient.get(`/payment/status/${bookingId}`),
    updateBookingPaymentMethod: (bookingId, data) => apiClient.put(`/bookings/${bookingId}/payment-method`, data),
    confirmDownpaymentByUser: (bookingId, data) => apiClient.post(`/bookings/${bookingId}/confirm-downpayment-by-user`, data),
    confirmOwnerPayment: (bookingId) => apiClient.post(`/bookings/${bookingId}/confirm-owner-payment`),
    confirmBookingPayment: (bookingId) => apiClient.put(`/bookings/${bookingId}/confirm-payment`),

    // --- BOOKING EXTENSION ---
    requestBookingExtension: (bookingId, data) => apiClient.post(`/bookings/${bookingId}/request-extension`, data),
    confirmExtensionPayment: (bookingId, data) => apiClient.post(`/bookings/${bookingId}/confirm-extension`, data),
    deferExtensionPayment: (bookingId, data) => apiClient.post(`/bookings/${bookingId}/defer-extension`, data),

    // --- PLATFORM FEES (NEW) ---
    // Corrected path from /bookings/admin/platform-fees to /admin/platform-fees
    getAllPlatformFees: () => apiClient.get('/admin/platform-fees'),
    // Corrected path from /bookings/admin/host-statements to /admin/host-statements
    getAllHostMonthlyStatements: () => apiClient.get('/admin/host-statements'),
    verifyPlatformFee: (feeId) => apiClient.put(`/bookings/admin/platform-fees/${feeId}/verify`), // This path may also need review
    getOwnerPlatformFees: () => apiClient.get('/bookings/owner/my-fees'),
    submitPlatformFeePayment: (paymentData) => apiClient.post('/bookings/pay-platform-fee', paymentData),

    // --- CHATS ---
    getUserChats: () => apiClient.get('/chats'),
    sendMessage: (chatId, payload) => apiClient.post(`/chats/${chatId}/messages`, payload),
    markChatAsRead: (chatId) => apiClient.put(`/chats/${chatId}/read`),

    // --- REVIEWS ---
    submitReview: (reviewData) => apiClient.post('/reviews', reviewData),
    getReviewsForHost: (hostId) => apiClient.get(`/reviews/host/${hostId}`),
    submitReviewReply: (reviewId, data) => apiClient.post(`/reviews/${reviewId}/reply`, data),

    // --- NOTIFICATIONS ---
    getNotifications: () => apiClient.get('/notifications'),
    markNotificationAsRead: (notificationId) => apiClient.post(`/notifications/${notificationId}/mark-read`),
    markAllNotificationsAsRead: () => apiClient.post('/notifications/mark-all-read'),
};