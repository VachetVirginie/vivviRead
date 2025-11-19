<script setup lang="ts">
import { computed } from 'vue'
import type { ReadingBook } from '../../composables/useReadingShelf'

const props = defineProps<{
  book: ReadingBook
}>()

const emit = defineEmits<{
  (e: 'start', id: string): void
  (e: 'remove', id: string): void
  (e: 'open', id: string): void
}>()

const authorLabel = computed(() => {
  const value = props.book.author || ''
  return value.length > 30 ? `${value.slice(0, 30)}…` : value
})
</script>

<template>
  <article
    class="book-card carousel__slide"
    role="group"
    :aria-label="`${props.book.title} de ${props.book.author}`"
    @click="emit('open', props.book.id)"
  >
    <div class="book-card__main">
      <div class="book-card__cover-wrapper">
        <img 
          v-if="props.book.coverUrl" 
          class="book-card__cover" 
          :src="props.book.coverUrl" 
          :alt="`Couverture de ${props.book.title}`" 
        />
        <div v-else class="book-card__cover-placeholder">
          <div class="book-card__cover-icon">📚</div>
          <p class="book-card__cover-text">Pas de couverture</p>
        </div>
        <span v-if="props.book.averageRating" class="book-card__rating-chip">
          {{ props.book.averageRating.toFixed(1) }}
        </span>
        <!-- Badge spécial pour livre unique -->
        <div class="book-card__featured-badge">
          <span>📖</span>
          <span>À découvrir</span>
        </div>
      </div>
      <div class="book-card__content">
        <div class="book-card__text">
          <p class="book-card__label">{{ authorLabel }}</p>
          <p class="book-card__meta">
            <span v-if="props.book.totalPages">{{ props.book.totalPages }} pages</span>
          </p>
          <h3 class="book-card__title">{{ props.book.title }}</h3>
        </div>
        <div class="book-card__actions">
          <button type="button" @click.stop="emit('start', props.book.id)">Commencer</button>
          <button type="button" class="book-card__remove" @click.stop="emit('remove', props.book.id)">Supprimer</button>
        </div>
      </div>
    </div>
  </article>
</template>

<style scoped>
.book-card {
  border-radius: var(--radius-2xl);
  padding: var(--space-6);
  background: var(--color-surface);
  border: 1px solid var(--color-neutral-200);
  box-shadow: var(--shadow-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  width: 100%;
  box-sizing: border-box;
  transition: all var(--transition-normal);
  cursor: pointer;
}

.book-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-xl);
}

.book-card__main {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  align-items: stretch;
  flex: 1;
}

/* Design spécial pour une card seule (featured) */
.carousel__track--single .book-card {
  background: linear-gradient(135deg, var(--color-surface) 0%, var(--color-neutral-50) 100%);
  border: 2px solid var(--color-primary-yellow);
  box-shadow: var(--shadow-xl), 0 0 0 1px rgba(250, 204, 21, 0.1);
  transform: scale(1.02);
}

.carousel__track--single .book-card:hover {
  transform: scale(1.05) translateY(-6px);
  box-shadow: var(--shadow-xl), 0 0 32px rgba(250, 204, 21, 0.2);
}

.carousel__track--single .book-card__main {
  gap: var(--space-6);
}

.carousel__track--single .book-card__cover-wrapper {
  background: var(--color-surface);
  min-height: 280px;
  padding: var(--space-4);
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--color-neutral-200);
}

.carousel__track--single .book-card__cover {
  max-height: 260px;
  filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.2));
}

.carousel__track--single .book-card:hover .book-card__cover {
  transform: scale(1.05) rotateY(5deg);
}

.carousel__track--single .book-card__title {
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
  -webkit-line-clamp: 3;
  line-clamp: 3;
}

.carousel__track--single .book-card__label {
  font-size: var(--text-base);
  color: var(--color-neutral-600);
}

