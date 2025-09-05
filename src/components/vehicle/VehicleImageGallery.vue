<template>
  <div class="vehicle-image-gallery">
    <img
      :src="mainImage"
      :alt="`${vehicleMake} ${vehicleModel}`"
      class="main-vehicle-image"
      @click="openModal"
      @error="
        $event.target.src =
          'https://placehold.co/800x600/e2e8f0/666666?text=Image+Not+Found'
      "
    />

    <div class="thumbnail-grid">
      <div
        v-for="(thumb, index) in displayThumbnails"
        :key="index"
        class="thumbnail-container"
        @click="openModal"
      >
        <img :src="thumb" alt="Vehicle thumbnail" class="thumbnail-image" />
        <button
          v-if="index === 1"
          @click.stop="openModal"
          class="show-all-button"
        >
          Show all photos
        </button>
      </div>
    </div>

    <transition name="modal-fade">
      <div v-if="isModalOpen" class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop>
          <button @click="closeModal" class="modal-close-button">&times;</button>

          <div class="modal-photo-section">
            <h3 class="modal-section-title">Main Photo</h3>
            <div class="modal-photo-grid single">
              <img
                :src="mainImage"
                :alt="`${vehicleMake} ${vehicleModel}`"
                class="modal-image"
                @click="openFullScreen(mainImage)"
              />
            </div>
          </div>

          <div v-if="interiorPhotos.length > 0" class="modal-photo-section">
            <h3 class="modal-section-title">Interior Photos</h3>
            <div class="modal-photo-grid">
              <img
                v-for="(image, index) in interiorPhotos"
                :key="`interior-${index}`"
                :src="image"
                alt="Vehicle interior"
                class="modal-image"
                @click="openFullScreen(image)"
              />
            </div>
          </div>

          <div v-if="otherExteriorPhotos.length > 0" class="modal-photo-section">
            <h3 class="modal-section-title">Exterior Photos</h3>
            <div class="modal-photo-grid">
              <img
                v-for="(image, index) in otherExteriorPhotos"
                :key="`exterior-${index}`"
                :src="image"
                alt="Vehicle exterior"
                class="modal-image"
                @click="openFullScreen(image)"
              />
            </div>
          </div>
        </div>
      </div>
    </transition>

    <transition name="fullscreen-fade">
      <div
        v-if="isFullScreenOpen"
        class="fullscreen-overlay"
        @click="closeFullScreen"
      >
        <button @click.stop="closeFullScreen" class="fullscreen-close-button">
          &times;
        </button>
        <button @click.stop="prevImage" class="nav-button prev-button">
          &#10094;
        </button>
        <img
          :src="allImagesForSlider[currentImageIndex]"
          class="fullscreen-image"
          @click.stop
        />
        <button @click.stop="nextImage" class="nav-button next-button">
          &#10095;
        </button>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'VehicleImageGallery',
  props: {
    // Props are updated to be more semantic
    exteriorPhotos: {
      type: Array,
      default: () => [],
    },
    interiorPhotos: {
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
    mainImage() {
      return this.exteriorPhotos.length > 0
        ? this.exteriorPhotos[0]
        : 'https://placehold.co/800x600/e2e8f0/666666?text=No+Main+Image';
    },
    otherExteriorPhotos() {
      return this.exteriorPhotos.slice(1);
    },
    displayThumbnails() {
      const thumbs = [];
      const placeholder =
        'https://placehold.co/400x300/e2e8f0/666666?text=Photo';
      // First thumbnail is the first interior photo
      thumbs.push(
        this.interiorPhotos.length > 0 ? this.interiorPhotos[0] : placeholder
      );
      // Second thumbnail is the second exterior photo
      thumbs.push(
        this.exteriorPhotos.length > 1 ? this.exteriorPhotos[1] : placeholder
      );
      return thumbs;
    },
    allImagesForSlider() {
      return [...this.exteriorPhotos, ...this.interiorPhotos];
    },
  },
  methods: {
    openModal() {
      this.isModalOpen = true;
    },
    closeModal() {
      this.isModalOpen = false;
    },
    openFullScreen(clickedImageUrl) {
      const index = this.allImagesForSlider.findIndex(
        (image) => image === clickedImageUrl
      );
      this.currentImageIndex = index !== -1 ? index : 0;
      this.isFullScreenOpen = true;
    },
    closeFullScreen() {
      this.isFullScreenOpen = false;
    },
    nextImage() {
      this.currentImageIndex =
        (this.currentImageIndex + 1) % this.allImagesForSlider.length;
    },
    prevImage() {
      this.currentImageIndex =
        (this.currentImageIndex - 1 + this.allImagesForSlider.length) %
        this.allImagesForSlider.length;
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../../assets/styles/variables.scss';

/* On-page grid styles (unchanged) */
.vehicle-image-gallery {
  display: grid;
  grid-template-columns: 3fr 1fr;
  grid-template-rows: 1fr;
  gap: 0.5rem;
  align-items: stretch;
  overflow: hidden;
}
.main-vehicle-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: $border-radius-md;
  cursor: pointer;
}
.thumbnail-grid {
  display: grid;
  grid-template-rows: 1fr 1fr;
  gap: 0.5rem;
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
  cursor: pointer;
}

/* NEW: Modal Content Styles */
.modal-photo-section {
  margin-bottom: 2rem;
}
.modal-section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: $text-color-dark;
  margin-bottom: 1rem;
}
.modal-photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  &.single {
    grid-template-columns: 1fr;
    img {
      max-height: 500px;
    }
  }
}
.modal-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: $border-radius-md;
  cursor: pointer;
}

/* Modal Overlay Styles (unchanged) */
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
  width: 90%;
  max-width: 1200px;
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
  font-size: 2rem;
  cursor: pointer;
}

/* Full-Screen Slider Styles (unchanged) */
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
  max-width: 90vw;
  max-height: 90vh;
  object-fit: contain;
}
.fullscreen-close-button {
  position: absolute;
  top: 1rem;
  right: 2rem;
  color: white;
  font-size: 3rem;
  background: none;
  border: none;
  cursor: pointer;
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
}
.prev-button { left: 1rem; }
.next-button { right: 1rem; }
.modal-fade-enter-active, .modal-fade-leave-active,
.fullscreen-fade-enter-active, .fullscreen-fade-leave-active {
  transition: opacity 0.3s ease;
}
.modal-fade-enter-from, .modal-fade-leave-to,
.fullscreen-fade-enter-from, .fullscreen-fade-leave-to {
  opacity: 0;
}
</style>