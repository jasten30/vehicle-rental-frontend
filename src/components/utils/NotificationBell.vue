<template>
  <div class="notification-bell-container" ref="bellContainer">
    <button @click="toggleDropdown" class="bell-button">
      <i class="bi bi-bell-fill"></i>
      <span v-if="unreadNotificationsCount > 0" class="notification-badge">{{ unreadNotificationsCount }}</span>
    </button>
    <transition name="dropdown-fade">
      <div v-if="isDropdownOpen" class="notification-dropdown">
        <div class="dropdown-header">
          <h3>Notifications</h3>
          <button v-if="unreadNotificationsCount > 0" @click.stop="handleMarkAllAsRead" class="mark-all-read-btn">Mark all as read</button>
        </div>
        <div v-if="isLoadingNotifications" class="loading-state">
          <p>Loading...</p>
        </div>
        <div v-else-if="notifications.length === 0" class="empty-state">
          <i class="bi bi-check2-circle"></i>
          <p>You're all caught up!</p>
        </div>
        <ul v-else class="notification-list">
          <li
            v-for="notification in notifications"
            :key="notification.id"
            :class="{ 'is-read': notification.isRead }"
            @click="handleNotificationClick(notification)"
            class="notification-item"
          >
            <div class="notification-content">
              <p class="notification-message">{{ notification.message }}</p>
              <span class="notification-timestamp">{{ formatTimestamp(notification.timestamp) }}</span>
            </div>
            <div v-if="!notification.isRead" class="unread-indicator"></div>
          </li>
        </ul>
      </div>
    </transition>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import { DateTime } from 'luxon';

export default {
  name: 'NotificationBell',
  data() {
    return {
      isDropdownOpen: false,
      pollingInterval: null,
    };
  },
  computed: {
    ...mapGetters(['notifications', 'unreadNotificationsCount', 'isLoadingNotifications', 'isAuthenticated']),
  },
  methods: {
    ...mapActions(['fetchNotifications', 'markAllNotificationsAsRead', 'markNotificationAsRead']),
    toggleDropdown() {
      this.isDropdownOpen = !this.isDropdownOpen;
      if (this.isDropdownOpen) {
        this.fetchNotifications();
      }
    },
    handleNotificationClick(notification) {
      if (!notification.isRead) {
        this.markNotificationAsRead(notification.id);
      }
      
      // 👇 THIS CODE IS NOW UNCOMMENTED TO ENABLE NAVIGATION
      if (notification.link) {
        this.$router.push(notification.link);
      }
      
      this.isDropdownOpen = false;
    },
    handleMarkAllAsRead() {
        if(this.unreadNotificationsCount > 0) {
            this.markAllNotificationsAsRead();
        }
    },
    formatTimestamp(timestamp) {
      if (!timestamp) return '';
      // Firestore timestamps need to be converted to JS Dates first
      const jsDate = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return DateTime.fromJSDate(jsDate).toRelative();
    },
    closeDropdownOnClickOutside(event) {
      if (this.isDropdownOpen && this.$refs.bellContainer) {
        if (!this.$refs.bellContainer.contains(event.target)) {
          this.isDropdownOpen = false;
        }
      }
    },
    startPolling() {
        if(this.isAuthenticated) {
            this.fetchNotifications();
        }
        this.pollingInterval = setInterval(() => {
            if(this.isAuthenticated) {
                this.fetchNotifications();
            }
        }, 30000);
    },
    stopPolling() {
        clearInterval(this.pollingInterval);
    }
  },
  mounted() {
    document.addEventListener('click', this.closeDropdownOnClickOutside);
    this.startPolling();
  },
  beforeUnmount() {
    document.removeEventListener('click', this.closeDropdownOnClickOutside);
    this.stopPolling();
  },
};
</script>

<style lang="scss" scoped>
// --- THIS IS THE FIX ---
// This line imports your global SASS variables, making them available in this component.
@import '@/assets/styles/variables.scss';

.notification-bell-container {
  position: relative;
}
.bell-button {
  position: relative;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.5rem;
  color: $text-color-dark;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: $primary-color;
  }
}
.notification-badge {
  position: absolute;
  top: 0;
  right: 0;
  background-color: $primary-color;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 0.7rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}
.notification-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.75rem;
  width: 350px;
  max-height: 400px;
  background-color: white;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-large;
  border: 1px solid $border-color;
  z-index: 1001;
  display: flex;
  flex-direction: column;
}
.dropdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid $border-color;

  h3 {
    margin: 0;
    font-size: 1.1rem;
  }
}
.mark-all-read-btn {
  background: none;
  border: none;
  color: $primary-color;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.8rem;

  &:hover {
    text-decoration: underline;
  }
}
.notification-list {
  list-style: none;
  margin: 0;
  padding: 0;
  overflow-y: auto;
}
.notification-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-bottom: 1px solid $border-color;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: #f9f9f9;
  }

  &.is-read {
    opacity: 0.7;
    .unread-indicator {
      display: none;
    }
  }
}
.notification-content {
  flex-grow: 1;
}
.notification-message {
  margin: 0 0 0.25rem 0;
  font-size: 0.9rem;
  color: $text-color-dark;
  line-height: 1.4;
}
.notification-timestamp {
  font-size: 0.75rem;
  color: $text-color-medium;
}
.unread-indicator {
  width: 8px;
  height: 8px;
  background-color: $primary-color;
  border-radius: 50%;
  margin-left: 1rem;
  flex-shrink: 0;
}
.empty-state, .loading-state {
  padding: 2rem;
  text-align: center;
  color: $text-color-medium;
  i {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }
}
.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition: transform 0.2s ease-out, opacity 0.2s ease-out;
}
.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  transform: translateY(-10px) scale(0.98);
  opacity: 0;
}
</style>

