<script setup lang="ts">
import Carousel from '../ui/Carousel.vue'
import BookCard from '../ui/BookCard.vue'
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
      :items-per-page="3"
    >
      <article
        v-for="book in books"
        :key="book.id"
        class="completed__card carousel__slide"
        role="group"
      >
        <BookCard :book="book" :hide-actions="true" />
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
  background: var(--color-white);
  border-radius: 0;
  padding: 1.75rem 1.5rem 6rem;
  border: 3px solid var(--color-black);
  border-left: 8px solid #16a34a;
  box-shadow: var(--shadow-brutal);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  position: relative;
  animation: var(--animation-slide-up);
  animation-delay: 0.2s;
  animation-fill-mode: both;
}

.completed::after {
  content: '✓';
  position: absolute;
  top: -3px;
  right: -3px;
  width: 20px;
  height: 20px;
  background: #16a34a;
  color: white;
  border: 2px solid var(--color-black);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 12px;
}

.completed__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

.completed__card {
  border-radius: 0;
  padding: 1.25rem;
  background: var(--color-white);
  border: 2px solid var(--color-black);
  border-top: 4px solid #16a34a;
  box-shadow: var(--shadow-subtle);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
  box-sizing: border-box;
  transition: var(--transition-snap);
  cursor: pointer;
  position: relative;
  animation: var(--animation-pop-in);
  animation-fill-mode: both;
}

.completed__card:nth-child(1) { animation-delay: 0s; }
.completed__card:nth-child(2) { animation-delay: 0.1s; }
.completed__card:nth-child(3) { animation-delay: 0.2s; }
.completed__card:nth-child(4) { animation-delay: 0.3s; }

.completed__card:hover {
  transform: var(--transform-lift);
  box-shadow: var(--shadow-hover);
}

.completed__card::before {
  content: '📚';
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 16px;
  height: 16px;
  background: #16a34a;
  color: white;
  border: 1px solid var(--color-black);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
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
  background: rgba(22, 163, 74, 0.1);
  border: 1px solid #16a34a;
  border-radius: 0;
  display: inline-block;
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
  border: 2px solid var(--color-black);
  border-radius: 0;
  padding: 0.4rem 0.9rem;
  font-weight: bold;
  text-transform: uppercase;
  font-size: 0.75rem;
  cursor: pointer;
  background: #16a34a;
  color: white;
  transition: var(--transition-snap);
  box-shadow: var(--shadow-subtle);
}

.completed__actions button:hover {
  transform: var(--transform-press);
  box-shadow: var(--shadow-hover);
  animation: pulse-scale 0.6s ease-in-out infinite;
}
.completed__carousel :deep(.carousel__controls) {
  margin-top: 1.25rem;
}
</style>
