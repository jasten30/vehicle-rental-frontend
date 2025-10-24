import api from '@/views/services/api';
import { DateTime, Interval } from 'luxon'; // Added Interval

const state = () => ({
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
  vehicleError: null, // Added for potential error state
});

const mutations = {
  SET_VEHICLE_FILTER(state, { key, value }) {
    if (state.vehicleFilters.hasOwnProperty(key)) {
      state.vehicleFilters[key] = value;
    } else {
      // Attempted to set unknown filter key is ignored silently
    }
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
  // Example mutations for potential use with update/add/error
  UPDATE_VEHICLE_SUCCESS(state, updatedVehicle) {
      const index = state.allVehicles.findIndex(v => v.id === updatedVehicle.id);
      if (index !== -1) {
          // Replace the old vehicle data with the updated one
          state.allVehicles.splice(index, 1, updatedVehicle);
      }
      state.vehicleError = null; // Clear error on success
  },
  ADD_VEHICLE_SUCCESS(state, newVehicle) {
      state.allVehicles.push(newVehicle); // Add to the list
      state.vehicleError = null; // Clear error on success
  },
  SET_VEHICLE_ERROR(state, error) {
      state.vehicleError = error;
  },
};

const actions = {
  async fetchAllVehicles({ commit }) {
    commit('SET_VEHICLE_ERROR', null); // Clear previous errors
    try {
      const response = await api.getAllVehicles();
      commit("SET_ALL_VEHICLES", response.data);
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      commit('SET_VEHICLE_ERROR', errorMsg);
      throw error; // Re-throw for component handling
    }
  },
  async getVehiclesByOwner({ commit }, ownerId) { // Changed _commit to commit
    commit('SET_VEHICLE_ERROR', null);
    try {
      // Assuming api.getVehiclesByOwner doesn't need ownerId if using auth token
      const response = await api.getVehiclesByOwner();
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      commit('SET_VEHICLE_ERROR', errorMsg);
      throw error;
    }
  },
  async checkVehicleAvailability({ commit }, payload) { // Changed _commit to commit
    const { vehicleId, startDate, endDate } = payload;
    commit('SET_VEHICLE_ERROR', null);
    try {
      const response = await api.checkVehicleAvailability(vehicleId, startDate, endDate);
      return { ...response.data }; // Return availability status and cost
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
        commit('SET_VEHICLE_ERROR', errorMsg); // Set error state
      throw error; // Re-throw for component handling
    }
  },
  async addVehicle({ commit }, vehicleData) { // Changed _commit to commit
    commit('SET_VEHICLE_ERROR', null);
    try {
      const response = await api.addVehicle(vehicleData);
        // Assuming response.data contains the ID and potentially the created vehicle object
        // You might need to fetch the full vehicle data again if the backend only returns ID
      // commit('ADD_VEHICLE_SUCCESS', { ...vehicleData, id: response.data.id }); // Optimistic update
      return response.data; // Return { id: ... }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      commit('SET_VEHICLE_ERROR', errorMsg);
      throw error;
    }
  },

  async updateVehicle({ commit }, { id, updates }) {
    commit('SET_VEHICLE_ERROR', null);
    try {
      // Make sure 'updates' is passed directly as the second argument
      const response = await api.updateVehicle(id, updates); 

      commit('UPDATE_VEHICLE_SUCCESS', { id, ...updates }); 
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      commit('SET_VEHICLE_ERROR', errorMsg);
      throw error;
    }
  },

  async getVehicleById({ commit }, vehicleId) { // Changed _commit to commit
    commit('SET_VEHICLE_ERROR', null);
    try {
      const response = await api.getVehicleById(vehicleId);
      // Process dates here if needed, although usually done in component
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      commit('SET_VEHICLE_ERROR', errorMsg);
      throw error;
    }
  },

  // Mutations called via actions
  setVehicleFilter({ commit }, payload) { // payload should be { key, value }
    commit('SET_VEHICLE_FILTER', payload);
  },
  setVehicleSort({ commit }, payload) { // payload should be { key, order }
    commit('SET_VEHICLE_SORT', payload);
  },
  resetVehicleFilters({ commit }) {
    commit('RESET_VEHICLE_FILTERS');
  },
};

const getters = {
  currentVehicleFilters: (state) => state.vehicleFilters,
  allVehicles: (state) => state.allVehicles,
  vehicleSort: (state) => state.vehicleSort,
  vehicleError: (state) => state.vehicleError, // Getter for error state

  filteredAndSortedVehicles: (state, getters) => { // Added getters argument
    // Ensure allVehicles is always an array before filtering/sorting
    let vehicles = Array.isArray(state.allVehicles) ? [...state.allVehicles] : [];
    const filters = state.vehicleFilters;

    // --- Filtering ---
    if (filters.make) {
        vehicles = vehicles.filter(v => v.make && v.make.toLowerCase().includes(filters.make.toLowerCase()));
    }
    if (filters.model) {
        vehicles = vehicles.filter(v => v.model && v.model.toLowerCase().includes(filters.model.toLowerCase()));
    }
    if (filters.year !== null && !isNaN(filters.year)) {
        vehicles = vehicles.filter(v => v.year === parseInt(filters.year));
    }
    if (filters.location) {
        // More robust location filtering (checking multiple fields)
        const locLower = filters.location.toLowerCase();
        vehicles = vehicles.filter(v =>
            (v.location?.city?.toLowerCase().includes(locLower)) ||
            (v.location?.barangay?.toLowerCase().includes(locLower)) ||
            (v.location?.region?.toLowerCase().includes(locLower))
        );
    }
    if (filters.minPrice !== null && !isNaN(filters.minPrice)) {
        vehicles = vehicles.filter(v => typeof v.rentalPricePerDay === 'number' && v.rentalPricePerDay >= parseFloat(filters.minPrice));
    }
    if (filters.maxPrice !== null && !isNaN(filters.maxPrice)) {
        vehicles = vehicles.filter(v => typeof v.rentalPricePerDay === 'number' && v.rentalPricePerDay <= parseFloat(filters.maxPrice));
    }

    // --- Availability Filtering ---
    if (filters.availabilityStartDate && filters.availabilityEndDate) {
      try {
        // Ensure dates are parsed correctly
        const reqStart = DateTime.fromISO(filters.availabilityStartDate).startOf('day');
        const reqEnd = DateTime.fromISO(filters.availabilityEndDate).endOf('day'); // Use end of day

        if (reqStart.isValid && reqEnd.isValid && reqStart <= reqEnd) {
          const requestedInterval = Interval.fromDateTimes(reqStart, reqEnd);

          vehicles = vehicles.filter(vehicle => {
            // If vehicle has no availability array or it's empty, assume available
            if (!Array.isArray(vehicle.availability) || vehicle.availability.length === 0) {
              return true;
            }

            // Check if ANY blocked period overlaps with the requested interval
            const isOverlappingUnavailable = vehicle.availability.some(range => {
                try {
                    // Parse backend ISO strings, assuming they represent full days in UTC
                    const blockedStart = DateTime.fromISO(range.start).startOf('day');
                    const blockedEnd = DateTime.fromISO(range.end).endOf('day'); // Use end of day

                    if (!blockedStart.isValid || !blockedEnd.isValid) return false; // Skip invalid range

                    const blockedInterval = Interval.fromDateTimes(blockedStart, blockedEnd);
                    return requestedInterval.overlaps(blockedInterval);
                } catch(e) {
                    return false; // Treat parse errors as non-blocking? Or blocking? Decide policy.
                }

            });
            // Keep the vehicle ONLY if it DOES NOT overlap with any unavailable period
            return !isOverlappingUnavailable;
          });
        } else {
            // Invalid date range provided for availability filter is ignored silently
        }
      } catch(e) {
          // Error during availability filtering is ignored silently
      }
    }

    // --- Sorting ---
    const sortKey = state.vehicleSort.key;
    const sortOrder = state.vehicleSort.order === 'desc' ? -1 : 1; // Factor for direction

    if (sortKey) {
      vehicles.sort((a, b) => {
        let valA = a[sortKey];
        let valB = b[sortKey];

        // Basic type handling
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();
        if (valA === null || valA === undefined) valA = sortOrder === 1 ? Infinity : -Infinity; // Handle nulls
        if (valB === null || valB === undefined) valB = sortOrder === 1 ? Infinity : -Infinity;

        if (valA < valB) return -1 * sortOrder;
        if (valA > valB) return 1 * sortOrder;
        return 0;
      });
    }
    return vehicles;
  },
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};
