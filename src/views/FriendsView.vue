<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAppContext } from '../composables/useAppContext'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { shelf, friendsFeed, friendsRelations } = useAppContext()
const { user } = useAuth()

const activities = computed(() => friendsFeed.activities.value)
const hasActivities = computed(() => activities.value.length > 0)

const currentUserId = computed(() => user.value?.id ?? null)

const feedFilter = ref<'all' | 'books' | 'goals'>('all')

const filteredActivities = computed(() => {
  if (feedFilter.value === 'books') {
    return activities.value.filter((activity) => activity.type.startsWith('book_'))
  }

  if (feedFilter.value === 'goals') {
    return activities.value.filter((activity) => activity.type.startsWith('goal_'))
  }

  return activities.value
})

function formatDateLabel(dateString: string): string {
  const date = new Date(dateString)
  const today = new Date()

  const day = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const diffMs = todayDay.getTime() - day.getTime()
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "Aujourd'hui"
  if (diffDays === 1) return 'Hier'

  return date.toLocaleDateString()
}

function stringToColor(input: string): string {
  const colors = ['#F97316', '#F97373', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#FBBF24']
  let hash = 0
  for (let i = 0; i < input.length; i += 1) {
    hash = input.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % colors.length
  return colors[index] ?? '#111827'
}

function avatarInitialForName(name: string | null): string {
  if (!name) return '?'
  const trimmed = name.trim()
  return trimmed.charAt(0).toUpperCase() || '?'
}

function avatarColorForName(name: string | null): string {
  return stringToColor(name || '?')
}

function badgeForType(type: string): string {
  if (type === 'book_added') return 'LIVRE AJOUTÉ'
  if (type === 'book_finished') return 'LIVRE TERMINÉ'
  if (type === 'goal_created') return 'OBJECTIF CRÉÉ'
  if (type === 'goal_completed') return 'OBJECTIF ATTEINT'
  return 'ACTIVITÉ'
}

interface ActivityGroup {
  label: string
  items: typeof activities.value
}

const groupedActivities = computed(() => {
  const groups: ActivityGroup[] = []
  let currentKey: string | null = null
  let currentGroup: ActivityGroup | null = null

  for (const activity of filteredActivities.value) {
    const d = new Date(activity.createdAt)
    const key = d.toISOString().slice(0, 10)

    if (key !== currentKey) {
      currentKey = key
      currentGroup = {
        label: formatDateLabel(activity.createdAt),
        items: [],
      }
      groups.push(currentGroup)
    }

    currentGroup!.items.push(activity)
  }

  return groups
})

function handleSetFilter(filter: 'all' | 'books' | 'goals') {
  feedFilter.value = filter
}

function handleAddToShelf(activity: (typeof activities.value)[number]) {
  if (!activity.bookTitle || !activity.bookAuthor) return

  if (shelf.isInShelf(activity.bookTitle, activity.bookAuthor)) {
    return
  }

  shelf.addFromSearch({
    title: activity.bookTitle,
    author: activity.bookAuthor,
    totalPages: activity.totalPages,
    coverUrl: activity.coverUrl,
  })
}

onMounted(() => {
  friendsFeed.loadFriendsActivities()
  friendsRelations.loadRelations()
})
</script>

<template>
  <main class="friends-page">
    <header class="page-header">
      <div class="page-header__row">
        <div class="page-header__main">
          <p class="section-eyebrow">Communauté</p>
          <h1 class="page-header__title">Flux de tes amis</h1>
          <p class="page-header__subtitle">
            Vois ce que lisent les personnes que tu suis : livres terminés, ajouts récents et objectifs atteints.
          </p>
        </div>
        <div class="page-header__actions">
          <button
            type="button"
            class="page-header__action"
            @click="router.push({ name: 'friendsDiscover' })"
          >
            Trouver des amis
          </button>
        </div>
      </div>
    </header>

    <section class="friends-layout" aria-label="Flux d'activités des amis">
      <section class="friends-card friends-card--feed" aria-label="Activités détaillées des amis">
        <h2 class="friends-card__title">Activités récentes</h2>

        <div class="friends-network-bar">
          <div class="friends-network-bar__item">
            <span class="friends-network-bar__label">Tu suis</span>
            <span class="friends-network-bar__value">{{ friendsRelations.followingCount }}</span>
          </div>
          <div class="friends-network-bar__item">
            <span class="friends-network-bar__label">Te suivent</span>
            <span class="friends-network-bar__value">{{ friendsRelations.followersCount }}</span>
          </div>
          <p v-if="!friendsRelations.hasFollowing" class="friends-network-bar__hint">
            Commence par suivre des amis depuis "Trouver des amis" pour voir leurs lectures ici.
          </p>
        </div>

        <div class="friends-feed-filters" aria-label="Filtrer les activités">
          <button
            type="button"
            class="friends-feed-filter"
            :class="{ 'friends-feed-filter--active': feedFilter === 'all' }"
            @click="handleSetFilter('all')"
          >
            Tout
          </button>
          <button
            type="button"
            class="friends-feed-filter"
            :class="{ 'friends-feed-filter--active': feedFilter === 'books' }"
            @click="handleSetFilter('books')"
          >
            Livres
          </button>
          <button
            type="button"
            class="friends-feed-filter"
            :class="{ 'friends-feed-filter--active': feedFilter === 'goals' }"
            @click="handleSetFilter('goals')"
          >
            Objectifs
          </button>
        </div>

        <p v-if="friendsFeed.loading && !hasActivities" class="friends-empty">
          Chargement des lectures de tes amis…
        </p>

        <div v-if="hasActivities" class="friends-feed-groups">
          <section
            v-for="group in groupedActivities"
            :key="group.label"
            class="friends-feed-group"
          >
            <p class="friends-feed__group-label">
              {{ group.label }}
            </p>
            <ul class="friends-feed">
              <li
                v-for="activity in group.items"
                :key="activity.id"
                class="friends-feed__item"
              >
                <div class="friends-feed__header">
                  <div class="friends-feed__header-main">
                    <div
                      class="friends-feed__avatar"
                      :style="{ backgroundColor: avatarColorForName(activity.userName) }"
                      aria-hidden="true"
                    >
                      {{ avatarInitialForName(activity.userName) }}
                    </div>
                    <span class="friends-feed__name">{{ activity.userName }}</span>
                    <span class="friends-feed__badge">{{ badgeForType(activity.type) }}</span>
                  </div>
                  <span class="friends-feed__date">
                    {{ new Date(activity.createdAt).toLocaleDateString() }}
                  </span>
                </div>
                <p class="friends-feed__summary">
                  {{ activity.summary }}
                </p>
                <p v-if="activity.bookTitle" class="friends-feed__detail">
                  « {{ activity.bookTitle }} »
                  <span v-if="activity.bookAuthor">· {{ activity.bookAuthor }}</span>
                </p>
                <p v-else-if="activity.goalTitle" class="friends-feed__detail">
                  Objectif : {{ activity.goalTitle }}
                </p>
                <button
                  v-if="activity.bookTitle && activity.bookAuthor && activity.userId !== currentUserId"
                  type="button"
                  class="friends-feed__action"
                  :disabled="shelf.isInShelf(activity.bookTitle, activity.bookAuthor)"
                  @click="handleAddToShelf(activity)"
                >
                  {{
                    shelf.isInShelf(activity.bookTitle, activity.bookAuthor)
                      ? 'Déjà dans ta bibliothèque'
                      : 'Ajouter à ma liste'
                  }}
                </button>
              </li>
            </ul>
          </section>
        </div>

        <p v-else-if="!friendsFeed.loading" class="friends-empty">
          Aucune activité pour le moment. Tes propres lectures et objectifs, ainsi que ceux de tes amis suivis,
          apparaîtront ici.
        </p>
      </section>
    </section>
  </main>
</template>

<style scoped>
.friends-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-8) var(--space-4) var(--space-12);
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.friends-layout {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.friends-card {
  background: var(--color-white);
  border-radius: 0;
  border: 3px solid var(--color-black);
  box-shadow: var(--shadow-brutal);
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.friends-card--feed {
  border-color: var(--color-jaune-dore);
}

.friends-card__title {
  margin: 0;
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
}

.friends-network-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border-radius: 0;
  border: 2px solid var(--color-black);
  background: var(--color-neutral-50);
  margin-bottom: var(--space-4);
}

.friends-network-bar__item {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.friends-network-bar__label {
  font-size: var(--text-xxs, 0.65rem);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--color-neutral-600);
}

.friends-network-bar__value {
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
}

.friends-network-bar__hint {
  margin: 0 0 0 auto;
  font-size: var(--text-xs);
  color: var(--color-neutral-600);
}

.friends-feed-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-bottom: var(--space-3);
}

.friends-feed-filter {
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

.friends-feed-filter--active {
  background: var(--color-jaune-dore);
  box-shadow: 3px 3px 0 var(--color-black);
}

.friends-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: var(--space-3);
}

.friends-stats__item {
  background: var(--color-neutral-50);
  border-radius: 0;
  border: 2px solid var(--color-black);
  padding: var(--space-3) var(--space-4);
}

.friends-stats__label {
  margin: 0 0 var(--space-1);
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--color-neutral-600);
}

