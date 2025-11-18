<script setup lang="ts">
import type { GoogleBookVolume } from '../../services/googleBooks'

interface ExplorerPreset {
  label: string
  value: string
}

const props = defineProps<{
  query: string
  loading: boolean
  errorMessage: string | null
  hasSearched: boolean
  results: GoogleBookVolume[]
  canGoPrevious: boolean
  canGoNext: boolean
  currentPage: number
  paginationLabel: string
  presets: ExplorerPreset[]
  isResultInShelf: (book: GoogleBookVolume) => boolean
  onSubmit: () => void
  setQuery: (value: string) => void
  triggerPresetSearch: (value: string) => void
  goToPreviousPage: () => void
  goToNextPage: () => void
}>()

const emit = defineEmits<{
  (e: 'add', payload: {
    title: string
    author: string
    totalPages?: number
    coverUrl?: string
    averageRating?: number
    description?: string
  }): void
}>()

function handleQueryInput(event: Event) {
  const value = (event.target as HTMLInputElement).value
  props.setQuery(value)
}

function formatAuthors(book: GoogleBookVolume) {
  return book.volumeInfo.authors?.join(', ') ?? 'Auteur·ice inconnu·e'
}

function coverUrl(book: GoogleBookVolume) {
  return book.volumeInfo.imageLinks?.thumbnail ?? book.volumeInfo.imageLinks?.smallThumbnail
}

function handleAdd(book: GoogleBookVolume) {
  emit('add', {
    title: book.volumeInfo.title,
    author: formatAuthors(book),
    totalPages: book.volumeInfo.pageCount,
    coverUrl: coverUrl(book) ?? undefined,
    averageRating: book.volumeInfo.averageRating,
    description: book.volumeInfo.description,
  })
}
</script>

<template>
  <section id="explorer" class="explorer" aria-label="Explorateur de livres">
    <div class="explorer__header">
      <p class="section-eyebrow">Explorer</p>
      <h2>Découvre de nouvelles lectures et ajoute-les en un clic.</h2>
      <p>Utilise un mot-clé ou sélectionne un preset pour trouver ta prochaine pépite.</p>
    </div>

    <form class="search" @submit.prevent="props.onSubmit">
      <label class="search__label" for="explorer-search">Rechercher un livre</label>
      <div class="search__controls">
        <input
          id="explorer-search"
          type="text"
          :value="props.query"
          :disabled="props.loading"
          placeholder="Ex. fantasy cozy"
          @input="handleQueryInput"
        />
        <button type="submit" :disabled="props.loading">
          {{ props.loading ? 'Recherche…' : 'Rechercher' }}
        </button>
      </div>

      <div v-if="props.presets.length" class="search__presets">
        <button
          v-for="preset in props.presets"
          :key="preset.value"
          type="button"
          @click="props.triggerPresetSearch(preset.value)"
        >
          {{ preset.label }}
        </button>
      </div>

      <p v-if="props.errorMessage" class="state state--error">{{ props.errorMessage }}</p>
      <p v-else-if="props.hasSearched && !props.results.length" class="state">Aucun résultat pour cette recherche.</p>
    </form>

    <div v-if="props.results.length" class="results">
      <article v-for="book in props.results" :key="book.id" class="results__card">
        <img v-if="coverUrl(book)" :src="coverUrl(book)" :alt="`Couverture de ${book.volumeInfo.title}`" loading="lazy" />
        <div>
          <button
            class="results__add"
            type="button"
            :disabled="props.isResultInShelf(book)"
            @click="handleAdd(book)"
          >
            {{ props.isResultInShelf(book) ? 'Déjà dans la bibliothèque' : 'Ajouter à ma pile' }}
          </button>
          <h3>{{ book.volumeInfo.title }}</h3>
          <p class="results__meta">
            {{ formatAuthors(book) }}
            <template v-if="book.volumeInfo.pageCount"> · {{ book.volumeInfo.pageCount }} pages</template>
            <template v-if="book.volumeInfo.publishedDate"> · {{ book.volumeInfo.publishedDate }}</template>
          </p>
          <p class="results__description">
            {{ book.volumeInfo.description ?? 'Pas de description disponible.' }}
          </p>
          <div class="results__links">
            <a v-if="book.volumeInfo.previewLink" :href="book.volumeInfo.previewLink" target="_blank" rel="noopener">
              Aperçu
            </a>
            <a v-if="book.volumeInfo.infoLink" :href="book.volumeInfo.infoLink" target="_blank" rel="noopener">
              Fiche complète
            </a>
          </div>
        </div>
      </article>

      <div class="results__pagination">
        <span class="state">{{ props.paginationLabel }}</span>
        <div>
          <button type="button" :disabled="!props.canGoPrevious" @click="props.goToPreviousPage">Précédent</button>
          <button type="button" :disabled="!props.canGoNext" @click="props.goToNextPage">Suivant</button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.explorer {
  background: #ffffff;
  border-radius: 1.5rem;
  padding: 1.75rem 1.5rem;
  border: 1px solid #e5e7eb;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.explorer__header h2 {
  margin: 0 0 0.75rem;
  font-size: clamp(1.5rem, 3vw, 2.1rem);
}

