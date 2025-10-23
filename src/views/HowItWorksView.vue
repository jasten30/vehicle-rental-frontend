<template>
  <div class="how-it-works-page">
    <!-- How It Works Section -->
    <section class="how-it-works-section">
      <h2>How It Works</h2>
      <div class="steps-container">
        <div class="step-card">
          <div class="step-icon"><i class="bi bi-search"></i></div>
          <h3>1. Discover</h3>
          <p>Browse a unique selection of cars shared by local hosts, from daily drivers to luxury sedans.</p>
        </div>
        <div class="step-card">
          <div class="step-icon"><i class="bi bi-calendar-check"></i></div>
          <h3>2. Book</h3>
          <p>Choose your dates, book your trip, and get verified—all through our secure platform.</p>
        </div>
        <div class="step-card">
          <div class="step-icon"><i class="bi bi-key-fill"></i></div>
          <h3>3. Drive</h3>
          <p>Pick up your car, unlock new experiences, and hit the open road with confidence.</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'HowItWorksView',
};
</script>

<style lang="scss" scoped>
// Assuming variables are globally available or imported via vue.config.js
// If not, you might need to import variables.scss directly
// @import '@/assets/styles/variables.scss';

.how-it-works-page {
  color: #333; // Fallback text color
}

// How It Works Section
.how-it-works-section {
  padding: 4rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
  background-color: #f8f9fa; // Fallback background color
  text-align: center;
}
.how-it-works-section h2 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 3rem;
}
.steps-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
}
.step-card {
  padding: 2rem;
  background: #ffffff; // Fallback card background
  border-radius: 12px; // Fallback border radius
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); // Fallback shadow
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1); // Fallback shadow on hover
  }
}
.step-icon {
  font-size: 3rem;
  color: #dc3545; // Fallback primary color (red)
  margin-bottom: 1.5rem;
}
.step-card h3 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
}
.step-card p {
  color: #555; // Fallback text color
  line-height: 1.6;
}
</style>
