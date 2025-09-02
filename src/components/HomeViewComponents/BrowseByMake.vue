<template>
  <section class="browse-by-make-section">
    <div class="section-header-wrapper">
      <div class="section-header">
        <h2 class="section-title">Browse by make</h2>
        <div class="navigation-arrows">
          <button @click="prevCategory" class="arrow-button">
            <i class="bi bi-chevron-left"></i>
          </button>
          <button @click="nextCategory" class="arrow-button">
            <i class="bi bi-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>

    <div class="category-card-display">
      <transition name="slide" mode="out-in">
        <div
          v-if="currentCategory"
          :key="currentCategory.title"
          class="category-card"
        >
          <div class="category-header-content">
            <h3 class="category-title">{{ currentCategory.title }}</h3>
            <p class="category-description">
              {{ currentCategory.description }}
            </p>
          </div>

          <div class="make-cards-container">
            <div
              v-for="make in currentCategory.makes"
              :key="make.name"
              class="make-card"
            >
              <img
                :src="make.imageUrl"
                :alt="make.name"
                class="make-image"
              />
              <div class="make-name">{{ make.name }}</div>
            </div>
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
      currentCategoryIndex: 0,
      // REMOVED: showAll data property is no longer needed
      categorizedMakes: [
        {
          title: 'Economy and Compact Cars',
          description:
            'These are the most popular and affordable choices, ideal for city driving and shorter trips.',
          makes: [
            {
              name: 'Toyota',
              imageUrl:
                'https://placehold.co/150x150/f0f0f0/888888?text=Toyota',
            },
            {
              name: 'Mitsubishi',
              imageUrl:
                'https://placehold.co/150x150/f0f0f0/888888?text=Mitsubishi',
            },
            {
              name: 'Honda',
              imageUrl:
                'https://placehold.co/150x150/f0f0f0/888888?text=Honda',
            },
            {
              name: 'Nissan',
              imageUrl:
                'https://placehold.co/150x150/f0f0f0/888888?text=Nissan',
            },
            {
              name: 'Hyundai',
              imageUrl:
                'https://placehold.co/150x150/f0f0f0/888888?text=Hyundai',
            },
          ],
        },
        {
          title: 'SUVs and Vans',
          description:
            'These are preferred for group travel, family outings, and longer road trips.',
          makes: [
            {
              name: 'Toyota',
              imageUrl:
                'https://placehold.co/150x150/f0f0f0/888888?text=Toyota',
            },
            {
              name: 'Honda',
              imageUrl:
                'https://placehold.co/150x150/f0f0f0/888888?text=Honda',
            },
            {
              name: 'Mitsubishi',
              imageUrl:
                'https://placehold.co/150x150/f0f0f0/888888?text=Mitsubishi',
            },
            {
              name: 'Ford',
              imageUrl: 'https://placehold.co/150x150/f0f0f0/888888?text=Ford',
            },
            {
              name: 'Nissan',
              imageUrl:
                'https://placehold.co/150x150/f0f0f0/888888?text=Nissan',
            },
            {
              name: 'Hyundai',
              imageUrl:
                'https://placehold.co/150x150/f0f0f0/888888?text=Hyundai',
            },
          ],
        },
        // ... (other categories)
      ],
    };
  },
  computed: {
    currentCategory() {
      return this.categorizedMakes[this.currentCategoryIndex];
    },
    // REMOVED: displayedMakes computed property is no longer needed
  },
  methods: {
    nextCategory() {
      const totalCategories = this.categorizedMakes.length;
      this.currentCategoryIndex =
        (this.currentCategoryIndex + 1) % totalCategories;
      // No longer need to reset showAll state
    },
    prevCategory() {
      const totalCategories = this.categorizedMakes.length;
      this.currentCategoryIndex =
        (this.currentCategoryIndex - 1 + totalCategories) % totalCategories;
      // No longer need to reset showAll state
    },
    // REMOVED: toggleShowAll method is no longer needed
  },
};
</script>

<style lang="scss" scoped>
.browse-by-make-section {
  /* UPDATED: Padding adjusted for parent-controlled centering */
  padding: 2rem 0;
  max-width: 100%;
  box-sizing: border-box;
  margin-bottom: 4rem;
}

.section-header-wrapper {
  /* UPDATED: Increased max-width for a wider layout */
  max-width: 1100px;
  width: 100%;
  margin: 0 auto 1.5rem;
  /* Added padding to align with the card when screen is smaller than max-width */
  padding: 0 1rem;
  box-sizing: border-box;
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
  padding: 0 1rem; /* Added horizontal padding */
  box-sizing: border-box;
}

.category-card {
  width: 100%;
  /* UPDATED: Increased max-width for a wider layout */
  max-width: 1100px;
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

/* REMOVED: Styles for the 'see more' button are no longer needed */

.slide-enter-active,
.slide-leave-active {
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