<template>
  <div class="admin-page-container">
    <div class="page-header">
      <div>
        <h2 class="section-title">Manage Users</h2>
        <p class="section-subtitle">View, edit roles, and manage all users on the platform.</p>
      </div>
      <div class="search-bar">
        <i class="bi bi-search"></i>
        <input type="text" v-model="searchQuery" placeholder="Search by name or email..." />
      </div>
    </div>

    <!-- NEW: Tabbed navigation for filtering users by role -->
    <div class="user-filters">
        <button class="filter-tab" :class="{ active: activeTab === 'all' }" @click="activeTab = 'all'">All Users</button>
        <button class="filter-tab" :class="{ active: activeTab === 'owner' }" @click="activeTab = 'owner'">Owners</button>
        <button class="filter-tab" :class="{ active: activeTab === 'renter' }" @click="activeTab = 'renter'">Renters</button>
    </div>

    <div v-if="loading" class="loading-state">
      <p>Loading user data...</p>
    </div>
    <div v-else-if="error" class="error-state">
      <p>Failed to load users. Please try again.</p>
      <button @click="fetchData" class="button primary">Retry</button>
    </div>
    <div v-else-if="filteredUsers.length === 0" class="empty-state">
      <p>No users found matching your criteria.</p>
    </div>

    <div v-else class="table-container">
      <table>
        <thead>
          <tr>
            <th>User</th>
            <th>Role</th>
            <th>Listings</th>
            <th>Joined</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in filteredUsers" :key="user.uid">
            <td>
              <div class="user-cell">
                <span class="user-name">{{ user.name || 'N/A' }}</span>
                <span class="user-email">{{ user.email }}</span>
              </div>
            </td>
            <td>
              <span :class="['role-badge', getRoleClass(user.role)]">{{ user.role }}</span>
            </td>
            <td>{{ user.listingCount || 0 }}</td>
            <td>{{ formatDate(user.createdAt) }}</td>
            <td>
              <div class="action-buttons">
                <button @click="toggleUserRole(user)" class="button icon-button" title="Change Role" :disabled="user.role === 'admin'">
                  <i class="bi bi-person-gear"></i>
                </button>
                <button @click="viewProfile(user.uid)" class="button icon-button" title="View Profile">
                  <i class="bi bi-eye-fill"></i>
                </button>
                <button @click="handleDeleteUser(user)" class="button icon-button danger" title="Delete User" :disabled="user.role === 'admin'">
                    <i class="bi bi-trash3-fill"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import { DateTime } from 'luxon';

