import { computed, ref } from 'vue'
import { supabase } from '../lib/supabaseClient'
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

export function useReadingShelf() {
  const books = ref<ReadingBook[]>([])
  const removalPromptId = ref<string | null>(null)

  async function getCurrentUserId(): Promise<string> {
    const { data, error } = await supabase.auth.getUser()
    if (error || !data.user) {
      throw new Error('Utilisateur non authentifié')
    }
    return data.user.id
  }

  async function createActivityForCurrentUser(input: {
    type: 'book_added' | 'book_finished'
    payload: Record<string, any>
    visibility?: 'public' | 'followers' | 'private'
    bookId?: string | null
    userBookId?: string | null
  }) {
    try {
      const userId = await getCurrentUserId()
      const { error } = await supabase.from('activities').insert({
        user_id: userId,
        type: input.type,
        visibility: input.visibility ?? 'followers',
        book_id: input.bookId ?? null,
        user_book_id: input.userBookId ?? null,
        payload: input.payload ?? {},
      })

      if (error) {
        console.warn("Erreur lors de la création de l'activité de lecture dans Supabase :", error)
      }
    } catch (error) {
      console.warn(
        "Erreur inattendue lors de la création de l'activité de lecture dans Supabase :",
        error,
      )
    }
  }

  function mapRowToReadingBook(row: any): ReadingBook {
    return {
      id: row.id,
      title: row.books?.title ?? 'Livre sans titre',
      author: row.books?.author ?? 'Auteur inconnu',
      totalPages: row.total_pages ?? 0,
      currentPage: row.current_page ?? 0,
      status: row.status,
      notes: row.notes ?? undefined,
      description: row.books?.description ?? undefined,
      updatedAt: row.updated_at,
      coverUrl: row.books?.cover_url ?? undefined,
      averageRating: row.books?.average_rating ?? undefined,
    }
  }

  async function loadShelfFromSupabase() {
    try {
      const userId = await getCurrentUserId()
      const { data, error } = await supabase
        .from('user_books')
        .select(
          `id, status, total_pages, current_page, notes, updated_at, books:book_id (id, title, author, cover_url, average_rating, description)`
        )
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })

      if (error) {
        console.warn('Erreur lors du chargement de la bibliothèque depuis Supabase :', error)
        return
      }

      if (!data) {
        books.value = []
        return
      }

      books.value = data.map(mapRowToReadingBook)
    } catch (error) {
      console.warn('Impossible de charger la bibliothèque depuis Supabase :', error)
    }
  }

  async function upsertBookRecord(bookInput: {
    title: string
    author: string
    coverUrl?: string
    averageRating?: number
    description?: string
  }) {
    const { data: existing, error: existingError } = await supabase
      .from('books')
      .select('*')
      .eq('title', bookInput.title)
      .eq('author', bookInput.author)
      .maybeSingle()

    if (existingError && existingError.code !== 'PGRST116') {
      throw existingError
    }

    if (existing) {
      return existing
    }

    const { data: inserted, error: insertError } = await supabase
      .from('books')
      .insert({
        title: bookInput.title,
        author: bookInput.author,
        cover_url: bookInput.coverUrl ?? null,
        average_rating: bookInput.averageRating ?? null,
        description: bookInput.description ?? null,
      })
      .select('*')
      .single()

    if (insertError) {
      throw insertError
    }

    return inserted
  }

  async function syncUserBook(id: string) {
    const book = books.value.find((b) => b.id === id)
    if (!book) return

    const { error } = await supabase
      .from('user_books')
      .update({
        status: book.status,
        total_pages: book.totalPages,
        current_page: book.currentPage,
        notes: book.notes ?? null,
        updated_at: book.updatedAt,
      })
      .eq('id', id)

    if (error) {
      console.warn('Erreur lors de la synchronisation du livre vers Supabase :', error)
    }
  }

  // Chargement initial de la bibliothèque pour l'utilisateur connecté
  loadShelfFromSupabase().catch((error) => {
    console.warn('Erreur lors du chargement initial de la bibliothèque :', error)
  })

  async function addBook(book: {
    title: string
    author: string
    totalPages?: number
    coverUrl?: string
    averageRating?: number
    description?: string
  }) {
    const totalPages = Number.isFinite(book.totalPages)
      ? Math.max(0, Math.floor(book.totalPages ?? 0))
      : 0
    const coverUrl = book.coverUrl?.trim() || undefined
    const averageRating = Number.isFinite(book.averageRating) ? book.averageRating : undefined
    const description = book.description

    try {
      const userId = await getCurrentUserId()
      const bookRecord = await upsertBookRecord({
        title: book.title,
        author: book.author,
        coverUrl,
        averageRating,
        description,
      })

      const { data, error } = await supabase
        .from('user_books')
        .insert({
          user_id: userId,
          book_id: bookRecord.id,
          status: 'a_lire',
          total_pages: totalPages,
          current_page: 0,
          notes: null,
        })
        .select(
          `id, status, total_pages, current_page, notes, updated_at, books:book_id (id, title, author, cover_url, average_rating, description)`
        )
        .single()

      if (error || !data) {
        throw error
      }

      const readingBook = mapRowToReadingBook(data)
      books.value = [readingBook, ...books.value]

      void createActivityForCurrentUser({
        type: 'book_added',
        payload: {
          title: readingBook.title,
          author: readingBook.author,
          total_pages: readingBook.totalPages,
          current_page: readingBook.currentPage,
          status: readingBook.status,
          cover_url: readingBook.coverUrl ?? null,
        },
        bookId: (data as any).books?.id ?? null,
        userBookId: data.id as string,
      })
    } catch (error) {
      console.warn('Erreur lors de l’ajout du livre dans Supabase :', error)
    }
  }

  function removeBook(id: string) {
    books.value = books.value.filter((book) => book.id !== id)

    supabase
      .from('user_books')
      .delete()
      .eq('id', id)
      .then(({ error }) => {
        if (error) {
          console.warn('Erreur lors de la suppression du livre dans Supabase :', error)
        }
      })
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

    const updated = books.value.find((book) => book.id === id)
    if (updated) {
      syncUserBook(id)

      if (status === 'lu') {
        void createActivityForCurrentUser({
          type: 'book_finished',
          payload: {
            title: updated.title,
            author: updated.author,
            total_pages: updated.totalPages,
            current_page: updated.currentPage,
            status: updated.status,
            cover_url: updated.coverUrl ?? null,
          },
          userBookId: updated.id,
        })
      }
    }
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

    const updated = books.value.find((book) => book.id === id)
    if (updated) {
      syncUserBook(id)
    }
  }

  function updateNotes(id: string, notes: string) {
    books.value = books.value.map((book) => (book.id === id ? touch(book, { notes }) : book))

    const updated = books.value.find((book) => book.id === id)
    if (updated) {
      syncUserBook(id)
    }
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

    const updated = books.value.find((book) => book.id === id)
    if (updated) {
      syncUserBook(id)
    }
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
        coverUrl: undefined,
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
        label: 'Pile à lire',
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
