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
  (e: 'recommend', payload: { id: string }): void
}>()

const searchQuery = ref('')
const sortBy = ref<'recent' | 'title' | 'author'>('recent')
const progressFilter = ref<'all' | '0-25' | '25-50' | '50-75' | '75-100'>('all')
const showAdvancedFilters = ref(false)
const hasActiveAdvancedFilters = computed(() => progressFilter.value !== 'all')

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

const statusFeedback = ref<string | null>(null)
let statusFeedbackTimeout: number | null = null

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

function handleQuickProgress(type: 'plus10' | 'chapter') {
  if (!activeBook.value) return

  const book = activeBook.value
  if (!book.totalPages || book.totalPages <= 0) {
    return
  }

  const increment = type === 'plus10' ? 10 : Math.max(1, Math.round(book.totalPages / 20))
  const nextPage = Math.min(book.totalPages, book.currentPage + increment)

  emit('change-progress', {
    id: book.id,
    value: nextPage,
  })
}

function handleStatusSelectChange(event: Event) {
  if (!activeBook.value) return

  const select = event.target as HTMLSelectElement
  const nextStatus = select.value as ReadingStatus

  if (nextStatus === activeBook.value.status) {
    return
  }

  emit('change-status', {
    id: activeBook.value.id,
    status: nextStatus,
  })

  let message = 'Statut mis à jour'
  if (nextStatus === 'lu') {
    message = 'Marqué comme terminé'
  } else if (nextStatus === 'abandonne') {
    message = 'Marqué comme abandonné'
  }

  statusFeedback.value = message

  if (statusFeedbackTimeout !== null) {
    clearTimeout(statusFeedbackTimeout)
  }

  statusFeedbackTimeout = window.setTimeout(() => {
    statusFeedback.value = null
    statusFeedbackTimeout = null
  }, 2000)
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

      <div class="shelf__advanced-toggle">
        <button
          type="button"
          class="shelf__advanced-button"
          @click="showAdvancedFilters = !showAdvancedFilters"
        >
          Affiner les résultats
          <span v-if="hasActiveAdvancedFilters" class="shelf__advanced-badge">
            1
          </span>
        </button>
      </div>

      <div v-if="showAdvancedFilters" class="shelf__filters-advanced">
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

          <div class="shelf__progress-block">
            <p class="shelf__progress-main">
              <span class="shelf__progress-pages">
                {{ activeBook.currentPage }} / {{ activeBook.totalPages > 0 ? activeBook.totalPages : '–' }} pages
              </span>
              <span v-if="activeBook.totalPages > 0" class="shelf__progress-percent">
                {{ progressPercent(activeBook) }} %
              </span>
            </p>

            <div class="shelf__progress-quick">
              <button
                type="button"
                class="shelf__quick-button"
                :disabled="!activeBook.totalPages || activeBook.totalPages <= 0"
                @click="handleQuickProgress('plus10')"
              >
                +10 pages
              </button>
              <button
                type="button"
                class="shelf__quick-button"
                :disabled="!activeBook.totalPages || activeBook.totalPages <= 0"
                @click="handleQuickProgress('chapter')"
              >
                Marquer un chapitre
              </button>
            </div>

            <div class="shelf__progress-inputs">
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
            </div>
          </div>

          <label class="shelf__status">
          <span>Statut</span>
          <div class="shelf__status-control">
            <select
              :value="activeBook.status"
              @change="handleStatusSelectChange"
            >
              <option v-for="option in props.statusOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
            <span v-if="statusFeedback" class="shelf__status-feedback">
              ✓ {{ statusFeedback }}
            </span>
          </div>
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
          <div class="shelf__recommend-row">
            <button
              type="button"
              class="shelf__recommend-button"
              @click="emit('recommend', { id: activeBook.id })"
            >
              Conseiller ce livre à un ami
            </button>
          </div>
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
  background-color: hsla(246, 100%, 85%, 0.12);
  border-radius: 1.5rem;
  padding: 1.75rem 1.75rem;
  border: 1px solid rgba(255, 255, 255, 0.22);
  box-shadow: 0 22px 45px rgba(15, 23, 42, 0.75);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: relative;
  color: #e5e7eb;
  backdrop-filter: blur(22px);
  -webkit-backdrop-filter: blur(22px);
  margin-bottom: 2rem;
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

.shelf__advanced-toggle {
  display: flex;
  justify-content: flex-start;
  margin-top: 0.25rem;
}

.shelf__advanced-button {
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.7);
  padding: 0.35rem 0.9rem;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  background: rgba(15, 23, 42, 0.9);
  color: #e5e7eb;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  transition: var(--transition-snap);
}