export default {
  name: 'AdminUsersView',
  data() {
    return {
      loading: true,
      error: null,
      searchQuery: '',
      activeTab: 'all', // 'all', 'owner', 'renter'
    };
  },
  computed: {
    ...mapGetters(['allUsers']),
    // This computed property now chains the filtering: first by role, then by search query.
    filteredUsers() {
      // 1. Filter by the active tab
      let usersByRole;
      if (this.activeTab === 'all') {
        usersByRole = this.allUsers;
      } else {
        usersByRole = this.allUsers.filter(user => user.role === this.activeTab);
      }

      // 2. Apply the search query on the result of the tab filter
      if (!this.searchQuery) {
        return usersByRole;
      }
      const lowerQuery = this.searchQuery.toLowerCase();
      return usersByRole.filter(user => {
        const name = user.name || '';
        const email = user.email || '';
        return (
          name.toLowerCase().includes(lowerQuery) ||
          email.toLowerCase().includes(lowerQuery)
        );
      });
    },
  },
  methods: {
    ...mapActions(['fetchAllUsers', 'updateUserRole', 'deleteUser']),
    async fetchData() {
      this.loading = true;
      this.error = null;
      try {
        await this.fetchAllUsers();
      } catch (err) {
        this.error = 'An error occurred while fetching user data.';
      } finally {
        this.loading = false;
      }
    },
    async toggleUserRole(user) {
      const newRole = user.role === 'owner' ? 'renter' : 'owner';
      if (!confirm(`Change ${user.email}'s role to '${newRole}'?`)) return;
      
      try {
        await this.updateUserRole({ userId: user.uid, role: newRole });
        await this.fetchData();
      } catch (error) {
        alert('Failed to update user role. Please try again.');
        console.error('Role update error:', error);
      }
    },
    async handleDeleteUser(user) {
        const confirmationMessage = `Are you sure you want to permanently delete the user ${user.email}? This will also delete all vehicles they own. This action cannot be undone.`;
        if (!confirm(confirmationMessage)) return;

        try {
            await this.deleteUser(user.uid);
            alert('User deleted successfully.');
            await this.fetchData();
        } catch (error) {
            alert('Failed to delete user. Please try again.');
            console.error('User deletion error:', error);
        }
    },
    viewProfile(userId) {
      this.$router.push({ name: 'UserProfileView', params: { userId } });
    },
    formatDate(dateObj) {
      if (!dateObj) return 'N/A';
      const date = dateObj._seconds ? new Date(dateObj._seconds * 1000) : new Date(dateObj);
      return DateTime.fromJSDate(date).toFormat('MMM dd, yyyy');
    },
    getRoleClass(role) {
      if (role === 'admin') return 'role-admin';
      if (role === 'owner') return 'role-owner';
      return 'role-renter';
    },
  },
  created() {
    this.fetchData();
  },
};
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.admin-page-container { max-width: 1200px; margin: 2rem auto; padding: 0 1rem; }
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}
.section-title { font-size: 2.5rem; font-weight: 700; margin: 0; }
.section-subtitle { font-size: 1.1rem; color: $text-color-medium; margin-top: 0.25rem; }
.search-bar {
  position: relative;
  i {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: $text-color-medium;
  }
  input {
    padding: 0.75rem 1rem 0.75rem 3rem;
    border-radius: $border-radius-pill;
    border: 1px solid $border-color;
    width: 300px;
    font-size: 1rem;
  }
}
/* NEW Styles for the filter tabs */
.user-filters {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 2rem;
    border-bottom: 1px solid $border-color;
}
.filter-tab {
    padding: 0.75rem 1.5rem;
    cursor: pointer;
    background: none;
    border: none;
    font-size: 1rem;
    font-weight: 600;
    color: $text-color-medium;
    border-bottom: 3px solid transparent;
    transition: all 0.2s ease;

    &.active {
        color: $primary-color;
        border-bottom-color: $primary-color;
    }
    &:hover:not(.active) {
        background-color: #f9fafb;
    }
}
.table-container { background-color: $card-background; border-radius: $border-radius-lg; box-shadow: $shadow-light; overflow-x: auto; }
table { width: 100%; border-collapse: collapse; text-align: left; }
th, td { padding: 1rem; border-bottom: 1px solid $border-color; vertical-align: middle; }
thead th { font-size: 0.8rem; font-weight: 600; color: $text-color-medium; text-transform: uppercase; }
tbody tr:last-child td { border-bottom: none; }
.user-cell { display: flex; flex-direction: column; }
.user-name { font-weight: 600; color: $text-color-dark; }
.user-email { font-size: 0.9rem; color: $text-color-medium; }
.role-badge {
  padding: 0.25rem 0.75rem;
  border-radius: $border-radius-pill;
  font-weight: 600;
  font-size: 0.8rem;
  text-transform: capitalize;
  &.role-admin { background-color: lighten($admin-color, 40%); color: darken($admin-color, 20%); }
  &.role-owner { background-color: lighten($accent-color, 35%); color: darken($accent-color, 20%); }
  &.role-renter { background-color: #e5e7eb; color: #4b5568; }
}
.action-buttons {
  display: flex;
  gap: 0.5rem;
}
.icon-button {
  background: none;
  border: none;
  cursor: pointer;
  color: $text-color-medium;
  padding: 0.5rem;
  border-radius: 50%;
  display: flex;
  transition: background-color 0.2s ease;
  &:hover:not(:disabled) { background-color: #f3f4f6; color: $primary-color; }
  i { font-size: 1.25rem; }
  &.danger:hover:not(:disabled) {
      background-color: lighten($admin-color, 40%);
      color: $admin-color;
  }
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}
</style>

