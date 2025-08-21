<template>
  <div class="vehicle-image-gallery">
    <!-- Main Image -->
    <img :src="mainImageUrl || getPlaceholderImage(800, 600, 'cccccc', '333333', 'No Image')"
         :alt="`${vehicleMake} ${vehicleModel}`"
         class="main-vehicle-image"
         @error="$event.target.src = getPlaceholderImage(800, 600, 'cccccc', '333333', 'No Image')">
    
    <!-- Thumbnail Grid -->
    <div class="thumbnail-grid">
      <div v-for="(thumb, index) in thumbnailUrls" :key="index" class="thumbnail-container">
        <img :src="thumb" alt="Vehicle thumbnail" class="thumbnail-image">
        <button v-if="index === 3" @click="showAllPhotos" class="show-all-button">
          Show all photos
        </button>
      </div>
    </div>
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
  methods: {
    getPlaceholderImage(width, height, bgColor, textColor, text) {
      return `https://placehold.co/${width}x${height}/${bgColor}/${textColor}?text=${text}`;
    },
    showAllPhotos() {
      // You can add your modal or full-screen gallery logic here
      console.log('Show all photos clicked!');
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../../assets/styles/variables.scss';

.vehicle-image-gallery {
  display: grid;
  grid-template-columns: 2fr 1fr;
  grid-template-rows: repeat(2, 1fr);
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
  grid-row: 1 / 3;

  @media (max-width: 768px) {
    grid-column: 1 / 2;
    grid-row: auto;
    height: 300px;
  }
}

.thumbnail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
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
</style>
