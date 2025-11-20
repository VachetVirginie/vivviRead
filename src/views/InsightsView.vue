<script setup lang="ts">
import { computed, ref } from 'vue'

import { useAppContext } from '../composables/useAppContext'

const { shelf, goals } = useAppContext()

const books = computed(() => shelf.books.value)
const completedBooks = computed(() => shelf.completedBooks.value)

const totalBooks = computed(() => books.value.length)
const completedCount = computed(() => completedBooks.value.length)
const inProgressCount = computed(() => shelf.inProgressBooks.value.length)
const toReadCount = computed(() => shelf.toReadBooks.value.length)
const abandonedCount = computed(() => shelf.abandonedBooks.value.length)

const totalPagesRead = computed(() =>
  books.value.reduce((sum, book) => sum + Math.min(book.currentPage, book.totalPages ?? 0), 0)
)

const lastCompletedBook = computed(() => {
  const list = completedBooks.value
  if (!list.length) return null

  const sorted = [...list].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )

  return sorted[0]
})

const avgPagesPerBookRead = computed(() =>
  completedCount.value > 0 ? Math.round(totalPagesRead.value / completedCount.value) : 0
)

const baseGoals = computed(() => goals.goals.value)

const enrichedGoals = computed(() =>
  baseGoals.value.map((goal) => ({
    ...goal,
    displayCurrentValue: goal.displayCurrentValue ?? goal.currentValue,
  }))
)

const topGoals = computed(() => enrichedGoals.value.slice(0, 3))

const timelineFilter = ref<'all' | 'books' | 'goals'>('all')

const timelineEvents = computed(() => {
  const bookEvents = books.value.map((book) => ({
    id: `book-${book.id}`,
    date: book.updatedAt,
    type: 'book' as const,
    title: book.title,
    subtitle:
      book.status === 'lu'
        ? 'Livre terminé'
        : book.status === 'en_cours'
          ? 'Lecture en cours'
          : book.status === 'a_lire'
            ? 'Ajouté à la pile à lire'
            : 'Livre abandonné',
  }))

  const goalEvents = baseGoals.value.map((goal) => ({
    id: `goal-${goal.id}`,
    date: goal.updatedAt,
    type: 'goal' as const,
    title: goal.title,
    subtitle: 'Objectif mis à jour',
  }))

  const all = [...bookEvents, ...goalEvents].filter((event) => event.date)

  all.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  let filtered = all
  if (timelineFilter.value === 'books') {
    filtered = all.filter((event) => event.type === 'book')
  } else if (timelineFilter.value === 'goals') {
    filtered = all.filter((event) => event.type === 'goal')
  }

  return filtered.slice(0, 8)
})
</script>

