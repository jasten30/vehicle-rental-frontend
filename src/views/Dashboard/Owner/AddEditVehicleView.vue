<!-- frontend/src/views/Dashboard/Owner/AddEditVehicleView.vue -->
<template>
  <div class="add-edit-vehicle-container">
    <h2 class="section-title">{{ isEditing ? 'Edit Vehicle' : 'Add New Vehicle' }}</h2>

    <div v-if="loading" class="loading-message">
      <p>Loading vehicle details...</p>
    </div>

    <div v-else-if="errorMessage" class="error-message">
      <p>{{ errorMessage }}</p>
      <button @click="loadVehicle" v-if="isEditing" class="button primary-button">Retry Load Vehicle</button>
    </div>

    <form v-else @submit.prevent="saveVehicle" class="vehicle-form">
      <div class="form-group">
        <label for="make">Make</label>
        <input type="text" id="make" v-model="vehicleForm.make" required class="form-input">
      </div>

      <div class="form-group">
        <label for="model">Model</label>
        <input type="text" id="model" v-model="vehicleForm.model" required class="form-input">
      </div>

      <div class="form-group">
        <label for="year">Year</label>
        <input type="number" id="year" v-model.number="vehicleForm.year" required class="form-input">
      </div>

      <div class="form-group">
        <label for="licensePlate">License Plate</label>
        <input type="text" id="licensePlate" v-model="vehicleForm.licensePlate" required class="form-input">
      </div>

      <div class="form-group">
        <label for="rentalPricePerDay">Daily Rental Price (₱)</label>
        <input type="number" id="rentalPricePerDay" v-model.number="vehicleForm.rentalPricePerDay" required step="0.01" class="form-input">
      </div>

      <div class="form-group">
        <label for="location">Location</label>
        <input type="text" id="location" v-model="vehicleForm.location" required class="form-input">
      </div>

      <!-- NEW: Image Upload/URL Selection -->
      <div class="form-group image-upload-options">
        <label>Vehicle Image</label>
        <div class="radio-group">
          <label>
            <input type="radio" v-model="imageInputType" value="url"> Image URL
          </label>
          <label>
            <input type="radio" v-model="imageInputType" value="upload"> Upload Image
          </label>
        </div>

        <div v-if="imageInputType === 'url'">
          <label for="imageUrl">Image URL (Optional)</label>
          <input type="url" id="imageUrl" v-model="vehicleForm.imageUrl" class="form-input">
        </div>

        <div v-else-if="imageInputType === 'upload'">
          <label for="imageUpload">Upload Image File (Optional)</label>
          <input type="file" id="imageUpload" @change="handleFileUpload" accept="image/*" class="form-input file-input">
          <p v-if="uploadFileName" class="upload-file-name">Selected: {{ uploadFileName }}</p>
        </div>

        <div v-if="displayImageUrl" class="image-preview">
          <img :src="displayImageUrl" alt="Vehicle Preview" class="preview-image" @error="handleImageError">
          <p class="preview-text">Image Preview</p>
        </div>
      </div>

      <div class="form-group">
        <label for="description">Description (Optional)</label>
        <textarea id="description" v-model="vehicleForm.description" class="form-input textarea"></textarea>
      </div>

      <div v-if="successMessage" class="success-message">
        {{ successMessage }}
      </div>
      <div v-if="updateErrorMessage" class="error-message">
        {{ updateErrorMessage }}
      </div>

      <div class="form-actions">
        <button type="submit" :disabled="saving" class="button primary-button save-button">
          <span v-if="saving">Saving...</span>
          <span v-else>{{ isEditing ? 'Update Vehicle' : 'Add Vehicle' }}</span>
        </button>
        <button type="button" @click="goBack" class="button secondary-button">Cancel</button>
      </div>
    </form>
  </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  name: 'AddEditVehicleView',
  props: {
    vehicleId: { // This prop will be present if we are in 'edit' mode
      type: String,
      default: null,
    },
  },
  data() {
    return {
      loading: false,
      saving: false,
      errorMessage: null,
      updateErrorMessage: null,
      successMessage: null,
      vehicleForm: {
        make: '',
        model: '',
        year: null,
        licensePlate: '',
        rentalPricePerDay: null,
        location: '',
        imageUrl: '', // This will hold either URL or Base64
        description: '',
      },
      isEditing: false,
      imageInputType: 'url', // 'url' or 'upload'
      uploadFileName: null,
      base64Image: null, // To temporarily hold the base64 string
    };
  },
  computed: {
    displayImageUrl() {
      // If we have a base64 image, display that. Otherwise, display the URL.
      return this.base64Image || this.vehicleForm.imageUrl;
    }
  },
  created() {
    if (this.vehicleId) {
      this.isEditing = true;
      this.loadVehicle();
    }
  },
  methods: {
    ...mapActions(['addVehicle', 'getVehicleById', 'updateVehicle']),

    async loadVehicle() {
      this.loading = true;
      this.errorMessage = null;
      try {
        const fetchedVehicle = await this.getVehicleById(this.vehicleId); // Use existing action
        if (fetchedVehicle) {
          this.vehicleForm = {
            make: fetchedVehicle.make || '',
            model: fetchedVehicle.model || '',
            year: fetchedVehicle.year || null,
            licensePlate: fetchedVehicle.licensePlate || '',
            rentalPricePerDay: fetchedVehicle.rentalPricePerDay || null,
            location: fetchedVehicle.location || '',
            imageUrl: fetchedVehicle.imageUrl || '', // This will be the existing URL
            description: fetchedVehicle.description || '',
          };
          // If editing, assume existing image is a URL, set input type to URL
          this.imageInputType = 'url';
          this.base64Image = null; // Clear any previous base64
          this.uploadFileName = null; // Clear file name
          console.log('[AddEditVehicleView] Vehicle loaded for editing:', fetchedVehicle);
        } else {
          this.errorMessage = 'Vehicle not found.';
        }
      } catch (error) {
        console.error('[AddEditVehicleView] Error loading vehicle:', error);
        this.errorMessage = error.response?.data?.message || 'Failed to load vehicle for editing. Please try again.';
      } finally {
        this.loading = false;
      }
    },
    handleFileUpload(event) {
      const file = event.target.files[0];
      if (file) {
        this.uploadFileName = file.name;
        const reader = new FileReader();
        reader.onload = (e) => {
          this.base64Image = e.target.result; // Store Base64 for preview
          this.vehicleForm.imageUrl = e.target.result; // Send Base64 to backend via imageUrl field
        };
        reader.onerror = (error) => {
          console.error("Error reading file:", error);
          this.uploadFileName = null;
          this.base64Image = null;
          this.vehicleForm.imageUrl = '';
          this.updateErrorMessage = 'Failed to read image file.';
        };
        reader.readAsDataURL(file);
      } else {
        this.uploadFileName = null;
        this.base64Image = null;
        this.vehicleForm.imageUrl = '';
      }
    },
    async saveVehicle() {
      this.saving = true;
      this.successMessage = null;
      this.updateErrorMessage = null;
      try {
        let response;
        // If imageInputType is 'upload' and base64Image is available, vehicleForm.imageUrl already holds base64.
        // If imageInputType is 'url', vehicleForm.imageUrl holds the URL.
        // So, vehicleForm.imageUrl is correctly prepared for the backend.

        if (this.isEditing) {
          response = await this.updateVehicle({ id: this.vehicleId, ...this.vehicleForm });
          this.successMessage = 'Vehicle updated successfully!';
        } else {
          response = await this.addVehicle(this.vehicleForm);
          this.successMessage = 'Vehicle added successfully!';
          this.resetForm(); // Reset form for new entry
        }
        console.log('[AddEditVehicleView] Vehicle saved/updated:', response);
        this.goBack(); // Go back to listings after successful save
      } catch (error) {
        console.error('[AddEditVehicleView] Error saving vehicle:', error);
        this.updateErrorMessage = error.response?.data?.message || 'Failed to save vehicle. Please try again.';
      } finally {
        this.saving = false;
      }
    },
    resetForm() {
      this.vehicleForm = {
        make: '',
        model: '',
        year: null,
        licensePlate: '',
        rentalPricePerDay: null,
        location: '',
        imageUrl: '', // Clear image field
        description: '',
      };
      this.imageInputType = 'url'; // Reset to URL input
      this.uploadFileName = null;
      this.base64Image = null;
    },
    handleImageError(event) {
      // Set a placeholder image if the provided URL or Base64 fails to load
      event.target.src = this.getPlaceholderImage(200, 150, 'cccccc', '333333', 'Image Error');
    },
    getPlaceholderImage(width, height, bgColor, textColor, text) {
      return `https://placehold.co/${width}x${height}/${bgColor}/${textColor}?text=${text}`;
    },
    goBack() {
      this.$router.push({ name: 'OwnerVehicles' });
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../../../assets/styles/variables.scss';

.add-edit-vehicle-container {
  padding: 1.5rem;
  max-width: 700px;
  margin: 0 auto;
}

.section-title {
  font-size: 2rem;
  font-weight: 700;
  color: $text-color-dark;
  margin-bottom: 1.5rem;
  text-align: center;
}

.loading-message, .error-message {
  text-align: center;
  padding: 2rem;
  font-size: 1.1rem;
  color: $text-color-medium;
}

.error-message {
  color: #ef4444;
  font-weight: 600;
  background-color: #fee2e2;
  border-radius: $border-radius-md;
  padding: 0.75rem;
  margin-bottom: 1rem;
}

.success-message {
  color: #22c55e;
  font-weight: 600;
  background-color: #dcfce7;
  border-radius: $border-radius-md;
  padding: 0.75rem;
  margin-bottom: 1rem;
}

.vehicle-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background-color: $card-background;
  padding: 2rem;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-medium;
}

.form-group {
  margin-bottom: 0.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: $text-color-dark;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 1rem;
  box-sizing: border-box;
  transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;

  &:focus {
    outline: none;
    border-color: $primary-color;
    box-shadow: 0 0 0 3px rgba($primary-color, 0.2);
  }
}

.form-input.textarea {
  min-height: 100px;
  resize: vertical;
}

.file-input {
  padding: 0.75rem 0; /* Adjust padding for file input */
}

.upload-file-name {
  font-size: 0.85rem;
  color: $text-color-medium;
  margin-top: 0.5rem;
  font-style: italic;
}

.image-upload-options {
  .radio-group {
    display: flex;
    gap: 1.5rem;
    margin-bottom: 1rem;
    label {
      display: flex;
      align-items: center;
      font-weight: normal;
      color: $text-color-dark;
      input[type="radio"] {
        margin-right: 0.5rem;
      }
    }
  }
}

.image-preview {
  margin-top: 1rem;
  text-align: center;
  border: 1px dashed #ccc;
  padding: 1rem;
  border-radius: $border-radius-md;
  background-color: #f9fafb;
}

.preview-image {
  max-width: 100%;
  max-height: 200px;
  object-fit: contain;
  border-radius: $border-radius-sm;
  box-shadow: $shadow-light;
}

.preview-text {
  font-size: 0.85rem;
  color: $text-color-medium;
  margin-top: 0.5rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

.button {
  padding: 0.85rem 1.5rem;
  border-radius: 0.375rem;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out, opacity 0.2s ease-in-out;
  border: none;
}

.primary-button {
  background-color: $primary-color;
  color: white;
  &:hover:not(:disabled) {
    background-color: darken($primary-color, 10%);
  }
  &:disabled {
    background-color: lighten($primary-color, 20%);
    cursor: not-allowed;
    opacity: 0.7;
  }
}

.secondary-button {
  background-color: #6c757d;
  color: white;
  &:hover:not(:disabled) {
    background-color: darken(#6c757d, 10%);
  }
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
}s
</style>