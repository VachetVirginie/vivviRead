<script setup lang="ts">
import Carousel from '../ui/Carousel.vue'
import type { ReadingBook, ReadingStatus } from '../../composables/useReadingShelf'

defineProps<{ books: ReadingBook[] }>()

const emit = defineEmits<{
  (e: 'status-change', id: string, status: ReadingStatus): void
  (e: 'remove', id: string): void
}>()

function handleStatus(bookId: string, status: ReadingStatus) {
  emit('status-change', bookId, status)
}

function handleRemove(bookId: string) {
  emit('remove', bookId)
}
</script>

<template>
  <section id="abandoned" class="abandoned" aria-label="Livres abandonnés">
    <header>
      <p class="section-eyebrow">Livres abandonnés</p>
      <h2>Pas grave de faire une pause — garde une trace.</h2>
    </header>

    <p v-if="!books.length" class="state">Aucun livre abandonné pour le moment.</p>

    <Carousel
      v-else
      class="abandoned__carousel"
      :items-count="books.length"
      aria-label="Livres abandonnés"
      :ariaLabel="'Livres abandonnés'"
      :items-per-page="3"
    >
      <article v-for="book in books" :key="book.id" class="abandoned__card carousel__slide" role="group">
        <div v-if="book.coverUrl" class="abandoned__cover-wrapper">
          <img class="abandoned__cover" :src="book.coverUrl" :alt="`Couverture de ${book.title}`" />
        </div>
        <p class="abandoned__label">{{ book.author }}</p>
        <h3 class="abandoned__title">{{ book.title }}</h3>
        <p class="abandoned__meta">Arrêté à la page {{ book.currentPage }} / {{ book.totalPages }}</p>
        <div class="abandoned__actions">
          <button type="button" @click="handleStatus(book.id, 'en_cours')">Reprendre</button>
          <button type="button" @click="handleStatus(book.id, 'a_lire')">Reclasser</button>
          <button type="button" class="shelf__remove" @click="handleRemove(book.id)">Supprimer</button>
        </div>
      </article>
    </Carousel>
  </section>
</template>

<style scoped>
.abandoned {
  background: var(--color-white);
  border-radius: 0;
  padding: 1.75rem 1.5rem;
  border: 3px solid var(--color-black);
  border-left: 8px solid var(--accent-primary);
  box-shadow: var(--shadow-brutal);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  position: relative;
  animation: var(--animation-slide-up);
  animation-delay: 0.4s;
  animation-fill-mode: both;
}

.abandoned::after {
  content: '⏸';
  position: absolute;
  top: -3px;
  right: -3px;
  width: 20px;
  height: 20px;
  background: var(--accent-primary);
  color: white;
  border: 2px solid var(--color-black);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 12px;
}

.abandoned__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

.abandoned__card {
  border-radius: 0;
  padding: 1.25rem;
  background: var(--color-white);
  border: 2px solid var(--color-black);
  border-left: 6px solid var(--accent-primary);
  box-shadow: var(--shadow-subtle);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-height: 340px;
  transition: var(--transition-snap);
  cursor: pointer;
  position: relative;
}

.abandoned__card:hover {
  transform: var(--transform-lift);
  box-shadow: var(--shadow-hover);
  animation: sad-wobble 0.8s ease-in-out infinite;
}

.abandoned__card:nth-child(1) { animation-delay: 0s; }
.abandoned__card:nth-child(2) { animation-delay: 0.1s; }
.abandoned__card:nth-child(3) { animation-delay: 0.2s; }
.abandoned__card:nth-child(4) { animation-delay: 0.3s; }

.abandoned__card::before {
  content: '💔';
  position: absolute;
  bottom: -2px;
  left: -2px;
  width: 16px;
  height: 16px;
  background: var(--accent-primary);
  color: white;
  border: 1px solid var(--color-black);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
}

.abandoned__cover-wrapper {
  margin-bottom: 0.5rem;
}

.abandoned__cover {
  width: 100%;
  height: 220px;
  border-radius: 0.9rem;
  object-fit: cover;
  box-shadow: 0 10px 22px rgba(15, 23, 42, 0.3);
}

.abandoned__label {
  margin: 0;
  color: var(--color-black);
  font-size: 0.9rem;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0.2rem 0.4rem;
  background: rgba(255, 107, 107, 0.1);
  border: 1px solid var(--accent-primary);
  border-radius: 0;
  display: inline-block;
}

.abandoned__meta {
  margin: 0;
  color: #4b5563;
  font-size: 0.9rem;
}

.abandoned__title {
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-clamp: 3;
}

.abandoned__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.abandoned__actions button {
  border: none;
  border-radius: 0.75rem;
  padding: 0.4rem 0.9rem;
  font-weight: 600;
  cursor: pointer;
  background: #fee2e2;
  color: #7f1d1d;
}
</style>
