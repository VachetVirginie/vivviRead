<script setup lang="ts">
import { computed, ref } from 'vue'
import BookCard from '../ui/BookCard.vue'
import type { ReadingBook } from '../../composables/useReadingShelf'

const props = defineProps<{ books: ReadingBook[] }>()

const emit = defineEmits<{
  (e: 'status-change', id: string): void
  (e: 'remove', id: string): void
}>()

const searchQuery = ref('')
const sortBy = ref<'recent' | 'title' | 'author'>('recent')
const sizeFilter = ref<'all' | 'short' | 'medium' | 'long'>('all')

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

  if (sizeFilter.value !== 'all') {
    list = list.filter((book) => {
      const pages = book.totalPages || 0
      if (!pages) return false
      if (sizeFilter.value === 'short') return pages < 200
      if (sizeFilter.value === 'medium') return pages >= 200 && pages <= 400
      if (sizeFilter.value === 'long') return pages > 400
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

const activeBookId = ref<string | null>(null)

const activeBook = computed(() => props.books.find((b) => b.id === activeBookId.value) ?? null)

function openBookModal(id: string) {
  activeBookId.value = id
}

function closeBookModal() {
  activeBookId.value = null
}

function handleModalAction(action: 'start' | 'remove') {
  if (!activeBook.value) return
  if (action === 'start') {
    emit('status-change', activeBook.value.id)
  } else if (action === 'remove') {
    emit('remove', activeBook.value.id)
  }
  closeBookModal()
}
</script>

<template>
  <section id="to-read" class="to-read" role="region" aria-label="Pile à lire, galerie de cartes accessible">
    <header>
      <p class="section-eyebrow">Pile à lire</p>
      <h2>Prépare tes prochaines découvertes en parcourant ta pile sous forme de cartes accessibles.</h2>
    </header>

    <p v-if="!books.length" class="state">Ta pile à lire est vide pour l'instant.</p>

    <div v-else class="to-read__filters">
      <div class="to-read__filters-row">
        <label class="to-read__search">
          <span class="to-read__filters-label">Rechercher</span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Titre ou auteur"
          />
        </label>
        <div class="to-read__sort">
          <span class="to-read__filters-label">Trier par</span>
          <div class="to-read__chips">
            <button
              type="button"
              :class="['to-read__chip', { 'to-read__chip--active': sortBy === 'recent' }]"
              @click="sortBy = 'recent'"
            >
              Récent
            </button>
            <button
              type="button"
              :class="['to-read__chip', { 'to-read__chip--active': sortBy === 'title' }]"
              @click="sortBy = 'title'"
            >
              Titre
            </button>
            <button
              type="button"
              :class="['to-read__chip', { 'to-read__chip--active': sortBy === 'author' }]"
              @click="sortBy = 'author'"
            >
              Auteur
            </button>
          </div>
        </div>
      </div>

      <div class="to-read__filters-row to-read__filters-row--secondary">
        <span class="to-read__filters-label">Taille</span>
        <div class="to-read__chips">
          <button
            type="button"
            :class="['to-read__chip', { 'to-read__chip--active': sizeFilter === 'all' }]"
            @click="sizeFilter = 'all'"
          >
            Toutes
          </button>
          <button
            type="button"
            :class="['to-read__chip', { 'to-read__chip--active': sizeFilter === 'short' }]"
            @click="sizeFilter = 'short'"
          >
            Courtes
          </button>
          <button
            type="button"
            :class="['to-read__chip', { 'to-read__chip--active': sizeFilter === 'medium' }]"
            @click="sizeFilter = 'medium'"
          >
            Moyennes
          </button>
          <button
            type="button"
            :class="['to-read__chip', { 'to-read__chip--active': sizeFilter === 'long' }]"
            @click="sizeFilter = 'long'"
          >
            Pavés
          </button>
        </div>
      </div>
    </div>

    <p v-if="books.length && !filteredBooks.length" class="state">Aucun résultat avec ces filtres.</p>

    <div v-else-if="books.length && filteredBooks.length" class="to-read__grid">
      <BookCard
        v-for="book in filteredBooks"
        :key="book.id"
        :book="book"
        @open="openBookModal"
        @start="emit('status-change', $event)"
        @remove="emit('remove', $event)"
      />
    </div>

    <Teleport to="body">
      <div
        v-if="activeBook"
        class="to-read__modal-overlay"
        role="dialog"
        aria-modal="true"
        :aria-label="`Gérer ${activeBook.title}`"
      >
        <div class="to-read__modal">
          <button type="button" class="to-read__modal-close" aria-label="Fermer" @click="closeBookModal">×</button>
          <h3 class="to-read__modal-title">{{ activeBook.title }}</h3>
          <p class="to-read__modal-meta">
            {{ activeBook.author }}
            <template v-if="activeBook.totalPages"> · {{ activeBook.totalPages }} pages</template>
          </p>
          <p v-if="activeBook.averageRating" class="to-read__modal-extra">
            Note moyenne {{ activeBook.averageRating.toFixed(1) }} / 5
          </p>
          <div v-if="activeBook.coverUrl" class="to-read__modal-cover-wrapper">
            <img
              class="to-read__modal-cover"
              :src="activeBook.coverUrl"
              :alt="`Couverture de ${activeBook.title}`"
            />
          </div>
          <p v-if="activeBook.description" class="to-read__modal-summary">
            {{ activeBook.description }}
          </p>
          <p v-else-if="activeBook.notes" class="to-read__modal-summary">
            {{ activeBook.notes }}
          </p>
          <p v-else class="to-read__modal-summary">
            Tu peux ajouter un résumé personnel de ce livre dans tes notes.
          </p>
          <div class="to-read__modal-actions">
            <button type="button" @click="handleModalAction('start')">Commencer la lecture</button>
            <button type="button" @click="handleModalAction('remove')">Supprimer de la pile</button>
          </div>
        </div>
      </div>
    </Teleport>
  </section>
</template>

<style scoped>
.to-read {
  background-color: hsla(246, 100%, 85%, 0.12);
  border-radius: 1.5rem;
  padding: 1.75rem 1.75rem;
  border: 1px solid rgba(255, 255, 255, 0.22);
  display: flex;
  flex-direction: column;
  gap: 1.4rem;
  color: #e5e7eb;
  backdrop-filter: blur(22px);
  -webkit-backdrop-filter: blur(22px);
}

.to-read__filters {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.to-read__filters-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: flex-end;
  justify-content: space-between;
}

.to-read__filters-row--secondary {
  justify-content: flex-start;
}

.to-read__filters-label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #9ca3af;
}

.to-read__search {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1 1 160px;
}

.to-read__search input {
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.7);
  padding: 0.45rem 0.75rem;
  font: inherit;
  width: 100%;
  box-sizing: border-box;
  background: rgba(15, 23, 42, 0.9);
  color: #e5e7eb;
}

.to-read__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.to-read__chip {
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

.to-read__chip--active {
  background: #f9fafb;
  color: #020617;
}

.to-read__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.25rem;
}

@media (max-width: 640px) {
  .to-read__grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

.to-read__card {
  border-radius: 1.5rem;
  padding: 1.25rem;
  background-color: var(--glass-surface);
  border: 1px solid rgba(255, 255, 255, 0.22);
  box-shadow: 0 18px 36px rgba(15, 23, 42, 0.75);
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  min-height: 340px;
  transition: var(--transition-snap);
  cursor: pointer;
  position: relative;
}

.to-read__card:hover {
  transform: var(--transform-lift);
  box-shadow: var(--shadow-hover);
}

.to-read__card::after {
  content: '';
  position: absolute;
  top: -2px;
  right: -2px;
  width: 8px;
  height: 8px;
  background: var(--accent-primary);
  border: 1px solid var(--color-black);
}

.to-read__main {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  align-items: stretch;
  flex: 1;
}

.to-read__cover-wrapper {
  position: relative;
  flex-shrink: 0;
}

.to-read__content {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  flex: 1;
  align-items: center;
  text-align: center;
}

.to-read__text {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 96px;
}

.to-read__label {
  margin: 0 0 0.35rem;
  color: #6b7280;
  font-size: 0.9rem;
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.to-read__meta {
  margin: 0;
  font-size: 0.85rem;
  color: #4b5563;
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.to-read__title {
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-clamp: 3;
}

.to-read__cover {
  width: 100%;
  height: 220px;
  border-radius: 0.9rem;
  object-fit: cover;
  box-shadow: 0 10px 22px rgba(15, 23, 42, 0.3);
}

.to-read__rating-chip {
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

.to-read__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: auto;
}

.to-read__actions button {
  border: none;
  border-radius: 999px;
  padding: 0.45rem 1.1rem;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.85rem;
  min-width: 120px;
}

.to-read__actions button:first-child {
  background: #facc15;
  color: #111827;
}

.to-read__modal-overlay {
  position: fixed;
  inset: 0;
  background: radial-gradient(circle at top left, rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.95));
  backdrop-filter: blur(18px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  z-index: 30;
  animation: var(--animation-fade-in);
}

.to-read__modal {
  background-color: hsla(246, 100%, 85%, 0.16);
  color: #e5e7eb;
  border-radius: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.22);
  padding: 1.7rem 1.8rem 1.4rem;
  box-shadow: 0 26px 60px rgba(15, 23, 42, 0.9);
  max-width: 480px;
  width: min(480px, 100%);
  position: relative;
  max-height: min(80vh, 560px);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.to-read__modal::after {
  content: none;
}

.to-read__modal-title {
  margin: 0 0 0.3rem;
}

.to-read__modal-meta {
  margin: 0;
  font-size: 0.9rem;
  color: #9ca3af;
}

.to-read__modal-extra {
  margin: 0.4rem 0 0;
  font-size: 0.85rem;
  color: #cbd5f5;
}

.to-read__modal-cover-wrapper {
  margin-top: 0.9rem;
  display: flex;
  justify-content: center;
}

.to-read__modal-cover {
  max-width: 220px;
  width: 100%;
  border-radius: 1rem;
  box-shadow: 0 14px 26px rgba(15, 23, 42, 0.18);
}

.to-read__modal-summary {
  margin-top: 0.75rem;
  font-size: 0.9rem;
  color: #d1d5db;
}

.to-read__modal-actions {
  margin-top: 0.9rem;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.to-read__modal-actions button {
  border: none;
  border-radius: 999px;
  padding: 0.7rem 1.2rem;
  font-weight: 600;
  text-transform: none;
  font-size: 0.85rem;
  cursor: pointer;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.8);
  background: #f9fafb;
  color: #020617;
  transition: var(--transition-snap);
}

.to-read__modal-actions button:first-child {
  background: #f9fafb;
  color: #020617;
}

.to-read__modal-actions button:last-child {
  background: #fee2e2;
  color: var(--color-rouge-corail);
}

.to-read__modal-actions button:hover {
  background: #e5e7eb;
}

.to-read__modal-close {
  position: absolute;
  top: 0.6rem;
  right: 0.75rem;
  border: none;
  background: transparent;
  color: #9ca3af;
  font-size: 1.1rem;
  cursor: pointer;
}

@media (max-width: 480px) {
  .to-read {
    padding: 1.4rem 1rem;
  }

  .to-read__card {
    padding: 1rem;
  }

  .to-read__cover {
    width: 104px;
    min-height: 140px;
  }

  .to-read__actions {
    margin-top: 0.25rem;
  }

  .to-read__modal-overlay {
    align-items: flex-start;
    padding: 1rem 0.75rem;
    overflow-y: auto;
  }

  .to-read__modal {
    max-height: none;
    width: 100%;
    margin-top: 2.5rem;
  }
}
</style>