.explorer__header p {
  margin: 0;
  color: #4b5563;
}

.search {
  background: #f9fafb;
  border-radius: 1rem;
  padding: 1.25rem;
  border: 1px solid #e5e7eb;
}

.search__label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.search__controls {
  display: flex;
  gap: 0.75rem;
}

.search__presets {
  margin-top: 0.75rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.search__presets button {
  border-radius: 999px;
  padding: 0.35rem 0.95rem;
  background: #ffffff;
  color: #374151;
  border: 1px solid #e5e7eb;
  font-size: 0.8rem;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease, transform 0.1s ease;
}

.search__presets button:hover,
.search__presets button:focus-visible {
  outline: none;
  background: #facc15;
  border-color: #facc15;
  color: #111827;
  box-shadow: 0 6px 14px rgba(15, 23, 42, 0.18);
  transform: translateY(-1px);
}

.search input {
  flex: 1;
  padding: 0.85rem 1rem;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  color: #111827;
  font-size: 1rem;
  transition: border-color 0.2s ease;
}

.search input:focus {
  outline: none;
  border-color: #facc15;
}

.search button {
  border: none;
  border-radius: 0.75rem;
  background: #facc15;
  color: #111827;
  padding: 0 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.search button:disabled {
  opacity: 0.6;
  cursor: progress;
}

.results {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.results__card {
  display: grid;
  grid-template-columns: 128px 1fr;
  gap: 1rem;
  background: #ffffff;
  border-radius: 1rem;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
}

.results__card img {
  width: 128px;
  height: 192px;
  object-fit: cover;
  border-radius: 0.75rem;
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.45);
}

.results__card h3 {
  margin: 0 0 0.25rem;
  font-size: 1.25rem;
}

.results__meta {
  margin: 0 0 0.75rem;
  color: #6b7280;
  font-size: 0.95rem;
}

.results__description {
  margin: 0 0 1rem;
  color: #4b5563;
  line-height: 1.4;
  max-height: 4.5rem;
  overflow: hidden;
  text-overflow: ellipsis;
}

.results__links {
  display: flex;
  gap: 1rem;
}

.results__links a {
  color: #111827;
  text-decoration: none;
  font-weight: 600;
}

.results__pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.results__pagination button {
  border: none;
  border-radius: 999px;
  padding: 0.5rem 1.25rem;
  font-weight: 600;
  background: #f3f4f6;
  color: #111827;
  cursor: pointer;
}

.results__pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.results__add {
  border: none;
  border-radius: 0.75rem;
  padding: 0.65rem 1rem;
  background: #16a34a;
  color: #fefce8;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 0.75rem;
}

.results__add:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  background: #e5e7eb;
  color: #9ca3af;
}

@media (max-width: 640px) {
  .search__controls {
    flex-direction: column;
  }

  .results__card {
    grid-template-columns: 1fr;
  }

  .results__card img {
    width: 100%;
    height: auto;
  }
}
</style>
