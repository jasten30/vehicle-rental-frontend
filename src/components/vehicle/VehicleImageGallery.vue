<template>
  <div class="vehicle-image-gallery">
    <!-- Main Image -->
    <img :src="mainImageUrl || getPlaceholderImage(800, 600, 'ffffff', '333333', 'No Image')"
      :alt="`${vehicleMake} ${vehicleModel}`"
      class="main-vehicle-image"
      @click="openModal"
      @error="$event.target.src = getPlaceholderImage(800, 600, 'ffffff', '333333', 'No Image')">
    
    <!-- Thumbnail Grid -->
    <div class="thumbnail-grid">
      <div v-for="(thumb, index) in thumbnailUrls.slice(0, 2)" :key="index" class="thumbnail-container" @click="openModal">
        <img :src="thumb" alt="Vehicle thumbnail" class="thumbnail-image">
        <!-- The show-all-button is now on the second thumbnail (index 1) -->
        <button v-if="index === 1" @click.stop="openModal" class="show-all-button">
          Show all photos
        </button>
      </div>
    </div>

    <!-- The Main Modal (Masonry Gallery) -->
    <transition name="modal-fade">
      <div v-if="isModalOpen" class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop>
          <button @click="closeModal" class="modal-close-button">&times;</button>
          <div class="modal-image-grid">
            <img v-for="(image, index) in allImages" 
              :key="index"
              :src="image" 
              :alt="`Vehicle photo ${index + 1}`" 
              class="modal-image"
              @click="openFullScreen(index)">
          </div>
        </div>
      </div>
    </transition>

    <!-- The Full-Screen Image Modal -->
    <transition name="fullscreen-fade">
      <div v-if="isFullScreenOpen" class="fullscreen-overlay" @click="closeFullScreen">
        <button @click.stop="closeFullScreen" class="fullscreen-close-button">&times;</button>
        <button @click.stop="prevImage" class="nav-button prev-button">&#10094;</button>
        <img :src="allImages[currentImageIndex]" class="fullscreen-image" @click.stop>
        <button @click.stop="nextImage" class="nav-button next-button">&#10095;</button>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'VehicleImageGallery',
  props: {
    mainImageUrl: {
      type: String,
      default: '',
    },
    thumbnailUrls: {
      type: Array,
      default: () => [],
    },
    vehicleMake: {
      type: String,
      default: '',
    },
    vehicleModel: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      isModalOpen: false,
      isFullScreenOpen: false,
      currentImageIndex: 0,
    };
  },
  computed: {
    allImages() {
      // Combines the main image with the thumbnails for the modal view
      const images = [...this.thumbnailUrls];
      if (this.mainImageUrl) {
        images.unshift(this.mainImageUrl);
      }
      return images;
    },
  },
  methods: {
    getPlaceholderImage(width, height, bgColor, textColor, text) {
      // The background color is now 'ffffff' (white) to match the page background
      return `https://placehold.co/${width}x${height}/${bgColor}/${textColor}?text=${text}`;
    },
    openModal() {
      this.isModalOpen = true;
    },
    closeModal() {
      this.isModalOpen = false;
    },
    openFullScreen(index) {
      this.currentImageIndex = index;
      this.isFullScreenOpen = true;
    },
    closeFullScreen() {
      this.isFullScreenOpen = false;
    },
    nextImage() {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.allImages.length;
    },
    prevImage() {
      this.currentImageIndex = (this.currentImageIndex - 1 + this.allImages.length) % this.allImages.length;
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../../assets/styles/variables.scss';

.vehicle-image-gallery {
  display: grid;
  grid-template-columns: 3fr 1fr;
  grid-template-rows: 1fr;
  gap: 0.5rem;
  align-items: stretch;
  overflow: hidden;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    grid-template-rows: auto;
  }
}

.main-vehicle-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: $border-radius-md;
  box-shadow: $shadow-medium;
  grid-column: 1 / 2;
  grid-row: 1 / 2;
  cursor: pointer;

  @media (max-width: 768px) {
    grid-column: 1 / 2;
    grid-row: auto;
    height: 300px;
  }
}

.thumbnail-grid {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 0.5rem;
  
  @media (max-width: 768px) {
    display: none;
  }
}

.thumbnail-container {
  position: relative;
  overflow: hidden;
  border-radius: $border-radius-md;
  cursor: pointer;
}

.thumbnail-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.thumbnail-container:hover .thumbnail-image {
  transform: scale(1.05);
}

.show-all-button {
  position: absolute;
  bottom: 0.5rem;
  right: 0.5rem;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  z-index: 10;
}

.show-all-button:hover {
  background-color: rgba(0, 0, 0, 0.9);
}

/* Main Modal (Masonry) Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  position: relative;
  width: 90%;
  max-height: 90vh;
  padding: 2rem;
  background: white;
  border-radius: $border-radius-lg;
  overflow-y: auto;
}

.modal-close-button {
  position: absolute;
  top: 1rem;
  right: 1.5rem;
  background: none;
  border: none;
  color: #333;
  font-size: 2rem;
  font-weight: bold;
  cursor: pointer;
  z-index: 1001;
}

.modal-image-grid {
  column-count: 3;
  column-gap: 1rem;

  @media (max-width: 1024px) {
    column-count: 2;
  }
  @media (max-width: 768px) {
    column-count: 1;
  }
}

.modal-image {
  width: 100%;
  height: auto;
  margin-bottom: 1rem;
  border-radius: $border-radius-md;
  object-fit: cover;
  break-inside: avoid-column;
  cursor: pointer;
}

/* Full-Screen Modal Styles */
.fullscreen-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.95);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.fullscreen-image {
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
}

.fullscreen-close-button {
  position: absolute;
  top: 1rem;
  right: 2rem;
  background: none;
  border: none;
  color: white;
  font-size: 3rem;
  font-weight: bold;
  cursor: pointer;
  z-index: 2001;
}

.nav-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  padding: 1rem;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.5rem;
  z-index: 2001;
  transition: background-color 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.4);
  }
}

.prev-button {
  left: 1rem;
}

.next-button {
  right: 1rem;
}

/* Modal and Full-screen Transitions */
.modal-fade-enter-active, .modal-fade-leave-active,
.fullscreen-fade-enter-active, .fullscreen-fade-leave-active {
  transition: opacity 0.3s ease;
}
.modal-fade-enter, .modal-fade-leave-to,
.fullscreen-fade-enter, .fullscreen-fade-leave-to {
  opacity: 0;
}
</style>
