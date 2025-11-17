import { createStore } from 'vuex';
import api from '@/views/services/api'; // UPDATED: Corrected import path
import router from '../router';
import { DateTime, Interval } from 'luxon'; // UPDATED: Imported Interval
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  signInWithCustomToken,
} from 'firebase/auth';
import owner from './modules/owner';
import { setAuthToken } from '@/views/services/api'; // UPDATED: Corrected import path

export default createStore({
  state: {
    user: null,
    isAuthenticated: false,
    authLoading: true,
    userRole: null,
    authToken: null,
    vehicle: null,
    allBookings: [],
    allUsers: [],
    vehicleFilters: {
      make: '',
      model: '',
      year: null,
      location: '',
      minPrice: null,
      maxPrice: null,
      availabilityStartDate: null,
      availabilityEndDate: null,
      vehicleType: '',
      seats: null,
      assetType: null, // Make sure this line exists
    },
    vehicleSort: {
      key: 'rentalPricePerDay',
      order: 'asc',
    },
    allVehicles: [],
    userChats: [],
    notifications: [],
    isLoadingNotifications: false,
  },
  mutations: {
    SET_NOTIFICATIONS(state, notifications) {
      state.notifications = notifications;
    },
    SET_NOTIFICATIONS_LOADING(state, isLoading) {
      state.isLoadingNotifications = isLoading;
    },
    MARK_NOTIFICATION_AS_READ(state, notificationId) {
      const notification = state.notifications.find(n => n.id === notificationId);
      if (notification) {
        notification.isRead = true;
      }
    },
    MARK_ALL_NOTIFICATIONS_AS_READ(state) {
      state.notifications.forEach(n => n.isRead = true);
    },
    SET_BOOKING(state, booking) {
      state.booking = booking;
    },
    UPDATE_BOOKING_STATUS(state, { bookingId, newStatus }) {
      if (state.booking && state.booking.id === bookingId) {
        state.booking.paymentStatus = newStatus;
      }
      const bookingInList = state.allBookings.find(b => b.id === bookingId);
      if (bookingInList) {
        bookingInList.paymentStatus = newStatus;
      }
    },
    SET_USER(state, userPayload) {
      state.user = userPayload;
    },
    SET_AUTH_STATE(state, { user, userRole, authToken }) {
      state.user = user;
      state.isAuthenticated = !!user;
      state.userRole = userRole;
      state.authToken = authToken;
      state.authLoading = false;
    },
    SET_AUTH_TOKEN(state, token) {
      state.authToken = token;
    },
    SET_ALL_BOOKINGS(state, bookings) {
      state.allBookings = bookings;
    },
    SET_AUTH_LOADING(state, loading) {
      state.authLoading = loading;
    },
    SET_VEHICLE_FILTER(state, { key, value }) {
      // FIX: Use safe property check for ESLint
      if (Object.prototype.hasOwnProperty.call(state.vehicleFilters, key)) {
        state.vehicleFilters[key] = value;
      } else {
         console.warn(`[Vuex] Attempted to set unknown filter key: ${key}`);
      }
    },
    SET_VEHICLE_SORT(state, { key, order }) {
      state.vehicleSort.key = key;
      state.vehicleSort.order = order;
    },
    RESET_VEHICLE_FILTERS(state) {
      state.vehicleFilters = {
        make: '',
        model: '',
        year: null,
        location: '',
        minPrice: null,
        maxPrice: null,
        availabilityStartDate: null,
        availabilityEndDate: null,
        vehicleType: '',
        seats: null,
        assetType: null, // Make sure this is reset
      };
    },
    SET_ALL_VEHICLES(state, vehicles) {
      state.allVehicles = vehicles;
    },
    SET_VEHICLE(state, vehicle) {
      state.vehicle = vehicle;
    },
    CLEAR_AUTH(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.userRole = null;
      state.authToken = null;
    },
    SET_ALL_USERS(state, users) {
      state.allUsers = users;
    },
    SET_USER_CHATS(state, chats) {
      state.userChats = chats;
    },
    UPDATE_USER_FAVORITES(state, favoritesArray) {
    if (state.user) {
      state.user.favorites = favoritesArray;
    }
  },
  },
  actions: {
    async fetchNotifications({ commit }) {
      commit('SET_NOTIFICATIONS_LOADING', true);
      try {
        const response = await api.getNotifications();
        commit('SET_NOTIFICATIONS', response.data);
      } catch (error) {
        console.error('[Vuex] Failed to fetch notifications:', error);
      } finally {
        commit('SET_NOTIFICATIONS_LOADING', false);
      }
    },
    async markAllNotificationsAsRead({ commit }) {
      try {
        await api.markAllNotificationsAsRead();
        commit('MARK_ALL_NOTIFICATIONS_AS_READ');
      } catch (error) {
        console.error('[Vuex] Failed to mark all notifications as read:', error);
        throw error;
      }
    },
    async markNotificationAsRead({ commit }, notificationId) {
      try {
        await api.markNotificationAsRead(notificationId);
        commit('MARK_NOTIFICATION_AS_READ', notificationId);
      } catch (error) {
        console.error(`[Vuex] Failed to mark notification ${notificationId} as read:`, error);
        throw error;
      }
    },
    async approveBooking({ commit }, bookingId) {
      try {
        await api.approveBooking(bookingId);
        commit('UPDATE_BOOKING_STATUS', { bookingId, newStatus: 'pending_payment' });
      } catch (error) {
        console.error('Error approving booking:', error);
        throw error;
      }
    },
    async declineBooking({ commit }, bookingId) {
      try {
        await api.declineBooking(bookingId);
        commit('UPDATE_BOOKING_STATUS', { bookingId, newStatus: 'declined_by_owner' });
      } catch (error) {
        console.error('Error declining booking:', error);
        throw error;
      }
    },
    async confirmDownpaymentByUser({ commit }, payload) {
        const { bookingId, referenceNumber } = payload;
        try {
          await api.confirmDownpaymentByUser(bookingId, { referenceNumber });
          commit('UPDATE_BOOKING_STATUS', { bookingId, newStatus: 'downpayment_pending_verification' });
        } catch (error) {
          console.error('Error confirming downpayment:', error);
          throw error;
        }
    },
    async confirmOwnerPayment({ commit }, bookingId) {
      try {
        await api.confirmOwnerPayment(bookingId);
        commit('UPDATE_BOOKING_STATUS', { bookingId, newStatus: 'downpayment_verified' });
      } catch (error) {
        console.error('[Vuex] Failed to confirm owner payment:', error);
        throw error;
      }
    },
    initializeAuth({ commit }) {
      return new Promise((resolve) => {
        const auth = getAuth();
        onAuthStateChanged(auth, async (user) => {
          if (user) {
            try {
              const authToken = await user.getIdToken();
              setAuthToken(authToken); // This is your API token
              const response = await api.getUserProfile();
              const userRole = response.data.role || 'renter';
              commit('SET_AUTH_STATE', {
                user: response.data,
                userRole,
                authToken,
              });
            } catch (error) {
              console.error('[Vuex] Failed to initialize auth:', error);
              setAuthToken(null);
              commit('CLEAR_AUTH');
            }
          } else {
            setAuthToken(null);
            commit('CLEAR_AUTH');
          }
          commit('SET_AUTH_LOADING', false);
          resolve();
        });
      });
    },

    // --- UPDATED LOGIN ACTION ---
    async login({ commit }, { idToken }) { // Now expects idToken
      try {
        const auth = getAuth();
        
        // 1. Send the ID Token to the backend to get a *custom* token
        // This verifies the user and checks for 'isBlocked'
        const backendResponse = await api.login({ idToken }); // Pass idToken
        const customToken = backendResponse.data.token;

        // 2. Sign in with the new custom token
        // This is necessary to get the custom claims (like 'role')
        const userCredential = await signInWithCustomToken(auth, customToken);
        const user = userCredential.user;
        
        // 3. Get the *final* auth token (now with custom claims)
        const finalAuthToken = await user.getIdToken();
        setAuthToken(finalAuthToken);

        // 4. Fetch the full user profile
        const profileResponse = await api.getUserProfile();
        const userRole = profileResponse.data.role || 'renter';
        
        commit('SET_AUTH_STATE', {
          user: profileResponse.data,
          userRole,
          authToken: finalAuthToken,
        });

        // 5. Redirect
        if (userRole === 'admin') {
          router.push('/dashboard/admin/dashboard');
        } else if (userRole === 'owner') {
          router.push('/dashboard/owner/vehicles');
        } else {
          router.push('/dashboard/my-bookings');
        }
        return true;
      } catch (error) {
        console.error('[Vuex] Login failed:', error);
        throw error;
      }
    },
    // --- END UPDATED LOGIN ACTION ---

    async fetchAllBookings({ commit }, params = {}) {
      try {
        const response = await api.getAllBookings(params);
        commit('SET_ALL_BOOKINGS', response.data);
        return response.data;
      } catch (error) {
        console.error('Failed to fetch all bookings:', error);
        throw error;
      }
    },
    async register({ _commit }, userData) {
      try {
        await api.register(userData);
        router.push('/login');
        return true;
      } catch (error) {
        console.error('[Vuex] Registration failed:', error);
        throw error;
      }
    },
    async logout({ commit }) {
      commit('CLEAR_AUTH');
      const auth = getAuth();
      try {
        await signOut(auth);
        setAuthToken(null);
        router.push('/login');
      } catch (error) {
        console.error('[Vuex] Firebase sign out failed:', error);
        commit('CLEAR_AUTH');
      }
    },
    async fetchAllVehicles({ commit }) {
      try {
        const response = await api.getAllVehicles();
        const normalizedVehicles = response.data.map((vehicle) => {
          const normalized = { ...vehicle };
          normalized.rentalPricePerDay =
            parseFloat(vehicle.rentalPricePerDay) || 0;
          normalized.seats = parseInt(vehicle.seatingCapacity, 10) || 0;
          normalized.year = parseInt(vehicle.year, 10) || 0;
          normalized.make = vehicle.make || 'Unknown Make';
          normalized.model = vehicle.model || 'Unknown Model';
          if (!vehicle.location || !vehicle.location.city) {
            normalized.location = { city: 'Location Unavailable' };
          }
          if (!vehicle.exteriorPhotos || vehicle.exteriorPhotos.length === 0) {
            normalized.exteriorPhotos = [
              'https://placehold.co/400x300/e2e8f0/666666?text=No+Image',
            ];
          }
          // --- REMOVED: Faulty normalization logic ---
          return normalized;
        });
        commit('SET_ALL_VEHICLES', normalizedVehicles);
        return normalizedVehicles;
      } catch (error) {
        console.error('[Vuex] Failed to fetch all vehicles:', error);
        throw error;
      }
    },
    async getVehicleById({ commit }, vehicleId) {
      try {
        const response = await api.getVehicleById(vehicleId);
        commit('SET_VEHICLE', response.data);
        return response.data;
      } catch (error) {
        console.error('[Vuex] Failed to fetch vehicle by ID:', error);
        throw error;
      }
    },
    async checkVehicleAvailability({ _commit }, payload) {
      try {
        const { vehicleId, startDate, endDate } = payload;
        const response = await api.checkVehicleAvailability(
          vehicleId,
          startDate,
          endDate
        );
        return { ...response.data };
      } catch (error) {
        console.error('[Vuex] Failed to check vehicle availability:', error);
        throw error;
      }
    },
    async createBooking({ _commit }, bookingData) {
      try {
        const response = await api.createBooking(bookingData);
        const newBookingId = response.data.id;
        router.push({ name: 'BookingStatus', params: { bookingId: newBookingId } });
        return response.data;
      } catch (error) {
        console.error('[Vuex] Failed to create booking:', error);
        throw error;
      }
    },
    // FIX: Removed unused 'ownerId' parameter
    async getVehiclesByOwner({ _commit }) {
      try {
        const response = await api.getVehiclesByOwner();
        return response.data;
      } catch (error) {
        console.error('[Vuex] Failed to fetch owner vehicles:', error);
        throw error;
      }
    },
    async addVehicle({ _commit }, vehicleData) {
      try {
        const response = await api.addVehicle(vehicleData);
        return response.data;
      } catch (error) {
        console.error('[Vuex] Failed to add vehicle:', error);
        throw error;
      }
    },
    // FIX: Changed destructuring to { id, updates }
    async updateVehicle({ commit }, { id, updates }) {
      try {
        const response = await api.updateVehicle(id, updates);
        // Optimistic update to the list
        commit('UPDATE_VEHICLE_SUCCESS', { id, ...updates });
        return response.data;
      } catch (error) {
        console.error('[Vuex] Failed to update vehicle:', error);
        throw error;
      }
    },
    async fetchUserProfile({ commit }) {
      try {
        const response = await api.getUserProfile();
        commit('SET_USER', response.data);
        return response.data;
      } catch (error) {
        console.error('[Vuex] Failed to fetch user profile:', error);
        throw error;
      }
    },
    async updateUserProfile({ commit }, profileData) {
      try {
        const response = await api.updateUserProfile(profileData);
        commit('SET_USER', response.data.user);
        return response.data.user;
      } catch (error) {
        console.error('[Vuex] Failed to update user profile:', error);
        throw error;
      }
    },
    async getPaymentStatus({ _commit }, bookingId) {
      try {
        const response = await api.getPaymentStatus(bookingId);
        return response.data;
      } catch (error) {
        console.error('[Vuex] Failed to get payment status:', error);
        throw error;
      }
    },
    async getBookingById({ _commit }, bookingId) {
      try {
        const response = await api.getBookingById(bookingId);
        return response.data;
      } catch (error) {
        console.error('[Vuex] Failed to get booking by ID:', error);
        throw error;
      }
    },
    async updateBookingPaymentMethod({ _commit }, { bookingId, paymentMethod, newStatus }) {
      try {
        const response = await api.updateBookingPaymentMethod(bookingId, {
          paymentMethod,
          newStatus,
        });
        return response.data;
      } catch (error) {
        console.error('[Vuex] Failed to update booking payment method:', error);
        throw error;
      }
    },
    async confirmBookingPayment({ _commit }, bookingId) {
      try {
        const response = await api.confirmBookingPayment(bookingId);
        return response.data;
      } catch (error) {
        console.error('Failed to confirm booking payment:', error);
        throw error;
      }
    },
    async fetchAllUsers({ commit }) {
      try {
        const response = await api.getAllUsers();
        commit('SET_ALL_USERS', response.data);
        return response.data;
      } catch (error) {
        console.error('[Vuex] Failed to fetch all users:', error);
        throw error;
      }
    },
    async fetchBookingsByUser({ _commit }, userId) {
      try {
        const response = await api.fetchBookingsByUser(userId);
        return response.data;
      } catch (error) {
        console.error('[Vuex] Failed to fetch user bookings:', error);
        throw error;
      }
    },
    async sendEmailVerificationCode() {
      try {
        await api.sendEmailVerificationCode();
      } catch (error) {
        console.error('Failed to send email verification code:', error);
        throw error;
      }
    },
    async verifyEmailCode({ _commit }, code) {
      try {
        await api.verifyEmailCode(code);
      } catch (error) {
        console.error('Failed to verify email code:', error);
        throw error;
      }
    },
    async tokenLogin({ dispatch }) {
      try {
        const response = await api.tokenLogin();
        const customToken = response.data.token;
        const auth = getAuth();
        await signInWithCustomToken(auth, customToken);
        await dispatch('fetchUserProfile');
        const userRole = this.getters.userRole;
        if (userRole === 'admin') {
          router.push('/dashboard/admin/dashboard');
        } else if (userRole === 'owner') {
          router.push('/dashboard/owner/vehicles');
        } else {
          router.push('/dashboard/my-bookings');
        }
      } catch (error) {
        console.error('[Vuex] Token login failed:', error);
        throw error;
      }
    },
    async reauthenticate({ _commit }, password) {
      try {
        await api.reauthenticate(password);
        return true;
      } catch (error) {
        console.error('[Vuex] Re-authentication failed:', error);
        throw error;
      }
    },
    async submitHostApplication({ _commit }, applicationData) {
      try {
        const response = await api.submitHostApplication(applicationData);
        return response.data;
      } catch (error) {
        console.error('Failed to submit host application:', error);
        throw error;
      }
    },
    async fetchHostApplications({ _commit }) {
      try {
        const response = await api.getHostApplications();
        return response.data;
      } catch (error) {
        console.error('[Vuex] Failed to fetch host applications:', error);
        throw error;
      }
    },
    async approveHostApplication({ _commit }, { applicationId, userId }) {
      try {
        await api.approveHostApplication(applicationId, userId);
      } catch (error) {
        console.error('Failed to approve host application:', error);
        throw error;
      }
    },
    async declineHostApplication({ _commit }, applicationId) {
      try {
        await api.declineHostApplication(applicationId);
      } catch (error) {
        console.error('Failed to decline host application:', error);
        throw error;
      }
    },
    async fetchUserChats({ commit }) {
      try {
        const response = await api.getUserChats();
        commit('SET_USER_CHATS', response.data);
        return response.data;
      } catch (error) {
        console.error('[Vuex] Failed to fetch user chats:', error);
        throw error;
      }
    },
    async sendMessage({ _commit }, payload) {
      try {
        await api.sendMessage(payload.chatId, { 
          text: payload.text, 
          imageBase64: payload.imageBase64 
        });
      } catch (error) {
        console.error('[Vuex] Failed to send message:', error);
        throw error;
      }
    },
    async markChatAsRead({ dispatch }, chatId) {
      try {
        await api.markChatAsRead(chatId);
        dispatch('fetchUserChats');
      } catch (error) {
        console.error('Failed to mark chat as read:', error);
      }
    },
    async fetchDriveApplications({ _commit }) {
      try {
        const response = await api.getDriveApplications();
        return response.data;
      } catch (error) {
        console.error('[Vuex] Failed to fetch drive applications:', error);
        throw error;
      }
    },
    async approveDriveApplication({ _commit }, { applicationId, userId }) {
      try {
        await api.approveDriveApplication(applicationId, userId);
      } catch (error) {
        console.error('[Vuex] Failed to approve drive application:', error);
        throw error;
      }
    },
    async declineDriveApplication({ _commit }, { applicationId, userId }) {
      try {
        await api.declineDriveApplication(applicationId, userId);
      } catch (error) {
        console.error('[Vuex] Failed to decline drive application:', error);
        throw error;
      }
    },
    async submitDriveApplication({ _commit }, formData) {
      try {
        const response = await api.submitDriveApplication(formData);
        return response.data;
      } catch (error) {
        console.error('[Vuex] Failed to submit drive application:', error);
        throw error;
      }
    },
    async deleteUser({ _commit }, userId) {
      try {
        await api.deleteUser(userId);
      } catch (error) {
        console.error('[Vuex] Failed to delete user:', error);
        throw error;
      }
    },
    async updateBookingStatus({ _commit }, { bookingId, newStatus }) {
      try {
        const response = await api.updateBookingStatus(bookingId, { newStatus });
        return response.data;
      } catch (error) {
        console.error('[Vuex] Failed to update booking status:', error);
        throw error;
      }
    },
    async submitReview({ _commit }, reviewData) {
      try {
        await api.submitReview(reviewData);
      } catch (error) {
        console.error('[Vuex] Failed to submit review:', error);
        throw error;
      }
    },
    async cancelBooking({ commit }, bookingId) {
      try {
        await api.cancelBooking(bookingId); 
        commit('UPDATE_BOOKING_STATUS', { bookingId, newStatus: 'cancelled_by_renter' });
      } catch (error) {
        console.error('[Vuex] Failed to cancel booking:', error);
        throw error; 
      }
    },
    async submitBookingReport({ _commit }, reportData) { 
        try {
          await api.submitBookingReport(reportData); 
        } catch (error) {
          console.error('[Vuex] Failed to submit booking report:', error);
          throw error;
        }
    },
    async fetchBookingReports({ _commit }) {
        try {
          const response = await api.getBookingReports(); 
          if (response && Array.isArray(response.data)) {
              return response.data; 
          } else {
              console.error("[Vuex] Invalid response structure from getBookingReports API:", response);
              return []; 
          }
        } catch (error) {
          console.error('[Vuex] Failed to fetch booking reports:', error);
          throw error; 
        }
    },

    async resolveBookingReport({ _commit }, reportId) { 
        try {
            await api.resolveBookingReport(reportId);
        } catch (error) {
            console.error('[Vuex] Failed to resolve booking report:', error);
            throw error;
        }
    },
    async findOrCreateAdminUserChat({ _commit }, targetUserId) {
      try {
        const response = await api.findOrCreateAdminUserChat({ targetUserId });
        if (response && response.data && response.data.chatId) {
          return response.data.chatId;
        } else {
            throw new Error("Invalid response from findOrCreateAdminUserChat API");
        }
      } catch (error) {
        console.error('[Vuex] Failed to find or create admin-user chat:', error);
        throw error;
      }
    },
    async requestBookingExtension({ _commit }, payload) {
      try {
        const response = await api.requestBookingExtension(payload.bookingId, {
            extensionHours: payload.extensionHours
        });
        return response.data;
      } catch (error) {
        console.error('[Vuex] Failed to request booking extension:', error);
        throw error;
      }
    },
    async confirmExtensionPayment({ commit }, payload) {
      try {
        await api.confirmExtensionPayment(payload.bookingId, payload);
        commit('UPDATE_BOOKING_STATUS', { bookingId: payload.bookingId, newStatus: 'confirmed' });
      } catch (error) {
        console.error('[Vuex] Failed to confirm extension payment:', error);
        throw error;
      }
    },
    async downloadBookingContract({ _commit }, bookingId) {
      try {
        const response = await api.downloadBookingContract(bookingId);
        const contentDisposition = response.headers['content-disposition'];
        let filename = `BookingContract-${bookingId}.txt`; // default
        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
            if (filenameMatch && filenameMatch.length === 2) filename = filenameMatch[1];
        }
        return { data: response.data, filename: filename }; 
      } catch (error) {
        console.error('[Vuex] Failed to download contract:', error);
        throw error;
      }
    },
    async deferExtensionPayment({ commit }, payload) {
      try {
        await api.deferExtensionPayment(payload.bookingId, payload);
        commit('UPDATE_BOOKING_STATUS', { bookingId: payload.bookingId, newStatus: 'confirmed' });
      } catch (error) {
        console.error('[Vuex] Failed to defer extension payment:', error);
        throw error;
      }
    },
    async toggleFavorite({ commit, getters }, vehicleId) {
      if (!getters.isAuthenticated) {
        return;
      }
      
      const currentFavorites = getters.userFavorites;
      let optimisticFavorites;

      if (currentFavorites.includes(vehicleId)) {
        optimisticFavorites = currentFavorites.filter(id => id !== vehicleId);
      } else {
        optimisticFavorites = [...currentFavorites, vehicleId];
      }
      commit('UPDATE_USER_FAVORITES', optimisticFavorites);

      try {
        const response = await api.toggleFavoriteVehicle({ vehicleId });
        commit('UPDATE_USER_FAVORITES', response.data.favorites);
      } catch (error) {
        console.error("Error toggling favorite:", error);
        commit('UPDATE_USER_FAVORITES', currentFavorites);
        alert("Failed to update favorites. Please try again.");
      }
    },
    setVehicleFilter({ commit }, payload) {
      commit('SET_VEHICLE_FILTER', payload);
    },
    setVehicleSort({ commit }, payload) {
      commit('SET_VEHICLE_SORT', payload);
    },
    resetVehicleFilters({ commit }) {
      commit('RESET_VEHICLE_FILTERS');
    },

    async forgotPassword({ _commit }, email) {
      try {
        await api.forgotPassword(email); 
      } catch (error) {
        console.error('[Vuex] Forgot Password failed:', error);
        throw error;
      }
    },

    // ================================================
    //  NEW ACTIONS FOR PROFILE PAGE
    // ================================================
    async getPublicVehiclesByOwner({ _commit }, userId) {
      try {
        const response = await api.getPublicVehiclesByOwner(userId);
        return response.data; // Component will handle this data
      } catch (error) {
        console.error('[Vuex] Failed to fetch public vehicles:', error);
        throw error;
      }
    },
    async getReviewsForHost({ _commit }, hostId) {
      try {
        const response = await api.getReviewsForHost(hostId);
        return response.data; // Component will handle this data
      } catch (error) {
        console.error('[Vuex] Failed to fetch host reviews:', error);
        throw error;
      }
    },
    async submitReviewReply({ _commit }, { reviewId, text }) {
      try {
        await api.submitReviewReply(reviewId, { text });
      } catch (error) {
        console.error('[Vuex] Failed to submit review reply:', error);
        throw error; // Let the component handle the error message
      }
    },
    // --- ADD THIS ---
    async sendContactForm({ _commit }, formData) {
      try {
        await api.sendContactForm(formData);
      } catch (error) {
        console.error('[Vuex] Failed to send contact form:', error);
        throw error; // Let the component handle the error message
      }
    },
    // --- END ADD ---
    // ================================================

  },
  getters: {
    notifications: (state) => state.notifications,
    unreadNotificationsCount: (state) => {
      return state.notifications.filter(n => !n.isRead).length;
    },
    isLoadingNotifications: (state) => state.isLoadingNotifications,
    isAuthenticated: (state) => state.isAuthenticated,
    user: (state) => state.user,
    authLoading: (state) => state.authLoading,
    userRole: (state) => state.userRole,
    authToken: (state) => state.authToken,
    singleVehicle: (state) => state.vehicle,
    isAuthReady: (state) => !state.authLoading,
    currentVehicleFilters: (state) => state.vehicleFilters,
    allVehicles: (state) => state.allVehicles,
    allUsers: (state) => state.allUsers,
    allBookings: (state) => state.allBookings,
    vehicleSort: (state) => state.vehicleSort,
    userChats: (state) => state.userChats,
    userFavorites: (state) => state.user?.favorites || [],
    
    // ================================================
    //  UPDATED GETTER
    // ================================================
    // FIX: Prefixed unused getters with _
    filteredAndSortedVehicles: (state, _getters) => {
      let vehicles = Array.isArray(state.allVehicles)
        ? [...state.allVehicles]
        : [];
      const filters = state.vehicleFilters;

      // --- (1) APPLY ASSET TYPE FILTER FIRST ---
      // FIX: This logic is now correct
      if (filters.assetType === 'motorcycle') {
        vehicles = vehicles.filter(v => v.assetType === 'motorcycle');
      } else if (filters.assetType === 'vehicle') {
        // Treat 'vehicle' OR 'undefined' as a vehicle
        vehicles = vehicles.filter(v => v.assetType === 'vehicle' || !v.assetType);
      }
      // if filters.assetType is null, show all (no filter)
      // --- END ASSET TYPE FILTER ---

      if (filters.vehicleType) {
        vehicles = vehicles.filter(
          (v) =>
            v.vehicleType &&
            v.vehicleType.toLowerCase().includes(filters.vehicleType.toLowerCase())
        );
      }
      if (filters.seats !== null && !isNaN(filters.seats)) {
        const seatsFilterValue = parseInt(filters.seats, 10);
        vehicles = vehicles.filter((v) => {
          if (v.seatingCapacity === undefined) {
            return false;
          }
          const vehicleSeats = parseInt(v.seatingCapacity, 10);
          if (seatsFilterValue === 7) { // Assuming 7 means 7+
            return vehicleSeats >= 7;
          } else {
            return vehicleSeats === seatsFilterValue;
          }
        });
      }
      if (filters.make) {
        vehicles = vehicles.filter(
          (v) => v.make && v.make.toLowerCase().includes(filters.make.toLowerCase())
        );
      }
      if (filters.model) {
        vehicles = vehicles.filter(
          (v) =>
            v.model && v.model.toLowerCase().includes(filters.model.toLowerCase())
        );
      }
      if (filters.year !== null && !isNaN(filters.year)) {
        vehicles = vehicles.filter((v) => v.year === parseInt(filters.year));
      }
      if (filters.location) {
         const locLower = filters.location.toLowerCase();
         vehicles = vehicles.filter(v =>
            (v.location?.city?.toLowerCase().includes(locLower)) ||
            (v.location?.barangay?.toLowerCase().includes(locLower)) ||
            (v.location?.region?.toLowerCase().includes(locLower))
        );
      }
      if (filters.minPrice !== null && !isNaN(filters.minPrice)) {
        vehicles = vehicles.filter(
          (v) => v.rentalPricePerDay >= parseFloat(filters.minPrice)
        );
      }
      if (filters.maxPrice !== null && !isNaN(filters.maxPrice)) {
        vehicles = vehicles.filter(
          (v) => v.rentalPricePerDay <= parseFloat(filters.maxPrice)
        );
      }
      if (filters.availabilityStartDate && filters.availabilityEndDate) {
        try {
            const reqStart = DateTime.fromISO(filters.availabilityStartDate).startOf('day');
            const reqEnd = DateTime.fromISO(filters.availabilityEndDate).endOf('day');
            if (reqStart.isValid && reqEnd.isValid && reqStart <= reqEnd) {
                const requestedInterval = Interval.fromDateTimes(reqStart, reqEnd);
                vehicles = vehicles.filter((vehicle) => {
                    if (!vehicle.availability || vehicle.availability.length === 0) {
                        return true;
                    }
                    const isOverlappingUnavailable = vehicle.availability.some(
                        (range) => {
                           try {
                                const blockedStart = DateTime.fromISO(range.start).startOf('day');
                                const blockedEnd = DateTime.fromISO(range.end).endOf('day');
                                if (!blockedStart.isValid || !blockedEnd.isValid) return false;
                                const blockedInterval = Interval.fromDateTimes(blockedStart, blockedEnd);
                                return requestedInterval.overlaps(blockedInterval);
                           } catch(e) {
                               console.warn("Error parsing availability range during filter:", range, e);
                               return false;
                           }
                        }
                    );
                    return !isOverlappingUnavailable;
                });
            } else {
                 console.warn("[Vuex Getter] Invalid date range provided for availability filter.");
            }
        } catch(e) {
             console.error("[Vuex Getter] Error during availability filtering:", e);
        }
      }
      
      const sortKey = state.vehicleSort.key;
      const sortOrder = state.vehicleSort.order === 'desc' ? -1 : 1;
      
      if (sortKey) {
        vehicles.sort((a, b) => {
          let valA = a[sortKey];
          let valB = b[sortKey];
          if (typeof valA === 'string' && typeof valB === 'string') {
            valA = (valA || '').toLowerCase();
            valB = (valB || '').toLowerCase();
          }
          if (valA === null || valA === undefined) valA = sortOrder === 1 ? Infinity : -Infinity;
          if (valB === null || valB === undefined) valB = sortOrder === 1 ? Infinity : -Infinity;
          
          if (valA < valB) {
            return -1 * sortOrder;
          }
          if (valA > valB) {
            return 1 * sortOrder;
          }
          return 0;
        });
      }
      return vehicles;
    },
    // ================================================
  },
  modules: {
    owner,
  },
});