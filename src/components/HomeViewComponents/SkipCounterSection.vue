<template>
  <section class="skip-counter-section">
    <div class="container">
      <div class="header-content">
        <h2 class="main-title">
          Rent any car, anywhere, <span class="highlight">instantly.</span>
        </h2>
        <p class="subtitle">
          Skip the rental counter. Unlock freedom with a vehicle ready whenever
          you are.
        </p>
      </div>

      <div class="content-grid">
        <div class="text-column">
          <div class="feature-block">
            <h3 class="feature-title">Vehicle pickup made effortless</h3>
            <p class="feature-description">
              Connect with trusted local hosts in Cebu Province for a seamless
              handover experience.
            </p>

            <ul class="feature-list">
              <li>
                <div class="icon-box">
                  <i class="bi bi-lightning-charge-fill"></i>
                </div>
                <div class="list-text">
                  <strong>Skip the Line</strong>
                  <span>No waiting, no endless paperwork. Just drive.</span>
                </div>
              </li>
              <li>
                <div class="icon-box">
                  <i class="bi bi-geo-alt-fill"></i>
                </div>
                <div class="list-text">
                  <strong>Easy Access</strong>
                  <span
                    >Locate and unlock your booked vehicle via our app.</span
                  >
                </div>
              </li>
              <li>
                <div class="icon-box">
                  <i class="bi bi-shield-fill-check"></i>
                </div>
                <div class="list-text">
                  <strong>24/7 Support</strong>
                  <span>Travel with total peace of mind, day or night.</span>
                </div>
              </li>
            </ul>

            <button class="cta-button" @click="goToVehicleList">
              <span>Search for cars</span>
              <i class="bi bi-arrow-right"></i>
            </button>
          </div>
        </div>

        <div class="image-column">
          <div class="image-wrapper">
            <div class="backdrop-shape"></div>
            <img
              src="https://blog.carousell.ph/wp-content/uploads/PH_BlogCoverImages-8thSet_1024x536-2-696x364.jpg"
              alt="Happy travelers with car"
              class="main-image"
            />
            <div class="floating-badge">
              <i class="bi bi-star-fill"></i>
              <span>Top Rated Hosts</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: "SkipCounterSection",
  methods: {
    goToVehicleList() {
      this.$router.push({ name: "VehicleList" });
    },
  },
};
</script>

<style lang="scss" scoped>
@import url("https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css");
// Assuming you have this, otherwise replace variables with hex codes
@import "../../assets/styles/variables.scss";

// Variables for this component (fallback if global vars aren't present)
$primary-color: #6a0dad;
$primary-dark: #4b0082;
$text-dark: #191c2b;
$text-light: #6c757d;
$bg-light: #f8f9fa;

.skip-counter-section {
  padding: 5rem 1.5rem;
  background-color: #ffffff;
  overflow-x: hidden; // Prevent accidental scroll from floating elements

  .container {
    max-width: 1200px;
    margin: 0 auto;
  }
}

// --- Header Styling ---
.header-content {
  text-align: center;
  max-width: 800px;
  margin: 0 auto 4rem auto;

  .main-title {
    font-size: 3rem;
    font-weight: 800;
    color: $text-dark;
    line-height: 1.2;
    margin-bottom: 1rem;

    .highlight {
      color: $primary-color;
      position: relative;

      &::after {
        content: "";
        position: absolute;
        bottom: 5px;
        left: 0;
        width: 100%;
        height: 8px;
        background-color: rgba($primary-color, 0.2);
        z-index: -1;
        border-radius: 4px;
      }
    }

    @media (max-width: 768px) {
      font-size: 2.2rem;
    }
  }

  .subtitle {
    font-size: 1.25rem;
    color: $text-light;
    font-weight: 400;
  }
}

// --- Grid Layout ---
.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;

  @media (max-width: 992px) {
    grid-template-columns: 1fr;
    gap: 3rem;
    text-align: center;
  }
}

// --- Text Column Styling ---
.text-column {
  .feature-title {
    font-size: 2rem;
    font-weight: 700;
    color: $text-dark;
    margin-bottom: 1rem;
  }

  .feature-description {
    font-size: 1.1rem;
    color: $text-light;
    margin-bottom: 2.5rem;
    line-height: 1.6;
  }

  .feature-list {
    list-style: none;
    padding: 0;
    margin: 0 0 2.5rem 0;
    text-align: left; // Keep list left-aligned even on mobile for readability

    li {
      display: flex;
      align-items: flex-start;
      margin-bottom: 1.5rem;

      .icon-box {
        background-color: rgba($primary-color, 0.1);
        color: $primary-color;
        min-width: 45px;
        height: 45px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.25rem;
        margin-right: 1rem;
        flex-shrink: 0;
      }

      .list-text {
        display: flex;
        flex-direction: column;

        strong {
          font-size: 1.1rem;
          color: $text-dark;
          margin-bottom: 0.2rem;
        }

        span {
          color: $text-light;
          font-size: 0.95rem;
        }
      }
    }

    // Center the list container on mobile if desired, but keep items flex-start
    @media (max-width: 992px) {
      display: inline-block;
    }
  }
}

// --- Button Styling ---
.cta-button {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  background: linear-gradient(135deg, $primary-color, $primary-dark);
  color: white;
  border: none;
  border-radius: 50px;
  padding: 1rem 2.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 10px 20px rgba($primary-color, 0.3);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);

  i {
    transition: transform 0.3s ease;
  }

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 15px 25px rgba($primary-color, 0.4);

    i {
      transform: translateX(5px);
    }
  }
}

// --- Image Column Styling ---
.image-column {
  position: relative;
  display: flex;
  justify-content: center;

  .image-wrapper {
    position: relative;
    max-width: 550px;
    width: 100%;
    z-index: 1;
  }

  // Animated floating effect
  animation: float 6s ease-in-out infinite;

  .main-image {
    width: 100%;
    border-radius: 20px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
    position: relative;
    z-index: 2;
    object-fit: cover;
  }

  // Decorative shape behind image
  .backdrop-shape {
    position: absolute;
    top: -20px;
    right: -20px;
    width: 100%;
    height: 100%;
    background-color: rgba($primary-color, 0.1);
    border-radius: 20px;
    z-index: 1;
    transform: rotate(3deg);
    transition: transform 0.3s ease;
  }

  &:hover .backdrop-shape {
    transform: rotate(5deg) scale(1.02);
  }

  // Floating Badge
  .floating-badge {
    position: absolute;
    bottom: 30px;
    left: -30px;
    background: white;
    padding: 0.8rem 1.5rem;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    gap: 0.5rem;
    z-index: 3;
    font-weight: 700;
    color: $text-dark;

    i {
      color: #ffc107; // Gold color for star
    }

    @media (max-width: 576px) {
      left: 10px; // Adjust for mobile
      bottom: 20px;
    }
  }
}

// --- Animations ---
@keyframes float {
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-15px);
  }
  100% {
    transform: translateY(0px);
  }
}
</style>
