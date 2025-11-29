<template>
  <div class="chat-container">
    <!-- Left Column: Conversation List -->
    <div class="conversation-list">
      <div class="list-header">
        <h2>Inbox</h2>
        <!-- Optional: Add a search bar here -->
        <!-- <input type="text" placeholder="Search inbox..." class="search-bar" /> -->
      </div>
      <div v-if="loading" class="info-state">
        <p>Loading conversations...</p>
      </div>
      <div
        v-else-if="!sortedConversations || sortedConversations.length === 0"
        class="info-state"
      >
        <p>You have no messages yet.</p>
      </div>
      <div v-else class="conversations-scroll-area">
        <div
          v-for="chat in sortedConversations"
          :key="chat.id"
          class="conversation-item"
          :class="{
            active: selectedConversation && selectedConversation.id === chat.id,
          }"
          @click="selectConversation(chat)"
        >
          <div v-if="chat.otherUserDetails" class="conversation-content">
            <img
              :src="
                chat.otherUserDetails.profilePhotoUrl ||
                'https://placehold.co/100x100/e2e8f0/666666?text=User'
              "
              alt="Avatar"
              class="avatar"
            />
            <div class="conversation-details">
              <p class="user-name" :class="{ 'unread-text': isUnread(chat) }">
                {{ chat.otherUserDetails.name }}
              </p>
              <p
                class="last-message"
                :class="{ 'unread-text': isUnread(chat) }"
              >
                <!-- 👇 UPDATED: Added a check for 'user' before accessing 'user.uid' -->
                <span v-if="user && chat.lastMessage.senderId === user.uid"
                  >You:
                </span>
                {{ chat.lastMessage.text }}
              </p>
            </div>
            <div class="conversation-meta">
              <span class="last-message-time">{{
                formatLastMessageTime(chat.lastMessage.timestamp)
              }}</span>
              <div v-if="isUnread(chat)" class="unread-indicator"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Column: Active Chat Window -->
    <div class="chat-window">
      <div v-if="selectedConversation" class="chat-content-window">
        <!-- UPDATED: Chat header now includes avatar -->
        <div class="chat-header">
          <img
            :src="
              selectedConversation.otherUserDetails.profilePhotoUrl ||
              'https://placehold.co/100x100/e2e8f0/666666?text=User'
            "
            alt="Avatar"
            class="avatar-small"
          />
          <h3>{{ selectedConversation.otherUserDetails.name }}</h3>
          <!-- Optional: Add link to booking -->
          <router-link
            v-if="selectedConversation.bookingId"
            :to="`/dashboard/my-bookings/${selectedConversation.bookingId}`"
            class="booking-link"
            title="View Booking Details"
          >
            <i class="bi bi-file-text-fill"></i>
          </router-link>
        </div>
        <div class="message-area" ref="messageArea">
          <div
            v-for="message in messages"
            :key="message.id"
            class="message-bubble-wrapper"
            :class="{ 'is-sender': user && message.senderId === user.uid }"
          >
            <div class="message-bubble">
              <!-- MODIFIED: Show text if it exists -->
              <p v-if="message.text" class="message-text">{{ message.text }}</p>
              <!-- ADDED: Show image if it exists -->
              <img
                v-if="message.imageUrl"
                :src="message.imageUrl"
                alt="Chat image"
                class="chat-image"
                @load="scrollToBottom"
              />
            </div>
          </div>
        </div>
        <!-- Message Input Area -->
        <div class="message-input-area-wrapper">
          <!-- ADDED: Image Preview Area -->
          <div v-if="stagedImagePreview" class="image-preview">
            <img :src="stagedImagePreview" alt="Image preview" />
            <button @click="cancelImagePreview" class="cancel-preview-btn">
              <i class="bi bi-x"></i>
            </button>
          </div>
          <!-- END Image Preview -->

          <div class="message-input-area">
            <!-- ADDED: File Input Button -->
            <input
              type="file"
              ref="fileInput"
              @change="onFileSelected"
              accept="image/png, image/jpeg"
              hidden
            />
            <button
              @click="triggerFileInput"
              class="icon-button"
              title="Attach image"
            >
              <i class="bi bi-paperclip"></i>
            </button>
            <!-- END File Input Button -->

            <input
              v-model="newMessage"
              @keyup.enter="handleSendMessage"
              type="text"
              placeholder="Type a message..."
            />
            <button
              @click="handleSendMessage"
              class="send-button"
              :disabled="!canSendMessage"
            >
              <i class="bi bi-send-fill"></i>
            </button>
          </div>
        </div>
      </div>
      <div v-else class="no-chat-selected">
        <i class="bi bi-chat-dots-fill"></i>
        <p>Select a conversation to start chatting</p>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from "vuex";
