<script setup lang="ts">
import type { StatCard } from '../../types/dashboard'

defineProps<{ stats: StatCard[] }>()
</script>

<template>
  <section id="stats" class="stats" aria-label="Statistiques clé viviRead">
    <article v-for="stat in stats" :key="stat.label" class="stats__card">
      <p class="stats__value">{{ stat.value }}</p>
      <p class="stats__label">{{ stat.label }}</p>
      <p class="stats__sub">{{ stat.subLabel }}</p>
    </article>
  </section>
</template>

<style scoped>
.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
}

.stats__card {
  background: #ffffff;
  border-radius: 1.25rem;
  padding: 1.25rem;
  border: 1px solid #e5e7eb;
}

.stats__value {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
}

.stats__label {
  margin: 0.25rem 0;
  color: #4b5563;
}

.stats__sub {
  margin: 0;
  color: #6b7280;
}
</style>
