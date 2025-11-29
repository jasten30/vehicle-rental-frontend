<template>
  <div class="vehicle-image-gallery" :class="galleryLayoutClass">
    <img
      :src="mainImage"
      :alt="`${vehicleMake} ${vehicleModel}`"
      class="main-vehicle-image"
      @click="openModal"
      @error="
        $event.target.src =
          'https://placehold.co/800x600/e2e8f0/666666?text=No+Image'
      "
    />

    <div v-if="displayThumbnails.length > 0" class="thumbnail-grid">
      <div
        v-for="(thumb, index) in displayThumbnails"
        :key="index"
        class="thumbnail-container"
        @click="openModal"
      >
        <img
          :src="thumb"
          alt="Vehicle thumbnail"
          class="thumbnail-image"
          @error="
            $event.target.src =
              'https://placehold.co/400x300/e2e8f0/666666?text=No+Image'
          "
        />

        <button
          v-if="index === displayThumbnails.length - 1 && totalImageCount > 3"
          @click.stop="openModal"
          class="show-all-button"
        >
          <i class="bi bi-grid-3x3-gap-fill"></i> Show all photos
        </button>
      </div>
    </div>

    <transition name="modal-bounce">
      <div v-if="isModalOpen" class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop>
          <button @click="closeModal" class="modal-close-button">
            &times;
          </button>

          <h3 class="modal-gallery-title">
            {{ vehicleMake }} {{ vehicleModel }} Gallery
          </h3>

          <div class="modal-photo-section">
            <h4 class="modal-section-subtitle">Profile Photo</h4>
            <div class="modal-photo-grid single">
              <img
                :src="mainImage"
                class="modal-image profile-image"
                @click="openFullScreen(mainImage)"
              />
            </div>
          </div>

          <template v-if="isMotorcycle">
            <div class="modal-photo-section">
              <h4 class="modal-section-subtitle">
                Gallery Photos ({{ motorcycleGalleryImages.length }})
              </h4>
              <div
                v-if="motorcycleGalleryImages.length > 0"
                class="modal-photo-grid"
              >
                <img
                  v-for="(image, index) in motorcycleGalleryImages"
                  :key="`moto-${index}`"
                  :src="image"
                  class="modal-image"
                  @click="openFullScreen(image)"
                />
              </div>
              <p v-else class="no-photos-text">
                No additional photos available.
              </p>
            </div>
          </template>

          <template v-else>
            <div v-if="interiorPhotos.length > 0" class="modal-photo-section">
              <h4 class="modal-section-subtitle">Interior & Detail Shots</h4>
              <div class="modal-photo-grid">
                <img
                  v-for="(image, index) in interiorPhotos"
                  :key="`interior-${index}`"
                  :src="image"
                  class="modal-image"
                  @click="openFullScreen(image)"
                />
              </div>
            </div>

            <div
              v-if="otherExteriorPhotos.length > 0"
              class="modal-photo-section"
            >
              <h4 class="modal-section-subtitle">Exterior Views</h4>
              <div class="modal-photo-grid">
                <img
                  v-for="(image, index) in otherExteriorPhotos"
                  :key="`exterior-${index}`"
                  :src="image"
                  class="modal-image"
                  @click="openFullScreen(image)"
                />
              </div>
            </div>
          </template>
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
        <div class="image-counter">
          {{ currentImageIndex + 1 }} / {{ allImagesForSlider.length }}
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: "VehicleImageGallery",
  props: {
    exteriorPhotos: { type: Array, default: () => [] },
    interiorPhotos: { type: Array, default: () => [] },
    vehicleMake: { type: String, default: "" },
    vehicleModel: { type: String, default: "" },
    assetType: { type: String, default: "vehicle" },
  },
  data() {
    return {
      isModalOpen: false,
      isFullScreenOpen: false,
      currentImageIndex: 0,
    };
  },
  computed: {
    isMotorcycle() {
      return (this.assetType || "").toLowerCase() === "motorcycle";
    },
    mainImage() {
      if (this.exteriorPhotos && this.exteriorPhotos.length > 0) {
        return this.exteriorPhotos[0];
      }
      return "https://placehold.co/800x600/e2e8f0/666666?text=No+Image";
    },
    otherExteriorPhotos() {
      if (!this.exteriorPhotos) return [];
      return this.exteriorPhotos.slice(1);
    },
    motorcycleGalleryImages() {
      const restOfExterior = this.otherExteriorPhotos;
      const interior = this.interiorPhotos || [];
      return [...restOfExterior, ...interior];
    },

    // --- FIX: RETURN ONLY REAL IMAGES ---
    displayThumbnails() {
      let thumbnails = [];

      if (this.isMotorcycle) {
        // For bikes: Get next 2 images from exterior array
        // Do NOT add placeholders if they don't exist
        if (this.exteriorPhotos.length > 1)
          thumbnails.push(this.exteriorPhotos[1]);
        if (this.exteriorPhotos.length > 2)
          thumbnails.push(this.exteriorPhotos[2]);
      } else {
        // For cars: Try Interior[0] then Exterior[1]
        if (this.interiorPhotos && this.interiorPhotos.length > 0) {
          thumbnails.push(this.interiorPhotos[0]);
        }
        if (this.exteriorPhotos && this.exteriorPhotos.length > 1) {
          thumbnails.push(this.exteriorPhotos[1]);
        }
        // If we still have less than 2, fill with whatever is available from exterior
        if (thumbnails.length < 2 && this.exteriorPhotos.length > 2) {
          thumbnails.push(this.exteriorPhotos[2]);
        }
        // Limit to 2 max
        thumbnails = thumbnails.slice(0, 2);
      }
      return thumbnails;
    },

    totalImageCount() {
      return (
        (this.exteriorPhotos?.length || 0) + (this.interiorPhotos?.length || 0)
      );
    },

    // Used for CSS class
    galleryLayoutClass() {
      const thumbCount = this.displayThumbnails.length;
      if (thumbCount === 0) return "layout-single";
      if (thumbCount === 1) return "layout-split-half";
      return "layout-standard";
    },

    allImagesForSlider() {
      const uniqueImages = new Set([
        ...(this.exteriorPhotos || []),
        ...(this.interiorPhotos || []),
      ]);
      return Array.from(uniqueImages).filter((url) => url);
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
      if (this.allImagesForSlider.length === 0) return;
      this.currentImageIndex =
        (this.currentImageIndex + 1) % this.allImagesForSlider.length;
    },
    prevImage() {
      if (this.allImagesForSlider.length === 0) return;
      this.currentImageIndex =
        (this.currentImageIndex - 1 + this.allImagesForSlider.length) %
        this.allImagesForSlider.length;
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/styles/variables.scss";

// --- Dynamic Gallery Layouts ---

// Default grid container
.vehicle-image-gallery {
  display: grid;
  gap: 0.5rem;
  height: 450px; /* Desktop Height */
  overflow: hidden;
  border-radius: 12px;
  width: 100%;

  // 1. Standard Layout (1 Big + 2 Small)
  &.layout-standard {
    grid-template-columns: 2fr 1fr;
  }

  // 2. Single Image Layout (1 Big, No Thumbnails)
  &.layout-single {
    grid-template-columns: 1fr;
    .thumbnail-grid {
      display: none;
    }
  }

  // 3. Split Half Layout
  &.layout-split-half {
    grid-template-columns: 1fr 1fr;
    .thumbnail-grid {
      grid-template-rows: 1fr;
    }
  }

  // --- MOBILE RESPONSIVENESS ---
  @media (max-width: 768px) {
    height: 300px; /* Smaller height for mobile */
    grid-template-columns: 1fr !important; /* Stack vertically if needed, or hide thumbnails */

    &.layout-standard {
      grid-template-columns: 1fr; /* Only show main image big */
      grid-template-rows: 1fr; /* Hide thumbnails visually or stack below */
      /* Note: You might want to hide .thumbnail-grid on mobile to save space */
    }

    /* Hide the side grid on mobile for a cleaner look */
    .thumbnail-grid {
      display: none;
    }
  }
}

.main-vehicle-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  cursor: pointer;
  transition: transform 0.3s ease;
  &:hover {
    transform: scale(1.02);
  }
}

.thumbnail-grid {
  display: grid;
  grid-template-rows: 1fr 1fr;
  gap: 0.5rem;
  height: 100%;

  /* On Tablet (between mobile and desktop), maybe show them? */
  @media (min-width: 769px) {
    display: grid;
  }
}

.thumbnail-container {
  position: relative;
  overflow: hidden;
  cursor: pointer;
  height: 100%;
  width: 100%;
}

.thumbnail-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.3s ease;
  &:hover {
    opacity: 0.9;
  }
}

