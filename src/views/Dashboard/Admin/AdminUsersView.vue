<template>
  <div class="admin-page-container">
    <header class="page-header">
      <div class="header-content">
        <h2 class="section-title">User Management</h2>
        <p class="section-subtitle">Monitor and manage user roles and platform access.</p>
      </div>
      <div class="header-stats">
        <div class="stat-item">
          <span class="stat-val">{{ allUsers.length }}</span>
          <span class="stat-label">Total</span>
        </div>
      </div>
    </header>

    <div class="control-bar">
      <div class="tabs-wrapper">
        <button 
          v-for="tab in ['all', 'owner', 'renter']" 
          :key="tab"
          class="filter-tab" 
          :class="{ active: activeTab === tab }" 
          @click="activeTab = tab"
        >
          {{ tab.charAt(0).toUpperCase() + tab.slice(1) + 's' }}
        </button>
      </div>

      <div class="search-wrapper">
        <i class="bi bi-search search-icon"></i>
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Find user by name or email..." 
          class="search-input"
        />
      </div>
    </div>

    <div class="content-area">
      
      <div v-if="loading" class="state-container">
        <div class="spinner"></div>
        <p>Fetching users...</p>
      </div>

      <div v-else-if="error" class="state-container error">
        <i class="bi bi-exclamation-circle"></i>
        <p>{{ error }}</p>
        <button @click="fetchData" class="button primary-btn">Retry</button>
      </div>

      <div v-else-if="filteredUsers.length === 0" class="state-container empty">
        <i class="bi bi-people"></i>
        <p>No users found.</p>
      </div>

      <div v-else>
        <div class="desktop-view table-responsive">
          <table class="modern-table">
            <thead>
              <tr>
                <th>User Profile</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in filteredUsers" :key="user.uid" :class="{ 'suspended-row': user.isSuspended }">
                <td>
                  <div class="user-info-cell">
                    <div class="user-avatar" :style="{ backgroundColor: getAvatarColor(user.name) }">
                      {{ getInitials(user.name) }}
                    </div>
                    <div class="user-text">
                      <span class="name">
                        {{ user.name || 'Unknown User' }}
                        <i v-if="user.isSuspended" class="bi bi-slash-circle-fill text-danger ml-1" title="Suspended"></i>
                      </span>
                      <span class="email">{{ user.email }}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span :class="['role-badge', getRoleClass(user.role)]">
                    {{ user.role }}
                  </span>
                </td>
                <td>
                  <div class="status-indicator">
                    <span v-if="user.isSuspended" class="status-badge status-danger">Suspended</span>
                    <span v-else class="status-badge status-success">Active</span>
                  </div>
                </td>
                <td class="date-cell">{{ formatDate(user.createdAt) }}</td>
                <td>
                  <div class="actions-cell">
                    <button @click="viewProfile(user.uid)" class="action-btn view" title="View Profile">
                      <i class="bi bi-eye"></i>
                    </button>
                    
                    <button 
                      @click="toggleUserRole(user)" 
                      class="action-btn edit" 
                      title="Switch Role" 
                      :disabled="user.role === 'admin'"
                    >
                      <i class="bi bi-arrow-left-right"></i>
                    </button>

                    <button 
                      @click="handleSuspendUser(user)" 
                      class="action-btn suspend" 
                      :class="{ 'active-suspend': user.isSuspended }"
                      :title="user.isSuspended ? 'Unsuspend User' : 'Suspend User'"
                      :disabled="user.role === 'admin'"
                    >
                      <i :class="user.isSuspended ? 'bi bi-unlock-fill' : 'bi bi-slash-circle'"></i>
                    </button>

                    <button 
                      @click="handleDeleteUser(user)" 
                      class="action-btn delete" 
                      title="Delete User" 
                      :disabled="user.role === 'admin'"
                    >
                      <i class="bi bi-trash3"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="mobile-view grid-layout">
          <div v-for="user in filteredUsers" :key="user.uid" class="user-card" :class="{ 'suspended-card': user.isSuspended }">
            <div class="card-header">
              <div class="user-avatar" :style="{ backgroundColor: getAvatarColor(user.name) }">
                {{ getInitials(user.name) }}
              </div>
              <div class="card-meta">
                <span :class="['role-badge', getRoleClass(user.role)]">{{ user.role }}</span>
                <span v-if="user.isSuspended" class="status-badge status-danger small">Suspended</span>
              </div>
            </div>
            
            <div class="card-body">
              <h3 class="card-name">{{ user.name || 'Unknown' }}</h3>
              <p class="card-email">{{ user.email }}</p>
              <p class="card-listings"><i class="bi bi-car-front-fill"></i> {{ user.listingCount || 0 }} vehicles listed</p>
            </div>

            <div class="card-actions">
              <button @click="viewProfile(user.uid)" class="btn-card secondary">Profile</button>
              <div class="icon-group">
                <button 
                  @click="toggleUserRole(user)" 
                  class="btn-icon" 
                  :disabled="user.role === 'admin'"
                >
                  <i class="bi bi-arrow-left-right"></i>
                </button>
                
                <button 
                  @click="handleSuspendUser(user)" 
                  class="btn-icon suspend" 
                  :class="{ 'active-suspend': user.isSuspended }"
                  :disabled="user.role === 'admin'"
                >
                  <i :class="user.isSuspended ? 'bi bi-unlock-fill' : 'bi bi-slash-circle'"></i>
                </button>

                <button 
                  @click="handleDeleteUser(user)" 
                  class="btn-icon danger" 
                  :disabled="user.role === 'admin'"
                >
                  <i class="bi bi-trash3"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
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
      activeTab: 'all',
    };
  },
  computed: {
    ...mapGetters(['allUsers']),
    filteredUsers() {
      let usersByRole;
      if (this.activeTab === 'all') {
        usersByRole = this.allUsers;
      } else {
        usersByRole = this.allUsers.filter(user => user.role === this.activeTab);
      }

      if (!this.searchQuery) return usersByRole;

      const lowerQuery = this.searchQuery.toLowerCase();
      return usersByRole.filter(user => {
        const name = user.name || '';
        const email = user.email || '';
        return name.toLowerCase().includes(lowerQuery) || email.toLowerCase().includes(lowerQuery);
      });
    },
  },
  methods: {
    // Ensure toggleUserSuspension is in mapActions
    ...mapActions(['fetchAllUsers', 'updateUserRole', 'deleteUser', 'toggleUserSuspension']),
    
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
    getInitials(name) {
      if (!name) return 'U';
      return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    },
    getAvatarColor(name) {
      const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1'];
      if (!name) return '#9ca3af';
      let hash = 0;
      for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
      }
      return colors[Math.abs(hash) % colors.length];
    },
    async toggleUserRole(user) {
      const newRole = user.role === 'owner' ? 'renter' : 'owner';
      if (!confirm(`Change ${user.email}'s role to '${newRole}'?`)) return;
      
      try {
        await this.updateUserRole({ userId: user.uid, role: newRole });
        await this.fetchData();
      } catch (error) {
        alert('Failed to update user role.');
      }
    },
    
    async handleSuspendUser(user) {
        const action = user.isSuspended ? 'unsuspend' : 'suspend';
        if (!confirm(`Are you sure you want to ${action} ${user.name || user.email}?`)) return;

        // 1. Optimistic Update (Force Reactivity)
        const originalStatus = user.isSuspended;
        user.isSuspended = !originalStatus;

        try {
            await this.toggleUserSuspension({
                userId: user.uid,
                isSuspended: user.isSuspended
            });
            
            alert(`User ${action}ed successfully.`);
            
            // 2. Re-fetch data to ensure backend state is synced
            await this.fetchData(); 

        } catch (error) {
            // 3. Revert on error
            user.isSuspended = originalStatus;
            console.error(error);
            alert('Failed to update user status.');
        }
    },
    
    async handleDeleteUser(user) {
        if (!confirm(`Permanently delete ${user.email}?`)) return;
        try {
            await this.deleteUser(user.uid);
            await this.fetchData();
        } catch (error) {
            alert('Failed to delete user.');
        }
    },
    viewProfile(userId) {
      this.$router.push({ name: 'UserProfileView', params: { userId } });
    },
    formatDate(dateObj) {
      if (!dateObj) return '-';
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

// --- Variables ---
$bg-color: #f8f9fa;
$text-main: #1f2937;
$text-light: #6b7280;
$border-color: #e5e7eb;
$card-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);

