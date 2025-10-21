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
              <span class="notification-timestamp">{{ formatTimestamp(notification.createdAt) }}</span>
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
        // Optimistically mark as read locally while API call runs
        // This provides faster UI feedback
        const localNotification = this.notifications.find(n => n.id === notification.id);
        if (localNotification) {
            localNotification.isRead = true;
        }
        // Dispatch action to update backend and potentially refetch
        this.markNotificationAsRead(notification.id).catch(err => {
            console.error("Failed to mark notification as read:", err);
            // Optionally revert local change on error
             if (localNotification) {
                 localNotification.isRead = false;
             }
        });
      }

      if (notification.link) {
        this.$router.push(notification.link);
      }

      this.isDropdownOpen = false; // Close dropdown after click
    },
     async handleMarkAllAsRead() { // Made async for potential await
        if (this.unreadNotificationsCount > 0) {
            // Optimistically mark all as read locally
            this.notifications.forEach(n => n.isRead = true);
            try {
                await this.markAllNotificationsAsRead();
                // Optional: Refetch after success if needed, though local update might suffice
                // await this.fetchNotifications();
            } catch (error) {
                console.error("Failed to mark all notifications as read:", error);
                 // Optionally revert local changes on error
                 await this.fetchNotifications(); // Refetch to get correct state
            }
        }
    },
    formatTimestamp(timestamp) {
      if (!timestamp) return '';
      try {
        let jsDate;
        if (timestamp.toDate && typeof timestamp.toDate === 'function') {
          jsDate = timestamp.toDate();
        } else if (timestamp._seconds !== undefined && timestamp._nanoseconds !== undefined) {
          jsDate = new Date(timestamp._seconds * 1000 + timestamp._nanoseconds / 1000000);
        } else {
          jsDate = new Date(timestamp);
        }

        // Check if the resulting date is valid
        if (isNaN(jsDate.getTime())) {
          console.warn("Could not parse timestamp:", timestamp);
          return 'Invalid date';
        }

        // Format using Luxon
        return DateTime.fromJSDate(jsDate).toRelative();

      } catch (e) {
        console.error("Error formatting timestamp:", timestamp, e);
        return 'Invalid date';
      }
    },
    startPolling() {
      if(this.isAuthenticated) {
        this.fetchNotifications();
      }
      // Clear existing interval before starting a new one
      if (this.pollingInterval) {
          clearInterval(this.pollingInterval);
      }
      this.pollingInterval = setInterval(() => {
        if(this.isAuthenticated) {
          this.fetchNotifications();
        } else {
            // Stop polling if user logs out
             this.stopPolling();
        }
      }, 30000); // Poll every 30 seconds
    },
    stopPolling() {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null; // Clear interval ID
    }
  },
  watch: {
      // Re-start polling when user logs in
      isAuthenticated(isAuth) {
          if (isAuth) {
              this.startPolling();
          } else {
              this.stopPolling();
          }
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
  transition: color 0.2s ease; // Added transition

  &:hover {
    color: $primary-color;
  }
}
.notification-badge {
  position: absolute;
  top: 2px; // Adjusted position
  right: 2px; // Adjusted position
  background-color: $admin-color; // Use admin/danger color for more visibility
  color: white;
  border-radius: 50%;
  width: 16px; // Slightly smaller
  height: 16px;
  font-size: 0.65rem; // Slightly smaller font
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  pointer-events: none; // Prevent badge from interfering with clicks
}
.notification-dropdown {
  position: absolute;
  top: calc(100% + 10px); // Position below button with gap
  right: 0;
  margin-top: 0; // Removed default margin-top
  width: 360px; // Slightly wider
  max-height: 450px; // Increased height
  background-color: white;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-large;
  border: 1px solid $border-color-light; // Lighter border
  z-index: 1001;
  display: flex;
  flex-direction: column;
  overflow: hidden; // Hide overflow during animation
}
.dropdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem; // Adjusted padding
  border-bottom: 1px solid $border-color-light; // Lighter border
  background-color: #f8f9fa; // Subtle background for header

  h3 {
    margin: 0;
    font-size: 1rem; // Slightly smaller header
    font-weight: 600; // Bold header
  }
}
.mark-all-read-btn {
  background: none;
  border: none;
  color: $primary-color;
  font-weight: 500; // Normal weight
  cursor: pointer;
  font-size: 0.75rem; // Smaller text
  padding: 0.25rem 0.5rem; // Add padding
  border-radius: $border-radius-sm; // Add rounding
  transition: background-color 0.2s ease;

  &:hover {
    text-decoration: none; // Remove underline
    background-color: lighten($primary-color, 40%); // Subtle hover background
  }
}
.notification-list {
  list-style: none;
  margin: 0;
  padding: 0;
  overflow-y: auto; // Enable scroll
  flex-grow: 1; // Allow list to take available space
}
.notification-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem; // Consistent padding
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-bottom: 1px solid $border-color-light; // Lighter border

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: #f1f3f5; // Subtle hover
  }

  &.is-read {
    background-color: #f8f9fa; // Slightly different background for read items
    opacity: 1; // Don't dim read items, use background instead

    .notification-message {
        font-weight: 400; // Normal weight for read messages
        color: $text-color-medium; // Dimmer text color
    }
     .unread-indicator {
       display: none;
     }
  }
}
.notification-content {
  flex-grow: 1;
  padding-right: 0.5rem; // Space before indicator
}
.notification-message {
  margin: 0 0 0.25rem 0;
  font-size: 0.85rem; // Slightly smaller message text
  color: $text-color-dark;
  line-height: 1.4;
  font-weight: 500; // Slightly bolder unread messages
}
.notification-timestamp {
  font-size: 0.7rem; // Smaller timestamp
  color: $text-color-medium;
  display: block; // Ensure it takes its own line
}
.unread-indicator {
  width: 7px; // Smaller indicator
  height: 7px;
  background-color: $primary-color;
  border-radius: 50%;
  margin-left: 0.5rem; // Reduced margin
  flex-shrink: 0;
}
.empty-state, .loading-state {
  padding: 2rem 1rem; // Adjusted padding
  text-align: center;
  color: $text-color-medium;
  flex-grow: 1; // Allow to fill space if list is empty
  display: flex; // Center content vertically
  flex-direction: column;
  justify-content: center;
  align-items: center;
  i {
    font-size: 1.8rem; // Slightly smaller icon
    margin-bottom: 0.75rem;
    color: $secondary-color; // Use success color for "all caught up"
  }
  p {
      font-size: 0.9rem;
  }
}

.loading-state p {
    font-style: italic; // Italicize loading text
}

// Improved Fade Animation
.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition: opacity 0.2s ease-out, transform 0.2s ease-out;
}
.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-5px); // Smaller translation
}
</style>