// frontend/src/store/modules/vehicles.js

import api from "@/views/services/api";
import { DateTime } from 'luxon';

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
});

const mutations = {
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
};

const actions = {
  async fetchAllVehicles({ commit }) {
    try {
      const response = await api.getAllVehicles();
      commit("SET_ALL_VEHICLES", response.data);
      return response.data;
    } catch (error) {
      console.error('[Vuex Vehicles] Failed to fetch vehicles:', error.response?.data?.message || error.message);
      throw error;
    }
  },
  async getVehiclesByOwner({ _commit }, ownerId) {
    try {
      const response = await api.getVehiclesByOwner(ownerId);
      return response.data;
    } catch (error) {
      console.error('[Vuex Vehicles] Failed to fetch owner vehicles:', error.response?.data?.message || error.message);
      throw error;
    }
  },
  async checkVehicleAvailability({ _commit }, payload) {
    const { vehicleId, startDate, endDate } = payload;
    try {
      const response = await api.checkVehicleAvailability(vehicleId, startDate, endDate);
      return { ...response.data };
    } catch (error) {
      console.error('[Vuex Vehicles] Failed to check availability:', error.response?.data?.message || error.message);
      throw error;
    }
  },
  async addVehicle({ _commit }, vehicleData) {
    try {
      const response = await api.addVehicle(vehicleData);
      return response.data;
    } catch (error) {
      console.error('[Vuex Vehicles] Failed to add vehicle:', error.response?.data?.message || error.message);
      throw error;
    }
  },
  async updateVehicle({ _commit }, { id, ...vehicleData }) {
    try {
      const response = await api.updateVehicle(id, vehicleData);
      return response.data;
    } catch (error) {
      console.error('[Vuex Vehicles] Failed to update vehicle:', error.response?.data?.message || error.message);
      throw error;
    }
  },
  async getVehicleById({ _commit }, vehicleId) {
    try {
      const response = await api.getVehicleById(vehicleId);
      return response.data;
    } catch (error) {
      console.error('[Vuex Vehicles] Failed to fetch vehicle by ID:', error.response?.data?.message || error.message);
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
};

const getters = {
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
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};
