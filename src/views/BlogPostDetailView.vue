<template>
  <div class="post-detail-page">
    <div v-if="post" class="post-container">
      <!-- Header -->
      <header class="post-header scroll-animate">
        <span class="post-category">{{ post.category }}</span>
        <h1 class="post-title">{{ post.title }}</h1>
        <div class="post-meta">
          <span>By {{ post.author }}</span>
          <span>&bull;</span>
          <span>{{ post.date }}</span>
        </div>
      </header>

      <!-- Hero Image -->
      <div class="hero-image-wrapper scroll-animate" style="--delay: 0.1s;">
        <img :src="post.imageUrl" :alt="post.title" class="hero-image" />
      </div>

      <!-- Article Content -->
      <article class="post-content scroll-animate" style="--delay: 0.2s;" v-html="post.content"></article>

      <!-- Back to Blog Link -->
      <div class="post-footer scroll-animate">
        <router-link to="/blog" class="button secondary-button">
          <i class="bi bi-arrow-left-short"></i> Back to All Posts
        </router-link>
      </div>

    </div>
    <div v-else class="loading-state">
      <p>Loading post...</p>
    </div>
  </div>
</template>

<script>
// Import the new mock data
import { allPosts } from '@/blogData.js';

export default {
  name: 'BlogPostDetailView',
  props: {
    slug: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      post: null,
      observer: null,
    };
  },
  methods: {
    fetchPost() {
      // For now, we find it in our mock data
      this.post = allPosts.find(p => p.slug === this.slug) || null;
    },
    
    setupScrollAnimations() {
       const options = {
        root: null,
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      };

      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            this.observer.unobserve(entry.target);
          }
        });
      }, options);

      this.$nextTick(() => {
        const sections = this.$el.querySelectorAll('.scroll-animate');
        sections.forEach(section => {
          this.observer.observe(section);
        });
      });
    }
  },
  created() {
    this.fetchPost();
  },
  mounted() {
    if (this.post) {
      this.setupScrollAnimations();
    }
  },
  beforeUnmount() {
    if (this.observer) {
      this.observer.disconnect();
    }
  },
  watch: {
    // If the user clicks a "related post" link, the component might
    // re-use. We need to watch the slug prop to refetch.
    slug(_newSlug) {
      this.fetchPost();
      this.$nextTick(() => this.setupScrollAnimations());
    }
  }
};
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.post-detail-page {
  background-color: #fff;
  padding-bottom: 4rem;
  @media (max-width: 768px) {
    padding-bottom: 2rem;
  }
}

.post-container {
  max-width: 800px; // Standard article width
  margin: 0 auto;
  padding: 2rem;

  @media (max-width: 768px) {
    padding: 1rem; // Tighter padding on mobile
  }
}

.post-header {
  text-align: center;
  margin: 2rem 0 3rem 0;
  @media (max-width: 768px) {
    margin: 1rem 0 2rem 0; // Less margin on mobile
  }
}

.post-category {
  display: inline-block;
  font-size: 0.9rem;
  font-weight: 700;
  color: $primary-color;
  background-color: lighten($primary-color, 45%);
  padding: 0.3rem 0.8rem;
  border-radius: $border-radius-pill;
  text-transform: uppercase;
  margin-bottom: 1rem;
}

.post-title {
  font-size: 2.75rem;
  font-weight: 800;
  color: $text-color-dark;
  margin: 0 0 1rem 0;
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 2rem; // Smaller title on mobile
  }
}

.post-meta {
  font-size: 1rem;
  color: $text-color-medium;
  span {
    margin: 0 0.5rem;
  }
  @media (max-width: 768px) {
    font-size: 0.9rem; // Smaller meta text
  }
}

.hero-image-wrapper {
  width: 100%;
  max-height: 500px;
  border-radius: $border-radius-lg;
  overflow: hidden;
  box-shadow: $shadow-medium;
  margin-bottom: 3rem;
  @media (max-width: 768px) {
    margin-bottom: 2rem;
    max-height: 300px; // Shorter image on mobile
  }
}

.hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.post-content {
  font-size: 1.1rem;
  line-height: 1.8;
  color: $text-color-dark;

  @media (max-width: 768px) {
    font-size: 1rem; // Smaller body text
    line-height: 1.7;
  }

  // This will style the HTML we injected
  :deep(p) {
    margin-bottom: 1.5rem;
  }

  :deep(h3) {
    font-size: 1.75rem;
    font-weight: 700;
    margin: 2.5rem 0 1rem 0;
    @media (max-width: 768px) {
      font-size: 1.4rem; // Smaller subheadings
    }
  }
  
  :deep(ul) {
    margin-bottom: 1.5rem;
    padding-left: 1.5rem;
  }

  :deep(li) {
    margin-bottom: 0.5rem;
  }
}

.post-footer {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid $border-color-light;
  text-align: center;
}

.button {
  padding: 0.85rem 1.75rem;
  font-size: 1rem;
  font-weight: 600;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border: none;
  border-radius: $border-radius-md;
  cursor: pointer;
  transition: all 0.2s ease;
  
  i {
    font-size: 1.25rem;
    transition: transform 0.2s ease;
  }
}
.button.secondary-button {
  background-color: $background-light;
  color: $text-color-dark;
  border: 1px solid $border-color;
  &:hover {
    background-color: $border-color-light;
    border-color: $border-color;
    i {
      transform: translateX(-4px);
    }
  }
}

.loading-state {
  text-align: center;
  padding: 6rem 2rem;
  font-size: 1.2rem;
  color: $text-color-medium;
}

// Scroll Animation
.scroll-animate {
  opacity: 0;
  transform: translateY(40px);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
  transition-delay: var(--delay, 0s);
  will-change: opacity, transform;

  &.is-visible {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>