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
          <span>4.5 (25 trips)</span>
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
          <span class="host-name">{{ host.name }}</span>
          <span class="host-member-date"
            >Member since {{ host.memberSince }}</span
          >
        </div>
      </div>
    </div>
    <hr class="divider" />
    <!-- Details Section with a 2x2 grid of categorized features -->
    <div class="details-list">
      <h4>Vehicle Features</h4>
      <div v-if="hasFeatures" class="features-grid-container">
        <div class="features-grid">
          <div
            v-for="(features, category) in displayedCategories"
            :key="category"
            class="feature-category"
          >
            <div v-if="features.length > 0">
              <h5 class="feature-category-title">
                {{ formatCategoryName(category) }}
              </h5>
              <ul>
                <li
                  v-for="(feature, featureIndex) in features"
                  :key="featureIndex"
                >
                  {{ feature }}
                </li>
              </ul>
            </div>
          </div>
        </div>
        <button
          v-if="!showAllFeatures"
          @click="toggleFeatures"
          class="see-all-btn"
        >
          See all features
        </button>
        <button v-else @click="toggleFeatures" class="see-all-btn">
          Show less
        </button>
      </div>
      <div v-else class="loading-state">
        <p>No features available for this vehicle.</p>
      </div>
    </div>
    <hr class="divider" />
    <!-- NEW SECTION: Included in the Price -->
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

    <!-- NEW SECTION: Ratings and Reviews with progress bars -->
    <div class="ratings-and-reviews-section">
      <h4 class="section-title">Ratings and reviews</h4>
      <div class="ratings-summary">
        <div class="overall-rating">
          <span class="rating-number">{{ overallRating.toFixed(2) }}</span>
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
    </div>
    <hr class="divider" />

    <!-- NEW SECTION: Rules of the road -->
    <div class="rules-section">
      <h3>Rules of the road</h3>
      <p>
        <strong class="rule-title">No smoking allowed</strong>
        Smoking in any Turo vehicle will result in a $150 fine.
      </p>
      <p>
        <strong class="rule-title">Keep the vehicle tidy</strong>
        Unreasonably dirty vehicles may result in a $150 fine.
      </p>
      <p>
        <strong class="rule-title">Refuel the vehicle</strong>
        Missing fuel may result in an additional fee.
      </p>
      <p>
        <strong class="rule-title">No off-roading</strong>
        The vehicle may have a device that collects driving and location data.
        Data may be shared with third parties for vehicle recovery or protection
        purposes.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
} from "firebase/auth";

const props = defineProps({
  vehicle: Object,
});

const db = getFirestore();
const auth = getAuth();
const appId =
  typeof window.__app_id !== "undefined" ? window.__app_id : "default-app-id";

const showAllFeatures = ref(false);

const reviews = ref([]);
const host = ref({
  name: "Host Name",
  profilePicture: "https://placehold.co/100x100/A0A0A0/FFFFFF?text=Host",
  memberSince: "N/A",
});

const hasFeatures = computed(
  () =>
    props.vehicle && props.vehicle.features && props.vehicle.features.length > 0
);

// Categorized features computed property
const categorizedFeatures = computed(() => {
  const categories = {
    safety: [],
    convenience: [],
    connectivity: [],
    additional: [],
  };

  if (!props.vehicle || !props.vehicle.features) {
    return categories;
  }

  const safetyKeywords = [
    "seatbelt",
    "airbag",
    "anti-lock",
    "parking assist",
    "camera",
  ];
  const convenienceKeywords = [
    "air conditioning",
    "automatic",
    "keyless entry",
    "storage",
    "cup holder",
    "sunroof",
  ];
  const connectivityKeywords = [
    "carplay",
    "android auto",
    "bluetooth",
    "offline maps",
    "usb port",
  ];

  props.vehicle.features.forEach((feature) => {
    const lowerFeature = feature.toLowerCase();
    if (safetyKeywords.some((keyword) => lowerFeature.includes(keyword))) {
      categories.safety.push(feature);
    } else if (
      convenienceKeywords.some((keyword) => lowerFeature.includes(keyword))
    ) {
      categories.convenience.push(feature);
    } else if (
      connectivityKeywords.some((keyword) => lowerFeature.includes(keyword))
    ) {
      categories.connectivity.push(feature);
    } else {
      categories.additional.push(feature);
    }
  });

  return categories;
});

