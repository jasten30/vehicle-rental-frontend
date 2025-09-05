<template>
  <div class="admin-page-container">
    <h2 class="section-title">Host Applications</h2>
    <p class="section-subtitle">
      Review, approve, or reject applications from renters who want to become hosts.
    </p>

    <div class="placeholder-content">
      <i class="bi bi-person-check-fill"></i>
      <p>A list of pending host applications will appear here.</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AdminHostApplicationsView',
  setup() {
    // Logic to fetch and manage applications will go here
    return {};
  },
};
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.admin-page-container { max-width: 1200px; margin: 0 auto; }
.section-title { font-size: 2.5rem; font-weight: 700; color: $text-color-dark; margin-bottom: 0.5rem; }
.section-subtitle { font-size: 1.1rem; color: $text-color-medium; margin-bottom: 2.5rem; }
.placeholder-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 4rem;
  border: 2px dashed $border-color;
  border-radius: $border-radius-lg;
  color: $text-color-medium;

  i {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  p {
    font-size: 1.2rem;
    font-weight: 500;
  }
}
</style>