.carousel__track--single .book-card__meta {
  font-size: var(--text-sm);
  color: var(--color-neutral-500);
}

.carousel__track--single .book-card__actions {
  gap: var(--space-3);
  margin-top: var(--space-4);
}

.carousel__track--single .book-card__actions button {
  padding: var(--space-4) var(--space-6);
  font-size: var(--text-base);
  font-weight: var(--font-bold);
}

.carousel__track--single .book-card__actions button:first-child {
  background: var(--color-jaune-dore);
  color: var(--color-neutral-900);
  box-shadow: var(--shadow-md);
  position: relative;
  overflow: hidden;
}

.carousel__track--single .book-card__actions button:first-child::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s;
}

.carousel__track--single .book-card__actions button:first-child:hover::before {
  left: 100%;
}

.book-card__cover-wrapper {
  position: relative;
  flex-shrink: 0;
  background: var(--color-neutral-50);
  border-radius: var(--radius-xl);
  padding: var(--space-3);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 240px;
}

.book-card__cover {
  max-width: 100%;
  max-height: 220px;
  border-radius: var(--radius-lg);
  object-fit: contain;
  box-shadow: var(--shadow-lg);
  transition: transform var(--transition-normal);
}

.book-card:hover .book-card__cover {
  transform: scale(1.02);
}

.book-card__cover-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 220px;
  background: linear-gradient(135deg, var(--color-neutral-100) 0%, var(--color-neutral-50) 100%);
  border: 2px dashed var(--color-neutral-300);
  border-radius: var(--radius-lg);
  color: var(--color-neutral-400);
}

.book-card__cover-icon {
  font-size: 3rem;
  margin-bottom: var(--space-2);
  opacity: 0.7;
}

.book-card__cover-text {
  margin: 0;
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--color-neutral-500);
}

.book-card__rating-chip {
  position: absolute;
  top: var(--space-2);
  right: var(--space-2);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  background: var(--color-primary-yellow);
  color: var(--color-neutral-900);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  box-shadow: var(--shadow-sm);
  backdrop-filter: blur(8px);
}

.book-card__featured-badge {
  position: absolute;
  top: var(--space-2);
  left: var(--space-2);
  display: none;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-full);
  background: var(--color-primary-green);
  color: white;
  font-size: var(--text-xs);
  font-weight: var(--font-bold);
  box-shadow: var(--shadow-md);
  animation: pulse 2s infinite;
}

.carousel__track--single .book-card__featured-badge {
  display: flex;
}

.book-card__content {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  flex: 1;
  align-items: center;
  text-align: center;
}

.book-card__text {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 96px;
  gap: var(--space-1);
}

.book-card__label {
  margin: 0;
  color: var(--color-neutral-500);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.book-card__meta {
  margin: 0;
  font-size: var(--text-xs);
  color: var(--color-neutral-400);
  font-weight: var(--font-medium);
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.book-card__title {
  margin: var(--space-2) 0 0;
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  color: var(--color-neutral-900);
  line-height: var(--leading-tight);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-clamp: 2;
}

.book-card__actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-top: auto;
  width: 100%;
}

.book-card__actions button {
  border: none;
  border-radius: var(--radius-full);
  padding: var(--space-3) var(--space-4);
  font-weight: var(--font-semibold);
  cursor: pointer;
  font-size: var(--text-sm);
  width: 100%;
  transition: all var(--transition-normal);
}

.book-card__actions button:first-child {
  background: var(--color-jaune-dore);
  color: var(--color-neutral-900);
  box-shadow: var(--shadow-sm);
}

.book-card__actions button:first-child:hover {
  background: #FFD966;
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.book-card__remove {
  background: var(--color-neutral-100);
  color: var(--color-neutral-600);
  border: 1px solid var(--color-neutral-200);
}

.book-card__remove:hover {
  background: #fef2f2;
  color: var(--color-rouge-corail);
  border-color: #fecaca;
  transform: translateY(-1px);
}
</style>