.admin-page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  color: $text-main;

  @media(max-width: 768px) {
    padding: 1rem;
  }
}

// --- Header ---
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 2.5rem;

  .section-title {
    font-size: 2rem;
    font-weight: 800;
    margin: 0 0 0.5rem 0;
    letter-spacing: -0.025em;
  }
  .section-subtitle {
    color: $text-light;
    margin: 0;
    font-size: 1rem;
  }
  
  .header-stats {
    @media(max-width: 768px) { display: none; }
    .stat-item {
      text-align: center;
      background: white;
      padding: 0.5rem 1.5rem;
      border-radius: 12px;
      box-shadow: $card-shadow;
      
      .stat-val { display: block; font-weight: 800; font-size: 1.5rem; color: $primary-color; line-height: 1; }
      .stat-label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; color: $text-light; }
    }
  }
}

// --- Control Bar (Tabs + Search) ---
.control-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 0.5rem;
  border-radius: 16px;
  box-shadow: $card-shadow;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;

  @media(max-width: 768px) {
    flex-direction: column-reverse;
    align-items: stretch;
    padding: 1rem;
  }
}

.tabs-wrapper {
  display: flex;
  gap: 0.25rem;
  background: $bg-color;
  padding: 0.25rem;
  border-radius: 12px;

  .filter-tab {
    border: none;
    background: none;
    padding: 0.6rem 1.25rem;
    font-size: 0.9rem;
    font-weight: 600;
    color: $text-light;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover { color: $text-main; }
    &.active {
      background: white;
      color: $primary-color;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
  }
  @media(max-width: 768px) {
    width: 100%;
    justify-content: space-between;
    .filter-tab { flex: 1; text-align: center; padding: 0.6rem 0; font-size: 0.85rem; }
  }
}

.search-wrapper {
  position: relative;
  @media(max-width: 768px) { width: 100%; }

  .search-icon {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: $text-light;
  }
  .search-input {
    padding: 0.75rem 1rem 0.75rem 2.8rem;
    border: 1px solid $border-color;
    border-radius: 12px;
    width: 300px;
    transition: all 0.2s;
    font-size: 0.95rem;

    &:focus {
      outline: none;
      border-color: $primary-color;
      box-shadow: 0 0 0 3px rgba($primary-color, 0.1);
    }
    @media(max-width: 768px) { width: 100%; }
  }
}

// --- Desktop Table View ---
.desktop-view {
  display: block;
  @media(max-width: 768px) { display: none; }
}

.table-responsive {
  background: white;
  border-radius: 16px;
  box-shadow: $card-shadow;
  overflow: hidden;
}

.modern-table {
  width: 100%;
  border-collapse: collapse;

  thead th {
    text-align: left;
    padding: 1.25rem 1.5rem;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: $text-light;
    background: #fafafa;
    border-bottom: 1px solid $border-color;
  }

  tbody td {
    padding: 1rem 1.5rem;
    border-bottom: 1px solid $border-color;
    vertical-align: middle;
  }

  tbody tr:hover {
    background-color: #f9fafb;
  }

  // Dim suspended rows
  .suspended-row {
      background-color: #fef2f2; // Very light red bg
      opacity: 0.8;
  }

  .text-right { text-align: right; }
}

// --- Mobile Card View ---
.mobile-view {
  display: none;
  grid-template-columns: 1fr;
  gap: 1rem;
  @media(max-width: 768px) { display: grid; }
}

.user-card {
  background: white;
  border-radius: 16px;
  padding: 1.25rem;
  box-shadow: $card-shadow;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  &.suspended-card {
      border-left: 5px solid #dc2626;
      background-color: #fef2f2;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    
    .card-meta {
      text-align: right;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.25rem;
      .join-date { font-size: 0.75rem; color: $text-light; }
    }
  }

  .card-body {
    .card-name { margin: 0; font-size: 1.1rem; font-weight: 700; }
    .card-email { margin: 0.1rem 0 0.5rem 0; font-size: 0.9rem; color: $text-light; }
    .card-listings { margin: 0; font-size: 0.85rem; color: $primary-color; display: flex; align-items: center; gap: 0.5rem; background: rgba($primary-color, 0.05); padding: 0.25rem 0.5rem; border-radius: 6px; width: fit-content;}
  }

  .card-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid $border-color;
    padding-top: 1rem;
    margin-top: 0.5rem;

    .btn-card {
      padding: 0.5rem 1rem;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.9rem;
      border: 1px solid $border-color;
      background: white;
      color: $text-main;
    }
    .icon-group {
      display: flex;
      gap: 0.5rem;
    }
  }
}

