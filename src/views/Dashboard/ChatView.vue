<template>
  <div class="chat-container">
    <!-- Left Column: Conversation List -->
    <div class="conversation-list">
      <div class="list-header">
        <h2>Inbox</h2>
      </div>
      <div v-if="loading" class="info-state">
        <p>Loading conversations...</p>
      </div>
      <div v-else-if="!sortedConversations || sortedConversations.length === 0" class="info-state">
        <p>You have no messages yet.</p>
      </div>
      <div v-else class="conversations-scroll-area">
        <!-- UPDATED: Looping over 'sortedConversations' instead of 'conversations' -->
        <div
          v-for="chat in sortedConversations"
          :key="chat.id"
          class="conversation-item"
          :class="{ active: selectedConversation && selectedConversation.id === chat.id }"
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
              <!-- UPDATED: User name is now bold if the chat is unread -->
              <p class="user-name" :class="{ 'unread-text': isUnread(chat) }">
                {{ chat.otherUserDetails.name }}
              </p>
              <!-- UPDATED: Last message is now bold if the chat is unread -->
              <p class="last-message" :class="{ 'unread-text': isUnread(chat) }">
                {{ chat.lastMessage.text }}
              </p>
            </div>
            <!-- NEW: Unread indicator dot -->
            <div v-if="isUnread(chat)" class="unread-indicator"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Column: Active Chat Window (No changes here) -->
    <div class="chat-window">
      <div v-if="selectedConversation" class="chat-content-window">
        <div class="chat-header">
          <h3>{{ selectedConversation.otherUserDetails.name }}</h3>
        </div>
        <div class="message-area" ref="messageArea">
          <div
            v-for="message in messages"
            :key="message.id"
            class="message-bubble-wrapper"
            :class="{ 'is-sender': user && message.senderId === user.uid }"
          >
            <div class="message-bubble">
              <p class="message-text">{{ message.text }}</p>
              <span class="message-timestamp">{{
                formatMessageTimestamp(message.timestamp)
              }}</span>
            </div>
          </div>
        </div>
        <div class="message-input-area">
          <input
            v-model="newMessage"
            @keyup.enter="handleSendMessage"
            type="text"
            placeholder="Type a message..."
          />
          <button @click="handleSendMessage" class="send-button">Send</button>
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
import { mapActions, mapGetters, mapState } from 'vuex';
import { db } from '@/firebase/config';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { DateTime } from 'luxon';

