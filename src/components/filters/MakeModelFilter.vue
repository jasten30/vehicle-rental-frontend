<template>
  <div class="make-model-filter-container">
    <button class="filter-trigger" :class="{ 'active': isActive || isApplied }" @click="$emit('toggle-dropdown')">
      <span>{{ buttonLabel }}</span>
      <i class="bi" :class="isActive ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
    </button>

    <div class="filter-dropdown-content" :class="{ 'active': isActive }">
      <div class="dropdown-header" v-if="panelState === 'models'">
        <button class="back-button" @click="panelState = 'makes'">&#10094;</button>
        <span class="header-title">Select Model ({{ localMake }})</span>
      </div>

      <div class="dropdown-body">
        <!-- Makes Panel -->
        <div v-if="panelState === 'makes'" class="scrollable-list">
          <div
            v-for="make in uniqueMakes"
            :key="make"
            class="list-item"
            :class="{ 'active': localMake === make }"
            @click="selectMake(make)"
          >
            {{ make }}
          </div>
        </div>
        
        <!-- Models Panel -->
        <div v-if="panelState === 'models'" class="scrollable-list">
           <div
            class="list-item"
            :class="{ 'active': localModel === '' }"
            @click="selectModel('')"
          >
            All {{ localMake }} Models
          </div>
          <div
            v-for="model in modelsForMake"
            :key="model"
            class="list-item"
            :class="{ 'active': localModel === model }"
            @click="selectModel(model)"
          >
            {{ model }}
          </div>
        </div>
      </div>
      <div class="dropdown-footer">
        <button class="dropdown-button secondary" @click="handleReset">Reset</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "MakeModelFilter",
  props: {
    selectedMake: String,
    selectedModel: String,
    allVehicles: { type: Array, default: () => [] },
    isActive: Boolean,
  },
  emits: ['update:make', 'update:model', 'reset', 'toggle-dropdown'],
  data() {
    return {
      localMake: this.selectedMake,
      localModel: this.selectedModel,
      panelState: "makes", // 'makes' or 'models'
    };
  },
  computed: {
    isApplied() {
      return !!this.selectedMake;
    },
    buttonLabel() {
      if (this.selectedMake && this.selectedModel) {
        return `${this.selectedMake} ${this.selectedModel}`;
      }
      if (this.selectedMake) {
        return this.selectedMake;
      }
      return "Make & Model";
    },
    uniqueMakes() {
      const makes = this.allVehicles.map(v => v.make);
      return [...new Set(makes)].sort();
    },
    modelsForMake() {
      if (!this.localMake) return [];
      const models = this.allVehicles
        .filter(v => v.make === this.localMake)
        .map(v => v.model);
      return [...new Set(models)].sort();
    },
  },
  watch: {
    isActive(newVal) {
      // When dropdown opens, sync local state with props
      if (newVal) {
        this.localMake = this.selectedMake;
        this.localModel = this.selectedModel;
        this.panelState = this.selectedMake ? "models" : "makes";
      }
    }
  },
  methods: {
    selectMake(make) {
      this.localMake = make;
      this.localModel = ""; // Reset model
      this.$emit('update:make', make);
      this.panelState = 'models';
    },
    selectModel(model) {
      this.localModel = model;
      this.$emit('update:model', model);
      this.$emit('toggle-dropdown');
    },
    handleReset() {
      this.localMake = "";
      this.localModel = "";
      this.panelState = 'makes';
      this.$emit('reset');
      this.$emit('toggle-dropdown');
    },
  },
};
</script>

<style lang="scss" scoped>
@import './_FilterDropdown.scss';
.filter-dropdown-content {
  width: 300px; // Make/Model can be narrower
}
</style>

