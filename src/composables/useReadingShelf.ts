import { computed, ref, watch } from 'vue'
import { syncShelf } from '../services/shelfSync'
import type { StatCard } from '../types/dashboard'

export type ReadingStatus = 'a_lire' | 'en_cours' | 'lu' | 'abandonne'

export interface ReadingBook {
  id: string
  title: string
  author: string
  totalPages: number
  currentPage: number
  status: ReadingStatus
  notes?: string
  description?: string
  updatedAt: string
  coverUrl?: string
  averageRating?: number
}

const STORAGE_KEY = 'viviread-reading-shelf'

function loadInitialBooks(): ReadingBook[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as ReadingBook[]
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((book) => ({
          ...book,
          updatedAt: book.updatedAt ?? new Date().toISOString(),
        }))
      }
    }
  } catch (error) {
    console.warn('Impossible de charger les lectures en cours :', error)
  }

  return [
    {
      id: 'demo-1',
      title: 'Demain et tous les autres jours',
      author: 'Sophie Astrabie',
      totalPages: 320,
      currentPage: 128,
      status: 'en_cours',
      notes: 'Lecture du soir · focus ambiance automne',
      updatedAt: new Date().toISOString(),
      coverUrl: undefined,
    },
    {
      id: 'demo-2',
      title: 'Le chant des cavalières',
      author: 'Jeanne Mariem Corrèze',
      totalPages: 410,
      currentPage: 76,
      status: 'en_cours',
      updatedAt: new Date().toISOString(),
      coverUrl: undefined,
    },
    {
      id: 'demo-3',
      title: 'La somme de nos folies',
      author: 'Shih-Li Kow',
      totalPages: 280,
      currentPage: 0,
      status: 'a_lire',
      updatedAt: new Date().toISOString(),
      coverUrl: undefined,
    },
  ]
}

