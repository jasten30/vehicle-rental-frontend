<template>
  <div class="details-box">
    <div class="vehicle-header">
      <h2 class="vehicle-name">{{ vehicle.model }}</h2>
      <div class="vehicle-info">
        <span class="vehicle-make">{{ vehicle.make }}</span>
        <div class="vehicle-rating">
          <svg
            class="star-icon"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.381-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
            ></path>
          </svg>
          <span>{{ overallRating.toFixed(1) }} ({{ totalReviews }} ratings)</span>
        </div>
      </div>
    </div>
    <hr class="divider" />
    <div class="hosted-by-section">
      <h4 class="hosted-by-title">Hosted by</h4>
      <div class="host-profile">
        <img
          :src="host.profilePicture"
          alt="Host Profile Picture"
          class="host-avatar"
        />
        <div class="host-details">
          <router-link
            v-if="host.id"
            :to="{ name: 'UserProfileView', params: { userId: host.id } }"
            class="host-name-link"
          >
            <span class="host-name">{{ host.name }}</span>
          </router-link>
          <span v-else class="host-name">{{ host.name }}</span>
          <span class="host-member-date"
            >Member since {{ host.memberSince }}</span
          >
        </div>
      </div>
    </div>
    <hr class="divider" />
    <div class="details-list">
      <h4>Vehicle Features</h4>
      <!-- Check if the selectedFeaturesList has items -->
      <div v-if="selectedFeaturesList.length > 0" class="features-grid-container">
        <div class="features-grid">
           <!-- Display features in two columns -->
           <ul class="feature-column">
             <li v-for="(feature, index) in selectedFeaturesList.slice(0, Math.ceil(selectedFeaturesList.length / 2))" :key="`col1-${index}`">
               {{ feature }}
             </li>
           </ul>
           <ul class="feature-column" v-if="selectedFeaturesList.length > 1">
             <li v-for="(feature, index) in selectedFeaturesList.slice(Math.ceil(selectedFeaturesList.length / 2))" :key="`col2-${index}`">
               {{ feature }}
             </li>
           </ul>
        </div>
        <!-- "See all/less" functionality removed for simplicity with the new structure -->
      </div>
      <div v-else class="loading-state">
        <p>No additional features listed for this vehicle.</p>
      </div>
    </div>
    <hr class="divider" />
    <div class="included-in-price-section">
      <h4 class="included-title">Rental Perks</h4>
      <div class="included-content-grid">
        <div class="included-category">
          <h5 class="included-category-title">Convenience</h5>
          <ul>
            <li>Hassle-free pickup and return</li>
            <li>Use the app for seamless instructions</li>
            <li>Additional drivers are free of charge</li>
            <li>A 30-minute grace period for late returns</li>
            <li>No need to extend your trip for minor delays</li>
          </ul>
        </div>
        <div class="included-category">
          <h5 class="included-category-title">Peace of mind</h5>
          <ul>
            <li>Return without washing (just keep it tidy)</li>
            <li>Basic roadside assistance is included</li>
            <li>24/7 customer support is available</li>
          </ul>
        </div>
      </div>
    </div>
    <hr class="divider" />
    <div class="ratings-and-reviews-section">
      <h4 class="section-title">Ratings and reviews</h4>
      <div class="ratings-summary">
        <div class="overall-rating">
          <span class="rating-number">{{ overallRating.toFixed(1) }}</span>
          <span class="star-icon">★</span>
        </div>
        <span class="text-sm font-semibold text-gray-500"
          >({{ totalReviews }} ratings)</span
        >
      </div>
      <div class="categorical-ratings">
        <div
          v-for="rating in categoricalRatings"
          :key="rating.category"
          class="rating-item"
        >
          <span class="category-name">{{ rating.category }}</span>
          <div class="bar-chart">
            <div
              class="bar-fill"
              :style="{ width: (rating.score / 5) * 100 + '%' }"
            ></div>
          </div>
          <span class="score">{{ rating.score.toFixed(1) }}</span>
        </div>
      </div>

      <div v-if="reviews.length > 0" class="reviews-list-section">
        <div v-for="review in displayedReviews" :key="review.id" class="review-item">
            <div class="review-header">
                <img :src="review.reviewerPhoto" alt="Reviewer" class="reviewer-avatar" />
                <div class="reviewer-info">
                    <span class="reviewer-name">{{ review.reviewerName }}</span>
                    <span class="review-date">{{ formatTimestampToDate(review.createdAt) }}</span>
                </div>
            </div>
            <p class="review-comment">{{ review.comment }}</p>
        </div>
        <button v-if="reviews.length > 2" @click="toggleReviews" class="see-all-btn">
            {{ showAllReviews ? 'Show less reviews' : `Show all ${reviews.length} reviews` }}
        </button>
      </div>

    </div>
    <hr class="divider" />
    <div class="rules-section">
      <h3>Rules of the road</h3>
      <p>
        <strong class="rule-title">No smoking allowed</strong>
        Smoking in any vehicle will result in a fine.
      </p>
      <p>
        <strong class="rule-title">Keep the vehicle tidy</strong>
        Unreasonably dirty vehicles may result in a fine.
      </p>
      <p>
        <strong class="rule-title">Refuel the vehicle</strong>
        Missing fuel may result in an additional fee.
      </p>
      <p>
        <strong class="rule-title">No off-roading</strong>
        The vehicle may have a device that collects driving and location data.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import {
  getFirestore,
  doc, // <-- This is the IMPORTED function
  getDoc,
  collection,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore';

const props = defineProps({
  vehicle: Object,
});

const db = getFirestore();
// Removed showAllFeatures as we'll display all features now
const reviews = ref([]);
const host = ref({
  id: null,
  name: 'Host Name',
  profilePicture: 'https://placehold.co/100x100/A0A0A0/FFFFFF?text=Host',
  memberSince: 'N/A',
});
const showAllReviews = ref(false);

// ======================================================
//  FEATURE LOGIC
// ======================================================
const featureNameMap = {
  seatbeltsAndAirbags: "Seatbelts and Airbags",
  abs: "Anti-lock Braking System (ABS)",
  esc: "Electronic Stability Control (ESC)",
  backupCamera: "Back-up Camera",
  bsm: "Blind Spot Monitoring (BSM)",
  tpms: "Tire Pressure Monitoring System (TPMS)",
  fcw: "Forward Collision Warning (FCW)",
  bluetooth: "Bluetooth",
  usbPort: "USB Port",
  appleCarPlay: "Apple CarPlay",
  androidAuto: "Android Auto",
  gps: "GPS Navigation",
  keylessEntry: "Keyless Entry",
  heatedSeats: "Heated Seats",
  sunroof: "Sunroof",
  childSeat: "Child Seat",
  bikeRack: "Bike Rack",
  roofBox: "Roof Box",
  petFriendly: "Pet Friendly",
};

const selectedFeaturesList = computed(() => {
  if (!props.vehicle || !props.vehicle.features || typeof props.vehicle.features !== 'object') {
    return [];
  }
  return Object.keys(props.vehicle.features)
    .filter(key => props.vehicle.features[key] === true)
    .map(key => featureNameMap[key] || key); 
});
// ======================================================

const displayedReviews = computed(() => {
    if (showAllReviews.value) {
        return reviews.value;
    }
    return reviews.value.slice(0, 2);
});

const toggleReviews = () => {
    showAllReviews.value = !showAllReviews.value;
};

const formatTimestampToDate = (timestamp) => {
  if (!timestamp) return 'N/A';
  let date;
  if (timestamp.toDate) {
    date = timestamp.toDate();
  } else if (timestamp._seconds) {
    date = new Date(timestamp._seconds * 1000);
  } else if (timestamp.seconds) {
    date = new Date(timestamp.seconds * 1000);
  } else {
    return 'N/A';
  }
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
  }).format(date);
};

