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
      :items-per-page="4"
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
  background: #ffffff;
  border-radius: 1.5rem;
  padding: 1.75rem 1.5rem;
  border: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.abandoned__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

.abandoned__card {
  border-radius: 1.25rem;
  padding: 1.25rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  box-shadow: 0 6px 20px rgba(15, 23, 42, 0.06);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
  box-sizing: border-box;
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
  color: #b91c1c;
  font-size: 0.9rem;
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
