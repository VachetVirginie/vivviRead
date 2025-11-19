<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

import { useAppContext } from '../composables/useAppContext'
import { useSupabaseTest } from '../composables/useSupabaseTest'
import type { GoogleBookVolume } from '../services/googleBooks'

import HeroSection from '../components/sections/HeroSection.vue'
import StatsSection from '../components/sections/StatsSection.vue'
import QuickNav from '../components/sections/QuickNav.vue'
import ModalAddBook from '../components/sections/modals/ModalAddBook.vue'
import ModalAddGoal from '../components/sections/modals/ModalAddGoal.vue'

/* -------- GLOBAL STATE -------- */
const { shelf, goals, explorer, modals } = useAppContext()
useSupabaseTest()

const goalsList = computed(() => goals.goals.value)
const goalsPreview = computed(() => goalsList.value.slice(0, 2))
const goalsCount = computed(() => goalsList.value.length)
const explorerState = explorer.publicState
const explorerRawState = explorer.state
const explorerLoading = computed(() => explorerRawState.loading)
const hasExplorerResults = computed(() => explorerState.value.results.length > 0)
const explorerPreviewResults = computed(() => explorerState.value.results.slice(0, 3))

/* -------- COMPUTED -------- */
const heroSession = computed(() => shelf.computeHeroSession())
const stats = computed(() => shelf.computeStats())
const quickNavLinks = [
  { id: 'goals', label: 'Objectifs' },
  { id: 'stats', label: 'Statistiques' },
  { id: 'explorer', label: 'Explorateur' },
]

const isBookModalOpen = computed(() => modals.active.value === 'book')
const isGoalModalOpen = computed(() => modals.active.value === 'goal')

function previewAuthors(book: GoogleBookVolume) {
  return book.volumeInfo.authors?.join(', ') ?? 'Auteur·ice inconnu·e'
}
</script>

<template>
  <main class="page">
    <HeroSection
      :hero-session="heroSession"
      :loading="explorerLoading"
      @open-modal="modals.open"
      @fetch-books="explorer.submitSearch"
    />

    <QuickNav class="quick-nav animate-fade-in-up" :links="quickNavLinks" @open-modal="modals.open" />

    <StatsSection class="stats-section animate-fade-in-up" :stats="stats" />

    <section id="goals" class="home-block goals-section animate-fade-in-up" aria-label="Aperçu de mes objectifs">
      <header class="home-block__header">
        <div class="home-block__header-main">
          <p class="section-eyebrow">Objectifs</p>
          <h2>Ton rythme de lecture</h2>
          <p class="home-block__subtitle">
            Un aperçu rapide de tes objectifs en cours. Modifie-les en détail depuis la page Objectifs.
          </p>
        </div>
        <RouterLink to="/objectifs" class="home-block__link">
          Voir tous mes objectifs
        </RouterLink>
      </header>

      <div v-if="goalsPreview.length" class="home-goals-preview__grid stagger-children">
        <article
          v-for="(goal, index) in goalsPreview"
          :key="goal.id"
          class="home-goals-preview__card animate-fade-in-scale"
          :style="{ '--stagger-delay': index }"
        >
          <p class="home-goals-preview__label">{{ goal.unit }}</p>
          <h3>{{ goal.title }}</h3>
          <p class="home-goals-preview__value">
            {{ goal.currentValue }} / {{ goal.targetValue }} {{ goal.unit }}
          </p>
          <div class="home-goals-preview__progress">
            <span :style="{ width: `${Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100))}%` }" />
          </div>
        </article>
      </div>
      <p v-else class="state">
        Aucun objectif pour le moment. Commence par t’en fixer un dans l’onglet Objectifs.
      </p>

      <p v-if="goalsCount > goalsPreview.length" class="home-block__hint">
        {{ goalsCount - goalsPreview.length }} autre(s) objectif(s) t’attendent dans la page dédiée.
      </p>
    </section>

    <section id="explorer" class="home-block explorer-section animate-fade-in-up" aria-label="Découvrir de nouvelles lectures">
      <header class="home-block__header">
        <div class="home-block__header-main">
          <p class="section-eyebrow">Découvertes</p>
          <h2>Des idées de lectures à portée de main</h2>
          <p class="home-block__subtitle">
            L’explorateur te propose des livres adaptés à tes envies. Ouvre-le pour lancer une recherche complète.
          </p>
        </div>
        <RouterLink to="/explorer" class="home-block__link">
          Ouvrir l’explorateur
        </RouterLink>
      </header>

      <div v-if="hasExplorerResults" class="home-explorer-preview__list stagger-children">
        <article
          v-for="(book, index) in explorerPreviewResults"
          :key="book.id"
          class="home-explorer-preview__card animate-fade-in-scale"
          :style="{ '--stagger-delay': index }"
        >
          <h3>{{ book.volumeInfo.title }}</h3>
          <p class="home-explorer-preview__meta">
            {{ previewAuthors(book) }}
          </p>
        </article>
      </div>
      <p v-else class="state">
        Lance une recherche depuis l’onglet Explorer pour voir des suggestions apparaître ici.
      </p>
    </section>

    <!-- MODALS -->
    <ModalAddBook
      v-if="isBookModalOpen"
      @close="modals.close"
      @add="shelf.addBook"
    />

    <ModalAddGoal
      v-if="isGoalModalOpen"
      @close="modals.close"
      @add="goals.addGoal"
    />
  </main>
