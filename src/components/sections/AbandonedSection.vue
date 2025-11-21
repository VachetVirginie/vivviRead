<script setup lang="ts">
import { computed, ref } from 'vue'
import BookCard from '../ui/BookCard.vue'
import type { ReadingBook, ReadingStatus } from '../../composables/useReadingShelf'

const props = defineProps<{ books: ReadingBook[] }>()

const emit = defineEmits<{
  (e: 'status-change', id: string, status: ReadingStatus): void
  (e: 'remove', id: string): void
}>()

const searchQuery = ref('')
const sortBy = ref<'recent' | 'title' | 'author'>('recent')
const progressFilter = ref<'all' | 'early' | 'middle' | 'late'>('all')

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

  if (progressFilter.value !== 'all') {
    list = list.filter((book) => {
      if (!book.totalPages || book.totalPages <= 0) return false
      const percent = Math.round((book.currentPage / book.totalPages) * 100)
      if (progressFilter.value === 'early') return percent < 25
      if (progressFilter.value === 'middle') return percent >= 25 && percent <= 75
      if (progressFilter.value === 'late') return percent > 75
      return true
    })
  }

  const sorted = [...list]
  if (sortBy.value === 'title') {
    sorted.sort((a, b) => a.title.localeCompare(b.title))
  } else if (sortBy.value === 'author') {
    sorted.sort((a, b) => a.author.localeCompare(b.author))
  } else {
    sorted.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  }

  return sorted
})

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

    <div v-else>
      <div class="abandoned__filters">
        <div class="abandoned__filters-row">
          <label class="abandoned__search">
            <span class="abandoned__filters-label">Rechercher</span>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Titre ou auteur"
            />
          </label>
          <div class="abandoned__sort">
            <span class="abandoned__filters-label">Trier par</span>
            <div class="abandoned__chips">
              <button
                type="button"
                :class="['abandoned__chip', { 'abandoned__chip--active': sortBy === 'recent' }]"
                @click="sortBy = 'recent'"
              >
                Récent
              </button>
              <button
                type="button"
                :class="['abandoned__chip', { 'abandoned__chip--active': sortBy === 'title' }]"
                @click="sortBy = 'title'"
              >
                Titre
              </button>
              <button
                type="button"
                :class="['abandoned__chip', { 'abandoned__chip--active': sortBy === 'author' }]"
                @click="sortBy = 'author'"
              >
                Auteur
              </button>
            </div>
          </div>
        </div>

        <div class="abandoned__filters-row abandoned__filters-row--secondary">
          <span class="abandoned__filters-label">Progression à l'arrêt</span>
          <div class="abandoned__chips">
            <button
              type="button"
              :class="['abandoned__chip', { 'abandoned__chip--active': progressFilter === 'all' }]"
              @click="progressFilter = 'all'"
            >
              Toutes
            </button>
            <button
              type="button"
              :class="['abandoned__chip', { 'abandoned__chip--active': progressFilter === 'early' }]"
              @click="progressFilter = 'early'"
            >
              Début
            </button>
            <button
              type="button"
              :class="['abandoned__chip', { 'abandoned__chip--active': progressFilter === 'middle' }]"
              @click="progressFilter = 'middle'"
            >
              Milieu
            </button>
            <button
              type="button"
              :class="['abandoned__chip', { 'abandoned__chip--active': progressFilter === 'late' }]"
              @click="progressFilter = 'late'"
            >
              Tard
            </button>
          </div>
        </div>
      </div>

      <p v-if="books.length && !filteredBooks.length" class="state">Aucun résultat avec ces filtres.</p>

      <div v-else class="abandoned__grid">
        <article
          v-for="book in filteredBooks"
          :key="book.id"
          class="abandoned__card"
          role="group"
        >
          <BookCard :book="book" :hide-actions="true" />
          <p class="abandoned__meta">Arrêté à la page {{ book.currentPage }} / {{ book.totalPages }}</p>
          <div class="abandoned__actions">
            <button type="button" @click="handleStatus(book.id, 'en_cours')">Reprendre</button>
            <button type="button" @click="handleStatus(book.id, 'a_lire')">Reclasser</button>
            <button type="button" class="shelf__remove" @click="handleRemove(book.id)">Supprimer</button>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.abandoned {
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
  animation-delay: 0.4s;
  animation-fill-mode: both;
  margin-bottom: 2em;
  color: #e5e7eb;
  backdrop-filter: blur(22px);
  -webkit-backdrop-filter: blur(22px);
}

.abandoned::after {
  content: none;
}

.abandoned__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1.25rem;
}

@media (min-width: 640px) {
  .abandoned__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.abandoned__card {
  border-radius: 1.25rem;
  padding: 1.25rem;
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.7);
  border-left: 4px solid var(--accent-primary);
  box-shadow: 0 18px 36px rgba(15, 23, 42, 0.75);
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
  content: none;
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
  color: #fecaca;
  font-size: 0.9rem;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0.2rem 0.4rem;
  background: rgba(248, 113, 113, 0.18);
  border: 1px solid var(--accent-primary);
  border-radius: 999px;
  display: inline-block;
}

.abandoned__meta {
  margin: 0;
  color: #e5e7eb;
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

.abandoned__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.abandoned__chip {
  border: 1px solid rgba(148, 163, 184, 0.7);
  border-radius: 999px;
  padding: 0.25rem 0.8rem;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  background: transparent;
  cursor: pointer;
  color: #cbd5f5;
}

.abandoned__chip--active {
  background: var(--accent-primary);
  color: #ffffff;
}

.abandoned__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.abandoned__actions button {
  border: none;
  border-radius: 999px;
  padding: 0.5rem 1.1rem;
  font-weight: 600;
  text-transform: none;
  font-size: 0.8rem;
  cursor: pointer;
  background: #f9fafb;
  color: #020617;
  transition: var(--transition-snap);
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.7);
}

.abandoned__actions button:nth-child(2) {
  background: rgba(15, 23, 42, 0.9);
  color: #e5e7eb;
}

.abandoned__actions .shelf__remove {
  background: #b91c1c;
  color: #fef2f2;
  border-color: transparent;
}

.abandoned__actions button:hover {
  background: #e5e7eb;
  color: #020617;
}
</style>
