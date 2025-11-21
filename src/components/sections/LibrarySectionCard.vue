<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { ReadingBook } from '../../composables/useReadingShelf'

const props = defineProps<{
  title: string
  subtitle: string
  count: number
  books: ReadingBook[]
  routeName: string
  variant: 'to-read' | 'in-progress' | 'completed' | 'abandoned'
}>()

const router = useRouter()

const previewBooks = computed(() => props.books.slice(0, 3))

function handleClick() {
  router.push({ name: props.routeName })
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    handleClick()
  }
}
</script>

<template>
  <section
    class="library-section-card"
    :class="`library-section-card--${variant}`"
    role="button"
    tabindex="0"
    @click="handleClick"
    @keydown="handleKeydown"
  >
    <header class="library-section-card__header">
      <div>
        <p class="section-eyebrow">{{ title }}</p>
        <h2 class="library-section-card__title">
          {{ subtitle }}
        </h2>
      </div>
      <p class="library-section-card__count">
        {{ count }} livre<span v-if="count !== 1">s</span>
      </p>
    </header>

    <div class="library-section-card__body">
      <div v-if="previewBooks.length" class="library-section-card__covers">
        <div
          v-for="book in previewBooks"
          :key="book.id"
          class="library-section-card__cover-wrapper"
        >
          <img
            v-if="book.coverUrl"
            class="library-section-card__cover"
            :src="book.coverUrl"
            :alt="`Couverture de ${book.title}`"
          />
          <div v-else class="library-section-card__cover-placeholder">
            <span>📚</span>
          </div>
        </div>
      </div>
      <p v-else class="library-section-card__empty">
        Aucun livre pour le moment. Clique pour en ajouter.
      </p>
    </div>

    <footer class="library-section-card__footer">
      <span class="library-section-card__cta">Ouvrir la galerie</span>
    </footer>
  </section>
</template>

<style scoped>
.library-section-card {
  background-color: var(--glass-surface);
  border-radius: 1.5rem;
  padding: 1.5rem 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.22);
  box-shadow: 0 22px 45px rgba(15, 23, 42, 0.75);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  cursor: pointer;
  position: relative;
  transition: var(--transition-snap);
  animation: var(--animation-slide-up);
  animation-fill-mode: both;
  color: #e5e7eb;
  backdrop-filter: blur(22px);
  -webkit-backdrop-filter: blur(22px);
}

.library-section-card:hover {
  transform: var(--transform-lift);
  box-shadow: var(--shadow-hover);
}

.library-section-card::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  border: 1px solid rgba(255, 255, 255, 0.04);
  pointer-events: none;
}

.library-section-card--to-read {
  border-top: 2px solid var(--color-jaune-dore);
}

.library-section-card--in-progress {
  border-top: 2px solid var(--accent-secondary);
}

.library-section-card--completed {
  border-top: 2px solid #16a34a;
}

.library-section-card--abandoned {
  border-top: 2px solid var(--accent-primary);
}

.library-section-card__header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
}

.library-section-card__title {
  margin: 0.25rem 0 0;
  font-size: var(--text-base);
  color: #f9fafb;
}

.library-section-card__count {
  margin: 0;
  font-size: var(--text-xs);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #cbd5f5;
}

.library-section-card__body {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.library-section-card__covers {
  display: flex;
  gap: 0.75rem;
}

.library-section-card__cover-wrapper {
  width: 64px;
  height: 96px;
  border-radius: 0.9rem;
  border: 1px solid rgba(255, 255, 255, 0.35);
  background: rgba(15, 23, 42, 0.85);
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.7);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.library-section-card__cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.library-section-card__cover-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.library-section-card__empty {
  margin: 0;
  font-size: 0.9rem;
  color: #cbd5f5;
}

.library-section-card__footer {
  display: flex;
  justify-content: flex-end;
}

.library-section-card__cta {
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #f9fafb;
}
</style>
