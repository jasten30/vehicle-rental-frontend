<!-- vehicle-rental-frontend/src/components/BrowseByMake.vue - Browse by Make component -->
<template>
  <section class="browse-by-make-section">
    <!-- Header with title and navigation arrows, now aligned with the card -->
    <div class="section-header-wrapper">
      <div class="section-header">
        <h2 class="section-title">Browse by make</h2>
        <div class="navigation-arrows">
          <!-- Previous Category Button -->
          <button @click="prevCategory" class="arrow-button">
            <i class="bi bi-chevron-left"></i>
          </button>
          <!-- Next Category Button -->
          <button @click="nextCategory" class="arrow-button">
            <i class="bi bi-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>
    
    <!-- Single Card Display Area with slide transition -->
    <div class="category-card-display">
      <transition name="slide" mode="out-in">
        <!-- We display a single card based on the currentCategoryIndex -->
        <div v-if="currentCategory" :key="currentCategory.title" class="category-card">
          <!-- Category Header -->
          <div class="category-header-content">
            <h3 class="category-title">{{ currentCategory.title }}</h3>
            <p class="category-description">{{ currentCategory.description }}</p>
          </div>
          
          <!-- Grid layout for the makes within the card -->
          <div class="make-cards-container">
            <div v-for="make in displayedMakes" :key="make.name" class="make-card">
              <!-- Vehicle Image -->
              <img :src="make.imageUrl" :alt="make.name" class="make-image">
              <!-- Make Name -->
              <div class="make-name">{{ make.name }}</div>
            </div>
          </div>

          <!-- The "See more" button, only shown if there are more than 4 items -->
          <div v-if="!showAll && currentCategory.makes.length > 4" class="see-more-container">
            <button @click="toggleShowAll" class="see-more-button">
              See more
            </button>
          </div>
        </div>
      </transition>
    </div>
  </section>
</template>

<script>
export default {
  name: 'BrowseByMake',
  data() {
    return {
      // The state variable to control which card is visible.
      currentCategoryIndex: 0,
      // The state to control whether to show all items or just the first four.
      showAll: false,
      
      // Data remains the same.
      categorizedMakes: [
        {
          title: 'Economy and Compact Cars',
          description: 'These are the most popular and affordable choices, ideal for city driving and shorter trips.',
          makes: [
            { name: 'Toyota', imageUrl: 'https://placehold.co/150x150/f0f0f0/888888?text=Toyota' },
            { name: 'Mitsubishi', imageUrl: 'https://placehold.co/150x150/f0f0f0/888888?text=Mitsubishi' },
            { name: 'Honda', imageUrl: 'https://placehold.co/150x150/f0f0f0/888888?text=Honda' },
            { name: 'Nissan', imageUrl: 'https://placehold.co/150x150/f0f0f0/888888?text=Nissan' },
            { name: 'Hyundai', imageUrl: 'https://placehold.co/150x150/f0f0f0/888888?text=Hyundai' },
          ],
        },
        {
          title: 'SUVs and Vans',
          description: 'These are preferred for group travel, family outings, and longer road trips, especially for exploring outside of major cities.',
          makes: [
            { name: 'Toyota', imageUrl: 'https://placehold.co/150x150/f0f0f0/888888?text=Toyota' },
            { name: 'Honda', imageUrl: 'https://placehold.co/150x150/f0f0f0/888888?text=Honda' },
            { name: 'Mitsubishi', imageUrl: 'https://placehold.co/150x150/f0f0f0/888888?text=Mitsubishi' },
            { name: 'Ford', imageUrl: 'https://placehold.co/150x150/f0f0f0/888888?text=Ford' },
            { name: 'Nissan', imageUrl: 'https://placehold.co/150x150/f0f0f0/888888?text=Nissan' },
            { name: 'Hyundai', imageUrl: 'https://placehold.co/150x150/f0f0f0/888888?text=Hyundai' },
          ],
        },
        {
          title: 'Luxury and Premium Vehicles',
          description: 'For special occasions, business trips, or a more comfortable travel experience, some rental companies offer premium makes.',
          makes: [
            { name: 'BMW', imageUrl: 'https://placehold.co/150x150/f0f0f0/888888?text=BMW' },
            { name: 'Mercedes-Benz', imageUrl: 'https://placehold.co/150x150/f0f0f0/888888?text=MBenz' },
            { name: 'Rolls-Royce', imageUrl: 'https://placehold.co/150x150/f0f0f0/888888?text=RR' },
            { name: 'Audi', imageUrl: 'https://placehold.co/150x150/f0f0f0/888888?text=Audi' },
          ],
        },
        {
          title: 'Specialty Vehicles',
          description: 'You may also find these for specific purposes like large group transportation or rugged travel.',
          makes: [
            { name: 'Isuzu', imageUrl: 'https://placehold.co/150x150/f0f0f0/888888?text=Isuzu' },
            { name: 'Suzuki', imageUrl: 'https://placehold.co/150x150/f0f0f0/888888?text=Suzuki' },
            { name: 'Kia', imageUrl: 'https://placehold.co/150x150/f0f0f0/888888?text=Kia' },
          ],
        },
      ],
    };
  },
  computed: {
    // A computed property to get the currently selected category object.
    currentCategory() {
      return this.categorizedMakes[this.currentCategoryIndex];
    },
    // A computed property to return either the limited or full list of makes.
    displayedMakes() {
      if (this.showAll) {
        return this.currentCategory.makes;
      } else {
        return this.currentCategory.makes.slice(0, 4);
      }
    },
  },
  methods: {
    /**
     * Increments the category index, wrapping around to the first category if at the end.
     * Also resets the "show all" state.
     */
    nextCategory() {
      const totalCategories = this.categorizedMakes.length;
      this.currentCategoryIndex = (this.currentCategoryIndex + 1) % totalCategories;
      this.showAll = false; // Reset state for the new category
    },
    /**
     * Decrements the category index, wrapping around to the last category if at the beginning.
     * Also resets the "show all" state.
     */
    prevCategory() {
      const totalCategories = this.categorizedMakes.length;
      this.currentCategoryIndex = (this.currentCategoryIndex - 1 + totalCategories) % totalCategories;
      this.showAll = false; // Reset state for the new category
    },
    /**
     * Toggles the showAll state to expand or collapse the list.
     */
    toggleShowAll() {
      this.showAll = !this.showAll;
    },
  },
};
</script>

