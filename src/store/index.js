import { createStore } from 'vuex';
import api from '@/views/services/api';
import router from '../router';
import { DateTime } from 'luxon';
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  signInWithCustomToken,
} from 'firebase/auth';
import owner from './modules/owner';
import { setAuthToken } from '@/views/services/api';

export default createStore({
  state: {
    user: null,
    isAuthenticated: false,
    authLoading: true,
    userRole: null,
    authToken: null,
    vehicle: null,
    allBookings: [],
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
    },
    vehicleSort: {
      key: 'rentalPricePerDay',
      order: 'asc',
    },
    allVehicles: [],
  },
  mutations: {
    SET_AUTH_STATE(state, { user, userRole, authToken }) {
      state.user = user;
      state.isAuthenticated = !!user;
      state.userRole = userRole;
      state.authToken = authToken;
      state.authLoading = false;
    },
    SET_ALL_BOOKINGS(state, bookings) {
      state.allBookings = bookings;
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
  },
  actions: {
    initializeAuth({ commit }) {
      return new Promise((resolve) => {
        const auth = getAuth();
        onAuthStateChanged(auth, async (user) => {
          if (user) {
            try {
              const authToken = await user.getIdToken();
              setAuthToken(authToken);
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
    async login({ commit }, credentials) {
      try {
        const auth = getAuth();
        const backendResponse = await api.login(credentials);
        const customToken = backendResponse.data.token;
        const userCredential = await signInWithCustomToken(auth, customToken);
        const user = userCredential.user;
        const authToken = await user.getIdToken();
        setAuthToken(authToken);
        const profileResponse = await api.getUserProfile();
        const userRole = profileResponse.data.role || 'renter';
        commit('SET_AUTH_STATE', {
          user: profileResponse.data,
          userRole,
          authToken,
        });
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
        return response.data;
      } catch (error) {
        console.error('[Vuex] Failed to create booking:', error);
        throw error;
      }
    },
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
    async updateVehicle({ _commit }, { id, ...vehicleData }) {
      try {
        const response = await api.updateVehicle(id, vehicleData);
        return response.data;
      } catch (error) {
        console.error('[Vuex] Failed to update vehicle:', error);
        throw error;
      }
    },
    async fetchUserProfile({ commit, state }) {
      try {
        const response = await api.getUserProfile();
        commit('SET_AUTH_STATE', {
          user: response.data,
          userRole: response.data.role,
          authToken: state.authToken,
        });
        return response.data;
      } catch (error) {
        if (error.response && error.response.status === 401) {
          commit('CLEAR_AUTH');
        }
        throw error;
      }
    },
    async updateUserProfile({ commit, state }, profileData) {
      try {
        const response = await api.updateUserProfile(profileData);
        const updatedUser = response.data.user;
        commit('SET_AUTH_STATE', {
          user: updatedUser,
          userRole: updatedUser.role,
          authToken: state.authToken,
        });
        return updatedUser;
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
    async updateBookingPaymentMethod(
      { _commit },
      { bookingId, paymentMethod, newStatus }
    ) {
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
    // Action for phone-based login
    async tokenLogin({ dispatch }) {
      try {
        const response = await api.tokenLogin();
        const customToken = response.data.token;
        
        const auth = getAuth();
        await signInWithCustomToken(auth, customToken);
        
        // After signing in, fetch the user profile to populate the store
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
    isAuthReady: (state) => !state.authLoading,
    currentVehicleFilters: (state) => state.vehicleFilters,
    allVehicles: (state) => state.allVehicles,
    allUsers: (state) => state.allUsers,
    allBookings: (state) => state.allBookings,
    vehicleSort: (state) => state.vehicleSort,
    filteredAndSortedVehicles: (state) => {
      let vehicles = Array.isArray(state.allVehicles)
        ? [...state.allVehicles]
        : [];
      const filters = state.vehicleFilters;
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
          if (seatsFilterValue === 7) {
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
        vehicles = vehicles.filter(
          (v) =>
            v.location &&
            v.location.city.toLowerCase().includes(filters.location.toLowerCase())
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
        const reqStart = DateTime.fromISO(filters.availabilityStartDate);
        const reqEnd = DateTime.fromISO(filters.availabilityEndDate);
        if (reqStart.isValid && reqEnd.isValid) {
          vehicles = vehicles.filter((vehicle) => {
            if (!vehicle.availability || vehicle.availability.length === 0) {
              return true;
            }
            const isOverlappingUnavailable = vehicle.availability.some(
              (range) => {
                const availStart = DateTime.fromISO(range.start);
                const availEnd = DateTime.fromISO(range.end);
                return reqStart <= availEnd && reqEnd >= availStart;
              }
            );
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
          if (valA < valB) {
            return sortOrder === 'asc' ? -1 : 1;
          }
          if (valA > valB) {
            return sortOrder === 'asc' ? 1 : -1;
          }
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