</template>

<style scoped>
.page {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-8);
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-8) var(--space-4) var(--space-12);
}

@media (min-width: 1024px) {
  .page {
    grid-template-columns: 2fr 1fr;
    grid-template-areas: 
      "hero hero"
      "quicknav quicknav"
      "stats goals"
      "explorer explorer";
    gap: var(--space-10) var(--space-8);
    padding: var(--space-12) var(--space-6) var(--space-16);
  }
  
  .hero { grid-area: hero; }
  .quick-nav { grid-area: quicknav; }
  .stats-section { grid-area: stats; }
  .goals-section { grid-area: goals; }
  .explorer-section { grid-area: explorer; }
}

.home-block {
  background: var(--color-white);
  border-radius: 0;
  padding: var(--space-8) var(--space-6);
  border: 3px solid var(--color-black);
  box-shadow: var(--shadow-brutal);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  transition: var(--transition-snap);
  position: relative;
}

.home-block::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--color-jaune-dore);
  opacity: 0;
  transition: opacity var(--transition-normal);
}

.home-block:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-xl);
}

.home-block:hover::before {
  opacity: 1;
}

.home-block__header {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-3) var(--space-4);
}

.home-block__header-main h2 {
  margin: 0 0 var(--space-2);
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  color: var(--color-neutral-900);
}

.home-block__subtitle {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--color-neutral-600);
  line-height: var(--leading-relaxed);
}

.home-block__link {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--color-primary-green);
  text-decoration: none;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-full);
  background: var(--color-neutral-100);
  transition: all var(--transition-normal);
}

.home-block__link:hover {
  background: var(--color-primary-green);
  color: var(--color-surface);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.home-block__hint {
  margin: 0;
  font-size: 0.85rem;
  color: #4b5563;
}

.home-goals-preview__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-4);
}

.home-goals-preview__card {
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  background: var(--color-jaune-dore);
  border: 1px solid #E6C266;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
}

.home-goals-preview__card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 50%);
  pointer-events: none;
}

.home-goals-preview__card:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: var(--shadow-lg);
}

.home-goals-preview__label {
  margin: 0 0 var(--space-2);
  text-transform: uppercase;
  font-size: var(--text-xs);
  letter-spacing: 0.15em;
  color: var(--color-neutral-800);
  font-weight: var(--font-medium);
  position: relative;
  z-index: 1;
}

.home-goals-preview__card h3 {
  margin: 0 0 var(--space-2);
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--color-neutral-900);
  position: relative;
  z-index: 1;
}

.home-goals-preview__value {
  margin: var(--space-1) 0 var(--space-4);
  font-weight: var(--font-semibold);
  font-size: var(--text-base);
  color: var(--color-neutral-800);
  position: relative;
  z-index: 1;
}

.home-goals-preview__progress {
  width: 100%;
  height: 8px;
  border-radius: var(--radius-full);
  background: rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1;
  overflow: hidden;
}

.home-goals-preview__progress span {
  display: block;
  height: 100%;
  border-radius: var(--radius-full);
  background: var(--color-neutral-900);
  transition: width var(--transition-slow);
}

.home-explorer-preview__list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-4);
}

.home-explorer-preview__card {
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  background: var(--color-surface);
  border: 1px solid var(--color-neutral-200);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
}

.home-explorer-preview__card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--color-jaune-dore);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform var(--transition-normal);
}

.home-explorer-preview__card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.home-explorer-preview__card:hover::before {
  transform: scaleX(1);
}

.home-explorer-preview__card h3 {
  margin: 0 0 var(--space-2);
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  color: var(--color-neutral-900);
  line-height: var(--leading-tight);
}

.home-explorer-preview__meta {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--color-neutral-600);
  line-height: var(--leading-normal);
}

.home-block .state {
  color: var(--color-neutral-500);
  font-size: var(--text-sm);
  text-align: center;
  padding: var(--space-8) var(--space-4);
  background: var(--color-neutral-50);
  border-radius: var(--radius-lg);
  border: 2px dashed var(--color-neutral-200);
}

.home-block__hint {
  margin: 0;
  font-size: var(--text-xs);
  color: var(--color-neutral-500);
  text-align: center;
  font-style: italic;
}

@media (min-width: 768px) {
  .home-block__header-main h2 {
    font-size: var(--text-2xl);
  }
  
  .home-goals-preview__grid,
  .home-explorer-preview__list {
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  }
}

@media (max-width: 640px) {
  .home-block {
    padding: var(--space-6) var(--space-4);
  }
  
  .home-goals-preview__grid,
  .home-explorer-preview__list {
    grid-template-columns: 1fr;
  }
}
</style>
