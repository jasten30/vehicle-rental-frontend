import { createStore } from "vuex";
import api from "@/views/services/api";
import router from "../router";
import { DateTime } from 'luxon';
import { getAuth, signInWithCustomToken, onAuthStateChanged, signOut } from 'firebase/auth';
import owner from './modules/owner';

export default createStore({
  state: {
    user: null,
    isAuthenticated: false,
    authLoading: true,
    userRole: null,
    vehicle: null,
    vehicleFilters: {
      make: "",
      model: "",
      year: null,
      location: "",
      minPrice: null,
      maxPrice: null,
      availabilityStartDate: null,
      availabilityEndDate: null,
      vehicleType: "",
      seats: null,
    },
    vehicleSort: {
      key: 'rentalPricePerDay',
      order: 'asc',
    },
    allVehicles: [],
  },
  mutations: {
    SET_AUTH_STATE(state, { user, userRole }) {
      state.user = user;
      state.isAuthenticated = !!user;
      state.userRole = userRole;
      state.authLoading = false;
    },
    SET_AUTH_LOADING(state, loading) {
      state.authLoading = loading;
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
        vehicleType: "",
        seats: null,
      };
    },
    SET_ALL_VEHICLES(state, vehicles) {
      state.allVehicles = vehicles;
    },
    SET_VEHICLE(state, vehicle) {
      state.vehicle = vehicle;
    }
  },
  actions: {
    initializeAuth({ commit }) {
      return new Promise((resolve) => {
        const auth = getAuth();
        onAuthStateChanged(auth, async (user) => {
          if (user) {
            try {
              const response = await api.getUserProfile();
              const userRole = response.data.role || "renter";
              commit("SET_AUTH_STATE", { user, userRole });
              console.log("[Vuex Action] Auth state initialized. User is logged in.");
            } catch (error) {
              console.error("[Vuex Action] Failed to fetch user profile after auth change:", error);
              commit("SET_AUTH_STATE", { user: null, userRole: null });
            }
          } else {
            commit("SET_AUTH_STATE", { user: null, userRole: null });
            console.log("[Vuex Action] Auth state initialized. User is logged out.");
          }
          resolve();
        });
      });
    },
    async login({ _commit }, credentials) {
      try {
        const backendResponse = await api.login(credentials);
        const customToken = backendResponse.data.token;
        const auth = getAuth();
        await signInWithCustomToken(auth, customToken);
        console.log("[Vuex Action] Firebase Client SDK signed in successfully.");
        await router.push("/dashboard");
        return true;
      } catch (error) {
        console.error("[Vuex Action] Login process failed:", error.response?.data?.message || error.message);
        throw error;
      }
    },
    async register({ _commit }, userData) {
      try {
        await api.register(userData);
        router.push("/login");
        return true;
      } catch (error) {
        console.error("[Vuex Action] Registration API call failed:", error.response?.data?.message || error.message);
        throw error;
      }
    },
    async logout({ _commit }) {
      try {
        const auth = getAuth();
        await signOut(auth);
        console.log('[Vuex Action] Signed out from Firebase Client SDK.');
        router.push("/login");
      } catch (error) {
        console.error('[Vuex Action] Error signing out from Firebase Client SDK:', error);
      }
    },
    async fetchAllVehicles({ commit }) {
      try {
        const response = await api.getAllVehicles();
        console.log("[Vuex Action] Raw vehicles from API:", response.data);
        const normalizedVehicles = response.data.map(vehicle => ({
          ...vehicle,
          rentalPricePerDay: parseFloat(vehicle.rentalPricePerDay) || 0,
          seats: parseInt(vehicle.seats, 10) || 0,
          year: parseInt(vehicle.year, 10) || 0,
        }));
        commit("SET_ALL_VEHICLES", normalizedVehicles);
        console.log("[Vuex Action] Normalized vehicles committed:", normalizedVehicles);
        return normalizedVehicles;
      } catch (error) {
        console.error('Failed to fetch vehicles:', error.response?.data?.message || error.message);
        throw error;
      }
    },
    async getVehicleById({ commit }, vehicleId) {
      try {
        const response = await api.getVehicleById(vehicleId);
        commit("SET_VEHICLE", response.data);
        return response.data;
      } catch (error) {
        console.error('Failed to fetch vehicle by ID:', error.response?.data?.message || error.message);
        throw error;
      }
    },
    async checkVehicleAvailability({ _commit }, payload) {
      try {
        const { vehicleId, startDate, endDate } = payload;
        const response = await api.checkVehicleAvailability(vehicleId, startDate, endDate);
        return { ...response.data };
      } catch (error) {
        console.error('[Vuex Action] Failed to check availability:', error.response?.data?.message || error.message);
        throw error;
      }
    },
    async createBooking({ _commit }, bookingData) {
      try {
        const response = await api.createBooking(bookingData);
        return response.data;
      } catch (error) {
        console.error('[Vuex Action] Failed to create booking:', error.response?.data?.message || error.message);
        throw error;
      }
    },
    async getVehiclesByOwner({ _commit }) {
      try {
        const response = await api.getVehiclesByOwner();
        return response.data;
      } catch (error) {
        console.error('Failed to fetch owner vehicles:', error.response?.data?.message || error.message);
        throw error;
      }
    },
    async addVehicle({ _commit }, vehicleData) {
      try {
        const response = await api.addVehicle(vehicleData);
        return response.data;
      } catch (error) {
        console.error('Failed to add vehicle:', error.response?.data?.message || error.message);
        throw error;
      }
    },
    async updateVehicle({ _commit }, { id, ...vehicleData }) {
      try {
        const response = await api.updateVehicle(id, vehicleData);
        return response.data;
      } catch (error) {
        console.error('Failed to update vehicle:', error.response?.data?.message || error.message);
        throw error;
      }
    },
    async fetchUserProfile({ commit }) {
      try {
        const response = await api.getUserProfile();
        commit('SET_AUTH_STATE', { user: response.data, userRole: response.data.role });
        return response.data;
      } catch (error) {
        console.error('Failed to fetch user profile:', error.response?.data?.message || error.message);
        if (error.response && error.response.status === 401) {
          commit('SET_AUTH_STATE', { user: null, userRole: null });
        }
        throw error;
      }
    },
    async updateUserProfile({ _commit }, profileData) {
      try {
        const response = await api.updateUserProfile(profileData);
        return response.data.user;
      } catch (error) {
        console.error('Failed to update user profile:', error.response?.data?.message || error.message);
        throw error;
      }
    },
    async getPaymentStatus({ _commit }, bookingId) {
      try {
        const response = await api.getPaymentStatus(bookingId);
        return response.data;
      } catch (error) {
        console.error('Failed to get payment status:', error.response?.data?.message || error.message);
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
      try {
        const response = await api.updateBooking(bookingId, { paymentMethod, newStatus });
        return response.data;
      } catch (error) {
        console.error('Failed to update booking payment method:', error);
        throw error;
      }
    },

    // New actions to handle filtering from the component
    setVehicleFilter({ commit }, payload) {
      commit('SET_VEHICLE_FILTER', payload);
    },
    setVehicleSort({ commit }, payload) {
      commit('SET_VEHICLE_SORT', payload);
    },
    resetVehicleFilters({ commit }) {
      commit('RESET_VEHICLE_FILTERS');
    },
  },
  getters: {
    isAuthenticated: (state) => state.isAuthenticated,
    user: (state) => state.user,
    authLoading: (state) => state.authLoading,
    userRole: (state) => state.userRole,
    singleVehicle: (state) => state.vehicle,
    currentVehicleFilters: (state) => state.vehicleFilters,
    allVehicles: (state) => state.allVehicles,
    vehicleSort: (state) => state.vehicleSort,
    filteredAndSortedVehicles: (state) => {
      let vehicles = Array.isArray(state.allVehicles) ? [...state.allVehicles] : [];
      const filters = state.vehicleFilters;
      if (filters.vehicleType) { vehicles = vehicles.filter(v => v.vehicleType && v.vehicleType.toLowerCase().includes(filters.vehicleType.toLowerCase())); }
      if (filters.seats !== null && !isNaN(filters.seats)) {
        const seatsFilterValue = parseInt(filters.seats, 10);
        vehicles = vehicles.filter(v => {
          if (v.seatingCapacity === undefined) { return false; }
          const vehicleSeats = parseInt(v.seatingCapacity, 10);
          if (seatsFilterValue === 7) { return vehicleSeats >= 7; } else { return vehicleSeats === seatsFilterValue; }
        });
      }
      if (filters.make) { vehicles = vehicles.filter(v => v.make && v.make.toLowerCase().includes(filters.make.toLowerCase())); }
      if (filters.model) { vehicles = vehicles.filter(v => v.model && v.model.toLowerCase().includes(filters.model.toLowerCase())); }
      if (filters.year !== null && !isNaN(filters.year)) { vehicles = vehicles.filter(v => v.year === parseInt(filters.year)); }
      if (filters.location) { vehicles = vehicles.filter(v => v.location && v.location.toLowerCase().includes(filters.location.toLowerCase())); }
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
            valA = (valA || '').toLowerCase();
            valB = (valB || '').toLowerCase();
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
