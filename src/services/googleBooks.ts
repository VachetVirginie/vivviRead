const GOOGLE_BOOKS_API_BASE_URL = 'https://www.googleapis.com/books/v1/volumes'

const API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY

export interface VolumeImageLinks {
  smallThumbnail?: string
  thumbnail?: string
}

export interface VolumeInfo {
  title: string
  subtitle?: string
  authors?: string[]
  publisher?: string
  description?: string
  categories?: string[]
  pageCount?: number
  publishedDate?: string
  previewLink?: string
  infoLink?: string
  averageRating?: number
  ratingsCount?: number
  imageLinks?: VolumeImageLinks
}

export interface GoogleBookVolume {
  id: string
  etag: string
  volumeInfo: VolumeInfo
}

export interface SearchBooksParams {
  query: string
  maxResults?: number
  startIndex?: number
  langRestrict?: string
  orderBy?: 'relevance' | 'newest'
}

export interface SearchBooksResponse {
  totalItems: number
  items: GoogleBookVolume[]
}

function buildSearchUrl({ query, maxResults = 10, startIndex = 0, langRestrict = 'fr', orderBy }: SearchBooksParams) {
  const url = new URL(GOOGLE_BOOKS_API_BASE_URL)
  url.searchParams.set('q', query)
  url.searchParams.set('maxResults', String(Math.min(maxResults, 40)))
  url.searchParams.set('startIndex', String(startIndex))

  if (langRestrict) {
    url.searchParams.set('langRestrict', langRestrict)
  }

  if (orderBy) {
    url.searchParams.set('orderBy', orderBy)
  }

  if (API_KEY) {
    url.searchParams.set('key', API_KEY)
  }

  return url.toString()
}

export async function searchBooks(params: SearchBooksParams): Promise<SearchBooksResponse> {
  const url = buildSearchUrl(params)
  const response = await fetch(url)

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`Google Books API error (${response.status}): ${errorBody}`)
  }

  const data = (await response.json()) as Partial<SearchBooksResponse>

  return {
    totalItems: data.totalItems ?? 0,
    items: data.items ?? [],
  }
}
