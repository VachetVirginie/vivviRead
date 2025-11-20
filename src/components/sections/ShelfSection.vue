<script setup lang="ts">
import { computed, ref } from 'vue'
import BookCard from '../ui/BookCard.vue'
import type { ReadingBook, ReadingStatus } from '../../composables/useReadingShelf'

const props = defineProps<{
  books: ReadingBook[]
  statusOptions: { value: ReadingStatus; label: string }[]
  removalPromptId: string | null
}>()

const emit = defineEmits<{
  (e: 'request-removal', id: string): void
  (e: 'change-total-pages', payload: { id: string; value: number }): void
  (e: 'change-status', payload: { id: string; status: ReadingStatus }): void
  (e: 'change-progress', payload: { id: string; value: number }): void
  (e: 'change-percent', payload: { id: string; value: number }): void
  (e: 'change-notes', payload: { id: string; value: string }): void
  (e: 'removal-choice', payload: { id: string; choice: 'to_read' | 'abandon' | 'delete' | 'cancel' }): void
  (e: 'status-change', payload: { id: string; status: ReadingStatus }): void
  (e: 'remove', id: string): void
  (e: 'open-modal', id: string): void
}>()

const searchQuery = ref('')
const sortBy = ref<'recent' | 'title' | 'author'>('recent')
const progressFilter = ref<'all' | '0-25' | '25-50' | '50-75' | '75-100'>('all')

function progressPercent(book: ReadingBook) {
  if (!book.totalPages || book.totalPages <= 0) {
    return 0
  }
  return Math.round((book.currentPage / book.totalPages) * 100)
}

const removalBook = computed(() => props.books.find((b) => b.id === props.removalPromptId) ?? null)

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
      const percent = progressPercent(book)
      if (progressFilter.value === '0-25') return percent < 25
      if (progressFilter.value === '25-50') return percent >= 25 && percent < 50
      if (progressFilter.value === '50-75') return percent >= 50 && percent < 75
      if (progressFilter.value === '75-100') return percent >= 75
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

function handleStatusChange(id: string) {
  emit('status-change', { id, status: 'en_cours' })
}

function handleRemove(id: string) {
  emit('remove', id)
}
</script>