export default {
  name: 'ChatView',
  data() {
    return {
      loading: true,
      selectedConversation: null,
      messages: [],
      newMessage: '',
      messagesUnsubscribe: null,
    };
  },
  computed: {
    ...mapGetters(['user']),
    ...mapState(['userChats']),
    // NEW: This computed property automatically sorts conversations by the most recent message
    sortedConversations() {
      if (!this.userChats || this.userChats.length === 0) {
        return [];
      }
      // Create a copy to avoid mutating state directly, then sort
      return [...this.userChats].sort((a, b) => {
        const timeA = a.lastMessage?.timestamp?.seconds || 0;
        const timeB = b.lastMessage?.timestamp?.seconds || 0;
        return timeB - timeA; // Sort descending (newest first)
      });
    },
  },
  methods: {
    ...mapActions(['fetchUserChats', 'sendMessage', 'markChatAsRead']),
    async loadConversations() {
      this.loading = true;
      try {
        await this.fetchUserChats();
      } catch (error) {
        console.error('Could not load conversations', error);
      } finally {
        this.loading = false;
      }
    },
    selectConversation(chat) {
      this.selectedConversation = chat;
      this.fetchMessages(chat.id);
      // Mark the chat as read if it's unread
      if (this.isUnread(chat)) {
        this.markChatAsRead(chat.id);
      }
    },
    fetchMessages(chatId) {
      if (this.messagesUnsubscribe) {
        this.messagesUnsubscribe();
      }
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      const q = query(messagesRef, orderBy('timestamp'));

      this.messagesUnsubscribe = onSnapshot(q, (snapshot) => {
        this.messages = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        this.scrollToBottom();
      });
    },
    async handleSendMessage() {
      if (!this.newMessage.trim()) return;
      try {
        await this.sendMessage({
          chatId: this.selectedConversation.id,
          text: this.newMessage,
        });
        this.newMessage = '';
      } catch (error) {
        alert('Could not send message.');
      }
    },
    // NEW: This method checks if a chat has unread messages for the current user
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
    formatMessageTimestamp(timestamp) {
      if (!timestamp) return '';
      return DateTime.fromSeconds(timestamp.seconds).toFormat('LLL dd, h:mm a');
    },
  },
  created() {
    this.loadConversations();
  },
  beforeUnmount() {
    if (this.messagesUnsubscribe) {
      this.messagesUnsubscribe();
    }
  },
};
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.chat-container {
  display: flex;
  height: calc(100vh - 70px); // Adjust based on your header height
  background-color: $card-background;
  border-top: 1px solid $border-color;
}
.conversation-list {
  width: 350px;
  border-right: 1px solid $border-color;
  display: flex;
  flex-direction: column;
  background-color: #f9fafb;
}
.list-header {
  padding: 1.5rem;
  border-bottom: 1px solid $border-color;
  h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
  }
}
.conversations-scroll-area {
  overflow-y: auto;
  flex-grow: 1;
}
.conversation-item {
  display: flex;
  padding: 1rem;
  cursor: pointer;
  border-bottom: 1px solid $border-color;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #f3f4f6;
  }
  &.active {
    background-color: lighten($primary-color, 45%);
  }
}
.conversation-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
}
.avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
}
.conversation-details {
    flex-grow: 1;
    overflow: hidden; /* Prevent details from pushing the dot out */
}
.user-name {
  font-weight: 600;
  margin: 0;
  color: $text-color-dark;
}
.last-message {
  font-size: 0.9rem;
  color: $text-color-medium;
  margin: 0.25rem 0 0 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
// NEW: Styles for unread messages
.unread-text {
    font-weight: 700;
    color: $text-color-dark !important;
}
.unread-indicator {
    width: 12px;
    height: 12px;
    background-color: $primary-color;
    border-radius: 50%;
    flex-shrink: 0; /* Prevent the dot from shrinking */
    margin-left: 0.5rem;
}
.chat-window {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.chat-content-window {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.chat-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid $border-color;
  background-color: $card-background;
  h3 {
    margin: 0;
    font-size: 1.25rem;
  }
}
.message-area {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.message-bubble-wrapper {
  display: flex;
  &.is-sender {
    justify-content: flex-end;
  }
}
.message-bubble {
  padding: 0.75rem 1rem;
  border-radius: 1.25rem;
  max-width: 70%;
  .message-text {
    margin: 0 0 0.25rem 0;
    line-height: 1.4;
    white-space: pre-wrap;
  }
  .message-timestamp {
    font-size: 0.75rem;
    opacity: 0.8;
  }
}
.is-sender .message-bubble {
  background-color: $primary-color;
  color: white;
  border-bottom-right-radius: 0.5rem;
}
.message-bubble-wrapper:not(.is-sender) .message-bubble {
  background-color: #e5e7eb;
  color: $text-color-dark;
  border-bottom-left-radius: 0.5rem;
}
.message-input-area {
  display: flex;
  padding: 1rem;
  border-top: 1px solid $border-color;
  background-color: #f9fafb;
  input {
    flex: 1;
    border: 1px solid $border-color;
    padding: 0.75rem;
    border-radius: $border-radius-pill;
    &:focus {
      outline: none;
      border-color: $primary-color;
      box-shadow: 0 0 0 2px lighten($primary-color, 40%);
    }
  }
}
.send-button {
  background-color: $primary-color;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: $border-radius-pill;
  margin-left: 0.75rem;
  cursor: pointer;
  font-weight: 600;
  &:hover {
    background-color: darken($primary-color, 10%);
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
