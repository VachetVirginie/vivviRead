import { computed, reactive } from 'vue'
import { searchBooks, type GoogleBookVolume } from '../services/googleBooks'

interface ExplorerPreset {
  label: string
  value: string
}

interface PaginatedState {
  query: string
  loading: boolean
  errorMessage: string | null
  hasSearched: boolean
  pageSize: number
  currentPage: number
  totalItems: number
  fetchedResults: GoogleBookVolume[]
  maxFetchedItems: number
}

const presets: ExplorerPreset[] = [
  { label: 'Best-sellers France', value: 'subject:fiction france best sellers' },
  { label: 'Sorties marquantes', value: 'subject:fiction france orderBy=newest' },
  { label: 'Fantasy francophone', value: 'subject:fantasy language:fr' },
]

export function useBookExplorer() {
  const state = reactive<PaginatedState>({
    query: 'lecture immersive',
    loading: false,
    errorMessage: null,
    hasSearched: false,
    pageSize: 5,
    currentPage: 0,
    totalItems: 0,
    fetchedResults: [],
    maxFetchedItems: 50,
  })

  async function fetchBooks(customQuery?: string) {
    const rawQuery = (customQuery ?? state.query).trim()

    if (!rawQuery) {
      state.fetchedResults = []
      state.hasSearched = false
      state.errorMessage = null
      return
    }

    let searchQuery = rawQuery
    let langRestrict: string | undefined
    let orderBy: 'relevance' | 'newest' | undefined

    // Support d'indices inline dans la requête, ex: "subject:fantasy language:fr orderBy=newest"
    const languageMatch = searchQuery.match(/language:([a-z]{2})/i)
    if (languageMatch && languageMatch[1]) {
      langRestrict = languageMatch[1].toLowerCase()
      searchQuery = searchQuery.replace(languageMatch[0], '').trim()
    }

    const orderByMatch = searchQuery.match(/orderBy=(newest|relevance)/i)
    if (orderByMatch && orderByMatch[1]) {
      orderBy = orderByMatch[1].toLowerCase() as 'relevance' | 'newest'
      searchQuery = searchQuery.replace(orderByMatch[0], '').trim()
    }

    state.loading = true
    state.errorMessage = null
    state.hasSearched = true

    try {
      const fetched: GoogleBookVolume[] = []
      let remaining = state.maxFetchedItems
      let startIndex = 0

      while (remaining > 0) {
        const batchSize = Math.min(40, remaining)
        const response = await searchBooks({
          query: searchQuery,
          maxResults: batchSize,
          startIndex,
          langRestrict,
          orderBy,
        })

        state.totalItems = response.totalItems

        if (response.items?.length) {
          fetched.push(...response.items)
        }

        if (!response.items || response.items.length < batchSize) {
          break
        }

        remaining -= response.items.length
        startIndex += response.items.length

        if (startIndex >= response.totalItems) {
          break
        }
      }

      state.fetchedResults = fetched.slice(0, state.maxFetchedItems)
      state.currentPage = 0
    } catch (error) {
      state.errorMessage = error instanceof Error ? error.message : String(error)
    } finally {
      state.loading = false
    }
  }

  function submitSearch() {
    state.currentPage = 0
    fetchBooks()
  }

  function triggerPresetSearch(value: string) {
    state.query = value
    state.currentPage = 0
    fetchBooks()
  }

  function goToPreviousPage() {
    if (state.currentPage > 0) {
      state.currentPage -= 1
    }
  }

  function goToNextPage() {
    if (canGoNext.value) {
      state.currentPage += 1
    }
  }

  const canGoPrevious = computed(() => state.currentPage > 0)

  const canGoNext = computed(
    () => (state.currentPage + 1) * state.pageSize < Math.min(state.maxFetchedItems, state.fetchedResults.length || state.totalItems)
  )

  const paginatedResults = computed(() => {
    const start = state.currentPage * state.pageSize
    return state.fetchedResults.slice(start, start + state.pageSize)
  })

  const paginationLabel = computed(() => {
    const totalVisible = Math.min(state.maxFetchedItems, state.totalItems || state.fetchedResults.length)
    const totalPages = Math.max(1, Math.ceil(totalVisible / state.pageSize))
    return `Page ${state.currentPage + 1} sur ${totalPages} · ${totalVisible} résultats`
  })

  const publicState = computed(() => ({
    query: state.query,
    loading: state.loading,
    errorMessage: state.errorMessage,
    hasSearched: state.hasSearched,
    results: paginatedResults.value,
    canGoPrevious: canGoPrevious.value,
    canGoNext: canGoNext.value,
    currentPage: state.currentPage,
    paginationLabel: paginationLabel.value,
    presets,
    isResultInShelf: (_book: GoogleBookVolume) => false,
    onSubmit: submitSearch,
  }))

  return {
    state,
    publicState,
    presets,
    paginatedResults,
    paginationLabel,
    canGoPrevious,
    canGoNext,
    submitSearch,
    triggerPresetSearch,
    goToPreviousPage,
    goToNextPage,
    fetchBooks,
  }
}
