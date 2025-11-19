<script setup lang="ts">
import { ref } from 'vue'
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
  lengthFilter: 'all' | 'short' | 'medium' | 'long'
  periodFilter: 'all' | 'recent' | 'modern' | 'older'
  hideInShelf: boolean
  sortMode: 'relevance' | 'pages-asc' | 'pages-desc' | 'date-desc' | 'rating-desc'
  isResultInShelf: (book: GoogleBookVolume) => boolean
  onSubmit: () => void
  setQuery: (value: string) => void
  triggerPresetSearch: (value: string) => void
  goToPreviousPage: () => void
  goToNextPage: () => void
  setLengthFilter: (value: 'all' | 'short' | 'medium' | 'long') => void
  setPeriodFilter: (value: 'all' | 'recent' | 'modern' | 'older') => void
  setHideInShelf: (value: boolean) => void
  setSortMode: (value: 'relevance' | 'pages-asc' | 'pages-desc' | 'date-desc' | 'rating-desc') => void
  filtersRemoveAll: boolean
  totalFiltered: number
  totalUnfiltered: number
  moodFilter: 'all' | 'feelgood' | 'epic' | 'dark'
  hasActiveFilters: boolean
  activeFiltersCount: number
  setMoodFilter: (value: 'all' | 'feelgood' | 'epic' | 'dark') => void
  resetFilters: () => void
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
  activePresetLabel.value = null
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

// Filtres locaux pour Explorer

const activePresetLabel = ref<string | null>(null)

function handleHideInShelfChange(event: Event) {
  const checked = (event.target as HTMLInputElement).checked
  props.setHideInShelf(checked)
}

function handleSortChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value as
    | 'relevance'
    | 'pages-asc'
    | 'pages-desc'
    | 'date-desc'
    | 'rating-desc'
  props.setSortMode(value)
}

function handlePresetClick(preset: ExplorerPreset) {
  activePresetLabel.value = preset.label
  props.triggerPresetSearch(preset.value)
}

