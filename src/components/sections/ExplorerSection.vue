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
  background: var(--color-surface);
  border-radius: var(--radius-2xl);
  padding: var(--space-5) var(--space-4);
  border: 1px solid var(--color-neutral-200);
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

@media (min-width: 768px) {
  .explorer {
    padding: var(--space-7) var(--space-6);
    gap: var(--space-6);
  }
}

@media (min-width: 1024px) {
  .explorer {
    padding: var(--space-8) var(--space-8);
    gap: var(--space-8);
  }
}

.explorer__header h2 {
  margin: 0 0 var(--space-3);
  font-size: clamp(1.5rem, 3vw, 2.1rem);
  font-weight: var(--font-bold);
  color: var(--color-neutral-900);
}

.explorer__header p {
  margin: 0;
  color: var(--color-neutral-600);
  line-height: var(--leading-relaxed);
}

.search {
  background: var(--color-neutral-50);
  border-radius: var(--radius-xl);
  padding: var(--space-5);
  border: 1px solid var(--color-neutral-200);
}

.search__label {
  display: block;
  font-weight: var(--font-semibold);
  margin-bottom: var(--space-3);
  color: var(--color-neutral-900);
}

.search__controls {
  display: flex;
  gap: var(--space-3);
}

.search__presets {
  margin-top: var(--space-3);
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.search__presets button {
  border-radius: var(--radius-full);
  padding: var(--space-2) var(--space-4);
  background: var(--color-surface);
  color: var(--color-neutral-600);
  border: 1px solid var(--color-neutral-200);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.search__presets button:hover,
.search__presets button:focus-visible {
  outline: none;
  background: var(--color-rouge-corail);
  border-color: var(--color-rouge-corail);
  color: white;
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.search input {
  flex: 1;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-neutral-200);
  background: var(--color-surface);
  color: var(--color-neutral-900);
  font-size: var(--text-base);
  transition: all var(--transition-normal);
}

.search input:focus {
  outline: none;
  border-color: var(--color-jaune-dore);
  box-shadow: 0 0 0 3px rgba(255, 209, 102, 0.1);
}

.search button {
  border: none;
  border-radius: var(--radius-lg);
  background: var(--color-jaune-dore);
  color: var(--color-neutral-900);
  padding: var(--space-3) var(--space-6);
  font-weight: var(--font-semibold);
  cursor: pointer;
  transition: all var(--transition-normal);
  box-shadow: var(--shadow-sm);
}

.search button:hover:not(:disabled) {
  background: #FFD966;
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.search button:disabled {
  opacity: 0.6;
  cursor: progress;
}

.results {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.results__card {
  display: grid;
  grid-template-columns: 128px 1fr;
  gap: var(--space-4);
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  padding: var(--space-4);
  border: 1px solid var(--color-neutral-200);
  box-shadow: var(--shadow-md);
  transition: all var(--transition-normal);
}

.results__card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.results__card img {
  width: 128px;
  height: 192px;
  object-fit: contain;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  background: var(--color-neutral-50);
  padding: var(--space-1);
}

.results__card h3 {
  margin: 0 0 var(--space-1);
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  color: var(--color-neutral-900);
}

.results__meta {
  margin: 0 0 var(--space-3);
  color: var(--color-neutral-500);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
}

.results__description {
  margin: 0 0 var(--space-4);
  color: var(--color-neutral-600);
  line-height: var(--leading-relaxed);
  max-height: 4.5rem;
  overflow: hidden;
  text-overflow: ellipsis;
}

.results__links {
  display: flex;
  gap: var(--space-4);
}

.results__links a {
  color: var(--color-rouge-corail);
  text-decoration: none;
  font-weight: var(--font-semibold);
  font-size: var(--text-sm);
  transition: all var(--transition-normal);
}

.results__links a:hover {
  color: #FF5555;
  text-decoration: underline;
}

.results__pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--space-4);
  flex-wrap: wrap;
  gap: var(--space-3);
}

.results__pagination button {
  border: none;
  border-radius: var(--radius-full);
  padding: var(--space-2) var(--space-5);
  font-weight: var(--font-semibold);
  background: var(--color-turquoise);
  color: var(--color-neutral-900);
  cursor: pointer;
  transition: all var(--transition-normal);
  box-shadow: var(--shadow-sm);
}

.results__pagination button:hover:not(:disabled) {
  background: #4AC4BD;
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.results__pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: var(--color-neutral-300);
}

.results__add {
  border: none;
  border-radius: var(--radius-lg);
  padding: var(--space-3) var(--space-4);
  background: var(--color-turquoise);
  color: var(--color-neutral-900);
  font-weight: var(--font-semibold);
  cursor: pointer;
  margin-bottom: var(--space-3);
  transition: all var(--transition-normal);
  box-shadow: var(--shadow-sm);
  font-size: var(--text-sm);
}

.results__add:hover:not(:disabled) {
  background: #4AC4BD;
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.results__add:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  background: var(--color-neutral-200);
  color: var(--color-neutral-500);
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