import { db } from "@/firebase/config";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { DateTime } from "luxon";

export default {
  name: "ChatView",
  data() {
    return {
      loading: true,
      selectedConversation: null,
      messages: [],
      newMessage: "",
      messagesUnsubscribe: null,
      stagedImageBase64: null,
      stagedImagePreview: null,
    };
  },
  computed: {
    ...mapGetters(["user"]),
    ...mapState(["userChats"]),
    sortedConversations() {
      if (!this.userChats || this.userChats.length === 0) return [];
      return [...this.userChats].sort((a, b) => {
        const timeA =
          a.lastMessage?.timestamp?._seconds ||
          a.lastMessage?.timestamp?.seconds ||
          0;
        const timeB =
          b.lastMessage?.timestamp?._seconds ||
          b.lastMessage?.timestamp?.seconds ||
          0;
        return timeB - timeA;
      });
    },
    canSendMessage() {
      return this.newMessage.trim() !== "" || this.stagedImageBase64 !== null;
    },
  },
  methods: {
    ...mapActions(["fetchUserChats", "sendMessage", "markChatAsRead"]),
    async loadConversations() {
      this.loading = true;
      try {
        await this.fetchUserChats();
      } catch (error) {
        console.error("Could not load conversations", error);
      } finally {
        this.loading = false;
      }
    },
    selectConversation(chat) {
      // Don't re-select if already selected
      if (this.selectedConversation?.id === chat.id) return;

      this.selectedConversation = chat;
      this.fetchMessages(chat.id);
      if (this.isUnread(chat)) {
        this.markChatAsRead(chat.id);
      }
    },
    fetchMessages(chatId) {
      if (this.messagesUnsubscribe) {
        this.messagesUnsubscribe();
      }
      const messagesRef = collection(db, "chats", chatId, "messages");
      const q = query(messagesRef, orderBy("timestamp"));

      this.messagesUnsubscribe = onSnapshot(q, (snapshot) => {
        this.messages = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        this.scrollToBottom();
      });
    },
    async handleSendMessage() {
      if (!this.canSendMessage) return;

      const payload = {
        chatId: this.selectedConversation.id,
        text: this.newMessage.trim(),
        imageBase64: this.stagedImageBase64,
      };

      this.newMessage = "";
      this.cancelImagePreview();

      try {
        await this.sendMessage(payload);
      } catch (error) {
        alert("Could not send message.");
        this.newMessage = payload.text;
      }
    },

    triggerFileInput() {
      this.$refs.fileInput.click();
    },
    onFileSelected(event) {
      const file = event.target.files[0];
      if (!file) return;

      if (
        !file.type.startsWith("image/png") &&
        !file.type.startsWith("image/jpeg")
      ) {
        alert("Please select a valid image file (PNG or JPEG).");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("File is too large. Please select an image smaller than 5MB.");
        return;
      }

      this.stagedImagePreview = URL.createObjectURL(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        this.stagedImageBase64 = e.target.result;
      };
      reader.onerror = (e) => {
        console.error("FileReader error:", e);
        alert("Error reading file.");
        this.cancelImagePreview();
      };
      reader.readAsDataURL(file);

      event.target.value = null;
    },
    cancelImagePreview() {
      this.stagedImageBase64 = null;
      if (this.stagedImagePreview) {
        URL.revokeObjectURL(this.stagedImagePreview);
        this.stagedImagePreview = null;
      }
    },

    isUnread(chat) {
      if (!this.user || !chat.lastMessage?.readBy) {
        return false;
      }
      return !chat.lastMessage.readBy.includes(this.user.uid);
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.messageArea;
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      });
    },

    formatLastMessageTime(timestamp) {
      if (!timestamp) return "";

      let seconds;
      if (timestamp.seconds) {
        seconds = timestamp.seconds;
      } else if (timestamp._seconds) {
        seconds = timestamp._seconds;
      } else if (typeof timestamp === "number") {
        seconds = timestamp;
      } else {
        console.warn("Invalid timestamp format received:", timestamp);
        return "";
      }

      const dt = DateTime.fromSeconds(seconds);
      const now = DateTime.now();

      if (dt.hasSame(now, "day")) {
        return dt.toFormat("h:mm a");
      }
      if (dt.hasSame(now.minus({ days: 1 }), "day")) {
        return "Yesterday";
      }
      if (now.diff(dt, "weeks").weeks < 1) {
        return dt.toFormat("ccc");
      }
      return dt.toFormat("LLL dd");
    },

    formatMessageTimestamp(timestamp) {
      if (!timestamp) return "";
      let seconds;
      if (timestamp.seconds) {
        seconds = timestamp.seconds;
      } else if (timestamp._seconds) {
        seconds = timestamp._seconds;
      } else {
        return "";
      }
      return DateTime.fromSeconds(seconds).toFormat("LLL dd, h:mm a");
    },
  },
  created() {
    this.loadConversations();

    // 👇 CORRECTED WATCHER
    if (this.$route.params.chatId) {
      let unwatch; // 1. Declare 'unwatch' in the outer scope

      // 2. Assign the watcher return value to 'unwatch'
      unwatch = this.$watch(
        "sortedConversations",
        (newVal) => {
          if (newVal.length > 0) {
            const chat = newVal.find((c) => c.id === this.$route.params.chatId);
            if (chat) {
              this.selectConversation(chat);
            }

            // 3. Check if 'unwatch' exists before calling it
            if (unwatch) {
              unwatch(); // Call the function to stop watching
            }
          }
        },
        { immediate: true }
      );
    }
  },
  beforeUnmount() {
    if (this.messagesUnsubscribe) {
      this.messagesUnsubscribe();
    }
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/styles/variables.scss";

/* --- NEW MODERN STYLES --- */
.chat-container {
  display: flex;
  background-color: $card-background;
  position: fixed;
  top: 70px; /* Adjust to your header height */
  left: 0;
  width: 100%;
  bottom: 0;
}

/* --- Conversation List (Left Column) --- */
.conversation-list {
  width: 350px;
  border-right: 1px solid $border-color-light; // Lighter border
  display: flex;
  flex-direction: column;
  background-color: $card-background; // White background
}
.list-header {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid $border-color-light;
  h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
  }
}
.conversations-scroll-area {
  overflow-y: auto;
  flex-grow: 1;
  padding: 0.5rem; // Add padding around the list items
}
.conversation-item {
  display: flex;
  padding: 0.75rem; // Tighter padding
  cursor: pointer;
  border-radius: $border-radius-md; // Rounded corners for each item
  transition: background-color 0.2s ease;
  margin: 0.25rem 0;

  &:hover {
    background-color: $background-light; // Use light background var
  }
  &.active {
    background-color: lighten($primary-color, 45%); // Light blue for active
  }
}
.conversation-content {
  display: flex;
  align-items: center;
  gap: 0.75rem; // Reduced gap
  width: 100%;
  overflow: hidden;
}
.avatar {
  width: 48px; // Standard avatar size
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0; // Prevent avatar from shrinking
}
.conversation-details {
  flex-grow: 1;
  overflow: hidden;
}
.user-name {
  font-weight: 600;
  font-size: 0.95rem; // Slightly larger name
  margin: 0;
  color: $text-color-dark;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.last-message {
  font-size: 0.85rem; // Slightly smaller message
  color: $text-color-medium;
  margin: 0.15rem 0 0 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  span {
    // Style "You:"
    font-weight: 500;
  }
}
.conversation-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  font-size: 0.75rem;
  color: $text-color-medium;
  flex-shrink: 0;
}
.last-message-time {
  margin-bottom: 0.25rem;
}
.unread-text {
  font-weight: 700;
  color: $text-color-dark !important;
}
.unread-indicator {
  width: 10px; // Standard unread dot
  height: 10px;
  background-color: $primary-color;
  border-radius: 50%;
}

