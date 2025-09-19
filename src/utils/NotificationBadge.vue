<template>
  <span v-if="count > 0" class="notification-badge">
    {{ count }}
  </span>
</template>

<script>
export default {
  name: 'NotificationBadge',
  props: {
    count: {
      type: Number,
      default: 0,
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.notification-badge {
  background-color: $admin-color;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  margin-left: 0.5rem;
}
</style>