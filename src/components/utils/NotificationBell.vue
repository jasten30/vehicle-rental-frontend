<template>
  <div class="notification-bell-container" ref="bellContainer">
    <button @click="toggleDropdown" class="bell-button">
      <i class="bi bi-bell-fill"></i>
      <span v-if="unreadNotificationsCount > 0" class="notification-badge">{{
        unreadNotificationsCount
      }}</span>
    </button>
    <transition name="dropdown-fade">
      <div v-if="isDropdownOpen" class="notification-dropdown">
        <div class="dropdown-header">
          <h3>Notifications</h3>
          <button
            v-if="unreadNotificationsCount > 0"
            @click.stop="handleMarkAllAsRead"
            class="mark-all-read-btn"
          >
            Mark all as read
          </button>
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
              <span class="notification-timestamp">{{
                formatTimestamp(notification.createdAt)
              }}</span>
            </div>
            <div v-if="!notification.isRead" class="unread-indicator"></div>
          </li>
        </ul>
      </div>
    </transition>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import { DateTime } from "luxon";

export default {
  name: "NotificationBell",
  data() {
    return {
      isDropdownOpen: false,
      pollingInterval: null,
    };
  },
  computed: {
    ...mapGetters([
      "notifications",
      "unreadNotificationsCount",
      "isLoadingNotifications",
      "isAuthenticated",
    ]),
  },
  methods: {
    ...mapActions([
      "fetchNotifications",
      "markAllNotificationsAsRead",
      "markNotificationAsRead",
    ]),

    toggleDropdown() {
      this.isDropdownOpen = !this.isDropdownOpen;
      // Only fetch if opening, and we haven't fetched recently?
      // Actually, relying on polling is better, or fetch once on open.
      if (this.isDropdownOpen) {
        this.fetchNotifications();
      }
    },

    handleNotificationClick(notification) {
      if (!notification.isRead) {
        const localNotification = this.notifications.find(
          (n) => n.id === notification.id
        );
        if (localNotification) localNotification.isRead = true;

        this.markNotificationAsRead(notification.id).catch((err) => {
          console.error("Failed to mark notification as read:", err);
          if (localNotification) localNotification.isRead = false;
        });
      }
      if (notification.link) {
        this.$router.push(notification.link);
      }
      this.isDropdownOpen = false;
    },

    async handleMarkAllAsRead() {
      if (this.unreadNotificationsCount > 0) {
        this.notifications.forEach((n) => (n.isRead = true));
        try {
          await this.markAllNotificationsAsRead();
        } catch (error) {
          console.error("Failed to mark all as read:", error);
          await this.fetchNotifications();
        }
      }
    },

    formatTimestamp(timestamp) {
      if (!timestamp) return "";
      try {
        let jsDate;
        if (timestamp.toDate) jsDate = timestamp.toDate();
        else if (timestamp._seconds)
          jsDate = new Date(timestamp._seconds * 1000);
        else jsDate = new Date(timestamp);

        if (isNaN(jsDate.getTime())) return "Invalid date";
        return DateTime.fromJSDate(jsDate).toRelative();
      } catch (e) {
        return "Invalid date";
      }
    },

    startPolling() {
      // 1. SAFETY: Clear any existing interval first to prevent duplicates
      this.stopPolling();

      // 2. Fetch once immediately on mount (if authenticated)
      if (this.isAuthenticated) {
        this.fetchNotifications();
      }

      // 3. Set interval for every 60 seconds (not 30, saves quota)
      this.pollingInterval = setInterval(() => {
        if (this.isAuthenticated) {
          this.fetchNotifications();
        }
      }, 60000);
    },

    stopPolling() {
      if (this.pollingInterval) {
        clearInterval(this.pollingInterval);
        this.pollingInterval = null;
      }
    },

    closeDropdownOnClickOutside(event) {
      // Logic to close dropdown if clicking outside
      if (
        this.isDropdownOpen &&
        this.$refs.bellContainer &&
        !this.$refs.bellContainer.contains(event.target)
      ) {
        this.isDropdownOpen = false;
      }
    },
  },
  watch: {
    isAuthenticated: {
      immediate: true, // Run this logic immediately on creation
      handler(isAuth) {
        if (isAuth) {
          this.startPolling();
        } else {
          this.stopPolling();
        }
      },
    },
  },
  // Note: We don't need 'mounted' to call startPolling anymore because the watcher does it immediately.
  mounted() {
    document.addEventListener("click", this.closeDropdownOnClickOutside);
  },
  beforeUnmount() {
    document.removeEventListener("click", this.closeDropdownOnClickOutside);
    this.stopPolling();
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/styles/variables.scss";

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
  transition: color 0.2s ease;

  &:hover {
    color: $primary-color;
  }
}

.notification-badge {
  position: absolute;
  top: 2px;
  right: 2px;
  background-color: $admin-color;
  color: white;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  font-size: 0.65rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  pointer-events: none;
}

/* --- RESPONSIVE DROPDOWN --- */
.notification-dropdown {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  margin-top: 0;
  width: 360px; /* Default Desktop Width */
  max-height: 450px;
  background-color: white;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-large;
  border: 1px solid $border-color-light;
  z-index: 1001;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  /* --- Mobile Optimization --- */
  @media (max-width: 576px) {
    position: fixed; /* Break out of relative container */
    top: 70px; /* Position below header */
    left: 1rem; /* Gap from left */
    right: 1rem; /* Gap from right */
    width: auto; /* Auto width to fill space */
    max-height: 70vh; /* Prevent covering whole screen */
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2); /* Stronger shadow for floating element */
  }
}

.dropdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid $border-color-light;
  background-color: #f8f9fa;

  h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
  }
}

.mark-all-read-btn {
  background: none;
  border: none;
  color: $primary-color;
  font-weight: 500;
  cursor: pointer;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: $border-radius-sm;
  transition: background-color 0.2s ease;

  &:hover {
    text-decoration: none;
    background-color: lighten($primary-color, 40%);
  }
}

.notification-list {
  list-style: none;
  margin: 0;
  padding: 0;
  overflow-y: auto;
  flex-grow: 1;
  /* Smooth scroll for list */
  -webkit-overflow-scrolling: touch;
}

.notification-item {
  display: flex;
  align-items: flex-start; /* Align to top for multiline text */
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-bottom: 1px solid $border-color-light;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: #f1f3f5;
  }

  &.is-read {
    background-color: #ffffff; /* White for read */

    .notification-message {
      font-weight: 400;
      color: $text-color-medium;
    }
    .unread-indicator {
      display: none;
    }
  }

  /* Unread Style */
  &:not(.is-read) {
    background-color: lighten($primary-color, 48%); /* Very subtle highlight */
  }
}

.notification-content {
  flex-grow: 1;
  padding-right: 0.5rem;
}

.notification-message {
  margin: 0 0 0.25rem 0;
  font-size: 0.85rem;
  color: $text-color-dark;
  line-height: 1.4;
  font-weight: 600; /* Bold for unread */
}

.notification-timestamp {
  font-size: 0.7rem;
  color: $text-color-medium;
  display: block;
}

.unread-indicator {
  width: 8px;
  height: 8px;
  background-color: $primary-color;
  border-radius: 50%;
  margin-left: 0.5rem;
  margin-top: 0.3rem; /* Align with text top */
  flex-shrink: 0;
}

.empty-state,
.loading-state {
  padding: 2rem 1rem;
  text-align: center;
  color: $text-color-medium;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 150px;

  i {
    font-size: 1.8rem;
    margin-bottom: 0.75rem;
    color: $secondary-color;
  }
  p {
    font-size: 0.9rem;
  }
}

.loading-state p {
  font-style: italic;
}

// Fade Animation
.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition:
    opacity 0.2s ease-out,
    transform 0.2s ease-out;
}
.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
</style>
