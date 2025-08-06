// vehicle-rental-frontend/src/store/index.js
import { createStore } from "vuex";
import api from "@/views/services/api";
import router from "../router";
import { DateTime } from 'luxon';
import { getAuth, signInWithCustomToken } from 'firebase/auth';
import owner from '../store/modules/owner';

export default createStore({
  state: {
    authToken: localStorage.getItem("authToken") || null,
    user: JSON.parse(localStorage.getItem("user")) || null,
    isAuthenticated: !!localStorage.getItem("authToken"),
    userRole: localStorage.getItem("userRole") || null,
    vehicleFilters: {
      make: "",
      model: "",
      year: null,
      location: "",
      minPrice: null,
      maxPrice: null,
      availabilityStartDate: null,
      availabilityEndDate: null,
    },
    vehicleSort: {
      key: 'rentalPricePerDay',
      order: 'asc',
    },
    allVehicles: [],
  },
  mutations: {
    SET_AUTH_TOKEN(state, token) {
      state.authToken = token;
      state.isAuthenticated = !!token;
      if (token) { localStorage.setItem("authToken", token); } else { localStorage.removeItem("authToken"); }
    },
    SET_USER_INFO(state, user) {
      state.user = user;
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
        state.userRole = user.role || "renter";
        localStorage.setItem("userRole", user.role || "renter");
      } else {
        localStorage.removeItem("user");
        state.userRole = null;
        localStorage.removeItem("userRole");
      }
    },
    CLEAR_AUTH(state) {
      state.authToken = null;
      state.user = null;
      state.isAuthenticated = false;
      state.userRole = null;
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      localStorage.removeItem("userRole");
    },
    SET_VEHICLE_FILTER(state, { key, value }) {
      state.vehicleFilters[key] = value;
    },
    SET_VEHICLE_SORT(state, { key, order }) {
      state.vehicleSort.key = key;
      state.vehicleSort.order = order;
    },
    RESET_VEHICLE_FILTERS(state) {
      state.vehicleFilters = {
        make: "",
        model: "",
        year: null,
        location: "",
        minPrice: null,
        maxPrice: null,
        availabilityStartDate: null,
        availabilityEndDate: null,
      };
    },
    SET_ALL_VEHICLES(state, vehicles) {
      state.allVehicles = vehicles;
    },
  },
  actions: {
    async login({ commit }, credentials) {
      console.log("[Vuex Action] login action called with credentials:", credentials);
      console.log("[Vuex Action] Attempting backend API call to:", "/auth/login");

      try {
        const backendResponse = await api.login(credentials);
        const customToken = backendResponse.data.token;
        const userDetailsFromBackend = backendResponse.data.user;

        console.log("[Vuex Action] Backend login successful. Received custom token.");

        const auth = getAuth();
        const userCredential = await signInWithCustomToken(auth, customToken);
        const firebaseUser = userCredential.user;

        const idToken = await firebaseUser.getIdToken();
        console.log("[Vuex Action] Firebase Client SDK signed in. Obtained ID Token.");

        commit("SET_AUTH_TOKEN", idToken);
        commit("SET_USER_INFO", userDetailsFromBackend);

        console.log("[Vuex Action] State updated. Attempting redirection...");
        await router.push("/dashboard");
        console.log("[Vuex Action] router.push to /dashboard executed.");
        return true;
      } catch (error) {
        console.error(
          "[Vuex Action] Login process failed:",
          error.response?.data?.message || error.message,
          error
        );
        throw error;
      }
    },

    async register({ _commit }, userData) {
      console.log("[Vuex Action] register action called with user data:", userData);
      console.log("[Vuex Action] Attempting API call to:", "/auth/register");
      try {
        const response = await api.register(userData);
        console.log("[Vuex Action] Registration API call successful. Response data:", response.data);
        router.push("/login");
        return true;
      } catch (error) {
        console.error(
          "[Vuex Action] Registration API call failed:",
          error.response?.data?.message || error.message,
        );
        throw error;
      }
    },

    async logout({ commit }) {
      console.log('[Vuex Action] Logging out...');
      const auth = getAuth();
      try {
        await auth.signOut();
        console.log('[Vuex Action] Signed out from Firebase Client SDK.');
      } catch (error) {
        console.error('[Vuex Action] Error signing out from Firebase Client SDK:', error);
      } finally {
        commit("CLEAR_AUTH");
        router.push("/login");
      }
    },

    async fetchUserProfile({ commit }) {
      console.log('[Vuex Action] Fetching user profile...');
      try {
        const response = await api.getUserProfile();
        commit('SET_USER_INFO', response.data);
        console.log('[Vuex Action] User profile fetched successfully:', response.data);
        return response.data;
      } catch (error) {
        console.error('Failed to fetch user profile:', error.response?.data?.message || error.message);
        if (error.response && error.response.status === 401) {
          commit('CLEAR_AUTH');
        }
        throw error;
      }
    },

    async updateUserProfile({ commit }, profileData) {
      console.log('[Vuex Action] Updating user profile with data:', profileData);
      try {
        const response = await api.updateUserProfile(profileData);
        commit('SET_USER_INFO', response.data.user);
        console.log('[Vuex Action] User profile updated successfully:', response.data.user);
        return response.data.user;
      } catch (error) {
        console.error('Failed to update user profile:', error.response?.data?.message || error.message);
        throw error;
      }
    },

    async fetchAllVehicles({ commit }) {
      console.log("Fetching vehicles from API...");
      try {
        const response = await api.getAllVehicles();
        commit("SET_ALL_VEHICLES", response.data);
        return response.data;
      } catch (error) {
        console.error('Failed to fetch vehicles:', error.response?.data?.message || error.message);
        throw error;
      }
    },

    async getVehiclesByOwner({ _commit }, ownerId) {
      console.log('[Vuex Action] Fetching vehicles for owner ID:', ownerId);
      try {
        const response = await api.getVehiclesByOwner(ownerId); // Calls the new API service method
        console.log('[Vuex Action] Owner vehicles fetched successfully:', response.data);
        return response.data;
      } catch (error) {
        console.error('Failed to fetch owner vehicles:', error.response?.data?.message || error.message);
        throw error;
      }
    },

    async checkVehicleAvailability({ _commit }, payload) {
      const { vehicleId, startDate, endDate } = payload;
      console.log('[Vuex Action] Checking vehicle availability via API:', { vehicleId, startDate, endDate });
      try {
        const response = await api.checkVehicleAvailability(vehicleId, startDate, endDate);
        console.log('[Vuex Action] Availability check response:', response.data);
        return { ...response.data }; 
      } catch (error) {
        console.error('[Vuex Action] Failed to check availability:', error.response?.data?.message || error.message);
        throw error;
      }
    },

    async createBooking({ _commit }, bookingData) {
      console.log('[Vuex Action] Creating new booking via API:', bookingData);
      try {
        const response = await api.createBooking(bookingData);
        console.log('[Vuex Action] Booking created successfully:', response.data);
        return response.data;
      } catch (error) {
        console.error('[Vuex Action] Failed to create booking:', error.response?.data?.message || error.message);
        throw error;
      }
    },

    async addVehicle({ _commit }, vehicleData) {
      console.log('[Vuex Action] Adding new vehicle:', vehicleData);
      try {
        const response = await api.addVehicle(vehicleData); // Call API service method
        console.log('[Vuex Action] Vehicle added successfully:', response.data);
        return response.data;
      } catch (error) {
        console.error('Failed to add vehicle:', error.response?.data?.message || error.message);
        throw error;
      }
    },

    async updateVehicle({ _commit }, { id, ...vehicleData }) {
      console.log(`[Vuex Action] Updating vehicle ID ${id} with data:`, vehicleData);
      try {
        const response = await api.updateVehicle(id, vehicleData); // Call API service method
        console.log('[Vuex Action] Vehicle updated successfully:', response.data);
        return response.data;
      } catch (error) {
        console.error('Failed to update vehicle:', error.response?.data?.message || error.message);
        throw error;
      }
    },

    async getVehicleById({ _commit }, vehicleId) {
      console.log('[Vuex Action] Fetching single vehicle by ID:', vehicleId);
      try {
        const response = await api.getVehicleById(vehicleId); // Calls the API service method
        console.log('[Vuex Action] Single vehicle fetched successfully:', response.data);
        return response.data;
      } catch (error) {
        console.error('Failed to fetch vehicle by ID:', error.response?.data?.message || error.message);
        throw error;
      }
    },

    async initiateManualPayment({ _commit }, payload) {
      console.log('[Vuex Action] Initiating manual payment via API:', payload);
      try {
        const response = await api.initiateManualPayment(payload);
        console.log('[Vuex Action] Manual payment initiated successfully:', response.data);
        return response.data;
      } catch (error) {
        console.error('[Vuex Action] Failed to initiate manual payment:', error.response?.data?.message || error.message);
        throw error;
      }
    },

    async confirmManualQrPayment({ _commit }, bookingId) {
        console.log('[Vuex Action] Confirming manual QR payment for booking:', bookingId);
        try {
            const response = await api.confirmManualQrPayment(bookingId);
            console.log('[Vuex Action] Manual QR payment confirmed by user:', response.data);
            return response.data;
        } catch (error) {
            console.error('[Vuex Action] Failed to confirm manual QR payment:', error.response?.data?.message || error.message);
            throw error;
        }
    },

    async cancelBooking({ _commit }, bookingId) {
        console.log('[Vuex Action] Cancelling booking:', bookingId);
        try {
            const response = await api.cancelBooking(bookingId);
            console.log('[Vuex Action] Booking cancelled:', response.data);
            return response.data;
        } catch (error) {
            console.error('[Vuex Action] Failed to cancel booking:', error.response?.data?.message || error.message);
            throw error;
        }
    },

    async getPaymentStatus({ _commit }, bookingId) {
        console.log('[Vuex Action] Getting booking status via API for booking ID:', bookingId);
        try {
            const response = await api.getPaymentStatus(bookingId);
            console.log('[Vuex Action] Booking status retrieved:', response.data);
            return response.data;
        } catch (error) {
            console.error('[Vuex Action] Failed to get booking status:', error.response?.data?.message || error.message);
            throw error;
        }
    },

    async getBookingById({ _commit }, bookingId) {
      try {
        const response = await api.getBookingById(bookingId);
        return response.data;
      } catch (error) {
        console.error('Failed to get booking by ID:', error);
        throw error;
      }
    },

    async updateBookingPaymentMethod({ _commit }, { bookingId, paymentMethod, newStatus }) {
      console.log(`[Vuex Action] Calling api.updateBooking with bookingId: ${bookingId}, payload: { paymentMethod: ${paymentMethod}, newStatus: ${newStatus} }`);
      try {
        const response = await api.updateBooking(bookingId, { paymentMethod, newStatus });
        return response.data;
      } catch (error) {
        console.error('Failed to update booking payment method:', error);
        throw error;
      }
    },

    // NEW: Action for admin/owner to update booking status
    async updateBookingStatusAdmin({ _commit }, { bookingId, newStatus }) {
      console.log(`[Vuex Action] Calling api.updateBookingStatusAdmin for bookingId: ${bookingId}, newStatus: ${newStatus}`);
      try {
        const response = await api.updateBookingStatusAdmin(bookingId, newStatus);
        console.log('[Vuex Action] Admin status update successful:', response.data);
        return response.data;
      } catch (error) {
        console.error('[Vuex Action] Failed to update booking status (Admin):', error.response?.data?.message || error.message);
        throw error;
      }
    },

    async fetchBookingsByUser({ _commit }, userId) {
      try {
        const response = await api.getBookingsByUser(userId);
        return response.data;
      } catch (error) {
        console.error('Failed to fetch bookings by user:', error.response?.data?.message || error.message);
        throw error;
      }
    },

    setVehicleFilter({ commit }, { key, value }) {
      commit('SET_VEHICLE_FILTER', { key, value });
    },
    setVehicleSort({ commit }, { key, order }) {
      commit('SET_VEHICLE_SORT', { key, order });
    },
    resetVehicleFilters({ commit }) {
      commit('RESET_VEHICLE_FILTERS');
    },
  },
  getters: {
    isAuthenticated: (state) => state.isAuthenticated,
    authToken: (state) => state.authToken,
    user: (state) => state.user,
    userRole: (state) => state.userRole,
    currentVehicleFilters: (state) => state.vehicleFilters,
    allVehicles: (state) => state.allVehicles,
    vehicleSort: (state) => state.vehicleSort,
    filteredAndSortedVehicles: (state) => {
      let vehicles = Array.isArray(state.allVehicles) ? [...state.allVehicles] : [];
      const filters = state.vehicleFilters;

      if (filters.make) { vehicles = vehicles.filter(v => v.make.toLowerCase().includes(filters.make.toLowerCase())); }
      if (filters.model) { vehicles = vehicles.filter(v => v.model.toLowerCase().includes(filters.model.toLowerCase())); }
      if (filters.year !== null && !isNaN(filters.year)) { vehicles = vehicles.filter(v => v.year === parseInt(filters.year)); }
      if (filters.location) { vehicles = vehicles.filter(v => v.location.toLowerCase().includes(filters.location.toLowerCase())); }
      if (filters.minPrice !== null && !isNaN(filters.minPrice)) { vehicles = vehicles.filter(v => v.rentalPricePerDay >= parseFloat(filters.minPrice)); }
      if (filters.maxPrice !== null && !isNaN(filters.maxPrice)) { vehicles = vehicles.filter(v => v.rentalPricePerDay <= parseFloat(filters.maxPrice)); }
      
      if (filters.availabilityStartDate && filters.availabilityEndDate) {
        const reqStart = DateTime.fromISO(filters.availabilityStartDate);
        const reqEnd = DateTime.fromISO(filters.availabilityEndDate);
        if (reqStart.isValid && reqEnd.isValid) {
          vehicles = vehicles.filter(vehicle => {
            if (!vehicle.availability || vehicle.availability.length === 0) { return true; } 
            
            const isOverlappingUnavailable = vehicle.availability.some(range => {
              const availStart = DateTime.fromISO(range.start);
              const availEnd = DateTime.fromISO(range.end);
              return (reqStart <= availEnd) && (reqEnd >= availStart);
            });
            return !isOverlappingUnavailable;
          });
        }
      }

      const sortKey = state.vehicleSort.key;
      const sortOrder = state.vehicleSort.order;

      if (sortKey) {
        vehicles.sort((a, b) => {
          let valA = a[sortKey];
          let valB = b[sortKey];

          if (typeof valA === 'string' && typeof valB === 'string') {
            valA = valA.toLowerCase();
            valB = valB.toLowerCase();
          }

          if (valA < valB) { return sortOrder === 'asc' ? -1 : 1; }
          if (valA > valB) { return sortOrder === 'asc' ? 1 : -1; }
          return 0;
        });
      }
      return vehicles;
    },
  },
  modules: {
    owner,
  },
});
