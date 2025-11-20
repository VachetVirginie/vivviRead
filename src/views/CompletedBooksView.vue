<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import { useAppContext } from '../composables/useAppContext'
import type { ReadingStatus } from '../composables/useReadingShelf'

import CompletedSection from '../components/sections/CompletedSection.vue'

const { shelf } = useAppContext()
const router = useRouter()

const completedBooks = computed(() => shelf.completedBooks.value)

function handleCompletedStatusChange(payload: { id: string; status: ReadingStatus }) {
  shelf.setStatus(payload.id, payload.status)
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

    <CompletedSection
      :books="completedBooks"
      @status-change="handleCompletedStatusChange"
      @remove="shelf.removeBook"
    />
  </main>
</template>
