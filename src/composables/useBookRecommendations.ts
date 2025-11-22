import { ref, computed } from 'vue'
import { supabase } from '../lib/supabaseClient'

export type BookRecommendationStatus = 'sent' | 'seen' | 'added_to_list' | 'dismissed'

export interface BookRecommendation {
  id: string
  fromUserId: string
  toUserId: string
  userBookId: string | null
  bookId: string | null
  bookTitle: string
  bookAuthor: string
  coverUrl?: string
  message?: string
  status: BookRecommendationStatus
  createdAt: string
  fromUserName: string | null
}

interface ProfileSummary {
  id: string
  full_name: string | null
  username: string | null
}

interface BookSummary {
  id: string
  title: string | null
  author: string | null
  cover_url: string | null
}

async function getCurrentUserId(): Promise<string | null> {
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) {
    return null
  }
  return data.user.id
}

const incoming = ref<BookRecommendation[]>([])
const outgoing = ref<BookRecommendation[]>([])
const loading = ref(false)

function mapRowToRecommendation(
  row: any,
  options: {
    profileById?: Map<string, ProfileSummary>
    bookById?: Map<string, BookSummary>
  } = {},
): BookRecommendation {
  const fromUserId = row.from_user_id as string
  const toUserId = row.to_user_id as string
  const bookId = (row.book_id as string | null) ?? null
  const profile = options.profileById?.get(fromUserId)
  const book = bookId ? options.bookById?.get(bookId) : undefined

  const fromUserName = profile?.username ?? profile?.full_name ?? null
  const bookTitle = book?.title ?? 'Livre recommandé'
  const bookAuthor = book?.author ?? 'Auteur inconnu'
  const coverUrl = book?.cover_url ?? undefined

  const status = (row.status as BookRecommendationStatus) ?? 'sent'

  return {
    id: row.id as string,
    fromUserId,
    toUserId,
    userBookId: (row.user_book_id as string | null) ?? null,
    bookId,
    bookTitle,
    bookAuthor,
    coverUrl,
    message: (row.message as string | null) ?? undefined,
    status,
    createdAt: row.created_at as string,
    fromUserName,
  }
}

const unreadCount = computed(() => incoming.value.filter((rec) => rec.status === 'sent').length)

async function sendRecommendation(input: { toUserId: string; userBookId: string; message?: string }) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      console.warn("Impossible d’envoyer une recommandation sans être connecté")
      return
    }

    if (!input.toUserId || input.toUserId === userId) {
      return
    }

    const { data: userBook, error: userBookError } = await supabase
      .from('user_books')
      .select('id, book_id, books:book_id (id, title, author, cover_url)')
      .eq('id', input.userBookId)
      .maybeSingle()

    if (userBookError) {
      console.warn('Erreur lors du chargement du livre à recommander :', userBookError)
      return
    }

    if (!userBook) {
      console.warn("Aucun livre 'user_books' trouvé pour cette recommandation")
      return
    }

    const payload = {
      from_user_id: userId,
      to_user_id: input.toUserId,
      user_book_id: userBook.id as string,
      book_id: (userBook as any).book_id ?? null,
      message: input.message?.trim() || null,
      status: 'sent' as BookRecommendationStatus,
    }

    const { data: inserted, error: insertError } = await supabase
      .from('book_recommendations')
      .insert(payload)
      .select('id, from_user_id, to_user_id, user_book_id, book_id, message, status, created_at')
      .single()

    if (insertError) {
      console.warn("Erreur lors de l'envoi de la recommandation de livre :", insertError)
      return
    }

    const book = (userBook as any).books ?? null
    const bookById = new Map<string, BookSummary>()
    if (book && book.id) {
      bookById.set(book.id as string, {
        id: book.id as string,
        title: (book.title as string | null) ?? null,
        author: (book.author as string | null) ?? null,
        cover_url: (book.cover_url as string | null) ?? null,
      })
    }

    const recommendation = mapRowToRecommendation(inserted, {
      bookById,
    })

    outgoing.value = [recommendation, ...outgoing.value]
  } catch (error) {
    console.warn("Erreur inattendue lors de l'envoi d'une recommandation de livre :", error)
  }
}

