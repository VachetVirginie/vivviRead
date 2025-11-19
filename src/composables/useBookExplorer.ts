import { computed, reactive } from 'vue'
import { searchBooks, type GoogleBookVolume } from '../services/googleBooks'

type ExplorerLengthFilter = 'all' | 'short' | 'medium' | 'long'
type ExplorerPeriodFilter = 'all' | 'recent' | 'modern' | 'older'
type ExplorerSortMode = 'relevance' | 'pages-asc' | 'pages-desc' | 'date-desc' | 'rating-desc'

interface ExplorerPreset {
  label: string
  value: string
  sortMode?: ExplorerSortMode
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
  lengthFilter: ExplorerLengthFilter
  periodFilter: ExplorerPeriodFilter
  hideInShelf: boolean
  sortMode: ExplorerSortMode
}

interface UseBookExplorerOptions {
  isInShelf?: (title: string, author: string) => boolean
}

const presets: ExplorerPreset[] = [
  {
    label: 'Romans tendance (FR)',
    value: 'subject:fiction lang=fr orderBy=newest',
    sortMode: 'date-desc',
  },
  {
    label: 'Sorties marquantes (FR)',
    value: 'subject:fiction lang=fr orderBy=newest',
    sortMode: 'date-desc',
  },
  {
    label: 'Fantasy francophone',
    value: 'subject:fantasy lang=fr orderBy=relevance',
    sortMode: 'rating-desc',
  },
]

export function useBookExplorer(options: UseBookExplorerOptions = {}) {
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
    lengthFilter: 'all',
    periodFilter: 'all',
    hideInShelf: false,
    sortMode: 'relevance',
  })

  function normalizeAuthors(book: GoogleBookVolume) {
    return book.volumeInfo.authors?.join(', ') ?? 'Auteur·ice inconnu·e'
  }

  function isBookInShelf(book: GoogleBookVolume) {
    if (!options.isInShelf) return false
    return options.isInShelf(book.volumeInfo.title, normalizeAuthors(book))
  }

  function matchesLengthFilter(book: GoogleBookVolume) {
    const pages = book.volumeInfo.pageCount ?? 0
    if (state.lengthFilter === 'short') return pages > 0 && pages < 200
    if (state.lengthFilter === 'medium') return pages >= 200 && pages <= 400
    if (state.lengthFilter === 'long') return pages > 400
    return true
  }

  function extractYear(date?: string) {
    if (!date) return undefined
    const year = parseInt(date.slice(0, 4), 10)
    return Number.isNaN(year) ? undefined : year
  }

  function matchesPeriodFilter(book: GoogleBookVolume) {
    const year = extractYear(book.volumeInfo.publishedDate)
    if (state.periodFilter === 'recent') return year !== undefined && year >= 2015
    if (state.periodFilter === 'modern') return year !== undefined && year >= 1980 && year <= 2014
    if (state.periodFilter === 'older') return year !== undefined && year < 1980
    return true
  }

  const filteredResults = computed(() =>
    state.fetchedResults.filter((book) => {
      if (!matchesLengthFilter(book)) return false
      if (!matchesPeriodFilter(book)) return false
      if (state.hideInShelf && isBookInShelf(book)) return false
      return true
    }),
  )

  const sortedResults = computed(() => {
    const base = [...filteredResults.value]

    switch (state.sortMode) {
      case 'pages-asc':
        base.sort(
          (a, b) =>
            (a.volumeInfo.pageCount ?? Number.POSITIVE_INFINITY) -
            (b.volumeInfo.pageCount ?? Number.POSITIVE_INFINITY),
        )
        break
      case 'pages-desc':
        base.sort((a, b) => (b.volumeInfo.pageCount ?? 0) - (a.volumeInfo.pageCount ?? 0))
        break
      case 'date-desc':
        base.sort((a, b) => {
          const ay = extractYear(a.volumeInfo.publishedDate) ?? 0
          const by = extractYear(b.volumeInfo.publishedDate) ?? 0
          return by - ay
        })
        break
      case 'rating-desc':
        base.sort((a, b) => (b.volumeInfo.averageRating ?? 0) - (a.volumeInfo.averageRating ?? 0))
        break
      case 'relevance':
      default:
        break
    }

    return base
  })

  const totalFiltered = computed(() => sortedResults.value.length)
  const totalPages = computed(() => Math.max(1, Math.ceil(totalFiltered.value / state.pageSize)))
  const hasAnyRawResults = computed(() => state.fetchedResults.length > 0)
  const hasAnyFilteredResults = computed(() => totalFiltered.value > 0)
  const filtersRemoveAll = computed(() => hasAnyRawResults.value && !hasAnyFilteredResults.value)

  const paginatedResults = computed(() => {
    const start = state.currentPage * state.pageSize
    return sortedResults.value.slice(start, start + state.pageSize)
  })

  const canGoPrevious = computed(() => state.currentPage > 0)

  const canGoNext = computed(() => state.currentPage + 1 < totalPages.value)

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
    const languageMatch = searchQuery.match(/lang=([a-z]{2})/i)
    if (languageMatch && languageMatch[1]) {
      langRestrict = languageMatch[1].toLowerCase()
      searchQuery = searchQuery.replace(languageMatch[0], '').trim()
    }

    const orderByMatch = searchQuery.match(/orderBy=(newest|relevance)/i)
    if (orderByMatch && orderByMatch[1]) {
      orderBy = orderByMatch[1].toLowerCase() as 'relevance' | 'newest'
      searchQuery = searchQuery.replace(orderByMatch[0], '').trim()
    }

    if (!langRestrict) {
      langRestrict = 'fr'
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
    const preset = presets.find((p) => p.value === value)
    if (preset?.sortMode) {
      state.sortMode = preset.sortMode
    }
    state.currentPage = 0
    fetchBooks()
  }

  function goToPreviousPage() {
    if (canGoPrevious.value) {
      state.currentPage -= 1
    }
  }

  function goToNextPage() {
    if (canGoNext.value) {
      state.currentPage += 1
    }
  }

  function setLengthFilter(value: ExplorerLengthFilter) {
    state.lengthFilter = value
    state.currentPage = 0
  }

  function setPeriodFilter(value: ExplorerPeriodFilter) {
    state.periodFilter = value
    state.currentPage = 0
  }

  function setHideInShelf(value: boolean) {
    state.hideInShelf = value
    state.currentPage = 0
  }

  function setSortMode(value: ExplorerSortMode) {
    state.sortMode = value
    state.currentPage = 0
  }

  const paginationLabel = computed(() => {
    if (!state.hasSearched) {
      return ''
    }

    const baseTotal = Math.min(
      state.maxFetchedItems,
      state.totalItems || state.fetchedResults.length,
    )

    if (!totalFiltered.value) {
      if (!baseTotal) {
        return 'Aucun résultat'
      }
      const basePages = Math.max(1, Math.ceil(baseTotal / state.pageSize))
      return `Page ${state.currentPage + 1} sur ${basePages} · ${baseTotal} résultats`
    }

    const suffix =
      baseTotal && baseTotal !== totalFiltered.value
        ? ` (sur ${baseTotal} résultats bruts)`
        : ''

    return `Page ${state.currentPage + 1} sur ${totalPages.value} · ${totalFiltered.value} résultats${suffix}`
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
    filtersRemoveAll: state.hasSearched && filtersRemoveAll.value,
    totalFiltered: totalFiltered.value,
    totalUnfiltered: state.fetchedResults.length,
  }))

  fetchBooks()

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
    setLengthFilter,
    setPeriodFilter,
    setHideInShelf,
    setSortMode,
  }
}