<template>
  <section id="shelf" class="shelf" aria-label="Lectures en cours">
    <header>
      <p class="section-eyebrow">Lectures en cours</p>
      <h2>Garde un œil précis sur tes pages et capture tes impressions.</h2>
    </header>
    <p class="state">Utilise les actions rapides pour ajouter un livre ou renseigner ses détails.</p>

    <div v-if="books.length" class="shelf__filters">
      <div class="shelf__filters-row">
        <label class="shelf__search">
          <span class="shelf__filters-label">Rechercher</span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Titre ou auteur"
          />
          </label>
        <div class="shelf__sort">
          <span class="shelf__filters-label">Trier par</span>
          <div class="shelf__chips">
            <button
              type="button"
              :class="['shelf__chip', { 'shelf__chip--active': sortBy === 'recent' }]"
              @click="sortBy = 'recent'"
            >
              Récent
            </button>
            <button
              type="button"
              :class="['shelf__chip', { 'shelf__chip--active': sortBy === 'title' }]"
              @click="sortBy = 'title'"
            >
              Titre
            </button>
            <button
              type="button"
              :class="['shelf__chip', { 'shelf__chip--active': sortBy === 'author' }]"
              @click="sortBy = 'author'"
            >
              Auteur
            </button>
          </div>
        </div>
      </div>

      <div class="shelf__filters-row shelf__filters-row--secondary">
        <span class="shelf__filters-label">Progression</span>
        <div class="shelf__chips">
          <button
            type="button"
            :class="['shelf__chip', { 'shelf__chip--active': progressFilter === 'all' }]"
            @click="progressFilter = 'all'"
          >
            Toutes
          </button>
          <button
            type="button"
            :class="['shelf__chip', { 'shelf__chip--active': progressFilter === '0-25' }]"
            @click="progressFilter = '0-25'"
          >
            0–25 %
          </button>
          <button
            type="button"
            :class="['shelf__chip', { 'shelf__chip--active': progressFilter === '25-50' }]"
            @click="progressFilter = '25-50'"
          >
            25–50 %
          </button>
          <button
            type="button"
            :class="['shelf__chip', { 'shelf__chip--active': progressFilter === '50-75' }]"
            @click="progressFilter = '50-75'"
          >
            50–75 %
          </button>
          <button
            type="button"
            :class="['shelf__chip', { 'shelf__chip--active': progressFilter === '75-100' }]"
            @click="progressFilter = '75-100'"
          >
            75–100 %
          </button>
        </div>
      </div>
    </div>

    <p v-if="books.length && !filteredBooks.length" class="state">Aucun résultat avec ces filtres.</p>

    <div v-else-if="books.length && filteredBooks.length" class="shelf__grid">
      <BookCard
        v-for="book in filteredBooks"
        :key="book.id"
        :book="book"
        :hide-actions="true"
        @open="openBookModal"
        @start="handleStatusChange"
        @remove="handleRemove"
      />
    </div>

    <Teleport to="body">
      <div
        v-if="activeBook"
        class="shelf__confirm-overlay"
        role="dialog"
        aria-modal="true"
        :aria-label="`Suivi de ta lecture pour ${activeBook.title}`"
      >
        <div class="shelf__modal">
          <button type="button" class="shelf__confirm-close" aria-label="Fermer" @click="closeBookModal">×</button>
          <div class="shelf__header">
            <div class="shelf__title-block">
              <p class="shelf__label">{{ activeBook.author }}</p>
              <h3>{{ activeBook.title }}</h3>
            </div>
            <div class="shelf__meta">
              <p class="shelf__pages">
                {{ activeBook.currentPage }} / {{ activeBook.totalPages > 0 ? activeBook.totalPages : '–' }}
              </p>
              <button class="shelf__remove" type="button" @click="emit('request-removal', activeBook.id)">
                Retirer
              </button>
            </div>
          </div>

          <label class="shelf__total">
          <span>Pages totales</span>
          <input
            type="number"
            min="1"
            :value="activeBook.totalPages > 0 ? activeBook.totalPages : ''"
            placeholder="Ajoute le nombre de pages"
            @change="
              emit('change-total-pages', {
                id: activeBook.id,
                value: Number(($event.target as HTMLInputElement).value),
              })
            "
          />
        </label>

          <label class="shelf__status">
          <span>Statut</span>
          <select
            :value="activeBook.status"
            @change="
              emit('change-status', {
                id: activeBook.id,
                status: ($event.target as HTMLSelectElement).value as ReadingStatus,
              })
            "
          >
            <option v-for="option in props.statusOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </label>

          <label class="shelf__range">
          <span>Page actuelle</span>
          <input
            type="range"
            :min="0"
            :max="activeBook.totalPages"
            :value="activeBook.currentPage"
            :disabled="!activeBook.totalPages || activeBook.totalPages <= 0"
            @input="
              emit('change-progress', {
                id: activeBook.id,
                value: Number(($event.target as HTMLInputElement).value),
              })
            "
          />
        </label>

          <label class="shelf__percent">
          <span>Progression (%)</span>
          <input
            type="number"
            min="0"
            max="100"
            :value="progressPercent(activeBook)"
            :disabled="!activeBook.totalPages || activeBook.totalPages <= 0"
            @change="
              emit('change-percent', {
                id: activeBook.id,
                value: Number(($event.target as HTMLInputElement).value),
              })
            "
          />
          <small v-if="!activeBook.totalPages || activeBook.totalPages <= 0">
            Ajoute le nombre de pages pour activer.
          </small>
        </label>

          <textarea
          class="shelf__notes"
          rows="2"
          :value="activeBook.notes ?? ''"
          placeholder="Ajoute une note rapide (humeur, contexte, citations...)"
          @change="
            emit('change-notes', {
              id: activeBook.id,
              value: ($event.target as HTMLTextAreaElement).value,
            })
          "
          ></textarea>
        </div>
      </div>

      <div
        v-if="props.removalPromptId && removalBook"
        class="shelf__confirm-overlay"
        role="dialog"
        aria-modal="true"
        :aria-label="`Que souhaites-tu faire de ${removalBook.title} ?`"
      >
        <div class="shelf__confirm">
          <button
            type="button"
            class="shelf__confirm-close"
            aria-label="Fermer"
            @click="emit('removal-choice', { id: removalBook.id, choice: 'cancel' })"
          >
            ×
          </button>
          <p class="shelf__confirm-title">Que souhaites-tu faire de ce livre ?</p>
          <p class="shelf__confirm-meta">{{ removalBook.title }} · {{ removalBook.author }}</p>
          <div class="shelf__confirm-actions">
            <button type="button" @click="emit('removal-choice', { id: removalBook.id, choice: 'to_read' })">
              Repasser en PAL
            </button>
            <button type="button" @click="emit('removal-choice', { id: removalBook.id, choice: 'abandon' })">
              Marquer abandonné
            </button>
            <button type="button" @click="emit('removal-choice', { id: removalBook.id, choice: 'delete' })">
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </section>
</template>

<style scoped>
.shelf {
  background: var(--color-white);
  border-radius: 0;
  padding: 1.75rem 1.5rem;
  border: 3px solid var(--color-black);
  border-left: 8px solid var(--accent-secondary);
  box-shadow: var(--shadow-brutal);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: relative;
}

.shelf__filters {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.shelf__filters-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: flex-end;
  justify-content: space-between;
}

.shelf__filters-row--secondary {
  justify-content: flex-start;
}

.shelf__filters-label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.shelf__search {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1 1 160px;
}

.shelf__search input {
  border: 2px solid var(--color-black);
  border-radius: 0;
  padding: 0.4rem 0.6rem;
  font: inherit;
  width: 100%;
  box-sizing: border-box;
}

