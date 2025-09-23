<template>
  <section class="hero-section">
    <div class="hero-overlay"></div>
    <div class="hero-content">
      <h1 class="hero-title">Find Your Drive.</h1>
      <h2 class="hero-subtitle">Discover the perfect vehicle for your next journey.</h2>
      <button class="cta-button" @click="goToVehicleList">
        Browse Vehicles <i class="bi bi-arrow-right"></i>
      </button>
    </div>
  </section>
</template>

<script>
export default {
  name: "HeroSection",
  methods: {
    goToVehicleList() {
      this.$router.push({ name: "VehicleList" });
    },
  },
};
</script>

<style lang="scss" scoped>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Nunito:wght@400;600&display=swap');

.hero-section {
  position: relative;
  height: 650px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: white;
  overflow: hidden;

  // Background image is set here
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url('https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=2070');
    background-size: cover;
    background-position: center;
    // Adds a subtle zoom effect on load
    animation: zoom-in 15s ease-out forwards;
    z-index: 1;
  }
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4); // Dark overlay for readability
  z-index: 2;
}

.hero-content {
  position: relative;
  z-index: 3;
  max-width: 800px;
  padding: 0 1rem;
}

.hero-title {
  font-family: 'Playfair Display', serif;
  font-size: 4.5rem;
  font-weight: 700;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
  margin: 0;
  line-height: 1.1;

  @media (max-width: 768px) {
    font-size: 3rem;
  }
}

.hero-subtitle {
  font-family: 'Nunito', sans-serif;
  font-size: 1.25rem;
  margin: 1rem 0 2.5rem 0;
  line-height: 1.6;
  opacity: 0.9;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
}

.cta-button {
  background-color: #fff;
  color: #333;
  font-family: 'Nunito', sans-serif;
  font-size: 1.1rem;
  font-weight: 700;
  padding: 0.85rem 2rem;
  border: none;
  border-radius: 9999px;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
  }
}

@keyframes zoom-in {
  from {
    transform: scale(1);
  }
  to {
    transform: scale(1.1);
  }
}
</style>
