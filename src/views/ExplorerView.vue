<script setup lang="ts">
import { computed } from 'vue'

import { useAppContext } from '../composables/useAppContext'
import type { GoogleBookVolume } from '../services/googleBooks'

import ExplorerSection from '../components/sections/ExplorerSection.vue'
import ModalAddBook from '../components/sections/modals/ModalAddBook.vue'

const { shelf, explorer, modals } = useAppContext()

const explorerState = explorer.publicState
const explorerRawState = explorer.state
const explorerLoading = computed(() => explorerRawState.loading)

const isBookModalOpen = computed(() => modals.active.value === 'book')

function isResultInShelf(book: GoogleBookVolume) {
  const authors = book.volumeInfo.authors?.join(', ') ?? 'Auteur·ice inconnu·e'
  return shelf.isInShelf(book.volumeInfo.title, authors)
}

function handleExplorerQuery(value: string) {
  explorerRawState.query = value
}
</script>

<template>
  <main class="page">
    <header class="page-header">
      <div class="page-header__row">
        <div class="page-header__main">
          <h1 class="page-header__title">Explorer des livres</h1>
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

    <ExplorerSection
      :query="explorerRawState.query"
      :loading="explorerLoading"
      :error-message="explorerRawState.errorMessage"
      :has-searched="explorerRawState.hasSearched"
      :results="explorerState.results"
      :can-go-previous="explorerState.canGoPrevious"
      :can-go-next="explorerState.canGoNext"
      :current-page="explorerState.currentPage"
      :pagination-label="explorerState.paginationLabel"
      :presets="explorer.presets"
      :length-filter="explorerRawState.lengthFilter"
      :period-filter="explorerRawState.periodFilter"
      :hide-in-shelf="explorerRawState.hideInShelf"
      :sort-mode="explorerRawState.sortMode"
      :filters-remove-all="explorerState.filtersRemoveAll"
      :total-filtered="explorerState.totalFiltered"
      :total-unfiltered="explorerState.totalUnfiltered"
      :mood-filter="explorerRawState.moodFilter"
      :has-active-filters="explorerState.hasActiveFilters"
      :active-filters-count="explorerState.activeFiltersCount"
      :is-result-in-shelf="isResultInShelf"
      :on-submit="explorer.submitSearch"
      :set-query="handleExplorerQuery"
      :trigger-preset-search="explorer.triggerPresetSearch"
      :go-to-previous-page="explorer.goToPreviousPage"
      :go-to-next-page="explorer.goToNextPage"
      :set-length-filter="explorer.setLengthFilter"
      :set-period-filter="explorer.setPeriodFilter"
      :set-hide-in-shelf="explorer.setHideInShelf"
      :set-sort-mode="explorer.setSortMode"
      :set-mood-filter="explorer.setMoodFilter"
      :reset-filters="explorer.resetFilters"
      @add="shelf.addFromSearch"
    />

    <ModalAddBook
      v-if="isBookModalOpen"
      @close="modals.close"
      @add="shelf.addBook"
    />
  </main>
</template>