.shelf__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.shelf__chip {
  border: 2px solid var(--color-black);
  border-radius: 0;
  padding: 0.25rem 0.6rem;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  background: var(--color-white);
  cursor: pointer;
}

.shelf__chip--active {
  background: var(--accent-secondary);
  color: #ffffff;
}

.shelf__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1.25rem;
}

@media (min-width: 640px) {
  .shelf__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.shelf::after {
  content: '📖';
  position: absolute;
  top: -3px;
  right: -3px;
  width: 20px;
  height: 20px;
  background: var(--accent-secondary);
  color: white;
  border: 2px solid var(--color-black);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.shelf__header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
}

.shelf__title-block {
  min-width: 0;
}

.shelf__label {
  margin: 0 0 0.35rem;
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
  background: var(--color-gray-100);
  border: 1px solid var(--color-black);
  border-radius: 0;
  display: inline-block;
}

.shelf__pages {
  margin: 0;
  font-weight: 600;
  white-space: nowrap;
}

.shelf__meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.35rem;
}

.shelf__range,
.shelf__status,
.shelf__total,
.shelf__percent {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.9rem;
  color: #4b5563;
}

.shelf__modal .shelf__total,
.shelf__modal .shelf__status,
.shelf__modal .shelf__range,
.shelf__modal .shelf__percent {
  background: #f9fafb;
  border-radius: 0.9rem;
  padding: 0.6rem 0.75rem;
}

.shelf__range input {
  accent-color: #facc15;
}

.shelf__status select {
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  color: #111827;
  padding: 0.5rem 0.75rem;
}

.shelf__notes {
  border-radius: 0.9rem;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  color: #111827;
  padding: 0.85rem 1rem;
  font-family: inherit;
  resize: vertical;
  width: 100%;
  box-sizing: border-box;
}

.shelf__modal .shelf__notes {
  margin-top: 0.5rem;
}

.shelf__total input,
.shelf__percent input {
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  padding: 0.45rem 0.75rem;
  font-family: inherit;
  font-size: 0.9rem;
}

.shelf__total input:focus,
.shelf__percent input:focus,
.shelf__status select:focus,
.shelf__notes:focus {
  outline: none;
  border-color: #facc15;
  box-shadow: 0 0 0 1px rgba(250, 204, 21, 0.18);
}

.shelf__total input::-webkit-outer-spin-button,
.shelf__total input::-webkit-inner-spin-button,
.shelf__percent input::-webkit-outer-spin-button,
.shelf__percent input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.shelf__total input[type='number'],
.shelf__percent input[type='number'] {
  appearance: textfield;
  -moz-appearance: textfield;
}

.shelf__confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  z-index: 30;
  animation: var(--animation-fade-in);
}

.shelf__modal,
.shelf__confirm {
  background: var(--color-white);
  color: var(--color-black);
  border-radius: 0;
  border: 3px solid var(--color-black);
  padding: 1.5rem 1.6rem 1.3rem;
  box-shadow: var(--shadow-brutal);
  max-width: 540px;
  width: min(540px, 100%);
  position: relative;
  max-height: min(80vh, 600px);
  overflow-y: auto;
}

.shelf__modal::after,
.shelf__confirm::after {
  content: '';
  position: absolute;
  top: -3px;
  right: -3px;
  width: 16px;
  height: 16px;
  background: var(--accent-secondary);
  border: 2px solid var(--color-black);
}

.shelf__confirm-title {
  margin: 0;
  font-weight: 600;
}

.shelf__confirm-meta {
  margin: 0.35rem 0 0;
  font-size: 0.9rem;
  color: #4b5563;
}

.shelf__confirm-actions {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-top: 0.85rem;
}

.shelf__confirm-actions button {
  border: 2px solid var(--color-black);
  border-radius: 0;
  padding: 0.6rem 0.9rem;
  cursor: pointer;
  font-weight: bold;
  width: 100%;
  text-align: center;
  text-transform: uppercase;
  font-size: 0.8rem;
  box-shadow: var(--shadow-subtle);
  transition: var(--transition-snap);
}

.shelf__confirm-actions button:nth-child(1) {
  background: var(--accent-tertiary);
  color: var(--color-black);
}

.shelf__confirm-actions button:nth-child(2) {
  background: var(--accent-secondary);
  color: #ffffff;
}

.shelf__confirm-actions button:nth-child(3) {
  background: var(--color-rouge-corail);
  color: white;
}

.shelf__confirm-actions button:hover {
  transform: var(--transform-press);
  box-shadow: var(--shadow-hover);
}

.shelf__confirm-close {
  position: absolute;
  top: 0.6rem;
  right: 0.7rem;
  border: none;
  background: transparent;
  color: #9ca3af;
  font-size: 1.1rem;
  cursor: pointer;
}

@media (max-width: 640px) {
  .shelf__confirm-overlay {
    align-items: flex-start;
    padding: 1rem 0.75rem;
    overflow-y: auto;
  }

  .shelf__modal,
  .shelf__confirm {
    max-height: none;
    width: 100%;
    margin-top: 2.5rem;
  }
}
</style>
