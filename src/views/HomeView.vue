<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

import { useAppContext } from '../composables/useAppContext'
import { useSupabaseTest } from '../composables/useSupabaseTest'
import { useBookRecommendations } from '../composables/useBookRecommendations'
import type { GoogleBookVolume } from '../services/googleBooks'

import HeroSection from '../components/sections/HeroSection.vue'
import StatsSection from '../components/sections/StatsSection.vue'
import ModalAddGoal from '../components/sections/modals/ModalAddGoal.vue'

/* -------- GLOBAL STATE -------- */
const { shelf, goals, explorer, modals } = useAppContext()
const router = useRouter()
useSupabaseTest()

const { incoming: incomingRecommendations, unreadCount: unreadRecommendationsCount } = useBookRecommendations()

const goalsList = computed(() => {
  const baseGoals = goals.goals.value
  const books = shelf.books.value
  const completedCount = shelf.completedBooks.value.length
  const totalPagesRead = books.reduce(
    (sum, book) => sum + Math.min(book.currentPage, book.totalPages ?? 0),
    0
  )

  return baseGoals.map((goal) => {
    if (goal.trackingMode === 'auto_completed_books') {
      const display = Math.min(completedCount, goal.targetValue)
      return { ...goal, displayCurrentValue: display }
    }

    if (goal.trackingMode === 'auto_pages_read') {
      const display = Math.min(totalPagesRead, goal.targetValue)
      return { ...goal, displayCurrentValue: display }
    }

    return { ...goal, displayCurrentValue: goal.currentValue }
  })
})
const goalsPreview = computed(() => goalsList.value.slice(0, 2))
const goalsCount = computed(() => goalsList.value.length)
const completedCount = computed(() => shelf.completedBooks.value.length)
const totalPagesRead = computed(() =>
  shelf.books.value.reduce(
    (sum, book) => sum + Math.min(book.currentPage, book.totalPages ?? 0),
    0
  )
)
const lastCompletedBook = computed(() => {
  const list = shelf.completedBooks.value
  if (!list.length) return null

  const sorted = [...list].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )

  return sorted[0]
})
const explorerState = explorer.publicState
const explorerRawState = explorer.state
const explorerLoading = computed(() => explorerRawState.loading)
const hasExplorerResults = computed(() => explorerState.value.results.length > 0)
const explorerPreviewResults = computed(() => explorerState.value.results.slice(0, 3))

const hasRecommendations = computed(() => incomingRecommendations.value.length > 0)
const totalRecommendations = computed(() => incomingRecommendations.value.length)

/* -------- COMPUTED -------- */
const heroSession = computed(() => shelf.computeHeroSession())
const stats = computed(() => shelf.computeStats())
const isNewUser = computed(() => shelf.books.value.length === 0)

const isGoalModalOpen = computed(() => modals.active.value === 'goal')

function previewAuthors(book: GoogleBookVolume) {
  return book.volumeInfo.authors?.join(', ') ?? 'Auteur·ice inconnu·e'
}

function handleOpenModal(type: 'book' | 'goal') {
  if (type === 'book') {
    router.push({ name: 'explorer' })
    return
  }
  modals.open('goal')
}

function handleHeroPrimaryAction() {
  if (shelf.books.value.length === 0) {
    router.push({ name: 'explorer' })
    return
  }

  router.push({ name: 'libraryInProgress' })
}

function goToFriendsRecommendations() {
  router.push({
    name: 'friends',
    query: { filter: 'recommendations' },
  })
}
</script>