.shelf__advanced-button:hover {
  background: rgba(15, 23, 42, 0.7);
}

.shelf__advanced-badge {
  min-width: 1.35rem;
  height: 1.35rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: var(--color-rouge-corail);
  color: #f9fafb;
  font-size: 0.7rem;
}

.shelf__filters-advanced {
  margin-top: 0.5rem;
}

.shelf__filters-label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #9ca3af;
}

.shelf__search {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1 1 160px;
}

.shelf__search input {
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.7);
  padding: 0.45rem 0.75rem;
  font: inherit;
  width: 100%;
  box-sizing: border-box;
  background: rgba(15, 23, 42, 0.9);
  color: #e5e7eb;
}

.shelf__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.shelf__chip {
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

.shelf__chip--active {
  background: #f9fafb;
  color: #020617;
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
  content: none;
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
  color: #e5e7eb;
  font-size: 0.9rem;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0.2rem 0.4rem;
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.7);
  border-radius: 999px;
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
  color: #cbd5f5;
}

.shelf__progress-block {
  margin-top: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.shelf__progress-main {
  margin: 0;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 0.5rem;
}

.shelf__progress-pages {
  font-weight: 600;
}

.shelf__progress-percent {
  font-size: 0.9rem;
  color: #facc15;
}

.shelf__progress-quick {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.shelf__quick-button {
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.7);
  padding: 0.3rem 0.9rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  background: rgba(15, 23, 42, 0.9);
  color: #e5e7eb;
  cursor: pointer;
  transition: var(--transition-snap);
}

.shelf__quick-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.shelf__quick-button:not(:disabled):hover {
  background: rgba(15, 23, 42, 0.7);
}

.shelf__progress-inputs {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.shelf__modal .shelf__total,
.shelf__modal .shelf__status,
.shelf__modal .shelf__range,
.shelf__modal .shelf__percent {
  background: rgba(15, 23, 42, 0.9);
  border-radius: 0.9rem;
  padding: 0.6rem 0.75rem;
  color: var(--color-neutral-100);
}

.shelf__range input {
  accent-color: #facc15;
}

.shelf__status select {
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.7);
  background: rgba(15, 23, 42, 0.9);
  color: #e5e7eb;
  padding: 0.5rem 0.75rem;
}

.shelf__status-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.shelf__status-feedback {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  background: var(--accent-secondary);
  color: #020617;
  border-radius: 999px;
  border: 1px solid var(--color-black);
  padding: 0.1rem 0.45rem;
  font-weight: var(--font-medium);
  animation: celebration 0.4s ease-out;
}

.shelf__notes {
  border-radius: 0.9rem;
  border: 1px solid rgba(148, 163, 184, 0.7);
  background: rgba(15, 23, 42, 0.9);
  color: #e5e7eb;
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
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.7);
  background: rgba(15, 23, 42, 0.9);
  padding: 0.45rem 0.75rem;
  font-family: inherit;
  font-size: 0.9rem;
}

.shelf__total input:focus,
.shelf__percent input:focus,
.shelf__status select:focus,
.shelf__notes:focus {
  outline: none;
  border-color: #a855f7;
  box-shadow: 0 0 0 1px rgba(168, 85, 247, 0.4);
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
  background: radial-gradient(circle at top left, rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.95));
  backdrop-filter: blur(18px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  z-index: 30;
  animation: var(--animation-fade-in);
}

.shelf__modal,
.shelf__confirm {
  background-color: hsla(246, 100%, 85%, 0.16);
  color: #e5e7eb;
  border-radius: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.22);
  padding: 1.5rem 1.7rem 1.3rem;
  box-shadow: 0 26px 60px rgba(15, 23, 42, 0.9);
  max-width: 540px;
  width: min(540px, 100%);
  position: relative;
  max-height: min(80vh, 600px);
  overflow-y: auto;
}

.shelf__modal::after,
.shelf__confirm::after {
  content: none;
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
  border: none;
  border-radius: 999px;
  padding: 0.7rem 1.2rem;
  cursor: pointer;
  font-weight: 600;
  width: 100%;
  text-align: center;
  text-transform: none;
  font-size: 0.8rem;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.8);
  transition: var(--transition-snap);
}

.shelf__confirm-actions button:nth-child(1) {
  background: #f9fafb;
  color: #020617;
}

.shelf__confirm-actions button:nth-child(2) {
  background: #0ea5e9;
  color: #f9fafb;
}

.shelf__confirm-actions button:nth-child(3) {
  background: #dc2626;
  color: white;
}

.shelf__confirm-actions button:hover {
  background: #e5e7eb;
  color: #020617;
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
