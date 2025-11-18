<script setup lang="ts">
import type { FeatureTile } from '../../types/dashboard'

defineProps<{ features: FeatureTile[] }>()
</script>

<template>
  <section class="features" aria-label="Fonctionnalités principales">
    <header>
      <p class="section-eyebrow">Tout ce qu'il faut pour lire mieux</p>
      <h2>Une maison pour ta bibliothèque, ta wishlist et ta motivation.</h2>
    </header>
    <div class="features__grid">
      <article v-for="feature in features" :key="feature.title" class="features__tile">
        <p class="features__icon" aria-hidden="true">{{ feature.icon }}</p>
        <h3>{{ feature.title }}</h3>
        <p>{{ feature.description }}</p>
      </article>
    </div>
  </section>
</template>

<style scoped>
.features {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.features__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

.features__tile {
  background: rgba(15, 23, 42, 0.8);
  border-radius: 1.25rem;
  padding: 1.5rem;
  border: 1px solid rgba(99, 102, 241, 0.2);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.features__icon {
  font-size: 1.75rem;
  margin: 0;
}

.features__tile h3 {
  margin: 0;
}

.features__tile p {
  margin: 0;
  color: #cbd5f5;
}
</style>