<template>
  <main class="page">
    <HeroSection
      :hero-session="heroSession"
      :loading="explorerLoading"
      :is-new-user="isNewUser"
      @open-modal="handleOpenModal"
      @fetch-books="handleHeroPrimaryAction"
    />

    <StatsSection
      v-if="!isNewUser"
      class="stats-section animate-fade-in-up"
      :stats="stats"
    />

    <section
      id="insights"
      class="home-block insights-section animate-fade-in-up"
      aria-label="Aperçu de mes insights de lecture"
    >
      <header class="home-block__header">
        <div class="home-block__header-main">
          <p class="section-eyebrow">Insights</p>
          <h2>Moments forts de ta lecture</h2>
          <p class="home-block__subtitle">
            Un résumé rapide de tes habitudes de lecture. Retrouve plus de détails dans la page Insights.
          </p>
        </div>
        <RouterLink to="/insights" class="home-block__link">
          Voir Insights
        </RouterLink>
      </header>

      <div v-if="!isNewUser" class="insights-summary">
        <div class="insights-summary__item">
          <p class="insights-summary__label">Dernier livre terminé</p>
          <p class="insights-summary__value">
            {{ lastCompletedBook ? lastCompletedBook.title : 'Pas encore de livre terminé' }}
          </p>
        </div>
        <div class="insights-summary__item">
          <p class="insights-summary__label">Livres lus au total</p>
          <p class="insights-summary__value">{{ completedCount }}</p>
        </div>
        <div class="insights-summary__item">
          <p class="insights-summary__label">Pages lues</p>
          <p class="insights-summary__value">{{ totalPagesRead }}</p>
        </div>
      </div>
      <p v-else class="state">
        Tes insights apparaîtront ici dès que tu auras ajouté et commencé à lire un livre.
      </p>
    </section>

    <section
      v-if="!isNewUser"
      id="friends-recommendations"
      class="home-block recommendations-section animate-fade-in-up"
      aria-label="Recommandations de mes amis"
    >
      <header class="home-block__header">
        <div class="home-block__header-main">
          <p class="section-eyebrow">Communauté</p>
          <h2>Recommandations de tes amis</h2>
          <p class="home-block__subtitle">
            Les livres que tes amis te conseillent. Gère-les depuis le flux d'amis.
          </p>
        </div>
        <button
          type="button"
          class="home-block__link"
          @click="goToFriendsRecommendations"
        >
          Voir les recommandations
          <span
            v-if="unreadRecommendationsCount"
            class="home-recos-badge"
          >
            {{ unreadRecommendationsCount }}
          </span>
        </button>
      </header>

      <div v-if="hasRecommendations" class="home-recos-summary">
        <p class="home-recos-summary__text">
          Tes amis t'ont recommandé
          <strong>{{ totalRecommendations }}</strong>
          livre<span v-if="totalRecommendations > 1">s</span>.
        </p>
        <p v-if="unreadRecommendationsCount" class="home-recos-summary__hint">
          {{ unreadRecommendationsCount }}
          recommandation<span v-if="unreadRecommendationsCount > 1">s</span> à découvrir.
        </p>
      </div>
      <p v-else class="state">
        Dès qu'un ami te recommandera un livre, il apparaîtra ici.
      </p>
    </section>

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
          Gérer mes objectifs
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
            {{ goal.displayCurrentValue ?? goal.currentValue }} / {{ goal.targetValue }} {{ goal.unit }}
          </p>
          <div class="home-goals-preview__progress">
            <span
              :style="{
                width: `${Math.min(
                  100,
                  Math.round(((goal.displayCurrentValue ?? goal.currentValue) / goal.targetValue) * 100),
                )}%`,
              }"
            />
          </div>
        </article>
      </div>
      <div v-else class="home-goals-empty">
        <p class="state">
          Aucun objectif pour le moment. Commence par t’en fixer un dans l’onglet Objectifs.
        </p>
        <button
          type="button"
          class="home-goals-empty__cta"
          @click="modals.open('goal')"
        >
          Créer un objectif
        </button>
      </div>

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
          Ouvrir Explorer
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
    <ModalAddGoal
      v-if="isGoalModalOpen"
      @close="modals.close"
      @add="goals.addGoal"
    />
  </main>
</template>

<style scoped>
.page {
  /* display: grid; */
  grid-template-columns: 1fr;
  gap: var(--space-8);
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-12) var(--space-6) var(--space-16);
  color: #e5e7eb;
}

@media (max-width: 768px) {
  .page {
    gap: var(--space-0);
    max-width: 1200px;
    margin: 0 auto;
    color: #e5e7eb;
  }
}

@media (min-width: 1024px) {
  .page {
    grid-template-columns: 2fr 1fr;
    grid-template-areas: 
      "hero hero"
      "stats stats"
      "insights goals"
      "friends-recommendations goals"
      "explorer explorer";
    gap: var(--space-10) var(--space-8);
    padding: var(--space-12) var(--space-6) var(--space-16);
  }
  
  .hero { grid-area: hero; }
  .stats-section { grid-area: stats; }
  .insights-section { grid-area: insights; }
  .goals-section { grid-area: goals; }
  .recommendations-section { grid-area: friends-recommendations; }
  .explorer-section { grid-area: explorer; }
}

