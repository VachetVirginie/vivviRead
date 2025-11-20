<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import { useAppContext } from '../composables/useAppContext'
import type { ReadingStatus } from '../composables/useReadingShelf'

import AbandonedSection from '../components/sections/AbandonedSection.vue'

const { shelf } = useAppContext()
const router = useRouter()

const abandonedBooks = computed(() => shelf.abandonedBooks.value)

function handleAbandonedStatusChange(id: string, status: ReadingStatus) {
  shelf.setStatus(id, status)
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
          <h1 class="page-header__title">Livres abandonnés</h1>
          <p class="page-header__subtitle">
            Garde une trace des livres que tu as mis de côté.
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

    <AbandonedSection
      :books="abandonedBooks"
      @status-change="handleAbandonedStatusChange"
      @remove="shelf.removeBook"
    />
  </main>
</template>
