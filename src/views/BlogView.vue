<template>
  <div class="blog-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content scroll-animate">
        <h1 class="hero-title">The RentCycle Blog</h1>
        <p class="hero-subtitle">
          Your source for travel tips, hosting guides, and community stories.
        </p>
      </div>
    </section>

    <!-- Featured Post Section -->
    <section class="featured-post-section">
      <h2 class="section-title scroll-animate">Featured Post</h2>
      <div class="featured-post-card scroll-animate">
        <div class="featured-image-wrapper">
          <img :src="featuredPost.imageUrl" :alt="featuredPost.title" class="featured-image" />
        </div>
        <div class="featured-content">
          <span class="post-category">{{ featuredPost.category }}</span>
          <h3 class="post-title">{{ featuredPost.title }}</h3>
          <p class="post-excerpt">{{ featuredPost.excerpt }}</p>
          <!-- UPDATED: Changed from <a> to <router-link> -->
          <router-link :to="featuredPost.route" class="button primary-button">
            Read More <i class="bi bi-arrow-right-short"></i>
          </router-link>
        </div>
      </div>
    </section>

    <!-- Recent Posts Section -->
    <section class="recent-posts-section">
      <h2 class="section-title scroll-animate">Recent Posts</h2>
      <div class="posts-grid">
        <BlogPostCard
          v-for="(post, index) in recentPosts"
          :key="post.id"
          :post="post"
          class="scroll-animate"
          :style="{ '--delay': `${index * 0.1}s` }"
        />
      </div>
    </section>
  </div>
</template>

<script>
import BlogPostCard from '@/components/BlogPostCard.vue';
// --- UPDATED: Import mock data from the new file ---
import { allPosts } from '@/blogData.js';

export default {
  name: 'BlogView',
  components: {
    BlogPostCard,
  },
  data() {
    return {
      observer: null,
      featuredPost: allPosts[0], // The first post is featured
      recentPosts: allPosts.slice(1), // The rest are in the grid
    };
  },
  mounted() {
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
  },
  beforeUnmount() {
    if (this.observer) {
      this.observer.disconnect();
    }
  },
};
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

@keyframes kenburns-bg {
  0% { transform: scale(1) translate(0, 0); }
  100% { transform: scale(1.1) translate(-2%, 2%); }
}

.blog-page {
  color: $text-color-dark;
  overflow-x: hidden;
}

// Hero Section
.hero-section {
  position: relative;
  overflow: hidden;
  padding: 6rem 2rem;
  text-align: center;
  color: white;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1600');
    background-size: cover;
    background-position: center;
    animation: kenburns-bg 20s ease-in-out infinite alternate;
    z-index: 1;
    will-change: transform;
  }
  @media (max-width: 768px) { padding: 4rem 1.5rem; }
}
.hero-content { position: relative; z-index: 2; }
.hero-title {
  font-size: 3.5rem;
  font-weight: 900;
  margin-bottom: 1rem;
  @media (max-width: 768px) { font-size: 2.5rem; }
}
.hero-subtitle {
  font-size: 1.25rem;
  max-width: 800px;
  margin: 0 auto;
  line-height: 1.6;
  opacity: 0.9;
  @media (max-width: 768px) { font-size: 1rem; }
}

// Common Section Styling
section {
  padding: 4rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
  @media (max-width: 768px) { padding: 3rem 1.5rem; }
}
.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 3rem;
  text-align: center;
  color: $text-color-dark;
  @media (max-width: 768px) { font-size: 2rem; }
}

// Featured Post
.featured-post-section {
  padding-top: 6rem;
  padding-bottom: 6rem;
}
.featured-post-card {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: center;
  background: $card-background;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-large;
  overflow: hidden;
  border: 1px solid $border-color-light;

  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
}
.featured-image-wrapper {
  width: 100%;
  height: 100%;
  min-height: 400px;
  @media (max-width: 992px) {
    min-height: 300px;
    height: 300px;
  }
}
.featured-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.featured-content {
  padding: 2rem;
  @media (max-width: 992px) {
    padding-bottom: 2.5rem;
  }
}
.post-category {
  display: inline-block;
  font-size: 0.85rem;
  font-weight: 700;
  color: $primary-color;
  background-color: lighten($primary-color, 45%);
  padding: 0.3rem 0.8rem;
  border-radius: $border-radius-pill;
  text-transform: uppercase;
  margin-bottom: 1rem;
}
.post-title {
  font-size: 2rem;
  font-weight: 700;
  color: $text-color-dark;
  margin: 0 0 1rem 0;
}
.post-excerpt {
  font-size: 1rem;
  color: $text-color-medium;
  line-height: 1.7;
  margin-bottom: 2rem;
}
.button.primary-button {
  padding: 0.85rem 1.75rem;
  font-size: 1rem;
  font-weight: 600;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background-color: $primary-color;
  color: white;
  border: none;
  border-radius: $border-radius-md;
  cursor: pointer;
  transition: all 0.2s ease;
  i {
    transition: transform 0.2s ease;
  }
  &:hover {
    background-color: darken($primary-color, 10%);
    box-shadow: $shadow-hover;
    i {
      transform: translateX(4px);
    }
  }
}

// Recent Posts
.recent-posts-section {
  background-color: $background-light;
}
.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
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