// Computed property to determine which categories to display
const displayedCategories = computed(() => {
  if (showAllFeatures.value) {
    return categorizedFeatures.value;
  } else {
    return {
      safety: categorizedFeatures.value.safety,
      connectivity: categorizedFeatures.value.connectivity,
    };
  }
});

const toggleFeatures = () => {
  showAllFeatures.value = !showAllFeatures.value;
};

const formatTimestampToDate = (timestamp) => {
  if (!timestamp) {
    return "N/A";
  }

  let date;
  if (timestamp.toDate) {
    date = timestamp.toDate();
  } else if (timestamp.seconds) {
    date = new Date(timestamp.seconds * 1000);
  } else {
    return "N/A";
  }

  const options = { year: "numeric", month: "long" };
  return new Intl.DateTimeFormat("en-US", options).format(date);
};

const fetchHostData = async (ownerId) => {
  try {
    if (!ownerId) {
      console.error("Owner ID is missing from the vehicle document.");
      return;
    }
    // Corrected Firestore path to match security rules: /users/{userId}
    const hostDocRef = doc(db, "users", ownerId);
    const hostDocSnap = await getDoc(hostDocRef);
    if (hostDocSnap.exists()) {
      const hostData = hostDocSnap.data();
      host.value.name = hostData.name || "Jane Doe";
      host.value.profilePicture =
        hostData.userProfileImageUrl ||
        "https://placehold.co/100x100/A0A0A0/FFFFFF?text=Host";
      if (hostData.createdAt) {
        host.value.memberSince = formatTimestampToDate(hostData.createdAt);
      }
    } else {
      console.log("Host document not found for ownerId:", ownerId);
    }
  } catch (error) {
    console.error("Error fetching host data:", error);
  }
};

const fetchReviews = (vehicleId) => {
  const reviewsRef = collection(
    db,
    "artifacts",
    appId,
    "public",
    "data",
    "reviews"
  );
  const q = query(reviewsRef, where("vehicleId", "==", vehicleId));

  onSnapshot(q, (snapshot) => {
    const fetchedReviews = [];
    let totalRatings = 0;
    const scores = {
      cleanliness: 0,
      maintenance: 0,
      communication: 0,
      convenience: 0,
      accuracy: 0,
    };

    snapshot.forEach((doc) => {
      const reviewData = doc.data();
      fetchedReviews.push({ id: doc.id, ...reviewData });
      if (reviewData.categoricalRatings) {
        totalRatings++;
        for (const category in scores) {
          if (reviewData.categoricalRatings[category]) {
            scores[category] += reviewData.categoricalRatings[category];
          }
        }
      }
    });

    reviews.value = fetchedReviews;
    totalReviews.value = totalRatings;

    const avgScores = Object.keys(scores).map((category) => ({
      category,
      score: totalRatings > 0 ? scores[category] / totalRatings : 0,
    }));
    categoricalRatings.value = avgScores;
  });
};

const categoricalRatings = ref([]);
const totalReviews = ref(0);
const overallRating = computed(() => {
  if (categoricalRatings.value.length === 0) {
    return 0;
  }
  const sum = categoricalRatings.value.reduce(
    (acc, rating) => acc + rating.score,
    0
  );
  return sum / categoricalRatings.value.length;
});

const formatCategoryName = (name) => {
  return name.charAt(0).toUpperCase() + name.slice(1).replace("-", " ");
};

onMounted(() => {
  // Use the custom token to sign in to ensure authentication is successful.
  if (typeof window.__initial_auth_token !== "undefined") {
    signInWithCustomToken(auth, window.__initial_auth_token)
      .then(() => {
        if (props.vehicle && props.vehicle.ownerId) {
          fetchHostData(props.vehicle.ownerId);
          fetchReviews(props.vehicle.id);
        }
      })
      .catch((error) => {
        console.error("Error signing in with custom token:", error);
      });
  } else {
    // If no custom token is available, sign in anonymously.
    signInAnonymously(auth)
      .then(() => {
        if (props.vehicle && props.vehicle.ownerId) {
          fetchHostData(props.vehicle.ownerId);
          fetchReviews(props.vehicle.id);
        }
      })
      .catch((error) => {
        console.error("Error signing in anonymously:", error);
      });
  }
});
</script>