const fetchHostData = async (ownerId) => {
  try {
    if (!ownerId) {
      return;
    }
    const hostDocRef = doc(db, 'users', ownerId); // <-- Uses imported 'doc'
    const hostDocSnap = await getDoc(hostDocRef);
    if (hostDocSnap.exists()) {
      const hostData = hostDocSnap.data();
      host.value.id = ownerId;
      host.value.name =
        `${hostData.firstName || ''} ${hostData.lastName || ''}`.trim() ||
        'Host';
      host.value.profilePicture =
        hostData.profilePhotoUrl || 'https://placehold.co/100x100/A0A0A0/FFFFFF?text=Host';
      if (hostData.createdAt) {
        host.value.memberSince = formatTimestampToDate(hostData.createdAt);
      }
    }
  } catch (error) {
    console.error('Error fetching host data:', error);
  }
};

const fetchReviews = (vehicleId) => {
  const reviewsRef = collection(db, 'reviews');
  const q = query(reviewsRef, where('vehicleId', '==', vehicleId));
  
  // --- UPDATED THIS FUNCTION ---
  onSnapshot(q, async (snapshot) => {
    // FIX: Renamed 'doc' to 'reviewDoc' to avoid conflict
    const reviewPromises = snapshot.docs.map(async (reviewDoc) => { 
        const reviewData = reviewDoc.data();
        let reviewerName = 'Anonymous';
        let reviewerPhoto = 'https://placehold.co/100x100/A0A0A0/FFFFFF?text=User';
        if(reviewData.renterId) {
            try {
                // Now the imported 'doc' function is used correctly
                const userDoc = await getDoc(doc(db, 'users', reviewData.renterId)); 
                if(userDoc.exists()) {
                    const userData = userDoc.data();
                    reviewerName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'User';
                    reviewerPhoto = userData.profilePhotoUrl || reviewerPhoto;
                }
            } catch (e) {
                console.error(`Failed to fetch user data for renterId: ${reviewData.renterId}`, e);
            }
        }
        return { id: reviewDoc.id, ...reviewData, reviewerName, reviewerPhoto };
    });
    // --- END UPDATE ---
    
    reviews.value = await Promise.all(reviewPromises);
  });
};