function handleResetFiltersClick() {
  activePresetLabel.value = null
  props.resetFilters()
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
          :class="{ 'search__presets-button--active': activePresetLabel === preset.label }"
          :disabled="activePresetLabel === preset.label"
          @click="handlePresetClick(preset)"
        >
          {{ preset.label }}
        </button>
      </div>

      <div class="search__filters">
        <div class="search__filter-group">
          <span class="search__filter-label">Longueur</span>
          <button
            type="button"
            class="search__filter-chip"
            :class="{ 'search__filter-chip--active': props.lengthFilter === 'all' }"
            @click="props.setLengthFilter('all')"
          >
            Toutes
          </button>
          <button
            type="button"
            class="search__filter-chip"
            :class="{ 'search__filter-chip--active': props.lengthFilter === 'short' }"
            @click="props.setLengthFilter('short')"
          >
            Courts
          </button>
          <button
            type="button"
            class="search__filter-chip"
            :class="{ 'search__filter-chip--active': props.lengthFilter === 'medium' }"
            @click="props.setLengthFilter('medium')"
          >
            Moyens
          </button>
          <button
            type="button"
            class="search__filter-chip"
            :class="{ 'search__filter-chip--active': props.lengthFilter === 'long' }"
            @click="props.setLengthFilter('long')"
          >
            Pavés
          </button>
        </div>

        <div class="search__filter-group">
          <span class="search__filter-label">Période</span>
          <button
            type="button"
            class="search__filter-chip"
            :class="{ 'search__filter-chip--active': props.periodFilter === 'all' }"
            @click="props.setPeriodFilter('all')"
          >
            Toutes
          </button>
          <button
            type="button"
            class="search__filter-chip"
            :class="{ 'search__filter-chip--active': props.periodFilter === 'recent' }"
            @click="props.setPeriodFilter('recent')"
          >
            Récent
          </button>
          <button
            type="button"
            class="search__filter-chip"
            :class="{ 'search__filter-chip--active': props.periodFilter === 'modern' }"
            @click="props.setPeriodFilter('modern')"
          >
            1980–2014
          </button>
          <button
            type="button"
            class="search__filter-chip"
            :class="{ 'search__filter-chip--active': props.periodFilter === 'older' }"
            @click="props.setPeriodFilter('older')"
          >
            Avant 1980
          </button>
        </div>

        <div class="search__filter-group">
          <span class="search__filter-label">Ambiance</span>
          <button
            type="button"
            class="search__filter-chip"
            :class="{ 'search__filter-chip--active': props.moodFilter === 'all' }"
            @click="props.setMoodFilter('all')"
          >
            Toutes
          </button>
          <button
            type="button"
            class="search__filter-chip"
            :class="{ 'search__filter-chip--active': props.moodFilter === 'feelgood' }"
            @click="props.setMoodFilter('feelgood')"
          >
            Feel-good
          </button>
          <button
            type="button"
            class="search__filter-chip"
            :class="{ 'search__filter-chip--active': props.moodFilter === 'epic' }"
            @click="props.setMoodFilter('epic')"
          >
            Épique
          </button>
          <button
            type="button"
            class="search__filter-chip"
            :class="{ 'search__filter-chip--active': props.moodFilter === 'dark' }"
            @click="props.setMoodFilter('dark')"
          >
            Sombre / noir
          </button>
        </div>

        <div class="search__filter-group search__filter-group--inline">
          <label class="search__checkbox">
            <input type="checkbox" :checked="props.hideInShelf" @change="handleHideInShelfChange" />
            <span>Masquer les livres déjà dans ta bibliothèque</span>
          </label>
        </div>

        <div class="search__filter-group search__filter-group--inline">
          <label class="search__filter-label" for="explorer-sort">Trier par</label>
          <select
            id="explorer-sort"
            :value="props.sortMode"
            class="search__sort-select"
            @change="handleSortChange"
          >
            <option value="relevance">Pertinence</option>
            <option value="pages-asc">Plus courts d'abord</option>
            <option value="pages-desc">Plus longs d'abord</option>
            <option value="date-desc">Les plus récents</option>
            <option value="rating-desc">Mieux notés</option>
          </select>
        </div>

        <div v-if="props.hasActiveFilters" class="search__filters-footer">
          <span class="search__filters-indicator">
            {{ props.activeFiltersCount }} filtre{{ props.activeFiltersCount > 1 ? 's' : '' }} actif{{ props.activeFiltersCount > 1 ? 's' : '' }}
          </span>
          <button type="button" class="search__filters-reset" @click="handleResetFiltersClick">
            Réinitialiser les filtres
          </button>
        </div>
      </div>

      <p v-if="props.errorMessage" class="state state--error">{{ props.errorMessage }}</p>
      <p
        v-else-if="props.hasSearched && !props.totalUnfiltered"
        class="state"
      >
        Aucun résultat pour cette recherche.
      </p>
      <p
        v-else-if="props.hasSearched && props.filtersRemoveAll"
        class="state"
      >
        Aucun résultat ne correspond à ces filtres. Essaie de les assouplir.
      </p>
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
            <template v-if="book.volumeInfo.averageRating">
              · ⭐ {{ book.volumeInfo.averageRating.toFixed(1) }}
              <span v-if="book.volumeInfo.ratingsCount"> ({{ book.volumeInfo.ratingsCount }})</span>
            </template>
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
  background: var(--color-white);
  border-radius: 0;
  padding: var(--space-5) var(--space-4);
  border: 3px solid var(--color-black);
  box-shadow: var(--shadow-brutal);
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  position: relative;
  transition: var(--transition-snap);
  margin-bottom: 2em;
}

.explorer::after {
  content: '';
  position: absolute;
  top: -3px;
  right: -3px;
  width: 16px;
  height: 16px;
  background: var(--accent-secondary);
  border: 2px solid var(--color-black);
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
  border: 2px solid var(--color-black);
  border-radius: 0;
  padding: var(--space-2) var(--space-4);
  background: var(--color-white);
  color: var(--color-black);
  font-size: var(--text-sm);
  font-weight: bold;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
  transition: var(--transition-snap);
  box-shadow: var(--shadow-subtle);
}

.search__presets-button--active {
  background: var(--accent-tertiary);
  color: var(--color-black);
  box-shadow: var(--shadow-brutal);
  cursor: default;
}

.search__presets button:hover,
.search__presets button:focus-visible {
  outline: none;
  background: var(--accent-primary);
  color: white;
  transform: var(--transform-press);
  box-shadow: var(--shadow-hover);
}

.search__filters {
  margin-top: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.search__filters-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-3);
  margin-top: var(--space-2);
}

.search__filters-indicator {
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-neutral-800);
}

.search__filters-reset {
  border: 2px solid var(--color-black);
  border-radius: 0;
  padding: var(--space-1) var(--space-3);
  background: var(--color-white);
  color: var(--color-black);
  font-size: var(--text-xs);
  font-weight: var(--font-bold);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  cursor: pointer;
  box-shadow: var(--shadow-subtle);
  transition: var(--transition-snap);
}

.search__filters-reset:hover {
  background: var(--accent-secondary);
  transform: var(--transform-press);
  box-shadow: var(--shadow-hover);
}

.search__filter-group {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  align-items: center;
}

.search__filter-group--inline {
  align-items: center;
}