<style scoped>
.details-box {
  flex: 2;
  background-color: transparent;
  border-radius: 0.5rem;
}

/* Vehicle Details Styles */
.vehicle-header {
  margin-bottom: 1rem;
}

.vehicle-name {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1f2937;
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
  color: #4b5563;
  font-weight: 500;
}

.vehicle-rating {
  display: flex;
  align-items: center;
  font-size: 1rem;
  color: #1f2937;
}

.star-icon {
  width: 1rem;
  height: 1rem;
  margin-right: 0.25rem;
  color: #1f2937;
}

.divider {
  border: 0;
  height: 1px;
  background: #e0e0e0;
  margin-top: 1.5rem;
  margin-bottom: 1.5rem;
}

.hosted-by-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.hosted-by-title {
  font-size: 1.25rem;
  color: #000;
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

.host-name {
  font-size: 1.1rem;
  font-weight: bold;
  color: #000;
}

.host-member-date {
  font-size: 0.85rem;
  color: #4b5563;
}

.details-list {
  padding-top: 1.5rem;
}

/* New CSS for the 2x2 grid layout */
.features-grid-container {
  display: flex;
  flex-direction: column;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  margin-bottom: 1rem;
}

@media (max-width: 768px) {
  .features-grid {
    grid-template-columns: 1fr;
  }
}

.feature-category {
  margin-bottom: 1rem;
}

.feature-category-title {
  font-size: 1rem;
  color: #1f2937;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.feature-category ul {
  list-style: disc;
  padding-left: 1.5rem;
  margin: 0;
}

.feature-category li {
  font-size: 1rem;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.see-all-btn {
  background-color: transparent;
  color: #3b82f6;
  border: none;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  font-size: 0.9rem;
  transition: color 0.3s ease;
  align-self: flex-start;
}

.see-all-btn:hover {
  color: #2563eb;
  text-decoration: underline;
}

/* NEW: Styles for the Included in the Price section */
.included-in-price-section {
  display: flex;
  flex-direction: column;
  padding-top: 1.5rem;
}

.included-title {
  font-size: 1.25rem;
  color: #000;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.included-content-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
}

@media (max-width: 768px) {
  .included-content-grid {
    grid-template-columns: 1fr;
  }
}

.included-category {
  margin-bottom: 1rem;
}

.included-category-title {
  font-size: 1rem;
  color: #1f2937;
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
  color: #1f2937;
  margin-bottom: 0.25rem;
}

/* NEW: Ratings and Reviews Section Styles */
.ratings-and-reviews-section {
  padding-top: 1.5rem;
}

.section-title {
  font-size: 1.5rem;
  color: #000;
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
  color: #1f2937;
}

.star-icon {
  font-size: 1.5rem;
  color: #8c73ff; /* A shade of purple for the star */
}

.categorical-ratings {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.rating-item {
  display: grid;
  grid-template-columns: 150px 1fr auto;
  align-items: center;
  gap: 1rem;
}

@media (max-width: 500px) {
  .rating-item {
    grid-template-columns: 100px 1fr auto;
  }
}

.category-name {
  font-size: 1rem;
  color: #4b5563;
  font-weight: 500;
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
  background-color: #8c73ff;
  border-radius: 9999px;
  transition: width 0.5s ease-in-out;
}

.score {
  font-size: 1rem;
  color: #1f2937;
  font-weight: 500;
}

/* NEW SECTION: Rules of the road */
.rules-section {
  padding-top: 1.5rem;
}
.rules-section h3 {
  font-size: 1.5rem;
  color: #000;
  font-weight: bold;
  margin-bottom: 1rem;
}
.rules-section p {
  margin-bottom: 1rem;
  line-height: 1.6;
}
.rules-section strong {
  display: block;
  font-size: 1.1em;
  color: #0056b3;
  margin-bottom: 0.25rem;
}
</style>
