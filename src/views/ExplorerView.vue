<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import { useAppContext } from '../composables/useAppContext'
import { useToasts } from '../composables/useToasts'
import type { GoogleBookVolume } from '../services/googleBooks'

import ExplorerSection from '../components/sections/ExplorerSection.vue'

const { shelf, explorer } = useAppContext()
const router = useRouter()
const { showToast } = useToasts()

const explorerState = explorer.publicState
const explorerRawState = explorer.state
const explorerLoading = computed(() => explorerRawState.loading)

interface ExplorerPresetConfig {
  label: string
  value: string
}

const recommendedPresets = computed<ExplorerPresetConfig[]>(() => {
  const books = shelf.books.value
  const interesting = books.filter((book) => book.status === 'lu' || book.status === 'en_cours')
  if (!interesting.length) return []

  const genreBuckets = [
    {
      key: 'sfff',
      label: 'SFFF',
      keywords: ['science-fiction', 'science fiction', 'sf', 'fantasy', 'space opera', 'magicien', 'dragon'],
      query: 'subject:fantasy lang=fr orderBy=newest',
    },
    {
      key: 'polar',
      label: 'Polars & thrillers',
      keywords: ['polar', 'thriller', 'enquête', 'crime', 'noir'],
      query: 'subject:crime lang=fr orderBy=newest',
    },
    {
      key: 'romance',
      label: 'Romance',
      keywords: ['romance', 'amour', 'love'],
      query: 'subject:romance lang=fr orderBy=newest',
    },
    {
      key: 'essai',
      label: 'Essais & non-fiction',
      keywords: ['essai', 'biographie', 'témoignage', 'développement personnel', 'histoire'],
      query: 'subject:essai lang=fr orderBy=newest',
    },
  ] as const

  const counts: Record<string, number> = {}
  for (const bucket of genreBuckets) {
    counts[bucket.key] = 0
  }

  interesting.forEach((book) => {
    const text = `${book.title ?? ''} ${book.description ?? ''}`.toLowerCase()
    const bucket = genreBuckets.find((b) => b.keywords.some((kw) => text.includes(kw)))
    if (!bucket) {
      return
    }
    const key = bucket.key
    counts[key] = (counts[key] ?? 0) + 1
  })

  const activeBuckets = genreBuckets
    .map((bucket) => ({ bucket, count: counts[bucket.key] ?? 0 }))
    .filter((entry) => entry.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 2)

  if (!activeBuckets.length) return []

  return activeBuckets.map((entry) => ({
    label: `Recommandé · ${entry.bucket.label}`,
    value: entry.bucket.query,
  }))
})

function isResultInShelf(book: GoogleBookVolume) {
  const authors = book.volumeInfo.authors?.join(', ') ?? 'Auteur·ice inconnu·e'
  return shelf.isInShelf(book.volumeInfo.title, authors)
}

function handleExplorerQuery(value: string) {
  explorerRawState.query = value
}

interface ExplorerAddPayload {
  title: string
  author: string
  totalPages?: number
  coverUrl?: string
  averageRating?: number
  description?: string
}

function handleAddFromExplorer(payload: ExplorerAddPayload) {
  shelf.addFromSearch(payload)

  showToast({
    message: 'Ajouté à ta bibliothèque',
    actionLabel: 'Voir',
    onAction: () => {
      router.push({ name: 'libraryPal' })
    },
    variant: 'success',
  })
}
</script>

<template>
  <main class="page">
    <header class="page-header">
      <div class="page-header__row">
        <div class="page-header__main">
          <h1 class="page-header__title">Explorer des livres</h1>
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
      :recommended-presets="recommendedPresets"
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
      @add="handleAddFromExplorer"
    />
  </main>
</template>
