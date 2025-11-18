<template>
  <section class="hero-section">
    <div class="hero-single-bg-image"></div> 
    
    <div class="hero-overlay"></div>

    <div class="hero-content">
      <h1 class="hero-title">
        <span 
          v-for="(word, wordIndex) in titleWords" 
          :key="'title-word-' + wordIndex" 
          class="word"
        >
          <span 
            v-for="(char, charIndex) in word" 
            :key="'title-char-' + wordIndex + '-' + charIndex" 
            class="char"
            :style="{ 'animation-delay': (0.1 * (wordIndex * 5 + charIndex)) + 's' }"
          >
            {{ char }}
          </span>
          <span v-if="wordIndex < titleWords.length - 1" class="char space">&nbsp;</span>
        </span>
      </h1>

      <h2 class="hero-subtitle">
        <span 
          v-for="(char, index) in subtitleChars" 
          :key="'subtitle-char-' + index" 
          class="sub-char"
          :style="{ 'animation-delay': (1.5 + 0.03 * index) + 's' }"
        >
          {{ char }}
        </span>
      </h2>

      <button class="cta-button" @click="goToVehicleList">
        Browse Vehicles <i class="bi bi-arrow-right"></i>
      </button>
    </div>
  </section>
</template>

<script>
export default {
  name: "HeroSection",
  data() {
    return {
      title: "Find Your Drive.",
      subtitle: "Discover the perfect vehicle for your next journey.",
      // Removed backgroundImages array and currentImageIndex, imageInterval
    };
  },
  computed: {
    titleWords() {
      return this.title.split(' ');
    },
    subtitleChars() {
      return this.subtitle.split('');
    }
  },
  // Removed mounted and beforeUnmount hooks
  methods: {
    goToVehicleList() {
      this.$router.push({ name: "VehicleList" });
    },
    // Removed startImageSlideshow method
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
  font-family: 'Nunito', sans-serif;
}

/* New: Single background image div */
.hero-single-bg-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=2070'); 
  background-size: cover;
  background-position: center;
  animation: zoom-in 15s ease-out forwards; /* Applied the zoom-in animation directly */
  z-index: 1;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 2;
}

.hero-content {
  position: relative;
  z-index: 3;
  max-width: 900px;
  padding: 0 1.5rem;
  box-sizing: border-box;
}

.hero-title {
  font-family: 'Playfair Display', serif;
  font-size: 4.8rem;
  font-weight: 700;
  text-shadow: 0 4px 15px rgba(0, 0, 0, 0.6);
  margin: 0;
  line-height: 1.1;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  white-space: pre-wrap;

  .word {
    display: inline-flex;
    perspective: 1000px;
  }

  .char {
    display: inline-block;
    opacity: 0;
    transform: translate3d(var(--x, 0px), var(--y, 0px), var(--z, 0px)) rotate(var(--rotate, 0deg));
    animation: text-reveal 1s cubic-bezier(0.23, 1, 0.32, 1) forwards;
    animation-fill-mode: both; 
  }

  .char.space {
    width: 0.5em;
  }

  @for $i from 0 through 50 {
    .char:nth-child(#{$i}) {
      --x: #{random(400) - 200}px;
      --y: #{random(300) - 150}px;
      --z: #{random(500) - 250}px;
      --rotate: #{random(360) - 180}deg;
    }
  }

  @media (max-width: 992px) {
    font-size: 3.8rem;
  }
  @media (max-width: 768px) {
    font-size: 3rem;
    line-height: 1.2;
  }
  @media (max-width: 576px) {
    font-size: 2.2rem;
    line-height: 1.3;
  }
}

.hero-subtitle {
  font-family: 'Nunito', sans-serif;
  font-size: 1.4rem;
  margin: 1.5rem 0 3rem 0;
  line-height: 1.6;
  opacity: 0.9;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
  display: inline-block;

  .sub-char {
    display: inline-block;
    opacity: 0;
    transform: translateY(20px);
    animation: subtitle-reveal 0.5s ease-out forwards;
    animation-fill-mode: both;
  }

  @media (max-width: 992px) {
    font-size: 1.2rem;
  }
  @media (max-width: 768px) {
    font-size: 1rem;
    margin: 1rem 0 2.5rem 0;
  }
  @media (max-width: 576px) {
    font-size: 0.9rem;
    margin: 0.8rem 0 2rem 0;
  }
}

.cta-button {
  background-color: #fff;
  color: #333;
  font-family: 'Nunito', sans-serif;
  font-size: 1.15rem;
  font-weight: 700;
  padding: 0.9rem 2.2rem;
  border: none;
  border-radius: 9999px;
  cursor: pointer;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
    background-color: #f0f0f0;
  }

  .bi {
    font-size: 1.2em;
  }
}

@keyframes text-reveal {
  from {
    opacity: 0;
    transform: translate3d(var(--x), var(--y), var(--z)) rotate(var(--rotate));
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0) rotate(0deg);
  }
}

@keyframes subtitle-reveal {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
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