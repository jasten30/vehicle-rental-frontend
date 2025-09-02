<template>
  <section class="browse-by-city-section">
    <div class="section-header">
      <h2 class="section-title">Browse by city</h2>
      <div class="navigation-arrows">
        <button @click="scrollLeft" class="arrow-button">
          <i class="bi bi-chevron-left"></i>
        </button>
        <button @click="scrollRight" class="arrow-button">
          <i class="bi bi-chevron-right"></i>
        </button>
      </div>
    </div>

    <div class="category-card">
      <div class="city-cards-container" ref="cityContainer">
        <div v-for="city in allCities" :key="city.name" class="city-card">
          <div class="city-image-container">
            <img :src="city.imageUrl" :alt="city.name" class="city-image" />
            <div class="city-image-overlay">
              <span class="city-overlay-text">{{ city.name }}</span>
            </div>
          </div>
          <div class="city-name">{{ city.name }}</div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'BrowseByCity',
  data() {
    return {
      allCities: [
        {
          name: 'Bogo City',
          imageUrl: 'https://placehold.co/150x150/f0f0f0/888888?text=Bogo',
        },
        {
          name: 'Carcar City',
          imageUrl: 'https://placehold.co/150x150/f0f0f0/888888?text=Carcar',
        },
        {
          name: 'Cebu City',
          imageUrl: 'https://placehold.co/150x150/f0f0f0/888888?text=Cebu',
        },
        {
          name: 'Danao City',
          imageUrl: 'https://placehold.co/150x150/f0f0f0/888888?text=Danao',
        },
        {
          name: 'Lapu-Lapu City',
          imageUrl:
            'https://placehold.co/150x150/f0f0f0/888888?text=Lapu-Lapu',
        },
        {
          name: 'Mandaue City',
          imageUrl: 'https://placehold.co/150x150/f0f0f0/888888?text=Mandaue',
        },
        {
          name: 'Naga City',
          imageUrl: 'https://placehold.co/150x150/f0f0f0/888888?text=Naga',
        },
        {
          name: 'Talisay City',
          imageUrl: 'https://placehold.co/150x150/f0f0f0/888888?text=Talisay',
        },
        {
          name: 'Toledo City',
          imageUrl: 'https://placehold.co/150x150/f0f0f0/888888?text=Toledo',
        },
      ],
    };
  },
  methods: {
    scrollRight() {
      const container = this.$refs.cityContainer;
      container.scrollBy({
        left: 300, // Increased scroll distance for wider view
        behavior: 'smooth',
      });
    },
    scrollLeft() {
      const container = this.$refs.cityContainer;
      container.scrollBy({
        left: -300, // Increased scroll distance for wider view
        behavior: 'smooth',
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.browse-by-city-section {
  padding: 2rem;
  max-width: 100%;
  box-sizing: border-box;
  margin-bottom: 4rem;
  background-color: rgb(255, 255, 255);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  /* UPDATED: Increased max-width from 800px to 1100px */
  max-width: 1100px;
  margin: 0 auto 1.5rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
  margin: 0;
}

.navigation-arrows {
  display: flex;
  gap: 0.5rem;
}

.arrow-button {
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: box-shadow 0.2s ease-in-out, transform 0.2s ease-in-out;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }

  i {
    font-size: 1rem;
    color: #555;
  }
}

.category-card {
  width: 100%;
  /* UPDATED: Increased max-width from 800px to 1100px */
  max-width: 1100px;
  margin: 0 auto;
  background-color: #f9f9f9;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
  overflow-x: hidden;
}

.city-cards-container {
  display: flex;
  flex-wrap: nowrap;
  gap: 1.5rem;
  overflow-x: auto;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 1.5rem; /* For spacing if scrollbar is visible on some systems */
}

/* Hide the scrollbar for a cleaner look */
.city-cards-container::-webkit-scrollbar {
  display: none;
}
.city-cards-container {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}

.city-card {
  display: inline-block;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  text-decoration: none;
  color: inherit;
  cursor: pointer;
  width: 100px;
}

.city-image-container {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #ddd;
  transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
}

.city-card:hover .city-image-container {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.city-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.city-image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.85);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
}

.city-card:hover .city-image-overlay {
  opacity: 1;
}

.city-overlay-text {
  font-weight: bold;
  font-size: 1rem;
  color: #333;
  text-align: center;
  padding: 0 5px;
  white-space: normal;
}

.city-name {
  margin-top: 0.75rem;
  font-weight: 500;
  font-size: 1rem;
  color: #333;
}
</style>