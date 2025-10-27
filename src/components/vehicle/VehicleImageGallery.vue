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

    <!-- Modal for All Photos -->
    <transition name="modal-bounce">
      <div v-if="isModalOpen" class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop>
          <button @click="closeModal" class="modal-close-button">&times;</button>

          <h3 class="modal-gallery-title">{{ vehicleMake }} {{ vehicleModel }} Photo Gallery</h3>
          
          <!-- Section 1: Main Exterior Photo (Common to both) -->
          <div class="modal-photo-section">
            <h4 class="modal-section-subtitle">Profile Photo</h4>
            <div class="modal-photo-grid single">
              <img
                :src="mainImage"
                :alt="`${vehicleMake} ${vehicleModel} - Main`"
                class="modal-image profile-image"
                @click="openFullScreen(mainImage)"
              />
            </div>
          </div>

          <!-- ================================== -->
          <!-- FOR VEHICLES (CARS)                -->
          <!-- ================================== -->
          <template v-if="!isMotorcycle">
            <!-- Section 2: Interior Photos -->
            <div v-if="interiorPhotos.length > 0" class="modal-photo-section">
              <h4 class="modal-section-subtitle">Interior & Detail Shots ({{ interiorPhotos.length }})</h4>
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

            <!-- Section 3: Other Exterior Photos -->
            <div v-if="otherExteriorPhotos.length > 0" class="modal-photo-section">
              <h4 class="modal-section-subtitle">Exterior Views ({{ otherExteriorPhotos.length }})</h4>
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
          </template>

          <!-- ================================== -->
          <!-- FOR MOTORCYCLES                    -->
          <!-- ================================== -->
          <template v-else>
             <div v-if="motorcycleGalleryImages.length > 0" class="modal-photo-section">
              <h4 class="modal-section-subtitle">Motorcycle Gallery ({{ motorcycleGalleryImages.length }})</h4>
              <div class="modal-photo-grid">
                <img
                  v-for="(image, index) in motorcycleGalleryImages"
                  :key="`motorcycle-gallery-${index}`"
                  :src="image"
                  alt="Motorcycle gallery photo"
                  class="modal-image"
                  @click="openFullScreen(image)"
                />
              </div>
            </div>
          </template>
          
        </div>
      </div>
    </transition>

    <!-- Full-Screen Slider Modal -->
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
        <div class="image-counter">
          {{ currentImageIndex + 1 }} / {{ allImagesForSlider.length }}
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'VehicleImageGallery',
  props: {
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
    // --- NEW PROP ---
    assetType: {
      type: String,
      default: 'vehicle', // 'vehicle' or 'motorcycle'
    }
  },
  data() {
    return {
      isModalOpen: false,
      isFullScreenOpen: false,
      currentImageIndex: 0,
    };
  },
  computed: {
    // --- NEW COMPUTED PROP ---
    isMotorcycle() {
      return this.assetType === 'motorcycle';
    },
    mainImage() {
      // Profile photo is always the first exterior photo
      return this.exteriorPhotos.length > 0
        ? this.exteriorPhotos[0]
        : 'https://placehold.co/800x600/e2e8f0/666666?text=No+Main+Image';
    },
    otherExteriorPhotos() {
      // All exterior photos *except* the main/first one
      return this.exteriorPhotos.slice(1);
    },
    // --- NEW COMPUTED PROP ---
    motorcycleGalleryImages() {
      // For motorcycles, gallery = all other exterior photos + all "interior" (detail) photos
      return [...this.otherExteriorPhotos, ...this.interiorPhotos];
    },
    displayThumbnails() {
      const placeholder =
        'https://placehold.co/400x300/e2e8f0/666666?text=Photo';
      
      let candidateImages = [
        // Candidate 1: First Interior Photo (or first detail shot)
        this.interiorPhotos[0] || placeholder,
        // Candidate 2: Second Exterior Photo (or second gallery shot)
        this.exteriorPhotos[1] || this.interiorPhotos[1] || placeholder,
      ];
      
      const filteredCandidates = candidateImages.filter((img, index) => img !== placeholder || index === 0);
      
      while (filteredCandidates.length < 2) {
          filteredCandidates.push(placeholder);
      }

      return filteredCandidates.slice(0, 2);
    },
    allImagesForSlider() {
      // This logic works for both, as it combines all unique photos
      const uniqueImages = new Set([...this.exteriorPhotos, ...this.interiorPhotos]);
      return Array.from(uniqueImages).filter(url => url);
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
      this.isModalOpen = false; 
      const index = this.allImagesForSlider.findIndex(
        (image) => image === clickedImageUrl
      );
      this.currentImageIndex = index !== -1 ? index : 0;
      this.isFullScreenOpen = true;
    },
    closeFullScreen() {
      this.isFullScreenOpen = false;
      this.currentImageIndex = 0;
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

// =================================================================
// PRIMARY LAYOUT & RESPONSIVENESS
// =================================================================
.vehicle-image-gallery {
  display: grid;
  grid-template-columns: 3fr 1fr; 
  grid-template-rows: 1fr;
  gap: 0.5rem;
  height: 500px;
  align-items: stretch;
  overflow: hidden;
  border-radius: $border-radius-lg;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 100px;
    height: 400px;
    gap: 0.25rem;
  }
}
.main-vehicle-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: $border-radius-md;
  cursor: pointer;
  transition: transform 0.3s ease;
  &:hover {
      transform: scale(1.01);
  }
}
.thumbnail-grid {
  display: grid;
  grid-template-rows: 1fr 1fr;
  gap: 0.5rem;
  
  @media (max-width: 768px) {
     grid-template-columns: 1fr 1fr;
     grid-template-rows: 1fr;
     gap: 0.25rem;
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
  transition: opacity 0.3s ease;
  &:hover {
      opacity: 0.85;
  }
}
.show-all-button {
  position: absolute;
  bottom: 0.5rem;
  right: 0.5rem;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: $border-radius-pill;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
  transition: background-color 0.2s;
  &:hover {
    background-color: $primary-color;
  }
}

// =================================================================
// MODAL STYLES (Gallery View)
// =================================================================
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  width: 95%;
  max-width: 1200px;
  max-height: 95vh;
  padding: 2.5rem;
  background: white;
  border-radius: $border-radius-xl;
  overflow-y: auto;
  box-shadow: $shadow-medium;
}
.modal-close-button {
  position: sticky;
  top: 0.5rem;
  right: 0.5rem;
  z-index: 1001;
  background: $text-color-medium;
  color: white;
  border: none;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  font-size: 1.5rem;
  line-height: 1;
  padding: 0;
  cursor: pointer;
  transition: background-color 0.2s;
  &:hover {
    background-color: $admin-color;
  }
}
/* Gallery Title Style */
.modal-gallery-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: $text-color-dark;
  margin-bottom: 2rem;
  border-bottom: 2px solid $border-color;
  padding-bottom: 0.5rem;
}
.modal-photo-section {
  margin-bottom: 3rem;
}
/* Section Subtitle Style */
.modal-section-subtitle {
  font-size: 1.25rem;
  font-weight: 600;
  color: $primary-color;
  margin-bottom: 1rem;
}
.modal-photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); 
  gap: 1rem;
}
.modal-image {
  width: 100%;
  height: 250px;
  object-fit: cover; 
  border-radius: $border-radius-md;
  box-shadow: $shadow-medium;
  transition: transform 0.2s ease, opacity 0.2s ease;
  cursor: zoom-in; /* Indicate clickable for full screen */
  &:hover {
      opacity: 0.95;
      transform: scale(1.01);
  }
  &.profile-image { /* Specific style for the main profile image in modal */
      grid-column: span 1; 
      max-height: 500px;
      object-fit: contain; /* Main profile image should fit entirely */
  }
}

