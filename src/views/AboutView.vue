<template>
  <div class="about-us-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content scroll-animate">
        <h1 class="hero-title">Connecting Journeys, Building Communities</h1>
        <p class="hero-subtitle">
          RentCycle is more than just a rental marketplace. We are a
          community-driven platform dedicated to making mobility accessible,
          sustainable, and enjoyable for everyone.
        </p>
      </div>
    </section>

    <!-- Mission Section -->
    <section class="mission-section">
      <div class="mission-content">
        <div class="mission-text scroll-animate">
          <h2>Our Mission</h2>
          <p>
            Our goal is to revolutionize the way people think about vehicle
            ownership and travel. We empower local owners to safely and easily
            share their assets, providing renters with a convenient and
            affordable alternative to traditional rental services. By fostering
            a peer-to-peer network, we aim to reduce waste, support local
            economies, and create meaningful connections.
          </p>
        </div>
        <div class="mission-image scroll-animate">
          <img
            src="https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=1200"
            alt="Happy car owner"
          />
        </div>
      </div>
    </section>

    <!-- ================================== -->
    <!-- NEW "How It Works" Section -->
    <!-- ================================== -->
    <section class="how-it-works-section">
      <h2 class="scroll-animate">How It Works</h2>
      <div class="steps-container">
        <!-- Step 1 -->
        <div class="step-row">
          <div class="step-image-wrapper scroll-animate" style="--delay: 0s">
            <img
              src="https://images.unsplash.com/photo-1542362567-b07e54358753?q=80&w=1200"
              alt="Discover vehicles"
              class="step-image"
            />
          </div>
          <div class="step-text-content scroll-animate" style="--delay: 0.1s">
            <div class="step-icon"><i class="bi bi-search"></i></div>
            <h3>1. Discover</h3>
            <p>
              Browse a unique selection of cars and motorcycles shared by local
              hosts, from daily drivers to luxury sedans.
            </p>
          </div>
        </div>

        <!-- Step 2 -->
        <div class="step-row reverse">
          <div class="step-image-wrapper scroll-animate" style="--delay: 0s">
            <!-- === UPDATED IMAGE HERE === -->
            <img
              src="https://images.unsplash.com/photo-1502877338535-766e1452684a?q=80&w=1200"
              alt="Book a car"
              class="step-image"
            />
          </div>
          <div class="step-text-content scroll-animate" style="--delay: 0.1s">
            <div class="step-icon"><i class="bi bi-calendar-check"></i></div>
            <h3>2. Book</h3>
            <p>
              Choose your dates, book your trip, and get verified—all through
              our secure platform.
            </p>
          </div>
        </div>

        <!-- Step 3 -->
        <div class="step-row">
          <div class="step-image-wrapper scroll-animate" style="--delay: 0s">
            <img
              src="https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=1200"
              alt="Drive a motorcycle"
              class="step-image"
            />
          </div>
          <div class="step-text-content scroll-animate" style="--delay: 0.1s">
            <div class="step-icon"><i class="bi bi-key-fill"></i></div>
            <h3>3. Drive</h3>
            <p>
              Pick up your vehicle, unlock new experiences, and hit the open
              road with confidence.
            </p>
          </div>
        </div>
      </div>
    </section>
    <!-- ================================== -->
    <!-- END "How It Works" Section -->
    <!-- ================================== -->

    <!-- Meet the Team Section -->
    <section class="team-section">
      <h2 class="scroll-animate">Meet the Team</h2>
      <p class="team-intro scroll-animate">
        We are a passionate team of innovators, thinkers, and adventurers
        dedicated to building the future of mobility.
      </p>

      <div class="team-grid">
        <div class="team-member-card scroll-animate" style="--delay: 0s">
          <img
            src="@/assets/images/images/Deniel John T. Jumao-as.jpg"
            alt="Deniel John T. Jumao-as"
            class="team-member-photo"
          />
          <h4 class="member-name">Deniel John T. Jumao-as</h4>
          <p class="member-role">Backend Developer</p>
        </div>

        <div class="team-member-card scroll-animate" style="--delay: 0.1s">
          <img
            src="@/assets/images/images/Christian Jade C. Malahos.jpg"
            alt="Christian Jade C. Malahos"
            class="team-member-photo"
          />
          <h4 class="member-name">Christian Jade C. Malahos</h4>
          <p class="member-role">Project Manager</p>
        </div>

        <div class="team-member-card scroll-animate" style="--delay: 0.2s">
          <img
            src="@/assets/images/images/Frenand Ross M. Gungob.jpg"
            alt="Frenand Ross M. Gungob"
            class="team-member-photo"
          />
          <h4 class="member-name">Frenand Ross M. Gungob</h4>
          <p class="member-role">Frontend Developer</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: "AboutView",
  data() {
    return {
      observer: null,
    };
  },
  mounted() {
    const options = {
      root: null,
      threshold: 0.2, // Trigger when 20% of the element is visible
      rootMargin: "0px",
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          this.observer.unobserve(entry.target);
        }
      });
    }, options);

    this.$nextTick(() => {
      const sections = this.$el.querySelectorAll(".scroll-animate");
      sections.forEach((section) => {
        this.observer.observe(section);
      });
    });
  },
  beforeUnmount() {
    if (this.observer) {
      this.observer.disconnect();
    }
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/styles/variables.scss";

// --- ADDED: Keyframes for the background animation ---
@keyframes kenburns-bg {
  0% {
    transform: scale(1) translate(0, 0);
  }
  100% {
    transform: scale(1.1) translate(-2%, 2%);
  }
}
// ---

.about-us-page {
  color: $text-color-dark;
  overflow-x: hidden; // Prevent horizontal scroll from animations
}

// Hero Section
.hero-section {
  position: relative;
  overflow: hidden;
  padding: 6rem 2rem;
  text-align: center;
  color: white;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background:
      linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)),
      url("https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1600");
    background-size: cover;
    background-position: center;
    animation: kenburns-bg 20s ease-in-out infinite alternate;
    z-index: 1;
    will-change: transform;
  }

  @media (max-width: 768px) {
    padding: 4rem 1.5rem;
  }
}

