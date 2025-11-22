<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { useAppContext } from '../composables/useAppContext'
import type { ReadingStatus } from '../composables/useReadingShelf'
import { useBookRecommendations } from '../composables/useBookRecommendations'
import { useFriendsRelations } from '../composables/useFriendsRelations'
import { useProfilesDirectory } from '../composables/useProfilesDirectory'
import { useToasts } from '../composables/useToasts'

import ShelfSection from '../components/sections/ShelfSection.vue'
import LibrarySubnav from '../components/sections/LibrarySubnav.vue'
import ModalRecommendBook from '../components/sections/modals/ModalRecommendBook.vue'

const { shelf } = useAppContext()
const router = useRouter()

const { sendRecommendation } = useBookRecommendations()
const { followingIds } = useFriendsRelations()
const { profiles } = useProfilesDirectory()
const { showToast } = useToasts()

const inProgressBooks = computed(() => shelf.inProgressBooks.value)
const removalPromptId = shelf.removalPromptId
const shelfBooks = shelf.books

const recommendBookId = ref<string | null>(null)

const recommendBook = computed(() => shelfBooks.value.find((b) => b.id === recommendBookId.value) ?? null)

const friendOptions = computed(() => {
	const followSet = new Set(followingIds.value)
	const filtered = profiles.value.filter((profile) => followSet.has(profile.id))
	return filtered.map((profile) => ({
	  id: profile.id,
	  label: profile.username || profile.full_name || 'Lecteur·ice',
	}))
})

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

function handleRecommend(payload: { id: string }) {
  recommendBookId.value = payload.id
}

function closeRecommendModal() {
  recommendBookId.value = null
}

async function handleRecommendSubmit(payload: { toUserId: string; userBookId: string; message?: string }) {
  await sendRecommendation(payload)
  showToast({
    message: 'Recommandation envoyée à ton ami',
    variant: 'success',
  })
  recommendBookId.value = null
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
    
    <LibrarySubnav />

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
      @recommend="handleRecommend"
    />

    <Teleport to="body">
      <ModalRecommendBook
        v-if="recommendBook"
        :book-title="recommendBook.title"
        :book-author="recommendBook.author"
        :user-book-id="recommendBook.id"
        :friends="friendOptions"
        @close="closeRecommendModal"
        @submit="handleRecommendSubmit"
      />
    </Teleport>
  </main>
</template>