const totalReviews = computed(() => {
    return reviews.value.filter(r => r.categoricalRatings).length;
});

const categoricalRatings = computed(() => {
    const scores = { cleanliness: 0, maintenance: 0, communication: 0, convenience: 0, accuracy: 0 };
    const count = totalReviews.value;

    if (count === 0) {
        return Object.keys(scores).map(category => ({ category: formatCategoryName(category), score: 0 }));
    }

    reviews.value.forEach(review => {
        if (review.categoricalRatings) {
            for (const category in scores) {
                if (review.categoricalRatings[category]) {
                    scores[category] += review.categoricalRatings[category];
                }
            }
        }
    });
    
    return Object.keys(scores).map(category => ({
        category: formatCategoryName(category),
        score: scores[category] / count,
    }));
});

const overallRating = computed(() => {
  if (totalReviews.value === 0) return 0;
  const sum = categoricalRatings.value.reduce((acc, rating) => acc + rating.score, 0);
  return sum > 0 ? sum / categoricalRatings.value.length : 0;
});

const formatCategoryName = (name) => {
  // Simple capitalize for the rating categories
  return name.charAt(0).toUpperCase() + name.slice(1);
};

onMounted(() => {
  if (props.vehicle && props.vehicle.ownerId) {
    fetchHostData(props.vehicle.ownerId);
    fetchReviews(props.vehicle.id);
  }
});
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.details-box {
  flex: 2;
  background-color: transparent;
  border-radius: 0.5rem;
}
.vehicle-header {
  margin-bottom: 1rem;
}
.vehicle-name {
  font-size: 2.5rem;
  font-weight: 700;
  color: $text-color-dark;
  margin: 0;
}
.vehicle-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 0.25rem;
}
.vehicle-make {
  font-size: 1rem;
  color: $text-color-medium;
  font-weight: 500;
}
.vehicle-rating {
  display: flex;
  align-items: center;
  font-size: 1rem;
  color: $text-color-dark;
}
.star-icon {
  width: 1rem;
  height: 1rem;
  margin-right: 0.25rem;
  color: $primary-color;
}
.divider {
  border: 0;
  height: 1px;
  background: $border-color;
  margin: 1.5rem 0;
}
.hosted-by-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.hosted-by-title {
  font-size: 1.25rem;
  color: $text-color-dark;
  font-weight: bold;
  margin-bottom: 0.5rem;
}
.host-profile {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.host-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
}
.host-details {
  display: flex;
  flex-direction: column;
}
.host-name-link {
  text-decoration: none;
  color: inherit;
  &:hover .host-name {
    text-decoration: underline;
    color: $primary-color;
  }
}
.host-name {
  font-size: 1.1rem;
  font-weight: bold;
  color: $text-color-dark;
}
.host-member-date {
  font-size: 0.85rem;
  color: $text-color-medium;
}
.details-list {
  padding-top: 1.5rem;
}
.features-grid-container {
  display: flex;
  flex-direction: column;
}
.features-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr); // Always 2 columns for features
  gap: 2rem;
  margin-bottom: 1rem;
  @media (max-width: 576px) { // Single column on small screens
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
}
// Removed category title styles
.feature-column { // Style for the new UL columns
  list-style: disc;
  padding-left: 1.5rem;
  margin: 0;
  li {
    font-size: 1rem;
    color: $text-color-dark;
    margin-bottom: 0.5rem; // Increased spacing
  }
}

