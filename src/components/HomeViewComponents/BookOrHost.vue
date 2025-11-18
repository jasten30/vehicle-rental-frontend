<template>
  <section class="split-interaction-section">
    <div class="split-container">
      
      <div class="split-pane renter-pane" @click="goToVehicleList">
        <div class="background-layer"></div>
        <div class="content-layer">
          <h2 class="pane-title">Drive</h2>
          <p class="pane-subtitle">Find the perfect car for your journey.</p>
          <button class="action-btn">
            Book a Car <i class="bi bi-arrow-right"></i>
          </button>
        </div>
      </div>

      <div class="split-pane host-pane" @click="goToBecomeHost">
        <div class="background-layer"></div>
        <div class="content-layer">
          <h2 class="pane-title">Host</h2>
          <p class="pane-subtitle">Turn your idle vehicle into income.</p>
          <button class="action-btn">
            Become a Host <i class="bi bi-arrow-right"></i>
          </button>
        </div>
      </div>

    </div>
  </section>
</template>

<script>
export default {
  name: 'BookOrHost',
  methods: {
    goToVehicleList() {
      this.$router.push({ name: 'VehicleList' });
    },
    goToBecomeHost() {
      this.$router.push({ name: 'BecomeOwnerApplication' }); 
    }
  }
};
</script>

<style lang="scss" scoped>
@import url('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css');
@import '@/assets/styles/variables.scss'; // Assuming you have global vars

// Configuration
$transition-speed: 0.6s;
$overlay-color: rgba(0, 0, 0, 0.4);
$overlay-hover: rgba(0, 0, 0, 0.2);
$primary-accent: #ff385c; // Or your brand color

.split-interaction-section {
  width: 100%;
  height: 600px; // Fixed height for the split effect
  overflow: hidden;
  font-family: 'Nunito', sans-serif;

  @media (max-width: 768px) {
    height: auto; // Auto height for stacking on mobile
    min-height: 80vh;
  }
}

.split-container {
  display: flex;
  width: 100%;
  height: 100%;

  @media (max-width: 768px) {
    flex-direction: column;
  }
}

.split-pane {
  position: relative;
  flex: 1; // Both start at 50% width
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: flex $transition-speed cubic-bezier(0.25, 1, 0.5, 1);
  overflow: hidden;

  // Background Images
  &.renter-pane .background-layer {
    background-image: url('https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2070&auto=format&fit=crop');
  }

  &.host-pane .background-layer {
    background-image: url('https://images.unsplash.com/photo-1560252829-804f1aedf1be?q=80&w=2070&auto=format&fit=crop');
  }

  // Hover Effects (Desktop Only)
  @media (min-width: 769px) {
    &:hover {
      flex: 2; // Expands to take up more space
      
      .background-layer {
        transform: scale(1.1); // Subtle zoom effect
        filter: grayscale(0%); // Colorize on hover
      }
      
      .content-layer {
        background: rgba(0,0,0, 0.2); // Lighten backdrop
      }
    }

    // When hovering one, darken the other sibling
    .split-container:hover &:not(:hover) {
      flex: 0.8; 
      .background-layer {
        filter: grayscale(100%) brightness(0.7);
      }
    }
  }
}

.background-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  transition: all $transition-speed ease;
  z-index: 0;
  
  // Initial state
  filter: brightness(0.8);
}

.content-layer {
  position: relative;
  z-index: 2;
  text-align: center;
  color: white;
  padding: 2rem;
  transition: all 0.3s ease;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: $overlay-color; // Darken image for readability
  backdrop-filter: blur(2px); // Slight blur for modern feel
}

.pane-title {
  font-size: 4rem;
  font-weight: 800;
  text-transform: uppercase;
  margin: 0;
  letter-spacing: 2px;
  text-shadow: 0 4px 10px rgba(0,0,0,0.3);

  @media (max-width: 768px) {
    font-size: 3rem;
  }
}

.pane-subtitle {
  font-size: 1.2rem;
  margin: 1rem 0 2rem;
  font-weight: 600;
  opacity: 0.9;
  max-width: 300px;
}

.action-btn {
  padding: 12px 30px;
  font-size: 1rem;
  font-weight: 700;
  color: white;
  background: transparent;
  border: 2px solid white;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 10px;
  text-transform: uppercase;
  letter-spacing: 1px;

  &:hover {
    background: white;
    color: black;
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.3);
  }
}

// Mobile adjustments
@media (max-width: 768px) {
  .split-pane {
    min-height: 400px; // Ensure enough height on mobile
    border-bottom: 1px solid rgba(255,255,255,0.2);
  }
  
  .content-layer {
    background: rgba(0,0,0,0.5); // Darker overlay on mobile for readability
    backdrop-filter: none;
  }
}
</style>