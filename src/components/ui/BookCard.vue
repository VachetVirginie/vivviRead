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
      <div v-if="props.book.coverUrl" class="book-card__cover-wrapper">
        <img class="book-card__cover" :src="props.book.coverUrl" :alt="`Couverture de ${props.book.title}`" />
        <span v-if="props.book.averageRating" class="book-card__rating-chip">
          {{ props.book.averageRating.toFixed(1) }}
        </span>
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
  border-radius: 1.25rem;
  padding: 1.25rem;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  box-shadow: 0 6px 20px rgba(15, 23, 42, 0.06);
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  width: 100%;
  box-sizing: border-box;
}

.book-card__main {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  align-items: stretch;
  flex: 1;
}

.book-card__cover-wrapper {
  position: relative;
  flex-shrink: 0;
}

.book-card__cover {
  width: 100%;
  height: 220px;
  border-radius: 0.9rem;
  object-fit: cover;
  box-shadow: 0 10px 22px rgba(15, 23, 42, 0.3);
}

.book-card__rating-chip {
  position: absolute;
  top: 0.35rem;
  right: 0.35rem;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  background: rgba(17, 24, 39, 0.9);
  color: #facc15;
  font-size: 0.7rem;
  font-weight: 600;
}

.book-card__content {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
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
}

.book-card__label {
  margin: 0 0 0.35rem;
  color: #6b7280;
  font-size: 0.9rem;
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.book-card__meta {
  margin: 0;
  font-size: 0.85rem;
  color: #4b5563;
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.book-card__title {
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-clamp: 3;
}

.book-card__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: auto;
}

.book-card__actions button {
  border: none;
  border-radius: 999px;
  padding: 0.45rem 1.1rem;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.85rem;
  min-width: 120px;
}

.book-card__actions button:first-child {
  background: #facc15;
  color: #111827;
}

.book-card__remove {
  background: #fee2e2;
  color: #b91c1c;
}
</style>
