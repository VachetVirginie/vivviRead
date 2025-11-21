<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import { useAppContext } from '../composables/useAppContext'
import ToReadSection from '../components/sections/ToReadSection.vue'
import LibrarySubnav from '../components/sections/LibrarySubnav.vue'

const { shelf } = useAppContext()
const router = useRouter()

const toReadBooks = computed(() => shelf.toReadBooks.value)

function handleToReadStart(id: string) {
  shelf.startReading(id)
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
          <h1 class="page-header__title">Pile à lire</h1>
          <p class="page-header__subtitle">
            Retrouve l'ensemble de ta pile à lire sous forme de galerie.
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

    <ToReadSection
      :books="toReadBooks"
      @status-change="handleToReadStart"
      @remove="shelf.removeBook"
    />
  </main>
</template>