.search__filter-label {
  font-size: var(--text-xs);
  font-weight: var(--font-bold);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-neutral-700);
}

.search__filter-chip {
  border: 2px solid var(--color-black);
  border-radius: 0;
  padding: var(--space-1) var(--space-3);
  background: var(--color-white);
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  cursor: pointer;
  transition: var(--transition-snap);
}

.search__filter-chip--active {
  background: var(--accent-primary);
  color: white;
  box-shadow: var(--shadow-subtle);
}

.search__checkbox input {
  margin-right: var(--space-2);
}

.search__sort-select {
  border-radius: 0;
  border: 2px solid var(--color-black);
  padding: var(--space-2) var(--space-3);
  background: var(--color-white);
  font-size: var(--text-sm);
}

.search input {
  flex: 1;
  padding: var(--space-3) var(--space-4);
  border-radius: 0;
  border: 2px solid var(--color-black);
  background: var(--color-white);
  color: var(--color-black);
  font-size: var(--text-base);
  font-weight: 500;
  transition: var(--transition-snap);
  box-shadow: var(--shadow-inset);
}

.search input:focus {
  outline: none;
  border-color: var(--accent-tertiary);
  box-shadow: var(--shadow-brutal);
  transform: var(--transform-float);
}

.search button {
  border: 2px solid var(--color-black);
  border-radius: 0;
  background: var(--accent-tertiary);
  color: var(--color-black);
  padding: var(--space-3) var(--space-6);
  font-weight: bold;
  text-transform: uppercase;
  cursor: pointer;
  transition: var(--transition-snap);
  box-shadow: var(--shadow-brutal);
}

.search button:hover:not(:disabled) {
  transform: var(--transform-press);
  box-shadow: var(--shadow-hover);
}

.search button:disabled {
  opacity: 0.6;
  cursor: progress;
}

@media (max-width: 640px) {
  .search {
    padding: var(--space-4) var(--space-3);
  }

  .search__controls {
    flex-direction: column;
    align-items: stretch;
  }

  .search button {
    width: 100%;
    padding: var(--space-2) var(--space-4);
  }

  .search__presets {
    margin-top: var(--space-3);
    flex-wrap: nowrap;
    overflow-x: auto;
    padding-bottom: var(--space-1);
  }

  .search__presets button {
    flex: 0 0 auto;
    white-space: nowrap;
    font-size: var(--text-xs);
    padding: var(--space-2) var(--space-3);
  }

  .search__filters {
    margin-top: var(--space-3);
    gap: var(--space-2);
  }

  .search__filter-group {
    flex-direction: column;
    align-items: flex-start;
  }

  .search__filter-chip {
    padding: var(--space-1) var(--space-2);
    font-size: var(--text-xs);
  }
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
  background: var(--color-white);
  border-radius: 0;
  padding: var(--space-4);
  border: 2px solid var(--color-black);
  box-shadow: var(--shadow-subtle);
  transition: var(--transition-snap);
  position: relative;
  animation: var(--animation-slide-up);
  animation-fill-mode: both;
}

.results__card:nth-child(1) { animation-delay: 0s; }
.results__card:nth-child(2) { animation-delay: 0.1s; }
.results__card:nth-child(3) { animation-delay: 0.2s; }
.results__card:nth-child(4) { animation-delay: 0.3s; }
.results__card:nth-child(5) { animation-delay: 0.4s; }

.results__card:hover {
  transform: var(--transform-lift);
  box-shadow: var(--shadow-hover);
}

.results__card::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: -2px;
  width: 10px;
  height: 10px;
  background: var(--accent-secondary);
  border: 1px solid var(--color-black);
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
  border: 2px solid var(--color-black);
  border-radius: 0;
  padding: var(--space-2) var(--space-5);
  font-weight: bold;
  text-transform: uppercase;
  background: var(--accent-secondary);
  color: var(--color-black);
  cursor: pointer;
  transition: var(--transition-snap);
  box-shadow: var(--shadow-brutal);
}

.results__pagination button:hover:not(:disabled) {
  transform: var(--transform-press);
  box-shadow: var(--shadow-hover);
}

.results__pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: var(--color-neutral-300);
}

.results__add {
  border: 2px solid var(--color-black);
  border-radius: 0;
  padding: var(--space-3) var(--space-4);
  background: var(--accent-secondary);
  color: var(--color-black);
  font-weight: bold;
  text-transform: uppercase;
  cursor: pointer;
  margin-bottom: var(--space-3);
  transition: var(--transition-snap);
  box-shadow: var(--shadow-brutal);
  font-size: var(--text-sm);
}

.results__add:hover:not(:disabled) {
  transform: var(--transform-press);
  box-shadow: var(--shadow-hover);
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
