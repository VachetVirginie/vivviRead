<script setup lang="ts">
import { computed, ref } from 'vue'
import BookCard from '../ui/BookCard.vue'
import type { ReadingBook, ReadingStatus } from '../../composables/useReadingShelf'

const props = defineProps<{ books: ReadingBook[] }>()

const emit = defineEmits<{
  (e: 'status-change', payload: { id: string; status: ReadingStatus }): void
  (e: 'remove', id: string): void
}>()

const searchQuery = ref('')
const sortBy = ref<'recent' | 'title' | 'author' | 'rating'>('recent')
const yearFilter = ref<'all' | 'this-year' | 'last-year' | 'older'>('all')

function getYear(value: string): number | null {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.getFullYear()
}

const currentYear = new Date().getFullYear()

const filteredBooks = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  let list = props.books

  if (query) {
    list = list.filter((book) => {
      return (
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query)
      )
    })
  }

  if (yearFilter.value !== 'all') {
    list = list.filter((book) => {
      const year = getYear(book.updatedAt)
      if (!year) return false
      if (yearFilter.value === 'this-year') return year === currentYear
      if (yearFilter.value === 'last-year') return year === currentYear - 1
      if (yearFilter.value === 'older') return year < currentYear - 1
      return true
    })
  }

  const sorted = [...list]
  if (sortBy.value === 'title') {
    sorted.sort((a, b) => a.title.localeCompare(b.title))
  } else if (sortBy.value === 'author') {
    sorted.sort((a, b) => a.author.localeCompare(b.author))
  } else if (sortBy.value === 'rating') {
    sorted.sort((a, b) => (b.averageRating ?? 0) - (a.averageRating ?? 0))
  } else {
    sorted.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  }

  return sorted
})
</script>

<template>
  <section id="completed" class="completed" aria-label="Livres lus">
    <header>
      <p class="section-eyebrow">Livres lus</p>
      <h2>Célèbre chaque fin de livre et garde tes notes à portée.</h2>
    </header>

    <p v-if="!books.length" class="state">Tu n'as pas encore terminé de livre cette année.</p>

    <div v-else>
      <div class="completed__filters">
        <div class="completed__filters-row">
          <label class="completed__search">
            <span class="completed__filters-label">Rechercher</span>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Titre ou auteur"
            />
          </label>
          <div class="completed__sort">
            <span class="completed__filters-label">Trier par</span>
            <div class="completed__chips">
              <button
                type="button"
                :class="['completed__chip', { 'completed__chip--active': sortBy === 'recent' }]"
                @click="sortBy = 'recent'"
              >
                Récent
              </button>
              <button
                type="button"
                :class="['completed__chip', { 'completed__chip--active': sortBy === 'title' }]"
                @click="sortBy = 'title'"
              >
                Titre
              </button>
              <button
                type="button"
                :class="['completed__chip', { 'completed__chip--active': sortBy === 'author' }]"
                @click="sortBy = 'author'"
              >
                Auteur
              </button>
              <button
                type="button"
                :class="['completed__chip', { 'completed__chip--active': sortBy === 'rating' }]"
                @click="sortBy = 'rating'"
              >
                Note
              </button>
            </div>
          </div>
        </div>

        <div class="completed__filters-row completed__filters-row--secondary">
          <span class="completed__filters-label">Année</span>
          <div class="completed__chips">
            <button
              type="button"
              :class="['completed__chip', { 'completed__chip--active': yearFilter === 'all' }]"
              @click="yearFilter = 'all'"
            >
              Toutes
            </button>
            <button
              type="button"
              :class="['completed__chip', { 'completed__chip--active': yearFilter === 'this-year' }]"
              @click="yearFilter = 'this-year'"
            >
              Cette année
            </button>
            <button
              type="button"
              :class="['completed__chip', { 'completed__chip--active': yearFilter === 'last-year' }]"
              @click="yearFilter = 'last-year'"
            >
              Année dernière
            </button>
            <button
              type="button"
              :class="['completed__chip', { 'completed__chip--active': yearFilter === 'older' }]"
              @click="yearFilter = 'older'"
            >
              Plus ancien
            </button>
          </div>
        </div>
      </div>

      <p v-if="books.length && !filteredBooks.length" class="state">Aucun résultat avec ces filtres.</p>

      <div v-else class="completed__grid">
        <article
          v-for="book in filteredBooks"
          :key="book.id"
          class="completed__card"
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
      </div>
    </div>
  </section>
</template>

<style scoped>
.completed {
  background-color: hsla(246, 100%, 85%, 0.12);
  border-radius: 1.5rem;
  padding: 1.75rem 1.75rem 6rem;
  border: 1px solid rgba(255, 255, 255, 0.22);
  box-shadow: 0 22px 45px rgba(15, 23, 42, 0.75);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  position: relative;
  animation: var(--animation-slide-up);
  animation-delay: 0.2s;
  animation-fill-mode: both;
  color: #e5e7eb;
  backdrop-filter: blur(22px);
  -webkit-backdrop-filter: blur(22px);
}

.completed::after {
  content: none;
}

.completed__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1.25rem;
}

@media (min-width: 640px) {
  .completed__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.completed__card {
  border-radius: 1.25rem;
  padding: 1.25rem;
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.7);
  border-top: 2px solid #16a34a;
  box-shadow: 0 18px 36px rgba(15, 23, 42, 0.75);
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
  content: none;
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
  color: #bbf7d0;
  font-size: 0.9rem;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0.2rem 0.4rem;
  background: rgba(22, 163, 74, 0.22);
  border: 1px solid #16a34a;
  border-radius: 999px;
  display: inline-block;
}

.completed__meta {
  margin: 0;
  color: #9ca3af;
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
  color: #bbf7d0;
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
  border-radius: 999px;
  padding: 0.45rem 1.1rem;
  font-weight: 600;
  text-transform: none;
  font-size: 0.8rem;
  cursor: pointer;
  background: #f9fafb;
  color: #020617;
  transition: var(--transition-snap);
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.8);
}

.completed__actions button:hover {
  background: #e5e7eb;
}
</style>
