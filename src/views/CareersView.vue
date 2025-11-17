<template>
  <div class="careers-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content scroll-animate">
        <h1 class="hero-title">Join Our Mission</h1>
        <p class="hero-subtitle">
          We're building the future of shared mobility in the Philippines. Join our passionate team and help us create a community built on trust, convenience, and adventure.
        </p>
      </div>
    </section>

    <!-- Values Section -->
    <section class="values-section">
      <h2 class="section-title scroll-animate">Why You'll Love Working Here</h2>
       <div class="values-content">
          <div class="value-card scroll-animate" style="--delay: 0s;">
             <div class="info-icon"><i class="bi bi-people-fill"></i></div>
             <h3>Community First</h3>
             <p>We're not just a platform; we're a community. Every decision we make is to support our hosts and renters.</p>
          </div>
          <div class="value-card scroll-animate" style="--delay: 0.1s;">
             <div class="info-icon"><i class="bi bi-lightbulb-fill"></i></div>
             <h3>Drive Innovation</h3>
             <p>From secure payments to real-time chat, we are constantly building new tools to make sharing simple and safe.</p>
          </div>
          <div class="value-card scroll-animate" style="--delay: 0.2s;">
             <div class="info-icon"><i class="bi bi-shield-check"></i></div>
             <h3>Act with Integrity</h3>
             <p>Trust is our currency. We operate with transparency and a strong commitment to the safety of our users.</p>
          </div>
       </div>
    </section>

    <!-- Perks Section -->
    <section class="perks-section alternate-bg">
      <div class="perks-container">
        
        <!-- Perk 1 -->
        <div class="step-row">
          <div class="step-image-wrapper scroll-animate" style="--delay: 0s;">
            <img src="https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=1200" alt="Flexible Work" class="step-image"/>
          </div>
          <div class="step-text-content scroll-animate" style="--delay: 0.1s;">
            <div class="step-icon"><i class="bi bi-laptop"></i></div>
            <h3>Work Your Way</h3>
            <p>We believe in work-life balance. Enjoy flexible working hours and remote-friendly policies that let you do your best work from anywhere.</p>
          </div>
        </div>

        <!-- Perk 2 -->
        <div class="step-row reverse">
          <div class="step-image-wrapper scroll-animate" style="--delay: 0s;">
            <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1200" alt="Team Growth" class="step-image"/>
          </div>
          <div class="step-text-content scroll-animate" style="--delay: 0.1s;">
            <div class="step-icon"><i class="bi bi-graph-up-arrow"></i></div>
            <h3>Grow With Us</h3>
            <p>Join a fast-growing startup where you can make a real impact. We're committed to your professional development and provide opportunities to learn and lead.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Open Positions Section -->
    <section class="openings-section">
      <h2 class="section-title scroll-animate">Current Openings</h2>
      
      <div class="job-listings-container scroll-animate">
        <!-- Engineering Team -->
        <div class="department-group">
          <h3 class="department-title">Engineering</h3>
          <div class="job-card">
            <div class="job-info">
              <h4 class="job-title">Senior Frontend Engineer (Vue.js)</h4>
              <span class="job-location">Cebu City, PH / Remote</span>
            </div>
            <a href="mailto:careers@rentcycle.com?subject=Application: Senior Frontend Engineer" class="button primary-button">Apply Now</a>
          </div>
          <div class="job-card">
            <div class="job-info">
              <h4 class="job-title">Backend Engineer (Node.js & Firebase)</h4>
              <span class="job-location">Cebu City, PH / Remote</span>
            </div>
            <a href="mailto:careers@rentcycle.com?subject=Application: Backend Engineer" class="button primary-button">Apply Now</a>
          </div>
        </div>

        <!-- Support Team -->
        <div class="department-group">
          <h3 class="department-title">Support</h3>
          <div class="job-card">
            <div class="job-info">
              <h4 class="job-title">Community Support Specialist</h4>
              <span class="job-location">Cebu City, PH</span>
            </div>
            <a href="mailto:careers@rentcycle.com?subject=Application: Support Specialist" class="button primary-button">Apply Now</a>
          </div>
        </div>
        
        <!-- No Role CTA -->
        <div class="no-role-card">
          <h4>Don't see your role?</h4>
          <p>We're always looking for talented people. Send us your resume and tell us why you'd be a great fit.</p>
          <a href="mailto:careers@rentcycle.com?subject=Future Opportunity" class="button secondary-button">Get in Touch</a>
        </div>
      </div>
    </section>

  </div>
</template>