export function useReadingShelf() {
  const books = ref<ReadingBook[]>(loadInitialBooks())
  const removalPromptId = ref<string | null>(null)

  watch(
    books,
    (value) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
      syncShelf({ books: value, updatedAt: new Date().toISOString() }).catch((error) => {
        console.warn('Synchronisation distante impossible :', error)
      })
    },
    { deep: true }
  )

  function addBook(book: {
    title: string
    author: string
    totalPages?: number
    coverUrl?: string
    averageRating?: number
    description?: string
  }) {
    const id = crypto.randomUUID ? crypto.randomUUID() : `book-${Date.now()}`
    const totalPages = Number.isFinite(book.totalPages)
      ? Math.max(0, Math.floor(book.totalPages ?? 0))
      : 0
    const coverUrl = book.coverUrl?.trim() || undefined
    const averageRating = Number.isFinite(book.averageRating) ? book.averageRating : undefined
    books.value = [
      {
        id,
        title: book.title,
        author: book.author,
        totalPages,
        currentPage: 0,
        status: 'a_lire',
        updatedAt: new Date().toISOString(),
        coverUrl,
        averageRating,
        description: book.description,
      },
      ...books.value,
    ]
  }

  function removeBook(id: string) {
    books.value = books.value.filter((book) => book.id !== id)
  }

  function touch(book: ReadingBook, overrides?: Partial<ReadingBook>) {
    return {
      ...book,
      ...overrides,
      updatedAt: new Date().toISOString(),
    }
  }

  function setStatus(id: string, status: ReadingStatus) {
    books.value = books.value.map((book) => {
      if (book.id !== id) {
        return book
      }

      let currentPage = book.currentPage
      if (status === 'a_lire') {
        currentPage = 0
      } else if (status === 'lu') {
        currentPage = book.totalPages
      } else if (status === 'en_cours' && currentPage === 0) {
        currentPage = 1
      }

      return touch(book, {
        status,
        currentPage,
      })
    })
  }

  function updateProgress(id: string, page: number) {
    books.value = books.value.map((book) =>
      book.id === id
        ? touch(book, {
            currentPage: Math.max(0, Math.min(page, book.totalPages)),
            status:
              page >= book.totalPages
                ? 'lu'
                : page <= 0
                  ? 'a_lire'
                  : 'en_cours',
          })
        : book
    )
  }

  function updateNotes(id: string, notes: string) {
    books.value = books.value.map((book) => (book.id === id ? touch(book, { notes }) : book))
  }

  function updateTotalPages(id: string, totalPages: number) {
    const normalized = Math.max(1, Math.floor(totalPages))
    books.value = books.value.map((book) =>
      book.id === id
        ? touch(book, {
            totalPages: normalized,
            currentPage: Math.min(book.currentPage, normalized),
          })
        : book
    )
  }

  function startReading(id: string) {
    setStatus(id, 'en_cours')
  }

  function addFromSearch(book: {
    title: string
    author: string
    totalPages?: number
    coverUrl?: string
    averageRating?: number
    description?: string
  }) {
    const exists = books.value.some((existing) => existing.title === book.title && existing.author === book.author)
    if (exists) {
      return
    }
    addBook(book)
  }

  function closeRemovalPrompt() {
    removalPromptId.value = null
  }

  function requestRemoval(id: string) {
    removalPromptId.value = id
  }

  function confirmRemoval(choice: 'to_read' | 'abandon' | 'delete', id: string) {
    if (choice === 'delete') {
      removeBook(id)
    } else if (choice === 'to_read') {
      setStatus(id, 'a_lire')
    } else if (choice === 'abandon') {
      setStatus(id, 'abandonne')
    }
    closeRemovalPrompt()
  }

  function computeHeroSession() {
    const inProgress = books.value.find((book) => book.status === 'en_cours') ?? books.value[0]
    if (!inProgress) {
      return {
        title: 'Aucune lecture en cours',
        meta: 'Ajoute un livre pour démarrer ta session.',
        status: 'Prêt à lire',
        percent: 0,
        coverUrl: undefined as string | undefined,
      }
    }

    const percent = inProgress.totalPages > 0 ? Math.round((inProgress.currentPage / inProgress.totalPages) * 100) : 0

    return {
      title: inProgress.title,
      meta: `${inProgress.author} · ${inProgress.totalPages || '—'} pages`,
      status: `Page ${inProgress.currentPage} / ${inProgress.totalPages || '—'}`,
      percent,
      coverUrl: inProgress.coverUrl,
    }
  }

  function computeStats(): StatCard[] {
    const totalBooks = books.value.length
    const completed = completedBooks.value.length
    const inProgressCount = inProgressBooks.value.length
    const toReadCount = toReadBooks.value.length
    const totalPagesRead = books.value.reduce((sum, book) => sum + Math.min(book.currentPage, book.totalPages ?? 0), 0)

    return [
      {
        label: 'Livres suivis',
        value: String(totalBooks),
        subLabel: 'Dans ta bibliothèque',
      },
      {
        label: 'Lectures en cours',
        value: String(inProgressCount),
        subLabel: `${completed} terminées en tout`,
      },
      {
        label: 'Pages lues',
        value: String(totalPagesRead),
        subLabel: `${toReadCount} en attente`,
      },
    ]
  }

  function isInShelf(title: string, author: string) {
    return books.value.some((book) => book.title === title && book.author === author)
  }

  const toReadBooks = computed(() => books.value.filter((book) => book.status === 'a_lire'))

  const inProgressBooks = computed(() => books.value.filter((book) => book.status === 'en_cours'))

  const completedBooks = computed(() => books.value.filter((book) => book.status === 'lu'))

  const abandonedBooks = computed(() => books.value.filter((book) => book.status === 'abandonne'))

  return {
    books,
    toReadBooks,
    inProgressBooks,
    completedBooks,
    abandonedBooks,
    removalPromptId,
    addBook,
    removeBook,
    setStatus,
    updateProgress,
    updateNotes,
    updateTotalPages,
    startReading,
    addFromSearch,
    requestRemoval,
    confirmRemoval,
    closeRemovalPrompt,
    computeHeroSession,
    computeStats,
    isInShelf,
  }
}