/* --- Chat Window (Right Column) --- */
.chat-window {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #f7f7f7; // Very light gray background
}
.chat-content-window {
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* Updated Chat Header */
.chat-header {
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid $border-color-light;
  background-color: $card-background;
  display: flex;
  align-items: center;
  gap: 0.75rem;

  h3 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
  }
  .avatar-small {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
  }
  .booking-link {
    margin-left: auto;
    color: $text-color-medium;
    font-size: 1.25rem;
    padding: 0.5rem;
    border-radius: 50%;
    &:hover {
      color: $primary-color;
      background-color: $background-light;
    }
  }
}
.message-area {
  flex: 1;
  padding: 1rem 1.5rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem; // Space between bubbles
}
.message-bubble-wrapper {
  display: flex;
  max-width: 75%; // Bubbles take max 75% of width

  &.is-sender {
    justify-content: flex-end;
    margin-left: auto; // Push to right
  }
  &:not(.is-sender) {
    margin-right: auto; // Push to left
  }
}
.message-bubble {
  padding: 0.6rem 0.9rem;
  border-radius: 1.1rem; // Bubbly
  line-height: 1.4;
  font-size: 0.9rem;

  .message-text {
    margin: 0;
    white-space: pre-wrap; // Respect line breaks
    word-break: break-word; // Break long words
  }
  .message-timestamp {
    // Removed from template, but style remains
    font-size: 0.7rem;
    opacity: 0.8;
    display: block;
    margin-top: 0.25rem;
  }
}
.is-sender .message-bubble {
  background-color: $primary-color;
  color: white;
  border-bottom-right-radius: 0.5rem; // Tail
}
.message-bubble-wrapper:not(.is-sender) .message-bubble {
  background-color: #f0f2f5; // Messenger gray
  color: $text-color-dark;
  border-bottom-left-radius: 0.5rem; // Tail
}