async function loadIncoming() {
  loading.value = true

  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      incoming.value = []
      return
    }

    const { data: rows, error } = await supabase
      .from('book_recommendations')
      .select('id, from_user_id, to_user_id, user_book_id, book_id, message, status, created_at')
      .eq('to_user_id', userId)
      .order('created_at', { ascending: false })

    if (error || !rows) {
      if (error) {
        console.warn('Erreur lors du chargement des recommandations de livres reçues :', error)
      }
      incoming.value = []
      return
    }

    const fromIds = Array.from(new Set((rows as any[]).map((row) => row.from_user_id as string)))
    const bookIds = Array.from(
      new Set(
        (rows as any[])
          .map((row) => row.book_id as string | null)
          .filter((id): id is string => !!id),
      ),
    )

    const [profilesResult, booksResult] = await Promise.all([
      fromIds.length
        ? supabase.from('profiles').select('id, full_name, username').in('id', fromIds)
        : Promise.resolve({ data: [], error: null } as { data: any[]; error: any }),
      bookIds.length
        ? supabase.from('books').select('id, title, author, cover_url').in('id', bookIds)
        : Promise.resolve({ data: [], error: null } as { data: any[]; error: any }),
    ])

    if (profilesResult.error) {
      console.warn('Erreur lors du chargement des profils pour les recommandations de livres :', profilesResult.error)
    }

    if (booksResult.error) {
      console.warn('Erreur lors du chargement des livres pour les recommandations de livres :', booksResult.error)
    }

    const profileById = new Map<string, ProfileSummary>()
    for (const profile of profilesResult.data ?? []) {
      profileById.set(profile.id as string, {
        id: profile.id as string,
        full_name: (profile.full_name as string | null) ?? null,
        username: (profile.username as string | null) ?? null,
      })
    }

    const bookById = new Map<string, BookSummary>()
    for (const book of booksResult.data ?? []) {
      bookById.set(book.id as string, {
        id: book.id as string,
        title: (book.title as string | null) ?? null,
        author: (book.author as string | null) ?? null,
        cover_url: (book.cover_url as string | null) ?? null,
      })
    }

    incoming.value = (rows as any[]).map((row) =>
      mapRowToRecommendation(row, {
        profileById,
        bookById,
      }),
    )
  } catch (error) {
    console.warn('Erreur inattendue lors du chargement des recommandations de livres reçues :', error)
    incoming.value = []
  } finally {
    loading.value = false
  }
}

async function loadOutgoing() {
  loading.value = true

  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      outgoing.value = []
      return
    }

    const { data: rows, error } = await supabase
      .from('book_recommendations')
      .select('id, from_user_id, to_user_id, user_book_id, book_id, message, status, created_at')
      .eq('from_user_id', userId)
      .order('created_at', { ascending: false })

    if (error || !rows) {
      if (error) {
        console.warn('Erreur lors du chargement des recommandations de livres envoyées :', error)
      }
      outgoing.value = []
      return
    }

    const fromIds = Array.from(new Set((rows as any[]).map((row) => row.from_user_id as string)))
    const bookIds = Array.from(
      new Set(
        (rows as any[])
          .map((row) => row.book_id as string | null)
          .filter((id): id is string => !!id),
      ),
    )

    const [profilesResult, booksResult] = await Promise.all([
      fromIds.length
        ? supabase.from('profiles').select('id, full_name, username').in('id', fromIds)
        : Promise.resolve({ data: [], error: null } as { data: any[]; error: any }),
      bookIds.length
        ? supabase.from('books').select('id, title, author, cover_url').in('id', bookIds)
        : Promise.resolve({ data: [], error: null } as { data: any[]; error: any }),
    ])

    if (profilesResult.error) {
      console.warn('Erreur lors du chargement des profils pour les recommandations de livres :', profilesResult.error)
    }

    if (booksResult.error) {
      console.warn('Erreur lors du chargement des livres pour les recommandations de livres :', booksResult.error)
    }

    const profileById = new Map<string, ProfileSummary>()
    for (const profile of profilesResult.data ?? []) {
      profileById.set(profile.id as string, {
        id: profile.id as string,
        full_name: (profile.full_name as string | null) ?? null,
        username: (profile.username as string | null) ?? null,
      })
    }

    const bookById = new Map<string, BookSummary>()
    for (const book of booksResult.data ?? []) {
      bookById.set(book.id as string, {
        id: book.id as string,
        title: (book.title as string | null) ?? null,
        author: (book.author as string | null) ?? null,
        cover_url: (book.cover_url as string | null) ?? null,
      })
    }

    outgoing.value = (rows as any[]).map((row) =>
      mapRowToRecommendation(row, {
        profileById,
        bookById,
      }),
    )
  } catch (error) {
    console.warn('Erreur inattendue lors du chargement des recommandations de livres envoyées :', error)
    outgoing.value = []
  } finally {
    loading.value = false
  }
}

async function updateStatus(id: string, status: BookRecommendationStatus) {
  try {
    const patch: Record<string, any> = {
      status,
      updated_at: new Date().toISOString(),
    }

    if (status === 'seen') {
      patch.seen_at = new Date().toISOString()
    }

    const { error } = await supabase
      .from('book_recommendations')
      .update(patch)
      .eq('id', id)

    if (error) {
      console.warn("Erreur lors de la mise à jour du statut d'une recommandation de livre :", error)
      return
    }

    incoming.value = incoming.value.map((rec) => (rec.id === id ? { ...rec, status } : rec))
  } catch (error) {
    console.warn("Erreur inattendue lors de la mise à jour du statut d'une recommandation de livre :", error)
  }
}

async function markAsSeen(id: string) {
  await updateStatus(id, 'seen')
}

async function markAsAddedToList(id: string) {
  await updateStatus(id, 'added_to_list')
}

async function dismiss(id: string) {
  await updateStatus(id, 'dismissed')
}

export function useBookRecommendations() {
  return {
    incoming,
    outgoing,
    loading,
    unreadCount,
    sendRecommendation,
    loadIncoming,
    loadOutgoing,
    markAsSeen,
    markAsAddedToList,
    dismiss,
  }
}