.home-block {
  background-color: var(--glass-surface);
  border-radius: 1.5rem;
  padding: var(--space-6);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 22px 45px rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(22px);
  -webkit-backdrop-filter: blur(22px);
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
  height: 3px;
  background: var(--color-jaune-dore);
  opacity: 1;
}

.home-block:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
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
  color: #f9fafb;
}

.home-block__subtitle {
  margin: 0;
  font-size: var(--text-sm);
  color: #e5e7eb;
  line-height: var(--leading-relaxed);
}

.home-block__link {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--color-neutral-800);
  text-decoration: none;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-full);
  background: var(--color-neutral-100);
  transition: all var(--transition-normal);
}

.home-block__link:hover {
  background: var(--accent-secondary);
  color: var(--color-black);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.home-block__link:focus-visible {
  outline: 2px solid var(--color-jaune-dore);
  outline-offset: 2px;
}

.home-recos-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: 0.5rem;
  min-width: 1.25rem;
  height: 1.25rem;
  border-radius: 999px;
  background: var(--color-rouge-corail);
  color: #f9fafb;
  font-size: 0.7rem;
  font-weight: var(--font-bold);
  border: 1px solid var(--color-black);
}

.home-recos-summary {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.home-recos-summary__text {
  margin: 0;
  font-size: var(--text-sm);
  color: #e5e7eb;
}

.home-recos-summary__hint {
  margin: 0;
  font-size: var(--text-xs);
  color: #f97316;
}

.home-block__hint {
  margin: 0;
  font-size: 0.85rem;
  color: #cbd5f5;
}

.home-goals-preview__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-4);
}

.home-goals-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
}

.home-goals-empty__cta {
  border-radius: 0;
  border: 2px solid var(--color-black);
  background: var(--color-jaune-dore);
  color: var(--color-black);
  padding: var(--space-2) var(--space-4);
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-weight: var(--font-semibold);
  cursor: pointer;
  box-shadow: var(--shadow-brutal);
}

.home-goals-preview__card {
  border-radius: 1.5rem;
  padding: var(--space-6);
  background-color: var(--glass-surface);
  border: 1px solid rgba(255, 255, 255, 0.22);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.55);
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
  color: #e5e7eb;
  font-weight: var(--font-medium);
  position: relative;
  z-index: 1;
}

.home-goals-preview__card h3 {
  margin: 0 0 var(--space-2);
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: #f9fafb;
  position: relative;
  z-index: 1;
}

.home-goals-preview__value {
  margin: var(--space-1) 0 var(--space-4);
  font-weight: var(--font-semibold);
  font-size: var(--text-base);
  color: #e5e7eb;
  position: relative;
  z-index: 1;
}

.home-goals-preview__progress {
  width: 100%;
  height: 8px;
  border-radius: var(--radius-full);
  background: rgba(15, 23, 42, 0.6);
  position: relative;
  z-index: 1;
  overflow: hidden;
}

.home-goals-preview__progress span {
  display: block;
  height: 100%;
  border-radius: var(--radius-full);
  background: #f9fafb;
  transition: width var(--transition-slow);
}

.home-explorer-preview__list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-4);
}

.home-explorer-preview__card {
  border-radius: 1.5rem;
  padding: var(--space-6);
  background-color: var(--glass-surface);
  border: 1px solid rgba(255, 255, 255, 0.22);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.55);
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
  color: #f9fafb;
  line-height: var(--leading-tight);
}

.home-explorer-preview__meta {
  margin: 0;
  font-size: var(--text-sm);
  color: #e5e7eb;
  line-height: var(--leading-normal);
  font-weight: bolder;
}

.insights-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: var(--space-4);
}

.insights-summary__item {
  border-radius: 1.25rem;
  border: 1px solid rgba(255, 255, 255, 0.22);
  padding: var(--space-4);
  background-color: var(--glass-surface);
}

.insights-summary__label {
  margin: 0 0 var(--space-2);
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #e5e7eb;
  font-weight: bolder;
}

.insights-summary__value {
  margin: 0;
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: #f9fafb;
}

.home-block .state {
  color: #cbd5f5;
  font-size: var(--text-sm);
  text-align: center;
  padding: var(--space-8) var(--space-4);
  background: rgba(15, 23, 42, 0.8);
  border-radius: var(--radius-lg);
  border: 1px dashed rgba(148, 163, 184, 0.6);
}

#explorer {
  margin-bottom: 2em;
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
