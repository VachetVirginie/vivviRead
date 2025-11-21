<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import { useAppContext } from '../composables/useAppContext'
import LibrarySectionCard from '../components/sections/LibrarySectionCard.vue'

const { shelf } = useAppContext()
const router = useRouter()

const toReadBooks = computed(() => shelf.toReadBooks.value)
const inProgressBooks = computed(() => shelf.inProgressBooks.value)
const completedBooks = computed(() => shelf.completedBooks.value)
const abandonedBooks = computed(() => shelf.abandonedBooks.value)

function goToExplorer() {
  router.push({ name: 'explorer' })
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
            @click="goToExplorer"
          >
            Ajouter un livre
          </button>
        </div>
      </div>
    </header>

    <section class="library-sections">
      <LibrarySectionCard
        title="Pile à lire"
        subtitle="Prépare tes prochaines découvertes en un coup d'œil."
        :count="toReadBooks.length"
        :books="toReadBooks"
        route-name="libraryPal"
        variant="to-read"
      />

      <LibrarySectionCard
        title="Lectures en cours"
        subtitle="Visualise rapidement tes lectures actives."
        :count="inProgressBooks.length"
        :books="inProgressBooks"
        route-name="libraryInProgress"
        variant="in-progress"
      />

      <LibrarySectionCard
        title="Livres lus"
        subtitle="Replonge dans les livres que tu as terminés."
        :count="completedBooks.length"
        :books="completedBooks"
        route-name="libraryCompleted"
        variant="completed"
      />

      <LibrarySectionCard
        title="Livres abandonnés"
        subtitle="Garde une trace des lectures mises en pause."
        :count="abandonedBooks.length"
        :books="abandonedBooks"
        route-name="libraryAbandoned"
        variant="abandoned"
      />
    </section>
  </main>
</template>

<style scoped>
.library-sections {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--space-4);
  margin-bottom: 2rem;
}

@media (min-width: 768px) {
  .library-sections {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    margin-bottom: 2rem;
  }
}
</style>
