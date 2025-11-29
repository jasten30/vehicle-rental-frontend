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

// Default grid (for desktop)
.vehicle-image-gallery {
  display: grid;
  gap: 0.5rem;
  height: 450px;
  overflow: hidden;
  border-radius: 12px;

  // 1. Standard Layout (1 Big + 2 Small)
  &.layout-standard {
    grid-template-columns: 3fr 1fr;
  }

  // 2. Single Image Layout (1 Big, No Thumbnails)
  &.layout-single {
    grid-template-columns: 1fr; // Full width
    .thumbnail-grid {
      display: none;
    } // Hide right column
  }

  // 3. Split Half Layout (1 Big + 1 Small)
  &.layout-split-half {
    grid-template-columns: 3fr 1fr;
    .thumbnail-grid {
      grid-template-rows: 1fr; // Only 1 row in right column
    }
  }

  // Mobile Responsiveness
  @media (max-width: 768px) {
    grid-template-columns: 1fr !important;
    height: 350px;

    &.layout-standard {
      grid-template-rows: 3fr 1fr;
    }
    &.layout-single {
      grid-template-rows: 1fr;
    }
    &.layout-split-half {
      grid-template-rows: 3fr 1fr;
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
    transform: scale(1.01);
  }
}

.thumbnail-grid {
  display: grid;
  grid-template-rows: 1fr 1fr; // Standard is 2 rows
  gap: 0.5rem;
  height: 100%;

  @media (max-width: 768px) {
    grid-template-columns: 1fr 1fr; // Side by side on mobile
    grid-template-rows: 1fr;
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

/* ... (Keep the rest of your existing Modal/Slider styles exactly as they were) ... */
.show-all-button {
  position: absolute;
  bottom: 0.5rem;
  right: 0.5rem;
  background-color: rgba(255, 255, 255, 0.9);
  color: $text-color-dark;
  border: 1px solid #e5e7eb;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
  i {
    margin-right: 4px;
  }
  &:hover {
    background-color: white;
    transform: translateY(-1px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
  }
}
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
  z-index: 2000;
}
.modal-content {
  width: 90%;
  max-width: 1000px;
  max-height: 90vh;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  overflow-y: auto;
  position: relative;
}
.modal-close-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: #f3f4f6;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover {
    background: #e5e7eb;
  }
}
.modal-gallery-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: $text-color-dark;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
}
.modal-section-subtitle {
  font-size: 1.1rem;
  font-weight: 600;
  color: $primary-color;
  margin-bottom: 1rem;
}
.modal-photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
  &.single {
    grid-template-columns: 1fr;
    max-width: 600px;
    margin: 0 auto 2rem auto;
  }
}
.modal-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
  cursor: zoom-in;
  transition: transform 0.2s;
  &:hover {
    transform: scale(1.02);
  }
  &.profile-image {
    height: auto;
    max-height: 400px;
    object-fit: contain;
    background: #f9fafb;
  }
}
.no-photos-text {
  color: #6b7280;
  font-style: italic;
}
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
  max-width: 95vw;
  max-height: 95vh;
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
  font-size: 2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover {
    background: rgba(255, 255, 255, 0.4);
  }
}
.nav-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  color: white;
  font-size: 3rem;
  border: none;
  cursor: pointer;
  padding: 1rem;
  &:hover {
    color: $primary-color;
  }
  &.prev-button {
    left: 1rem;
  }
  &.next-button {
    right: 1rem;
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
}
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
