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
  background: var(--color-white);
  border-radius: 0;
  padding: 1.25rem 1.25rem;
  border: 3px solid var(--color-black);
  box-shadow: var(--shadow-brutal);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  cursor: pointer;
  position: relative;
  transition: var(--transition-snap);
  animation: var(--animation-slide-up);
  animation-fill-mode: both;
}

.library-section-card:hover {
  transform: var(--transform-lift);
  box-shadow: var(--shadow-hover);
}

.library-section-card::after {
  content: '→';
  position: absolute;
  top: -3px;
  right: -3px;
  width: 20px;
  height: 20px;
  background: var(--accent-primary);
  color: #ffffff;
  border: 2px solid var(--color-black);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.library-section-card--to-read {
  border-left: 8px solid var(--color-jaune-dore);
}

.library-section-card--in-progress {
  border-left: 8px solid var(--accent-secondary);
}

.library-section-card--completed {
  border-left: 8px solid #16a34a;
}

.library-section-card--abandoned {
  border-left: 8px solid var(--accent-primary);
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
}

.library-section-card__count {
  margin: 0;
  font-size: var(--text-xs);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
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
  border: 2px solid var(--color-black);
  background: var(--color-gray-100);
  box-shadow: var(--shadow-subtle);
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
  color: #4b5563;
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
}
</style>
