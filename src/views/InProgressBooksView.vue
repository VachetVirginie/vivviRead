<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import { useAppContext } from '../composables/useAppContext'
import type { ReadingStatus } from '../composables/useReadingShelf'

import ShelfSection from '../components/sections/ShelfSection.vue'

const { shelf } = useAppContext()
const router = useRouter()

const inProgressBooks = computed(() => shelf.inProgressBooks.value)
const removalPromptId = shelf.removalPromptId
const shelfBooks = shelf.books

const statusOptions: { value: ReadingStatus; label: string }[] = [
  { value: 'a_lire', label: 'À lire' },
  { value: 'en_cours', label: 'En cours' },
  { value: 'lu', label: 'Terminé' },
  { value: 'abandonne', label: 'Abandonné' },
]

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

function goToExplorer() {
  router.push({ name: 'explorer' })
}

onMounted(() => {
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
})
</script>

<template>
  <main class="page">
    <header class="page-header">
      <div class="page-header__row">
        <div class="page-header__main">
          <h1 class="page-header__title">Lectures en cours</h1>
          <p class="page-header__subtitle">
            Gère en détail l'ensemble de tes lectures en cours.
          </p>
        </div>
        <div class="page-header__actions">
          <button
            type="button"
            class="page-header__action page-header__action--primary"
            @click="goToExplorer"
          >
            Ajouter un livre
          </button>
        </div>
      </div>
    </header>

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
  </main>
</template>
