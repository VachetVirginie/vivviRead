<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

import { useAppContext } from '../composables/useAppContext'
import { useSupabaseTest } from '../composables/useSupabaseTest'
import { useAuth } from '../composables/useAuth'
import type { GoogleBookVolume } from '../services/googleBooks'

import HeroSection from '../components/sections/HeroSection.vue'
import StatsSection from '../components/sections/StatsSection.vue'
import QuickNav from '../components/sections/QuickNav.vue'
import ModalAddBook from '../components/sections/modals/ModalAddBook.vue'
import ModalAddGoal from '../components/sections/modals/ModalAddGoal.vue'

/* -------- GLOBAL STATE -------- */
const { shelf, goals, explorer, modals } = useAppContext()
useSupabaseTest()

const {
  user,
  profile,
  role,
  signOut,
} = useAuth()

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
    <header class="page-header home-header">
      <div class="page-header__row">
        <div class="page-header__main">
          <p class="section-eyebrow">Bienvenue</p>
          <h2 class="page-header__title">Ta base pour suivre toutes tes lectures.</h2>
          <p class="page-header__subtitle">
            Retrouve ta progression, tes objectifs et ta prochaine lecture en un coup d'œil.
          </p>
        </div>
        <div class="page-header__actions">
          <RouterLink
            to="/livres"
            class="page-header__action page-header__action--primary"
          >
            Voir ma bibliothèque
          </RouterLink>
        </div>
      </div>
    </header>

    <section class="home-block" aria-label="Profil">
      <header class="home-block__header">
        <div class="home-block__header-main">
          <p class="section-eyebrow">Compte</p>
          <h2>Profil et rôle</h2>
          <p class="home-block__subtitle">
            Tu es connecté·e à VivviRead. Utilise le bouton ci-dessous pour te déconnecter.
          </p>
        </div>
      </header>

      <div class="auth-block">
        <div class="auth-block__status">
          <p v-if="user">
            Connecté en tant que
            <strong>{{ profile?.full_name || user.email }}</strong>
            <br />
            Rôle : <strong>{{ role }}</strong>
          </p>
          <p v-else>
            Non connecté.
          </p>
        </div>

        <div class="auth-block__actions">
          <button
            v-if="user"
            type="button"
            class="page-header__action"
            @click="signOut()"
          >
            Se déconnecter
          </button>
        </div>
      </div>
    </section>

    <HeroSection
      :hero-session="heroSession"
      :loading="explorerLoading"
      @open-modal="modals.open"
      @fetch-books="explorer.submitSearch"
    />

    <QuickNav :links="quickNavLinks" @open-modal="modals.open" />

    <StatsSection :stats="stats" />

    <section id="goals" class="home-block" aria-label="Aperçu de mes objectifs">
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

      <div v-if="goalsPreview.length" class="home-goals-preview__grid">
        <article
          v-for="goal in goalsPreview"
          :key="goal.id"
          class="home-goals-preview__card"
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

    <section id="explorer" class="home-block" aria-label="Découvrir de nouvelles lectures">
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

      <div v-if="hasExplorerResults" class="home-explorer-preview__list">
        <article
          v-for="book in explorerPreviewResults"
          :key="book.id"
          class="home-explorer-preview__card"
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
.page-header.home-header {
  position: static;
  background: #ffffff;
  box-shadow: none;
}

@media (min-width: 1024px) {
  .page-header.home-header {
    margin-left: calc(-50vw + 50%);
    margin-right: calc(-50vw + 50%);
    padding-left: calc(50vw - 50% + 1.5rem);
    padding-right: calc(50vw - 50% + 1.5rem);
  }
}

.home-block {
  background: #ffffff;
  border-radius: 1.5rem;
  padding: 1.6rem 1.5rem 1.4rem;
  border: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.home-block__header {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem 1rem;
}

.home-block__header-main h2 {
  margin: 0 0 0.4rem;
  font-size: 1.2rem;
}

.home-block__subtitle {
  margin: 0;
  font-size: 0.9rem;
  color: #4b5563;
}

.home-block__link {
  font-size: 0.9rem;
  font-weight: 500;
  color: #16a34a;
  text-decoration: none;
}

.home-block__link:hover {
  text-decoration: underline;
  color: #166534;
}

.home-block__hint {
  margin: 0;
  font-size: 0.85rem;
  color: #4b5563;
}

.home-goals-preview__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

.home-goals-preview__card {
  border-radius: 1.25rem;
  padding: 1.1rem;
  background: #facc15;
  border: 1px solid #eab308;
}

.home-goals-preview__label {
  margin: 0 0 0.35rem;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.15em;
  color: #16a34a;
}

.home-goals-preview__value {
  margin: 0.25rem 0;
  font-weight: 600;
}

.home-goals-preview__progress {
  width: 100%;
  height: 6px;
  border-radius: 999px;
  background: #e5e7eb;
}

.home-goals-preview__progress span {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: #111827;
}

.home-explorer-preview__list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.9rem;
}

.home-explorer-preview__card {
  border-radius: 1.1rem;
  padding: 1rem;
  background: #fefce8;
  border: 1px solid rgba(202, 138, 4, 0.26);
}

.home-explorer-preview__meta {
  margin: 0.35rem 0 0;
  font-size: 0.9rem;
  color: #4b5563;
}

.home-block .state {
  color: #4b5563;
}

@media (min-width: 768px) {
  .home-block__header-main h2 {
    font-size: 1.35rem;
  }
}
</style>
