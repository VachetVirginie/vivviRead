<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import { useAppContext } from '../composables/useAppContext'
import type { ReadingStatus } from '../composables/useReadingShelf'
import { useBookRecommendations } from '../composables/useBookRecommendations'
import { useFriendsRelations } from '../composables/useFriendsRelations'
import { useProfilesDirectory } from '../composables/useProfilesDirectory'
import { useToasts } from '../composables/useToasts'

import CompletedSection from '../components/sections/CompletedSection.vue'
import LibrarySubnav from '../components/sections/LibrarySubnav.vue'
import ModalRecommendBook from '../components/sections/modals/ModalRecommendBook.vue'

const { shelf } = useAppContext()
const router = useRouter()

const { sendRecommendation } = useBookRecommendations()
const { followingIds } = useFriendsRelations()
const { profiles } = useProfilesDirectory()
const { showToast } = useToasts()

const completedBooks = computed(() => shelf.completedBooks.value)

const recommendBookId = ref<string | null>(null)

const recommendBook = computed(
	() => completedBooks.value.find((b) => b.id === recommendBookId.value) ?? null,
)

const friendOptions = computed(() => {
	const followSet = new Set(followingIds.value)
	const filtered = profiles.value.filter((profile) => followSet.has(profile.id))
	return filtered.map((profile) => ({
	  id: profile.id,
	  label: profile.username || profile.full_name || 'Lecteur·ice',
	}))
})

function handleCompletedStatusChange(payload: { id: string; status: ReadingStatus }) {
  shelf.setStatus(payload.id, payload.status)
}

function handleRecommend(id: string) {
	recommendBookId.value = id
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

function goToExplorer() {
  router.push({ name: 'explorer' })
}
</script>

<template>
  <main class="page">
    <header class="page-header">
      <div class="page-header__row">
        <div class="page-header__main">
          <h1 class="page-header__title">Livres lus</h1>
          <p class="page-header__subtitle">
            Parcours tous les livres que tu as terminés et tes notes associées.
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

    <CompletedSection
      :books="completedBooks"
      @status-change="handleCompletedStatusChange"
      @remove="shelf.removeBook"
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