.friends-stats__value {
  margin: 0;
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
}

.friends-empty {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--color-neutral-600);
}

.friends-feed {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.friends-feed-groups {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.friends-feed-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.friends-feed__group-label {
  margin: 0 0 0.35rem;
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--color-neutral-600);
}

.friends-feed__item {
  border-radius: 0;
  border: 2px solid var(--color-black);
  padding: var(--space-3) var(--space-4);
  background: var(--color-neutral-50);
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.friends-feed__header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: var(--space-3);
}

.friends-feed__header-main {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.friends-feed__avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 999px;
  border: 2px solid var(--color-black);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-bold);
  font-size: 0.9rem;
  color: #ffffff;
}

.friends-feed__name {
  font-weight: var(--font-semibold);
}

.friends-feed__badge {
  border-radius: 0;
  border: 2px solid var(--color-black);
  padding: 0.1rem 0.4rem;
  font-size: var(--text-xxs, 0.65rem);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  background: var(--color-jaune-dore);
}

.friends-feed__date {
  font-size: var(--text-xs);
  color: var(--color-neutral-500);
}

.friends-feed__summary {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--color-neutral-900);
}

.friends-feed__detail {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--color-neutral-700);
}

.friends-feed__action {
  align-self: flex-start;
  margin-top: 0.35rem;
  border-radius: 0;
  border: 2px solid var(--color-black);
  background: var(--color-white);
  color: var(--color-black);
  padding: 0.25rem 0.8rem;
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  cursor: pointer;
  box-shadow: var(--shadow-subtle);
}

.friends-feed__action:hover {
  background: var(--color-jaune-dore);
  box-shadow: 3px 3px 0 var(--color-black);
}

@media (max-width: 640px) {
  .friends-feed__header-main {
    flex-wrap: wrap;
    gap: 0.35rem;
  }

  .friends-feed__badge {
    align-self: center;
    text-align: center;
  }
}
</style>