.show-all-button {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  background-color: rgba(255, 255, 255, 0.9);
  color: $text-color-dark;
  border: 1px solid #e5e7eb;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
  z-index: 10;

  i {
    margin-right: 6px;
  }
  &:hover {
    background-color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  }
}

/* --- MODAL STYLES --- */
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
  z-index: 2000;
  padding: 1rem; /* Prevent edge touching */
}

.modal-content {
  width: 100%;
  max-width: 1000px;
  max-height: 90vh;
  padding: 1.5rem; /* Reduced padding */
  background: white;
  border-radius: 12px;
  overflow-y: auto;
  position: relative;
  box-sizing: border-box;

  @media (min-width: 768px) {
    padding: 2.5rem;
  }
}

.modal-close-button {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background: #f3f4f6;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 1.2rem;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (min-width: 768px) {
    top: 1rem;
    right: 1rem;
    width: 40px;
    height: 40px;
    font-size: 1.5rem;
  }

  &:hover {
    background: #e5e7eb;
  }
}

.modal-gallery-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: $text-color-dark;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
  padding-right: 2rem; /* Avoid close button overlap */

  @media (min-width: 768px) {
    font-size: 1.5rem;
  }
}

.modal-section-subtitle {
  font-size: 1rem;
  font-weight: 600;
  color: $primary-color;
  margin-bottom: 0.75rem;
}

