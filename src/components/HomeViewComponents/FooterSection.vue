<template>
  <footer class="footer-container">
    <div class="footer-content">
      <div class="footer-column brand">
        <h2 class="footer-title">
          <span class="rent-text">RENT</span><span class="cycle-text">CYCLE</span>
        </h2>
        <p class="tagline">Your adventure starts here. Rent cars and motorcycles from trusted local hosts.</p>
        <div class="social-icons">
          <a href="#" aria-label="Facebook"><i class="bi bi-facebook"></i></a>
          <a href="#" aria-label="Instagram"><i class="bi bi-instagram"></i></a>
          <a href="#" aria-label="Twitter"><i class="bi bi-twitter"></i></a>
        </div>
      </div>
      
      <div class="footer-column links">
        <h4 class="column-title">Company</h4>
        <ul>
          <li><router-link to="/about">About Us</router-link></li>
          <li><router-link to="/careers">Careers</router-link></li>
          <li><router-link to="/blog">Blog</router-link></li>
        </ul>
      </div>

      <div class="footer-column links">
        <h4 class="column-title">Support</h4>
        <ul>
          <li><router-link to="/contact">Contact Support</router-link></li>
          <li><router-link to="/faq">FAQ</router-link></li>
          <!-- === UPDATED LINK === -->
          <li><router-link to="/trust-and-safety">Trust & Safety</router-link></li>
          <!-- === END UPDATE === -->
          <li><router-link to="/how-it-works">How it Works</router-link></li>
        </ul>
      </div>

      <div class="footer-column links">
        <h4 class="column-title">Hosting</h4>
        <ul>
          <li><router-link to="/become-a-host">Become a host</router-link></li>
          <!-- Commented out links for pages that don't exist yet -->
          <!-- <li><router-link to="/hosting-guide">Hosting Guide</router-link></li> -->
          <!-- <li><router-link to="/insurance">Insurance</router-link></li> -->
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <p>&copy; {{ new Date().getFullYear() }} RentCycle, Inc. All rights reserved.</p>
      <ul>
        <!-- Changed to placeholder links to avoid 404 errors -->
        <li><router-link to="#">Privacy Policy</router-link></li>
        <li><router-link to="#">Terms of Service</router-link></li>
      </ul>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'FooterSection'
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.footer-container {
  background-color: $background-light; // Use a light background
  color: $text-color-medium;
  padding: 4rem 2rem 2rem;
  border-top: 1px solid $border-color-light;
  font-family: 'Nunito', sans-serif;
}

.footer-content {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr; // Main brand column is wider
  gap: 2rem;
  max-width: 1400px;
  margin: 0 auto 3rem auto;

  @media (max-width: 992px) {
    grid-template-columns: 1fr 1fr; // 2x2 grid
  }

  @media (max-width: 576px) {
    grid-template-columns: 1fr; // Single column
  }
}

.footer-column {
  &.brand {
    padding-right: 1rem;
  }
}

.footer-title {
  font-family: 'Anton', sans-serif;
  font-size: 2.2rem;
  font-weight: 400;
  margin: 0 0 1rem 0;
  line-height: 1;
  .rent-text { color: red; font-style: italic; }
  .cycle-text { color: black; font-style: italic; }
}

.tagline {
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.social-icons {
  display: flex;
  gap: 1rem;
  a {
    color: $text-color-medium;
    font-size: 1.5rem;
    transition: color 0.2s ease;
    &:hover {
      color: $primary-color;
    }
  }
}

.column-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: $text-color-dark;
  margin-bottom: 1.25rem;
  margin-top: 0;
}

.links {
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  
  a {
    text-decoration: none;
    color: $text-color-medium;
    font-weight: 500;
    transition: color 0.2s ease;
    &:hover {
      color: $primary-color;
      text-decoration: underline;
    }
  }
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 2rem;
  border-top: 1px solid $border-color;
  max-width: 1400px;
  margin: 0 auto;
  font-size: 0.85rem;
  color: $text-color-medium;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    gap: 1.5rem;
  }

  a {
    text-decoration: none;
    color: $text-color-medium;
    font-weight: 500;
    &:hover {
      color: $primary-color;
      text-decoration: underline;
    }
  }
}
</style>