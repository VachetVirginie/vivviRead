<script setup lang="ts">
import { computed, ref } from 'vue'
import Carousel from '../ui/Carousel.vue'
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
}>()

function progressPercent(book: ReadingBook) {
  if (!book.totalPages || book.totalPages <= 0) {
    return 0
  }
  return Math.round((book.currentPage / book.totalPages) * 100)
}

const removalBook = computed(() => props.books.find((b) => b.id === props.removalPromptId) ?? null)

const activeBookId = ref<string | null>(null)

const activeBook = computed(() => props.books.find((b) => b.id === activeBookId.value) ?? null)

function openBookModal(id: string) {
  activeBookId.value = id
}

function closeBookModal() {
  activeBookId.value = null
}
</script>

<template>
  <section id="shelf" class="shelf" aria-label="Lectures en cours">
    <header>
      <p class="section-eyebrow">Lectures en cours</p>
      <h2>Garde un œil précis sur tes pages et capture tes impressions.</h2>
    </header>
    <p class="state">Utilise les actions rapides pour ajouter un livre ou renseigner ses détails.</p>

    <Carousel
      v-if="books.length"
      class="shelf__carousel"
      :items-count="books.length"
      aria-label="Lectures en cours"
      :ariaLabel="'Lectures en cours'"
      :items-per-page="4"
    >
      <article
        v-for="book in books"
        :key="book.id"
        class="shelf__card carousel__slide"
        role="group"
        :aria-label="`${book.title} de ${book.author}`"
        @click="openBookModal(book.id)"
      >
        <div v-if="book.coverUrl" class="shelf__cover-wrapper">
          <img class="shelf__cover" :src="book.coverUrl" :alt="`Couverture de ${book.title}`" />
        </div>
        <div class="shelf__header">
          <div class="shelf__title-block">
            <p class="shelf__label">{{ book.author }}</p>
            <h3>{{ book.title }}</h3>
          </div>
          <div class="shelf__meta">
            <p class="shelf__pages">{{ book.currentPage }} / {{ book.totalPages > 0 ? book.totalPages : '–' }}</p>
            <p class="shelf__progress" v-if="book.totalPages > 0">
              {{ progressPercent(book) }} %
            </p>
          </div>
        </div>
      </article>
    </Carousel>

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
  </section>
</template>

<style scoped>
.shelf {
  background: #ffffff;
  border-radius: 1.5rem;
  padding: 1.75rem 1.5rem;
  border: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.shelf__card {
  background: #ffffff;
  border-radius: 1.25rem;
  padding: 1.25rem;
  border: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
  width: 100%;
  box-sizing: border-box;
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
  color: #6b7280;
  font-size: 0.9rem;
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
  background: rgba(15, 23, 42, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 30;
}

.shelf__modal {
  background: #ffffff;
  border-radius: 1rem;
  padding: 1.1rem 1.25rem 1rem;
  border: 1px solid #e5e7eb;
  box-shadow: 0 22px 45px rgba(15, 23, 42, 0.4);
  max-width: 360px;
  width: calc(100% - 2rem);
  position: relative;
  max-height: 80vh;
  overflow-y: auto;
}

.shelf__confirm {
  background: #ffffff;
  border-radius: 1rem;
  padding: 1.1rem 1.25rem 1rem;
  border: 1px solid #e5e7eb;
  box-shadow: 0 22px 45px rgba(15, 23, 42, 0.4);
  max-width: 360px;
  width: calc(100% - 2rem);
  position: relative;
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
  border-radius: 0.8rem;
  padding: 0.5rem 0.9rem;
  cursor: pointer;
  font-weight: 600;
  width: 100%;
  text-align: center;
}

.shelf__confirm-actions button:nth-child(1) {
  background: #ecfdf3;
  color: #166534;
  border: 1px solid #22c55e;
}

.shelf__confirm-actions button:nth-child(2) {
  background: #fff7ed;
  color: #9a3412;
  border: 1px solid #f97316;
}

.shelf__confirm-actions button:nth-child(3) {
  background: var(--color-rouge-corail);
  color: white;
  border: 1px solid #FF5555;
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
</style>
