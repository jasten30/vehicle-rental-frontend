<template>
  <div class="about-us-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">Connecting Journeys, Building Communities</h1>
        <p class="hero-subtitle">
          RentCycle is more than just a car rental marketplace. We are a community-driven platform dedicated to making mobility accessible, sustainable, and enjoyable for everyone.
        </p>
      </div>
    </section>

    <!-- Mission Section -->
    <section class="mission-section">
      <div class="mission-content">
        <div class="mission-text">
          <h2>Our Mission</h2>
          <p>
            Our goal is to revolutionize the way people think about car ownership and travel. We empower local car owners to safely and easily share their vehicles, providing renters with a convenient and affordable alternative to traditional rental services. By fostering a peer-to-peer network, we aim to reduce waste, support local economies, and create meaningful connections.
          </p>
        </div>
        <div class="mission-image">
          <img src="https://placehold.co/600x400/28a745/ffffff?text=Our+Community" alt="Community" />
        </div>
      </div>
    </section>

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

    <!-- Meet the Team Section -->
    <section class="team-section">
      <h2>Meet the Team</h2>
      <p class="team-intro">We are a passionate team of innovators, thinkers, and adventurers dedicated to building the future of mobility.</p>
      <div class="team-grid">
        <div class="team-member-card">
          <img src="https://placehold.co/300x300/007bff/ffffff?text=CEO" alt="Team Member 1" class="team-member-photo" />
          <h4 class="member-name">Alex Johnson</h4>
          <p class="member-role">Co-Founder & CEO</p>
        </div>
        <div class="team-member-card">
          <img src="https://placehold.co/300x300/fd7e14/ffffff?text=CTO" alt="Team Member 2" class="team-member-photo" />
          <h4 class="member-name">Maria Garcia</h4>
          <p class="member-role">Co-Founder & CTO</p>
        </div>
        <div class="team-member-card">
          <img src="https://placehold.co/300x300/343a40/ffffff?text=COO" alt="Team Member 3" class="team-member-photo" />
          <h4 class="member-name">David Chen</h4>
          <p class="member-role">Chief Operating Officer</p>
        </div>
      </div>
    </section>

  </div>
</template>

<script>
export default {
  name: 'AboutView',
};
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.about-us-page {
  color: $text-color-dark;
}

// Hero Section
.hero-section {
  background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://placehold.co/1600x600/cccccc/333333?text=Driving+Forward');
  background-size: cover;
  background-position: center;
  padding: 6rem 2rem;
  text-align: center;
  color: white;
}
.hero-title {
  font-size: 3.5rem;
  font-weight: 900;
  margin-bottom: 1rem;
}
.hero-subtitle {
  font-size: 1.25rem;
  max-width: 800px;
  margin: 0 auto;
  line-height: 1.6;
}

// Common Section Styling
section {
  padding: 4rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
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
}

// How It Works Section
.how-it-works-section {
  background-color: $background-color;
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
  background: $card-background;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-light;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  &:hover {
    transform: translateY(-10px);
    box-shadow: $shadow-medium;
  }
}
.step-icon {
  font-size: 3rem;
  color: $primary-color;
  margin-bottom: 1.5rem;
}
.step-card h3 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
}
.step-card p {
  color: $text-color-medium;
  line-height: 1.6;
}

// Team Section
.team-section {
  text-align: center;
}
.team-section h2 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
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
}
.member-name {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}
.member-role {
  color: $text-color-medium;
}
</style>
