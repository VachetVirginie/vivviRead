<script setup lang="ts">
import { computed } from 'vue'

import { useAppContext } from '../composables/useAppContext'
import type { ReadingStatus } from '../composables/useReadingShelf'

import ToReadSection from '../components/sections/ToReadSection.vue'
import ShelfSection from '../components/sections/ShelfSection.vue'
import CompletedSection from '../components/sections/CompletedSection.vue'
import AbandonedSection from '../components/sections/AbandonedSection.vue'
import ModalAddBook from '../components/sections/modals/ModalAddBook.vue'

const { shelf, modals } = useAppContext()

const toReadBooks = computed(() => shelf.toReadBooks.value)
const inProgressBooks = computed(() => shelf.inProgressBooks.value)
const completedBooks = computed(() => shelf.completedBooks.value)
const abandonedBooks = computed(() => shelf.abandonedBooks.value)
const removalPromptId = shelf.removalPromptId
const shelfBooks = shelf.books
const isBookModalOpen = computed(() => modals.active.value === 'book')

const statusOptions: { value: ReadingStatus; label: string }[] = [
  { value: 'a_lire', label: 'À lire' },
  { value: 'en_cours', label: 'En cours' },
  { value: 'lu', label: 'Terminé' },
  { value: 'abandonne', label: 'Abandonné' },
]

function handleToReadStart(id: string) {
  shelf.startReading(id)
}

function handleShelfProgress(payload: { id: string; value: number }) {
  shelf.updateProgress(payload.id, payload.value)
}

function handleShelfPercent(payload: { id: string; value: number }) {
  const book = shelfBooks.value.find((b) => b.id === payload.id)
  if (!book || !book.totalPages) {
    return
  }
  const normalized = Math.max(0, Math.min(100, payload.value))
  const page = Math.round((normalized / 100) * book.totalPages)
  shelf.updateProgress(payload.id, page)
}

function handleShelfStatus(payload: { id: string; status: ReadingStatus }) {
  shelf.setStatus(payload.id, payload.status)
}

function handleShelfNotes(payload: { id: string; value: string }) {
  shelf.updateNotes(payload.id, payload.value)
}

function handleShelfTotalPages(payload: { id: string; value: number }) {
  shelf.updateTotalPages(payload.id, payload.value)
}

function handleRemovalChoice(payload: { id: string; choice: 'to_read' | 'abandon' | 'delete' | 'cancel' }) {
  if (payload.choice === 'cancel') {
    shelf.closeRemovalPrompt()
    return
  }
  shelf.confirmRemoval(payload.choice, payload.id)
}

function handleCompletedStatusChange(payload: { id: string; status: ReadingStatus }) {
  shelf.setStatus(payload.id, payload.status)
}

function handleAbandonedStatusChange(id: string, status: ReadingStatus) {
  shelf.setStatus(id, status)
}
</script>

<template>
  <main class="page">
    <header class="page-header">
      <div class="page-header__row">
        <div class="page-header__main">
          <h1 class="page-header__title">Ma bibliothèque</h1>
          <p class="page-header__subtitle">
            Gère ta pile à lire, tes lectures en cours, les livres terminés et ceux que tu as mis de côté.
          </p>
        </div>
        <div class="page-header__actions">
          <button
            type="button"
            class="page-header__action page-header__action--primary"
            @click="modals.open('book')"
          >
            Ajouter un livre
          </button>
        </div>
      </div>
    </header>

    <ToReadSection
      :books="toReadBooks"
      @status-change="handleToReadStart"
      @remove="shelf.removeBook"
    />

    <ShelfSection
      :books="inProgressBooks"
      :status-options="statusOptions"
      :removal-prompt-id="removalPromptId"
      @change-progress="handleShelfProgress"
      @change-percent="handleShelfPercent"
      @change-status="handleShelfStatus"
      @change-notes="handleShelfNotes"
      @change-total-pages="handleShelfTotalPages"
      @request-removal="shelf.requestRemoval"
      @removal-choice="handleRemovalChoice"
    />

    <CompletedSection
      :books="completedBooks"
      @status-change="handleCompletedStatusChange"
      @remove="shelf.removeBook"
    />

    <AbandonedSection
      :books="abandonedBooks"
      @status-change="handleAbandonedStatusChange"
      @remove="shelf.removeBook"
    />

    <ModalAddBook
      v-if="isBookModalOpen"
      @close="modals.close"
      @add="shelf.addBook"
    />
  </main>
</template>