/* STYLES for image preview and chat image */
.message-area .chat-image {
  max-width: 100%;
  height: auto;
  border-radius: $border-radius-md;
  margin-top: 8px;
}
.message-bubble p + img {
  margin-top: $spacing-sm;
}
.message-input-area-wrapper {
  display: flex;
  flex-direction: column;
  background-color: $card-background;
}
.image-preview {
  position: relative;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid $border-color-light;
  background-color: $background-light;
  img {
    height: 80px;
    width: auto;
    max-width: 80px;
    border-radius: $border-radius-sm;
    object-fit: cover;
  }
}
.cancel-preview-btn {
  position: absolute;
  top: 0px;
  left: 80px;
  background-color: $text-color-medium;
  color: white;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  line-height: 1;
  padding: 0;

  &:hover {
    background-color: $text-color-dark;
  }
}
/* END STYLES */

/* Updated Input Area */
.message-input-area {
  display: flex;
  padding: 0.75rem 1rem;
  border-top: 1px solid $border-color-light;
  background-color: $card-background; // White background
  align-items: center;
  gap: 0.5rem; // Adjusted gap

  input {
    flex: 1;
    border: none;
    background-color: #f0f2f5; // Messenger gray input
    padding: 0.75rem 1.25rem;
    border-radius: $border-radius-pill;
    font-size: 0.9rem;
    &:focus {
      outline: none;
      box-shadow: 0 0 0 2px lighten($primary-color, 40%);
    }
  }
}
/* Added Icon Button Style */
.icon-button {
  background: none;
  border: none;
  color: $text-color-medium;
  font-size: 1.4rem;
  padding: 0.5rem;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;

  &:hover {
    color: $primary-color;
    background-color: $background-light;
  }
}
/* Updated Send Button */
.send-button {
  background-color: $primary-color;
  color: white;
  border: none;
  width: 44px; // Round button
  height: 44px;
  border-radius: 50%;
  cursor: pointer;
  font-weight: 600;
  flex-shrink: 0; // Prevent shrinking
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  padding-left: 3px; // Visually center icon
  transition: background-color 0.2s ease;

  &:hover {
    background-color: darken($primary-color, 10%);
  }
  &:disabled {
    background-color: lighten($primary-color, 25%);
    cursor: not-allowed;
  }
}
.no-chat-selected,
.info-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: $text-color-medium;
  background-color: #f8f9fa;
  i {
    font-size: 4rem;
    margin-bottom: 1rem;
  }
  p {
    font-size: 1.1rem;
    font-weight: 500;
  }
}
</style>
