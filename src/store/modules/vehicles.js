import api from '@/views/services/api';
import { DateTime, Interval } from 'luxon';

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
    assetType: null, // <-- ADDED
  },
  vehicleSort: {
    key: 'rentalPricePerDay',
    order: 'asc',
  },
  allVehicles: [],
  vehicleError: null,
});

const mutations = {
  SET_VEHICLE_FILTER(state, { key, value }) {
    // FIX: Use safe property check
    if (Object.prototype.hasOwnProperty.call(state.vehicleFilters, key)) {
         state.vehicleFilters[key] = value;
    } else {
        console.warn(`[Vuex Vehicles] Attempted to set unknown filter key: ${key}`);
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
      assetType: null, // <-- ADDED
    };
  },
  SET_ALL_VEHICLES(state, vehicles) {
    state.allVehicles = vehicles;
  },
  UPDATE_VEHICLE_SUCCESS(state, updatedVehicle) {
      const index = state.allVehicles.findIndex(v => v.id === updatedVehicle.id);
      if (index !== -1) {
          state.allVehicles.splice(index, 1, updatedVehicle);
      }
      state.vehicleError = null;
  },
  ADD_VEHICLE_SUCCESS(state, newVehicle) {
      state.allVehicles.push(newVehicle);
      state.vehicleError = null;
  },
  SET_VEHICLE_ERROR(state, error) {
      state.vehicleError = error;
  },
};

const actions = {
  async fetchAllVehicles({ commit }) {
    commit('SET_VEHICLE_ERROR', null);
    try {
      const response = await api.getAllVehicles();
      commit("SET_ALL_VEHICLES", response.data);
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      console.error('[Vuex Vehicles] Failed to fetch vehicles:', errorMsg);
      commit('SET_VEHICLE_ERROR', errorMsg);
      throw error;
    }
  },
  // FIX: Prefixed unused ownerId with _
  async getVehiclesByOwner({ commit }, _ownerId) {
    commit('SET_VEHICLE_ERROR', null);
    try {
      // Assuming api.getVehiclesByOwner doesn't need ownerId if using auth token
      const response = await api.getVehiclesByOwner();
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      console.error('[Vuex Vehicles] Failed to fetch owner vehicles:', errorMsg);
      commit('SET_VEHICLE_ERROR', errorMsg);
      throw error;
    }
  },
  async checkVehicleAvailability({ commit }, payload) {
    const { vehicleId, startDate, endDate } = payload;
    commit('SET_VEHICLE_ERROR', null);
    try {
      const response = await api.checkVehicleAvailability(vehicleId, startDate, endDate);
      return { ...response.data };
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
       commit('SET_VEHICLE_ERROR', errorMsg);
      throw error;
    }
  },
  async addVehicle({ commit }, vehicleData) {
    commit('SET_VEHICLE_ERROR', null);
    try {
      const response = await api.addVehicle(vehicleData);
      // We might need to dispatch fetchAllVehicles again or just add the new one
      // For now, just return
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      console.error('[Vuex Vehicles] Failed to add vehicle:', errorMsg);
      commit('SET_VEHICLE_ERROR', errorMsg);
      throw error;
    }
  },

  async updateVehicle({ commit }, { id, updates }) {
    commit('SET_VEHICLE_ERROR', null);
    try {
      const response = await api.updateVehicle(id, updates);
      // We should probably update the vehicle in the local state
      commit('UPDATE_VEHICLE_SUCCESS', { id, ...updates }); // This might be incomplete
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      console.error('[Vuex Vehicles] Failed to update vehicle:', errorMsg);
      commit('SET_VEHICLE_ERROR', errorMsg);
      throw error;
    }
  },

  async getVehicleById({ commit }, vehicleId) {
    commit('SET_VEHICLE_ERROR', null);
    try {
      const response = await api.getVehicleById(vehicleId);
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      console.error('[Vuex Vehicles] Failed to fetch vehicle by ID:', errorMsg);
      commit('SET_VEHICLE_ERROR', errorMsg);
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
};

const getters = {
  currentVehicleFilters: (state) => state.vehicleFilters,
  allVehicles: (state) => state.allVehicles,
  vehicleSort: (state) => state.vehicleSort,
  vehicleError: (state) => state.vehicleError,

  // FIX: Prefixed unused getters with _
  filteredAndSortedVehicles: (state, _getters) => {
    let vehicles = Array.isArray(state.allVehicles) ? [...state.allVehicles] : [];
    const filters = state.vehicleFilters;

    // --- (1) APPLY ASSET TYPE FILTER FIRST ---
    if (filters.assetType) {
      vehicles = vehicles.filter(v => v.assetType === filters.assetType);
    }
    // --- END ASSET TYPE FILTER ---

    // --- (2) Other Filters ---
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
    // --- (3) Filter by vehicle-specific types (only if assetType is not motorcycle) ---
    if (filters.assetType !== 'motorcycle') {
        if (filters.vehicleType) {
            vehicles = vehicles.filter(v => v.vehicleType === filters.vehicleType);
        }
        if (filters.seats !== null && !isNaN(filters.seats)) {
            // Assuming 8 means 8+
            if (filters.seats === 8) {
                 vehicles = vehicles.filter(v => typeof v.seatingCapacity === 'number' && v.seatingCapacity >= 8);
            } else {
                 vehicles = vehicles.filter(v => typeof v.seatingCapacity === 'number' && v.seatingCapacity === parseInt(filters.seats));
            }
        }
    }


    // --- (4) Availability Filtering ---
    if (filters.availabilityStartDate && filters.availabilityEndDate) {
      try {
        const reqStart = DateTime.fromISO(filters.availabilityStartDate).startOf('day');
        const reqEnd = DateTime.fromISO(filters.availabilityEndDate).endOf('day');

        if (reqStart.isValid && reqEnd.isValid && reqStart <= reqEnd) {
          const requestedInterval = Interval.fromDateTimes(reqStart, reqEnd);

          vehicles = vehicles.filter(vehicle => {
            if (!Array.isArray(vehicle.availability) || vehicle.availability.length === 0) {
              return true;
            }

            const isOverlappingUnavailable = vehicle.availability.some(range => {
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

            });
            return !isOverlappingUnavailable;
          });
        } else {
             console.warn("[Vuex Getter] Invalid date range provided for availability filter.");
        }
      } catch(e) {
          console.error("[Vuex Getter] Error during availability filtering:", e);
      }
    }

    // --- (5) Sorting ---
    const sortKey = state.vehicleSort.key;
    const sortOrder = state.vehicleSort.order === 'desc' ? -1 : 1;

    if (sortKey) {
      vehicles.sort((a, b) => {
        let valA = a[sortKey];
        let valB = b[sortKey];

        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();
        if (valA === null || valA === undefined) valA = sortOrder === 1 ? Infinity : -Infinity;
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