// Removed see-all-btn styles related to features specifically
.see-all-btn { // Generic style for review button
  background-color: transparent;
  color: $primary-color;
  border: none;
  font-weight: 600;
  cursor: pointer;
  padding: 0.5rem 0;
  font-size: 0.9rem;
  transition: color 0.3s ease;
  align-self: flex-start;
  margin-top: 1rem; // Add margin for review button
  &:hover {
    text-decoration: underline;
  }
}

.included-in-price-section {
  padding-top: 1.5rem;
}
.included-title {
  font-size: 1.25rem;
  color: $text-color-dark;
  font-weight: bold;
  margin-bottom: 0.5rem;
}
.included-content-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}
.included-category-title {
  font-size: 1rem;
  color: $text-color-dark;
  font-weight: 600;
  margin-bottom: 0.5rem;
}
.included-category ul {
  list-style: disc;
  padding-left: 1.5rem;
  margin: 0;
}
.included-category li {
  font-size: 1rem;
  color: $text-color-dark;
  margin-bottom: 0.25rem;
}
.ratings-and-reviews-section {
  padding-top: 1.5rem;
}
.section-title {
  font-size: 1.5rem;
  color: $text-color-dark;
  font-weight: bold;
  margin-bottom: 1rem;
}
.ratings-summary {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  margin-bottom: 2rem;
}
.overall-rating {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
}
.rating-number {
  font-size: 2.5rem;
  font-weight: bold;
  color: $text-color-dark;
}
.categorical-ratings {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem; // Add space before reviews
}
.rating-item {
  display: grid;
  grid-template-columns: 150px 1fr auto;
  align-items: center;
  gap: 1rem;
}
.category-name {
  font-size: 1rem;
  color: $text-color-medium;
  font-weight: 500;
  text-transform: capitalize;
}
.bar-chart {
  width: 100%;
  height: 8px;
  background-color: #f3f4f6;
  border-radius: 9999px;
  overflow: hidden;
}
.bar-fill {
  height: 100%;
  background-color: $primary-color;
  border-radius: 9999px;
  transition: width 0.5s ease-in-out;
}
.score {
  font-size: 1rem;
  color: $text-color-dark;
  font-weight: 500;
}
.rules-section {
  padding-top: 1.5rem;
  h3 {
    font-size: 1.5rem;
    color: $text-color-dark;
    font-weight: bold;
    margin-bottom: 1rem;
  }
  p {
    margin-bottom: 1rem;
    line-height: 1.6;
  }
  strong.rule-title { // More specific selector
    display: block;
    font-size: 1.1em;
    color: $primary-color;
    margin-bottom: 0.25rem;
  }
}

.reviews-list-section {
    margin-top: 2rem;
}
.review-item {
    padding: 1.5rem 0;
    border-bottom: 1px solid $border-color;
    &:last-of-type {
        border-bottom: none;
    }
}
.review-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
}
.reviewer-avatar {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    object-fit: cover;
}
.reviewer-info {
    display: flex;
    flex-direction: column;
}
.reviewer-name {
    font-weight: 600;
    color: $text-color-dark;
}
.review-date {
    font-size: 0.85rem;
    color: $text-color-medium;
}
.review-comment {
    color: $text-color-dark;
    line-height: 1.6;
}

.loading-state { // Style for the 'no features' text
  color: $text-color-medium;
  font-style: italic;
  margin-top: 1rem;
}
</style>