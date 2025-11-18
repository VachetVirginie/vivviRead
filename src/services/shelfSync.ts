import type { ReadingBook } from '../composables/useReadingShelf'

const SHELF_ENDPOINT = import.meta.env.VITE_SHELF_SYNC_ENDPOINT

export interface ShelfSyncPayload {
  books: ReadingBook[]
  updatedAt: string
}

export async function syncShelf(payload: ShelfSyncPayload): Promise<void> {
  if (!SHELF_ENDPOINT) {
    console.info('Aucun endpoint de synchronisation défini. Payload ignoré.', payload)
    return
  }

  const response = await fetch(SHELF_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Échec de la synchronisation (${response.status}): ${body}`)
  }
}