<template>
  <main class="insights-page">
    <header class="page-header">
      <div class="page-header__row">
        <div class="page-header__main">
          <p class="section-eyebrow">Insights</p>
          <h1 class="page-header__title">Moments forts de ta lecture</h1>
          <p class="page-header__subtitle">
            Un aperçu détaillé de tes habitudes de lecture : livres terminés, pages lues et objectifs en
            mouvement.
          </p>
        </div>
      </div>
    </header>

    <section class="insights-grid" aria-label="Résumé des insights de lecture">
      <section class="insights-card insights-card--primary" aria-label="Chiffres clés">
        <h2 class="insights-card__title">Chiffres clés</h2>
        <div class="insights-metrics">
          <div class="insights-metrics__item">
            <p class="insights-metrics__label">Livres suivis</p>
            <p class="insights-metrics__value">{{ totalBooks }}</p>
          </div>
          <div class="insights-metrics__item">
            <p class="insights-metrics__label">Livres lus</p>
            <p class="insights-metrics__value">{{ completedCount }}</p>
          </div>
          <div class="insights-metrics__item">
            <p class="insights-metrics__label">Pages lues</p>
            <p class="insights-metrics__value">{{ totalPagesRead }}</p>
          </div>
          <div class="insights-metrics__item">
            <p class="insights-metrics__label">Pages moyennes par livre lu</p>
            <p class="insights-metrics__value">{{ avgPagesPerBookRead }}</p>
          </div>
        </div>
      </section>

      <section class="insights-card" aria-label="Dernier livre terminé">
        <h2 class="insights-card__title">Dernier livre terminé</h2>
        <p v-if="lastCompletedBook" class="insights-highlight__title">
          {{ lastCompletedBook.title }}
        </p>
        <p v-if="lastCompletedBook" class="insights-highlight__meta">
          {{ lastCompletedBook.author }} · {{ lastCompletedBook.totalPages || '—' }} pages
        </p>
        <p v-else class="insights-empty">
          Tu n'as pas encore terminé de livre. Une fois un livre marqué comme "lu", il apparaîtra ici.
        </p>

        <ul class="insights-statuses">
          <li>
            <span class="insights-statuses__label">En cours</span>
            <span class="insights-statuses__value">{{ inProgressCount }}</span>
          </li>
          <li>
            <span class="insights-statuses__label">À lire</span>
            <span class="insights-statuses__value">{{ toReadCount }}</span>
          </li>
          <li>
            <span class="insights-statuses__label">Abandonnés</span>
            <span class="insights-statuses__value">{{ abandonedCount }}</span>
          </li>
        </ul>
      </section>

      <section class="insights-card" aria-label="Objectifs en mouvement">
        <h2 class="insights-card__title">Objectifs en mouvement</h2>
        <ul v-if="topGoals.length" class="insights-goals">
          <li v-for="goal in topGoals" :key="goal.id" class="insights-goals__item">
            <div class="insights-goals__header">
              <p class="insights-goals__title">{{ goal.title }}</p>
              <p class="insights-goals__meta">
                {{ goal.displayCurrentValue ?? goal.currentValue }} / {{ goal.targetValue }} {{ goal.unit }}
              </p>
            </div>
            <div class="insights-goals__progress">
              <span
                :style="{
                  width: `${Math.min(
                    100,
                    Math.round(
                      (((goal.displayCurrentValue ?? goal.currentValue) / goal.targetValue) || 0) * 100,
                    ),
                  )}%`,
                }"
              />
            </div>
          </li>
        </ul>
        <p v-else class="insights-empty">
          Aucun objectif défini pour le moment. Crée un objectif depuis la page d'accueil ou l'onglet Objectifs.
        </p>
      </section>

      <section class="insights-card insights-card--timeline" aria-label="Dernières activités">
        <h2 class="insights-card__title">Dernières activités</h2>
        <div class="insights-timeline-filters" aria-label="Filtrer la timeline">
          <button
            type="button"
            :class="['insights-timeline-filter', { 'insights-timeline-filter--active': timelineFilter === 'all' }]"
            @click="timelineFilter = 'all'"
          >
            Tout
          </button>
          <button
            type="button"
            :class="['insights-timeline-filter', { 'insights-timeline-filter--active': timelineFilter === 'books' }]"
            @click="timelineFilter = 'books'"
          >
            Livres
          </button>
          <button
            type="button"
            :class="['insights-timeline-filter', { 'insights-timeline-filter--active': timelineFilter === 'goals' }]"
            @click="timelineFilter = 'goals'"
          >
            Objectifs
          </button>
        </div>
        <ul v-if="timelineEvents.length" class="insights-timeline">
          <li v-for="event in timelineEvents" :key="event.id" class="insights-timeline__item">
            <div class="insights-timeline__marker" />
            <div class="insights-timeline__content">
              <p class="insights-timeline__title">{{ event.title }}</p>
              <p class="insights-timeline__subtitle">{{ event.subtitle }}</p>
              <p class="insights-timeline__date">
                {{ new Date(event.date).toLocaleDateString() }}
              </p>
            </div>
          </li>
        </ul>
        <p v-else class="insights-empty">
          Les prochaines activités (livres terminés, objectifs mis à jour) apparaîtront ici au fil du temps.
        </p>
      </section>
    </section>
  </main>