.modal-photo-grid {
  display: grid;
  grid-template-columns: repeat(
    auto-fill,
    minmax(140px, 1fr)
  ); /* Smaller minmax for mobile */
  gap: 0.75rem;
  margin-bottom: 2rem;

  @media (min-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 1rem;
  }

  &.single {
    grid-template-columns: 1fr;
    max-width: 600px;
    margin: 0 auto 2rem auto;
  }
}

.modal-image {
  width: 100%;
  height: 120px; /* Shorter on mobile */
  object-fit: cover;
  border-radius: 8px;
  cursor: zoom-in;
  transition: transform 0.2s;

  @media (min-width: 768px) {
    height: 200px;
  }

  &:hover {
    transform: scale(1.02);
  }

  &.profile-image {
    height: auto;
    max-height: 300px;
    object-fit: contain;
    background: #f9fafb;
  }
}

.no-photos-text {
  color: #6b7280;
  font-style: italic;
  font-size: 0.9rem;
}

/* --- FULLSCREEN SLIDER --- */
.fullscreen-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: black;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 3000;
}

.fullscreen-image {
  max-width: 100vw;
  max-height: 100vh;
  object-fit: contain;
}

.fullscreen-close-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3001;
}

.nav-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  color: white;
  font-size: 2rem; /* Smaller arrows on mobile */
  border: none;
  cursor: pointer;
  padding: 1rem;
  z-index: 3001;

  @media (min-width: 768px) {
    font-size: 3rem;
  }

  &:hover {
    color: $primary-color;
  }
  &.prev-button {
    left: 0;
  }
  &.next-button {
    right: 0;
  }
}

.image-counter {
  position: absolute;
  bottom: 2rem;
  color: white;
  font-weight: 600;
  background: rgba(0, 0, 0, 0.5);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.9rem;
}

/* Transitions */
.modal-bounce-enter-active {
  transition: all 0.3s ease-out;
}
.modal-bounce-leave-active {
  transition: all 0.2s ease-in;
}
.modal-bounce-enter-from,
.modal-bounce-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.fullscreen-fade-enter-active,
.fullscreen-fade-leave-active {
  transition: opacity 0.3s;
}
.fullscreen-fade-enter-from,
.fullscreen-fade-leave-to {
  opacity: 0;
}
</style>
