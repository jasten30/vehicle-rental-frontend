<!-- frontend/src/components/SkipCounterSection.vue -->
<template>
  <section class="skip-counter-section">
    <div class="container">
      <div class="skip-counter-content">
        <h2 class="main-title">Rent any car, anywhere, instantly.</h2>
        <p class="subtitle">Avoid the hassle of the rental counter and find a car to rent almost anywhere you go.</p>
      </div>
      <div class="airport-pickup-container">
        <div class="text-content">
          <h3 class="feature-title">Airport pickup made easy</h3>
          <p class="feature-description">
            Enjoy convenient vehicle pickup from local hosts at Mactan-Cebu International Airport.
          </p>
          <ul class="feature-list">
            <li><i class="bi bi-check-circle-fill check-icon"></i>Forget about waiting in lines or dealing with endless paperwork.</li>
            <li><i class="bi bi-check-circle-fill check-icon"></i>Effortlessly locate and access your booked vehicle using our simple website.</li>
            <li><i class="bi bi-check-circle-fill check-icon"></i>Travel with peace of mind thanks to round-the-clock support.</li>
          </ul>
          <button class="search-for-airports-button">Search for cars at airports</button>
        </div>
        <div class="illustration-container">
          <!-- Placeholder for the illustration -->
          <img src="https://blog.carousell.ph/wp-content/uploads/PH_BlogCoverImages-8thSet_1024x536-2-696x364.jpg" alt="Airport pickup illustration" class="illustration-image">
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'SkipCounterSection',
};
</script>

<style lang="scss" scoped>
@import url('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css');
@import '../../assets/styles/variables.scss';

.skip-counter-section {
  padding: 4rem 2rem;
  text-align: center;
  background-color: white;
  .main-title {
    font-size: 3rem;
    font-weight: 700;
    color: #191c2b;
    margin-bottom: 0.5rem;
  }
  .subtitle {
    font-size: 1.2rem;
    color: #4b4b4b;
    margin-bottom: 3rem;
  }
  .airport-pickup-container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 2rem;
    margin-top: 2rem;
    text-align: left;
    @media (max-width: 992px) {
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
    .text-content {
      max-width: 500px;
      flex-basis: 50%;
      @media (max-width: 992px) {
          text-align: center;
      }
    }
    .feature-title {
      font-size: 2rem;
      font-weight: 700;
      color: #191c2b;
      margin-bottom: 1rem;
    }
    .feature-description {
      font-size: 1.1rem;
      color: #4b4b4b;
      margin-bottom: 1.5rem;
    }
    .feature-list {
      list-style-type: none;
      padding: 0;
      margin: 0 0 2rem 0;
      li {
        display: flex;
        align-items: center;
        font-size: 1.1rem;
        color: #4b4b4b;
        margin-bottom: 0.75rem;
      }
      .check-icon {
        color: #6a0dad;
        margin-right: 0.75rem;
      }
    }
    .search-for-airports-button {
      background-color: #6a0dad;
      color: white;
      border: none;
      border-radius: 8px;
      padding: 1rem 2rem;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.3s ease;
      &:hover {
        background-color: darken(#6a0dad, 10%);
      }
    }
    .illustration-container {
      max-width: 500px;
      flex-basis: 50%;
      text-align: center;
      @media (max-width: 992px) {
        max-width: 90%;
      }
    }
    .illustration-image {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
    }
  }
}
</style>
