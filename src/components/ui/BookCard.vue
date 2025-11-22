<script setup lang="ts">
import { computed } from 'vue'
import type { ReadingBook } from '../../composables/useReadingShelf'

const props = defineProps<{
  book: ReadingBook
  hideActions?: boolean
  showRecommendAction?: boolean
}>()

const emit = defineEmits<{
  (e: 'start', id: string): void
  (e: 'remove', id: string): void
  (e: 'open', id: string): void
  (e: 'recommend', id: string): void
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
        <div v-if="!hideActions" class="book-card__actions">
          <button type="button" @click.stop="emit('start', props.book.id)">Commencer</button>
          <button
            v-if="props.showRecommendAction"
            type="button"
            class="book-card__recommend"
            @click.stop="emit('recommend', props.book.id)"
          >
            Conseiller
          </button>
          <button type="button" class="book-card__remove" @click.stop="emit('remove', props.book.id)">Supprimer</button>
        </div>
      </div>
    </div>
  </article>
</template>

<style scoped>
.book-card {
  background-color: var(--glass-surface);
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 1.5rem;
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  transition: var(--transition-snap);
  box-shadow: 0 18px 36px rgba(15, 23, 42, 0.75);
  position: relative;
  cursor: pointer;
  animation: var(--animation-slide-up);
  animation-fill-mode: both;
  height: 100%;
  min-height: 380px;
  width: 100%;
  color: #e5e7eb;
  backdrop-filter: blur(22px);
  -webkit-backdrop-filter: blur(22px);
}

.book-card:hover {
  transform: var(--transform-lift);
  box-shadow: var(--shadow-hover);
  animation: pulse-scale 1s ease-in-out infinite;
}

.book-card::after {
  content: none;
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
  background-color: var(--glass-surface);
  border: 1px solid rgba(255, 255, 255, 0.35);
  box-shadow: 0 26px 52px rgba(15, 23, 42, 0.9);
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
  background: rgba(255, 255, 255, 0.2);
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
  color: #e5e7eb;
  font-size: var(--text-sm);
  font-weight: var(--font-bold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  position: relative;
  padding: 0.25rem 0.5rem;
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.7);
  border-radius: 999px;
}

.book-card__label::after {
  content: '';
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 8px;
  background: linear-gradient(to right, transparent, rgba(15, 23, 42, 0.9));
  pointer-events: none;
}

.book-card__meta {
  margin: 0;
  font-size: var(--text-xs);
  color: #9ca3af;
  font-weight: var(--font-medium);
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.book-card__title {
  margin: 0;
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-clamp: 2;
  color: #f9fafb;
  position: relative;
}

.book-card__title::after {
  content: '';
  position: absolute;
  bottom: 0;
  right: 0;
  width: 20px;
  height: 1.3em;
  background: linear-gradient(to right, transparent, hsla(246, 100%, 85%, 0.16));
  pointer-events: none;
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
  background: #f9fafb;
  color: #020617;
  border: none;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.8);
  position: relative;
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0.02em;
}

.book-card__actions button:first-child:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-lg);
}

.book-card__actions button:first-child:active {
  transform: translateY(1px);
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.8);
}

.book-card__recommend {
  background: var(--color-primary-green);
  color: #ffffff;
  border: 1px solid var(--color-primary-green);
}

.book-card__recommend:hover {
  background: #16a34a;
  border-color: #16a34a;
  transform: translateY(-1px);
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
