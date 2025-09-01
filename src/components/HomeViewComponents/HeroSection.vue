<!-- frontend/src/components/HeroSection.vue -->
<template>
  <section class="hero-section">
    <div class="hero-content">
      <h1 class="hero-title">Your Next Adventure, Your Way.</h1>
      <p class="hero-subtitle">
        Discover and rent the perfect car to start your journey today.
      </p>
      <button class="cta-button" @click="goToVehicleList">
        Browse Vehicles
      </button>
    </div>
  </section>
</template>

<script>
export default {
  name: "HeroSection",
  methods: {
    goToVehicleList() {
      // This will navigate to the 'VehicleList' route, which should be defined in your router configuration.
      this.$router.push({ name: "VehicleList" });
    },
  },
};
</script>

<style lang="scss" scoped>
@import url("https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&display=swap");

// CSS Variables for easy color and dimension changes
$hero-bg-color: #6a0dad;
$shape-color-1: #4a90e2;
$shape-color-2: #f8e71c;

@keyframes float {
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
  100% {
    transform: translateY(0);
  }
}

@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.hero-section {
  position: relative;
  min-height: 600px;
  background-color: $hero-bg-color;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: hidden; // Hides shapes that move off-screen
  font-family: "Nunito", sans-serif;
  color: white;

  // Pseudo-element for the first floating shape (a circle)
  &::before {
    content: "";
    position: absolute;
    top: 10%;
    left: 15%;
    width: 250px;
    height: 250px;
    background: $shape-color-1;
    border-radius: 50%;
    opacity: 0.6;
    animation: float 10s ease-in-out infinite;
    z-index: 0;
    filter: blur(50px);
  }

  // Pseudo-element for the second floating shape (a square)
  &::after {
    content: "";
    position: absolute;
    bottom: 15%;
    right: 10%;
    width: 180px;
    height: 180px;
    background: $shape-color-2;
    transform: rotate(45deg);
    opacity: 0.6;
    animation: float 12s ease-in-out infinite reverse;
    z-index: 0;
    filter: blur(50px);
  }
}

.hero-content {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 0 1rem;
  max-width: 800px;
}

.hero-title {
  font-size: 4rem;
  font-weight: 900;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.5);
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
}

.hero-subtitle {
  font-size: 1.5rem;
  font-weight: 400;
  margin-bottom: 2rem;
  line-height: 1.4;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
}

.cta-button {
  background-color: white;
  color: $hero-bg-color;
  font-size: 1.25rem;
  font-weight: 700;
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 9999px;
  cursor: pointer;
  box-shadow:
    0 4px 6px rgba(0, 0, 0, 0.1),
    0 1px 3px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow:
      0 6px 10px rgba(0, 0, 0, 0.15),
      0 2px 5px rgba(0, 0, 0, 0.1);
  }
}
</style>