// --- Shared Components ---
.user-info-cell {
  display: flex;
  align-items: center;
  gap: 1rem;

  .user-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 700;
    font-size: 0.9rem;
    flex-shrink: 0;
  }
  .user-text {
    display: flex;
    flex-direction: column;
    .name { font-weight: 600; color: $text-main; }
    .email { font-size: 0.85rem; color: $text-light; }
  }
}

.role-badge {
  padding: 0.35rem 0.75rem;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  &.role-admin { background: #fee2e2; color: #ef4444; }
  &.role-owner { background: #e0e7ff; color: #6366f1; }
  &.role-renter { background: #d1fae5; color: #10b981; }
}

.status-badge {
    padding: 0.25rem 0.6rem;
    border-radius: 4px;
    font-weight: 600;
    font-size: 0.75rem;
    &.status-danger { background: #fee2e2; color: #ef4444; border: 1px solid #fecaca; }
    &.status-success { background: #dcfce7; color: #16a34a; border: 1px solid #bbf7d0; }
    &.small { font-size: 0.7rem; padding: 2px 6px; }
}

.actions-cell {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.action-btn, .btn-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: $text-light;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover { background: #f3f4f6; color: $primary-color; }
  &.delete:hover { background: #fee2e2; color: #ef4444; }
  &.edit:hover { background: #e0e7ff; color: #6366f1; }
  
  /* Suspend specific styles */
  &.suspend:hover { background: #fee2e2; color: #ef4444; }
  &.active-suspend {
      color: #dc2626;
      background: #fee2e2;
      &:hover { background: #dcfce7; color: #16a34a; }
  }
  
  &:disabled { opacity: 0.3; cursor: not-allowed; &:hover { background: none; } }
}

.ml-1 { margin-left: 0.25rem; }
.text-danger { color: #dc2626; }

// --- State Containers ---
.state-container {
  text-align: center;
  padding: 4rem 2rem;
  color: $text-light;
  background: white;
  border-radius: 16px;
  box-shadow: $card-shadow;

  .spinner {
    margin: 0 auto 1rem;
    width: 2rem;
    height: 2rem;
    border: 3px solid rgba($primary-color, 0.3);
    border-radius: 50%;
    border-top-color: $primary-color;
    animation: spin 1s ease-in-out infinite;
  }
  i { font-size: 2.5rem; margin-bottom: 1rem; display: block; opacity: 0.5; }
  
  &.error i { color: #ef4444; opacity: 1; }
  
  .primary-btn {
    margin-top: 1rem;
    background: $primary-color;
    color: white;
    border: none;
    padding: 0.6rem 1.5rem;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
  }
}

@keyframes spin { to { transform: rotate(360deg); } }
</style>