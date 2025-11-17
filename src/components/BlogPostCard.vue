<template>
  <!-- UPDATED: Changed from <a> to <router-link> -->
  <router-link :to="post.route" class="blog-post-card">
    <div class="card-image-wrapper">
      <img :src="post.imageUrl" :alt="post.title" class="card-image" />
    </div>
    <div class="card-content">
      <span class="post-category">{{ post.category }}</span>
      <h4 class="post-title">{{ post.title }}</h4>
      <p class="post-excerpt">{{ post.excerpt }}</p>
      <div class="card-footer">
        <span>Read More</span>
        <i class="bi bi-arrow-right-short"></i>
      </div>
    </div>
  </router-link>
</template>

<script>
export default {
  name: 'BlogPostCard',
  props: {
    post: {
      type: Object,
      required: true,
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.blog-post-card {
  display: flex;
  flex-direction: column;
  background: $card-background;
  border-radius: $border-radius-lg;
  overflow: hidden;
  box-shadow: $shadow-light;
  border: 1px solid $border-color-light;
  text-decoration: none;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: $shadow-medium;
    .card-image {
      transform: scale(1.05);
    }
    .card-footer {
      color: $primary-color;
      i {
        transform: translateX(4px);
      }
    }
  }
}

.card-image-wrapper {
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.card-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.post-category {
  display: inline-block;
  font-size: 0.8rem;
  font-weight: 700;
  color: $primary-color;
  margin-bottom: 0.75rem;
  text-transform: uppercase;
}

.post-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: $text-color-dark;
  margin: 0 0 0.75rem 0;
  line-height: 1.4;
}

.post-excerpt {
  font-size: 0.95rem;
  color: $text-color-medium;
  line-height: 1.6;
  margin: 0;
  flex-grow: 1; // Pushes footer to the bottom
}

.card-footer {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.9rem;
  font-weight: 700;
  color: $text-color-dark;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid $border-color-light;
  transition: all 0.2s ease;
  
  i {
    font-size: 1.25rem;
    transition: transform 0.2s ease;
  }
}
</style>