<style lang="scss" scoped>
/*
  The 'scoped' attribute ensures that these styles only apply to this component.
*/
.browse-by-make-section {
  padding: 2rem; /* The main container now has padding */
  max-width: 100%;
  box-sizing: border-box;
  margin-bottom: 4rem; /* Added margin for a gap between sections */
}

/* New wrapper to handle the positioning of the header */
.section-header-wrapper {
  max-width: 800px; /* Align with the card below */
  width: 100%;
  margin: 0 auto 1.5rem; /* Center and provide bottom margin */
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.category-card-display {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0; /* Removed padding */
  overflow: visible; /* Changed from hidden to visible */
}

.category-card {
  width: 100%;
  max-width: 800px;
  background-color: #f9f9f9;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
}

.category-header-content {
  margin-bottom: 1.5rem;
}

.category-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
}

.category-description {
  font-size: 0.9rem;
  color: #666;
  margin: 0;
}

/* Updated to a grid layout to fit all items */
.make-cards-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1.5rem;
  justify-items: center;
}

.make-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  text-decoration: none;
  color: inherit;
  cursor: pointer;
}

.make-image {
  width: 150px;
  height: 150px;
  border-radius: 0.75rem;
  object-fit: cover;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
  }
}

.make-name {
  margin-top: 0.75rem;
  font-weight: 500;
  font-size: 1rem;
  color: #333;
}

/* The 'See more' button styling */
.see-more-container {
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
}

.see-more-button {
  background-color: rgba(255, 0, 0, 0.1); /* Red with 10% opacity */
  border: 1px solid rgba(255, 0, 0, 0.3); /* A slightly darker, more visible red border */
  color: #333;
  padding: 0.75rem 2rem;
  border-radius: 9999px; /* This makes it a pill shape */
  cursor: pointer;
  transition: background-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;

  &:hover {
    background-color: rgba(255, 0, 0, 0.2);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  }
}

/* CSS for the sliding transition */
.slide-enter-active, .slide-leave-active {
  transition: all 0.5s ease-in-out;
}

.slide-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}
</style>