.hero-content {
  position: relative;
  z-index: 2;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 900;
  margin-bottom: 1rem;
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
}
.hero-subtitle {
  font-size: 1.25rem;
  max-width: 800px;
  margin: 0 auto;
  line-height: 1.6;
  opacity: 0.9;
  @media (max-width: 768px) {
    font-size: 1rem;
  }
}

// Common Section Styling
section {
  padding: 6rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
  @media (max-width: 768px) {
    padding: 3rem 1.5rem;
  }
}

// Mission Section
.mission-section {
  background-color: #fdfdfd;
}
.mission-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: center;
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}
.mission-text h2 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: $primary-color;
  @media (max-width: 768px) {
    font-size: 2rem;
  }
}
.mission-text p {
  font-size: 1.1rem;
  line-height: 1.8;
  color: $text-color-medium;
}
.mission-image img {
  width: 100%;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-medium;
  @media (max-width: 768px) {
    grid-row: 1; // Move image to the top on mobile
  }
}

// ==================================
// UPDATED "How It Works" Section
// ==================================
.how-it-works-section {
  background-color: $background-light;
  text-align: left; // Changed from center
}
.how-it-works-section h2 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 3rem;
  text-align: center; // Keep title centered
  @media (max-width: 768px) {
    font-size: 2rem;
  }
}
.steps-container {
  display: flex;
  flex-direction: column;
  gap: 4rem; // Add more space between rows
}
.step-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: center;

  // Reverse layout for even rows
  &.reverse {
    .step-image-wrapper {
      order: 2;
    }
    .step-text-content {
      order: 1;
    }
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
    &.reverse {
      .step-image-wrapper,
      .step-text-content {
        order: initial; // Reset order on mobile
      }
    }
  }
}
.step-image-wrapper {
  border-radius: $border-radius-lg;
  overflow: hidden;
  box-shadow: $shadow-large;
}
.step-image {
  width: 100%;
  height: 100%;
  max-height: 400px;
  object-fit: cover;
  display: block;
}
.step-text-content {
  padding: 1rem;
  @media (max-width: 768px) {
    text-align: center;
    padding: 0;
  }
}
.step-icon {
  font-size: 3rem;
  color: $primary-color;
  margin-bottom: 1.5rem;
  display: inline-block;
}
.step-text-content h3 {
  font-size: 2rem; // Larger title
  font-weight: 700;
  margin-top: 0;
  margin-bottom: 1rem;
}
.step-text-content p {
  color: $text-color-medium;
  line-height: 1.8;
  font-size: 1.1rem;
}
// ==================================
// END "How It Works" Section
// ==================================

// Team Section
.team-section {
  text-align: center;
}
.team-section h2 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  @media (max-width: 768px) {
    font-size: 2rem;
  }
}
.team-intro {
  font-size: 1.1rem;
  color: $text-color-medium;
  max-width: 700px;
  margin: 0 auto 3rem;
}
.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}
.team-member-card {
  text-align: center;
}
.team-member-photo {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 1.5rem;
  border: 4px solid white;
  box-shadow: $shadow-medium;
  transition: transform 0.3s ease;
  &:hover {
    transform: scale(1.05);
  }
}
.member-name {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}
.member-role {
  color: $text-color-medium;
}

// --- NEW SCROLL ANIMATION STYLES ---
.scroll-animate {
  // Start hidden
  opacity: 0;
  transform: translateY(40px); // Start slightly lower
  transition:
    opacity 0.6s ease-out,
    transform 0.6s ease-out;
  transition-delay: var(--delay, 0s); // Use CSS variable for delay
  will-change: opacity, transform;

  // Animate when 'is-visible' class is added
  &.is-visible {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