<script>
export default {
  name: 'CareersView',
  data() {
    return {
      observer: null,
    };
  },
  mounted() {
    const options = {
      root: null,
      threshold: 0.1, // Start animation a bit earlier
      rootMargin: "0px",
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          this.observer.unobserve(entry.target);
        }
      });
    }, options);

    this.$nextTick(() => {
      const sections = this.$el.querySelectorAll('.scroll-animate');
      sections.forEach(section => {
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
@import '@/assets/styles/variables.scss';

// Animation for the hero background
@keyframes kenburns-bg {
  0% { transform: scale(1) translate(0, 0); }
  100% { transform: scale(1.1) translate(-2%, 2%); }
}

.careers-page {
  color: $text-color-dark;
  overflow-x: hidden;
}

// Hero Section
.hero-section {
  position: relative;
  overflow: hidden;
  padding: 6rem 2rem;
  text-align: center;
  color: white;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1600');
    background-size: cover;
    background-position: center;
    animation: kenburns-bg 20s ease-in-out infinite alternate;
    z-index: 1;
    will-change: transform;
  }
  @media (max-width: 768px) { padding: 4rem 1.5rem; }
}
.hero-content { position: relative; z-index: 2; }
.hero-title {
  font-size: 3.5rem;
  font-weight: 900;
  margin-bottom: 1rem;
  @media (max-width: 768px) { font-size: 2.5rem; }
}
.hero-subtitle {
  font-size: 1.25rem;
  max-width: 800px;
  margin: 0 auto;
  line-height: 1.6;
  opacity: 0.9;
  @media (max-width: 768px) { font-size: 1rem; }
}

// Common Section Styling
section {
  padding: 6rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
  @media (max-width: 768px) { padding: 3rem 1.5rem; }
}
.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 3rem;
  text-align: center;
  color: $text-color-dark;
  @media (max-width: 768px) { font-size: 2rem; }
}

// Values Section (reusing trust-card style)
.values-section {
  background-color: #fdfdfd;
}
.values-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
}
.value-card {
  background: $card-background;
  border: 1px solid $border-color-light;
  border-radius: $border-radius-lg;
  padding: 2rem;
  text-align: center;
  box-shadow: $shadow-light;
  
  .info-icon {
    font-size: 2.5rem;
    color: $primary-color; // Use primary color
    margin-bottom: 1rem;
    display: inline-block;
  }
  h3 {
    font-size: 1.25rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }
  p {
    color: $text-color-medium;
    line-height: 1.6;
    margin-bottom: 1rem;
  }
}

// Perks Section (reusing step-row style)
.perks-section.alternate-bg {
  background-color: $background-light;
}
.perks-container {
  display: flex;
  flex-direction: column;
  gap: 4rem;
}
.step-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: center;
  &.reverse {
    .step-image-wrapper { order: 2; }
    .step-text-content { order: 1; }
  }
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
    &.reverse {
      .step-image-wrapper, .step-text-content {
        order: initial;
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
  font-size: 2rem;
  font-weight: 700;
  margin-top: 0;
  margin-bottom: 1rem;
}
.step-text-content p {
  color: $text-color-medium;
  line-height: 1.8;
  font-size: 1.1rem;
}

// Open Positions Section
.openings-section {
  max-width: 900px; // Make this section a bit narrower
}
.job-listings-container {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}
.department-group {
  .department-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: $text-color-dark;
    margin-bottom: 1.5rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid $primary-color;
    display: inline-block;
  }
}
.job-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: $card-background;
  border: 1px solid $border-color-light;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-light;
  transition: box-shadow 0.2s ease;

  &:hover {
    box-shadow: $shadow-medium;
  }
  
  @media (max-width: 576px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}
.job-info {
  .job-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: $text-color-dark;
    margin: 0 0 0.25rem 0;
  }
  .job-location {
    font-size: 0.9rem;
    color: $text-color-medium;
  }
}
.button.primary-button, .button.secondary-button {
  padding: 0.6rem 1.2rem;
  font-size: 0.9rem;
  text-decoration: none;
  @media (max-width: 576px) {
    width: 100%;
    box-sizing: border-box;
  }
}
.button.primary-button {
  background-color: $primary-color;
  color: white;
  border: 1px solid $primary-color;
  &:hover { background-color: darken($primary-color, 10%); }
}
.button.secondary-button {
  background-color: transparent;
  color: $primary-color;
  border: 1px solid $primary-color;
  &:hover { background-color: lighten($primary-color, 45%); }
}
.no-role-card {
  text-align: center;
  background-color: $background-light;
  padding: 2rem;
  border-radius: $border-radius-lg;
  border: 1px dashed $border-color;
  h4 {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0 0 0.5rem 0;
  }
  p {
    color: $text-color-medium;
    margin-bottom: 1.5rem;
  }
}

// Scroll Animation
.scroll-animate {
  opacity: 0;
  transform: translateY(40px);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
  transition-delay: var(--delay, 0s);
  will-change: opacity, transform;

  &.is-visible {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>