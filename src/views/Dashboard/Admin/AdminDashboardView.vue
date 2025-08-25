<!-- src/views/dashboard/admin/AdminDashboardView.vue -->
<template>
  <div class="admin-dashboard-container">
    <h2 class="section-title">Admin Dashboard</h2>
    <div v-if="loading" class="loading-message">
      <p>Loading user data...</p>
    </div>
    <div v-else-if="errorMessage" class="error-message">
      <p>{{ errorMessage }}</p>
      <button @click="fetchUsers" class="button primary-button">Retry</button>
    </div>
    <div v-else class="user-list">
      <div v-for="user in users" :key="user.uid" class="user-card">
        <div class="user-details">
          <h3>{{ user.email || 'N/A' }}</h3>
          <p><strong>UID:</strong> {{ user.uid }}</p>
          <p><strong>Role:</strong> {{ user.role }}</p>
          <p><strong>Listings:</strong> {{ user.listingCount || 0 }} vehicles</p>
        </div>
        <div class="user-actions">
          <button @click="toggleUserRole(user)"
                  :disabled="user.role === 'admin'"
                  :class="['button', user.role === 'owner' ? 'secondary-button' : 'primary-button']">
            {{ user.role === 'owner' ? 'Demote to Renter' : 'Promote to Owner' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { getAuth } from 'firebase/auth';

export default {
  name: 'AdminDashboardView',
  setup() {
    const users = ref([]);
    const loading = ref(true);
    const errorMessage = ref(null);

    const auth = getAuth();

    // Fetches all users and their vehicle counts
    const fetchUsers = async () => {
      loading.value = true;
      errorMessage.value = null;
      try {
        const user = auth.currentUser;
        if (!user) throw new Error("User not authenticated.");
        
        const token = await user.getIdToken();
        const response = await fetch('http://localhost:5001/api/users/all-users', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        users.value = data;
        
      } catch (error) {
        console.error('[AdminDashboard] Error fetching users:', error);
        errorMessage.value = 'Failed to load user data. Check permissions.';
      } finally {
        loading.value = false;
      }
    };

    // Toggles a user's role and refreshes the list
    const toggleUserRole = async (user) => {
      const newRole = user.role === 'owner' ? 'renter' : 'owner';
      const userMessage = `Do you want to change ${user.email}'s role to '${newRole}'?`;
      if (!confirm(userMessage)) {
        return;
      }

      try {
        const currentUser = auth.currentUser;
        if (!currentUser) throw new Error("Admin user not authenticated.");
        
        const token = await currentUser.getIdToken();
        const response = await fetch(`http://localhost:5001/api/users/update-role/${user.uid}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ role: newRole })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        console.log(`Role for user ${user.uid} updated to ${newRole}`);
        // Optimistically update the UI
        user.role = newRole;
      } catch (error) {
        console.error('[AdminDashboard] Error toggling user role:', error);
        alert('Failed to update user role. Check console for details.');
      }
    };
    
    // Fetch users when the component is first loaded
    onMounted(fetchUsers);

    return {
      users,
      loading,
      errorMessage,
      toggleUserRole,
    };
  },
};
</script>

<style scoped>
.admin-dashboard-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}
.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 2rem;
  text-align: center;
}
.loading-message, .error-message {
  text-align: center;
  padding: 2rem;
  font-size: 1.1rem;
  color: #718096;
}
.user-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.user-card {
  background-color: #ffffff;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: box-shadow 0.2s ease;
}
.user-card:hover {
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}
.user-details h3 {
  font-size: 1.25rem;
  color: #2c5282;
  margin-bottom: 0.5rem;
}
.user-details p {
  font-size: 0.95rem;
  color: #4a5568;
  margin: 0.25rem 0;
}
.user-actions .button {
  padding: 0.75rem 1.25rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.2s ease;
  border: none;
}
.primary-button {
  background-color: #3b82f6;
  color: white;
}
.primary-button:hover {
  background-color: #2563eb;
  transform: translateY(-2px);
}
.secondary-button {
  background-color: #d1d5db;
  color: #1f2937;
}
.secondary-button:hover {
  background-color: #9ca3af;
  transform: translateY(-2px);
}
.button[disabled] {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