// =================================================================
// TRANSITIONS
// =================================================================
/* Modal Bounce Entrance */
.modal-bounce-enter-active {
  transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.modal-bounce-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease-in;
}
.modal-bounce-enter-from,
.modal-bounce-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(20px);
}

/* Fullscreen Fade */
.fullscreen-fade-enter-active,
.fullscreen-fade-leave-active {
  transition: opacity 0.3s ease;
}
.fullscreen-fade-enter-from,
.fullscreen-fade-leave-to {
  opacity: 0;
}


// =================================================================
// FULLSCREEN SLIDER STYLES
// =================================================================
.fullscreen-overlay {
  position: fixed; /* Already fixed, but ensuring */
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.95); /* Darker overlay for focus */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}
.fullscreen-image {
  max-width: 90vw;
  max-height: 90vh;
  object-fit: contain; /* This is key: ensures the entire image is visible */
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
  border-radius: $border-radius-md;
}
.image-counter {
    position: absolute;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    color: white;
    font-size: 1.1rem; /* Slightly larger text */
    font-weight: 600;
    padding: 0.6rem 1.2rem; /* Larger pill background */
    background: rgba(0, 0, 0, 0.6); /* Slightly darker, more prominent pill */
    border-radius: $border-radius-pill;
    z-index: 2001; /* Ensure counter is above images */
}
.fullscreen-close-button {
  color: white;
  background-color: rgba(0, 0, 0, 0.5); /* Slightly more prominent background */
  position: absolute; /* Changed from top/right relative to parent */
  top: 1.5rem; /* Position from top */
  right: 1.5rem; /* Position from right */
  width: 45px; /* Larger close button */
  height: 45px;
  border-radius: 50%;
  font-size: 2.5rem; /* Larger symbol */
  line-height: 1;
  transition: background-color 0.2s;
  z-index: 2001; /* Ensure close button is above images */
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
  border: 1px solid rgba(255, 255, 255, 0.3); /* subtle border */
  &:hover {
    background-color: $admin-color; /* Change to admin color on hover */
    transform: scale(1.05); /* Slight scale on hover */
  }
}
.nav-button {
  background: rgba(255, 255, 255, 0.2); /* Semi-transparent white background */
  color: $text-color-dark; /* Dark arrow for contrast */
  width: 50px; /* Larger nav button */
  height: 50px;
  font-size: 2.5rem;
  line-height: 1;
  border-radius: 50%;
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: background-color 0.2s, color 0.2s;
  z-index: 2001; /* Ensure nav buttons are above images */
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);

  &:hover {
    background-color: rgba(255, 255, 255, 0.5); /* Brighter white on hover */
    color: $primary-color;
  }
}
.prev-button { left: 1rem; }
.next-button { right: 1rem; }

// Mobile adjustments
@media (max-width: 576px) {
  .modal-content {
    padding: 1rem;
  }
  .modal-section-title {
    font-size: 1.4rem;
  }
  .fullscreen-close-button {
      top: 1rem;
      right: 1rem;
      width: 35px; /* Slightly smaller on mobile */
      height: 35px;
      font-size: 1.8rem;
  }
  .nav-button {
      width: 35px;
      height: 35px;
      font-size: 1.8rem;
  }
  .image-counter {
      bottom: 1rem;
  }
  .prev-button { left: 0.5rem; }
  .next-button { right: 0.5rem; }
}
</style>