</template>

<style scoped>
.insights-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-8) var(--space-4) var(--space-12);
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.insights-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
  gap: var(--space-6);
}

@media (max-width: 900px) {
  .insights-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

.insights-card {
  background: var(--color-white);
  border-radius: 0;
  border: 3px solid var(--color-black);
  box-shadow: var(--shadow-brutal);
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  position: relative;
}

.insights-card--primary::before {
  content: '';
  position: absolute;
  inset: 0;
  border-top: 4px solid var(--color-jaune-dore);
}

.insights-card__title {
  margin: 0;
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
}

.insights-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: var(--space-4);
}

.insights-metrics__item {
  background: var(--color-neutral-50);
  border-radius: 0;
  border: 2px solid var(--color-black);
  padding: var(--space-3) var(--space-4);
}

.insights-metrics__label {
  margin: 0 0 var(--space-2);
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--color-neutral-600);
}

.insights-metrics__value {
  margin: 0;
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
}

.insights-highlight__title {
  margin: 0 0 var(--space-1);
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
}

.insights-highlight__meta {
  margin: 0 0 var(--space-4);
  font-size: var(--text-sm);
  color: var(--color-neutral-600);
}

.insights-statuses {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: var(--space-3);
}

.insights-statuses__label {
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--color-neutral-600);
}

.insights-statuses__value {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
}

.insights-goals {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.insights-goals__item {
  border-radius: 0;
  border: 2px solid var(--color-black);
  padding: var(--space-3) var(--space-4);
  background: var(--color-neutral-50);
}

.insights-goals__header {
  display: flex;
  justify-content: space-between;
  gap: var(--space-3);
  align-items: baseline;
  margin-bottom: var(--space-2);
}

.insights-goals__title {
  margin: 0;
  font-weight: var(--font-semibold);
}

.insights-goals__meta {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--color-neutral-700);
}

.insights-goals__progress {
  width: 100%;
  height: 8px;
  border-radius: 0;
  border: 2px solid var(--color-black);
  background: var(--color-white);
  overflow: hidden;
}

.insights-goals__progress span {
  display: block;
  height: 100%;
  background: var(--color-neutral-900);
}

.insights-card--timeline {
  grid-column: span 2;
}

@media (max-width: 900px) {
  .insights-card--timeline {
    grid-column: span 1;
  }
}

.insights-timeline {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.insights-timeline__item {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--space-3);
  align-items: flex-start;
}

.insights-timeline__marker {
  width: 12px;
  height: 12px;
  border-radius: 999px;
  border: 2px solid var(--color-black);
  background: var(--color-jaune-dore);
  margin-top: 0.25rem;
}

.insights-timeline__content {
  border-left: 2px dashed var(--color-neutral-300);
  padding-left: var(--space-3);
}

.insights-timeline__title {
  margin: 0 0 0.15rem;
  font-weight: var(--font-semibold);
}

.insights-timeline__subtitle {
  margin: 0 0 0.15rem;
  font-size: var(--text-sm);
  color: var(--color-neutral-700);
}

.insights-timeline__date {
  margin: 0;
  font-size: var(--text-xs);
  color: var(--color-neutral-500);
}

.insights-empty {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--color-neutral-600);
}

.insights-timeline-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-bottom: var(--space-3);
}

.insights-timeline-filter {
  border-radius: 0;
  border: 2px solid var(--color-black);
  background: var(--color-white);
  color: var(--color-black);
  padding: 0.3rem 0.8rem;
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  cursor: pointer;
  box-shadow: var(--shadow-subtle);
}

.insights-timeline-filter--active {
  background: var(--color-jaune-dore);
  box-shadow: 3px 3px 0 var(--color-black);
}
</style>
