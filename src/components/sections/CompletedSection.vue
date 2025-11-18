<script setup lang="ts">
import Carousel from '../ui/Carousel.vue'
import type { ReadingBook, ReadingStatus } from '../../composables/useReadingShelf'

defineProps<{ books: ReadingBook[] }>()

const emit = defineEmits<{
  (e: 'status-change', payload: { id: string; status: ReadingStatus }): void
  (e: 'remove', id: string): void
}>()
</script>

<template>
  <section id="completed" class="completed" aria-label="Livres lus">
    <header>
      <p class="section-eyebrow">Livres lus</p>
      <h2>Célèbre chaque fin de livre et garde tes notes à portée.</h2>
    </header>

    <p v-if="!books.length" class="state">Tu n'as pas encore terminé de livre cette année.</p>

    <Carousel
      v-else
      class="completed__carousel"
      :items-count="books.length"
      aria-label="Livres lus"
      :ariaLabel="'Livres lus'"
      :items-per-page="4"
    >
      <article v-for="book in books" :key="book.id" class="completed__card carousel__slide" role="group">
        <div v-if="book.coverUrl" class="completed__cover-wrapper">
          <img class="completed__cover" :src="book.coverUrl" :alt="`Couverture de ${book.title}`" />
        </div>
        <p class="completed__label">{{ book.author }}</p>
        <p class="completed__meta">{{ book.totalPages }} pages · Terminé</p>
        <h3 class="completed__title">{{ book.title }}</h3>
        <p v-if="book.notes" class="completed__notes">{{ book.notes }}</p>
        <div class="completed__actions">
          <button type="button" @click="emit('status-change', { id: book.id, status: 'en_cours' })">Reprendre</button>
          <button type="button" @click="emit('status-change', { id: book.id, status: 'a_lire' })">Reclasser</button>
          <button type="button" class="shelf__remove" @click="emit('remove', book.id)">Supprimer</button>
        </div>
      </article>
    </Carousel>
  </section>
</template>

<style scoped>
.completed {
  background: #ffffff;
  border-radius: 1.5rem;
  padding: 1.75rem 1.5rem;
  border: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.completed__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

.completed__card {
  border-radius: 1.25rem;
  padding: 1.25rem;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  box-shadow: 0 6px 20px rgba(15, 23, 42, 0.06);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
  box-sizing: border-box;
}

.completed__cover-wrapper {
  margin-bottom: 0.5rem;
}

.completed__cover {
  width: 100%;
  height: 220px;
  border-radius: 0.9rem;
  object-fit: cover;
  box-shadow: 0 10px 22px rgba(15, 23, 42, 0.3);
}

.completed__label {
  margin: 0;
  color: #6b7280;
  font-size: 0.9rem;
}

.completed__meta {
  margin: 0;
  color: #4b5563;
  font-size: 0.9rem;
}

.completed__title {
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-clamp: 3;
}

.completed__notes {
  margin: 0;
  color: #166534;
  font-size: 0.9rem;
  white-space: pre-wrap;
}

.completed__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.completed__actions button {
  border: none;
  border-radius: 0.75rem;
  padding: 0.4rem 0.9rem;
  font-weight: 600;
  cursor: pointer;
  background: #fef3c7;
  color: #92400e;
  border: 1px solid #facc15;
}
</style>
