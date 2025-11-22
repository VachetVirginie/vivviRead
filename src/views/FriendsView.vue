<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAppContext } from '../composables/useAppContext'
import { useAuth } from '../composables/useAuth'
import { useToasts } from '../composables/useToasts'
import { useBookRecommendations, type BookRecommendation } from '../composables/useBookRecommendations'

const router = useRouter()
const route = useRoute()
const { shelf, friendsFeed, friendsRelations } = useAppContext()
const { user } = useAuth()
const { showToast } = useToasts()

const {
  incoming: incomingRecommendations,
  loading: recommendationsLoading,
  unreadCount,
  loadIncoming: loadIncomingRecommendations,
  markAsSeen,
  markAsAddedToList,
  dismiss,
} = useBookRecommendations()

const activities = computed(() => friendsFeed.activities.value)
const hasActivities = computed(() => activities.value.length > 0)

const currentUserId = computed(() => user.value?.id ?? null)

const hasRecommendations = computed(() => incomingRecommendations.value.length > 0)

const feedFilter = ref<'all' | 'books' | 'goals' | 'recommendations'>('all')

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

function handleSetFilter(filter: 'all' | 'books' | 'goals' | 'recommendations') {
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

  showToast({
    message: 'Ajouté à ta bibliothèque',
    actionLabel: 'Voir',
    onAction: () => {
      router.push({ name: 'library' })
    },
    variant: 'success',
  })
}

async function handleAddRecommendationToShelf(rec: BookRecommendation) {
  if (!rec.bookTitle || !rec.bookAuthor) return

  if (!shelf.isInShelf(rec.bookTitle, rec.bookAuthor)) {
    shelf.addFromSearch({
      title: rec.bookTitle,
      author: rec.bookAuthor,
      coverUrl: rec.coverUrl,
    })
  }

  await markAsAddedToList(rec.id)

  showToast({
    message: 'Ajouté à ta bibliothèque',
    variant: 'success',
  })
}

async function handleMarkRecommendationSeen(rec: BookRecommendation) {
  if (rec.status === 'sent') {
    await markAsSeen(rec.id)
  }
}

async function handleDismissRecommendation(rec: BookRecommendation) {
  await dismiss(rec.id)
}

onMounted(() => {
  friendsFeed.loadFriendsActivities()
  friendsRelations.loadRelations()
  void loadIncomingRecommendations()

  const initialFilter = route.query.filter
  if (initialFilter === 'recommendations') {
    feedFilter.value = 'recommendations'
  }
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
          <button
            type="button"
            class="friends-feed-filter"
            :class="{ 'friends-feed-filter--active': feedFilter === 'recommendations' }"
            @click="handleSetFilter('recommendations')"
          >
            Recommandations
            <span v-if="unreadCount" class="friends-feed-filter__badge">
              {{ unreadCount }}
            </span>
          </button>
        </div>

        <template v-if="feedFilter === 'recommendations'">
          <p v-if="recommendationsLoading && !hasRecommendations" class="friends-empty">
            Chargement de tes recommandations…
          </p>

          <ul v-else-if="hasRecommendations" class="friends-feed">
            <li
              v-for="rec in incomingRecommendations"
              :key="rec.id"
              class="friends-feed__item"
            >
              <div class="friends-feed__header">
                <div class="friends-feed__header-main">
                  <div
                    class="friends-feed__avatar"
                    :style="{ backgroundColor: avatarColorForName(rec.fromUserName) }"
                    aria-hidden="true"
                  >
                    {{ avatarInitialForName(rec.fromUserName) }}
                  </div>
                  <span class="friends-feed__name">
                    {{ rec.fromUserName || 'Un lecteur' }}
                  </span>
                  <span class="friends-feed__badge">RECOMMANDATION</span>
                </div>
                <span class="friends-feed__date">
                  {{ new Date(rec.createdAt).toLocaleDateString() }}
                </span>
              </div>

              <p class="friends-feed__summary">
                t’a recommandé :
              </p>
              <p class="friends-feed__detail">
                « {{ rec.bookTitle }} »
                <span v-if="rec.bookAuthor">· {{ rec.bookAuthor }}</span>
              </p>

              <p v-if="rec.message" class="friends-feed__detail">
                « {{ rec.message }} »
              </p>

              <div class="friends-feed__actions-row">
                <button
                  type="button"
                  class="friends-feed__action"
                  :disabled="rec.status === 'added_to_list'"
                  @click="handleAddRecommendationToShelf(rec)"
                >
                  {{
                    rec.status === 'added_to_list'
                      ? 'Déjà ajouté à ta bibliothèque'
                      : 'Ajouter à ma bibliothèque'
                  }}
                </button>
                <button
                  v-if="rec.status === 'sent'"
                  type="button"
                  class="friends-feed__action friends-feed__action--secondary"
                  @click="handleMarkRecommendationSeen(rec)"
                >
                  Marquer comme vu
                </button>
                <button
                  type="button"
                  class="friends-feed__link"
                  @click="handleDismissRecommendation(rec)"
                >
                  Ignorer
                </button>
              </div>
            </li>
          </ul>

          <p v-else class="friends-empty">
            Aucun ami ne t’a encore recommandé de livre. Quand ce sera le cas, tout apparaîtra ici.
          </p>
        </template>

        <template v-else>
          <p v-if="friendsFeed.loading && !hasActivities" class="friends-empty">
            Chargement des lectures de tes amis…
          </p>

          <div v-else-if="hasActivities" class="friends-feed-groups">
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
                      <button
                        type="button"
                        class="friends-feed__name-button"
                        @click="router.push({ name: 'readerProfile', params: { id: activity.userId } })"
                      >
                        <span class="friends-feed__name">{{ activity.userName }}</span>
                      </button>
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
                  <span
                    v-if="activity.bookTitle && activity.bookAuthor && shelf.isInShelf(activity.bookTitle, activity.bookAuthor)"
                    class="friends-feed__tag"
                  >
                    Ajouté
                  </span>
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

          <p v-else class="friends-empty">
            Aucune activité pour le moment. Tes propres lectures et objectifs, ainsi que ceux de tes amis suivis,
            apparaîtront ici.
          </p>
        </template>
      </section>
    </section>
  </main>
</template>

<style scoped>
.friends-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-12) var(--space-6) var(--space-16);
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
  color: #e5e7eb;
}

.friends-layout {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  margin-bottom: 2em;
}

.friends-card {
  background-color: var(--glass-surface);
  border-radius: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.22);
  box-shadow: 0 22px 45px rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(22px);
  -webkit-backdrop-filter: blur(22px);
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.friends-card--feed {
  border-top: 2px solid rgba(250, 250, 250, 0.5);
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
  padding: var(--space-2) var(--space-3);
  border-radius: 0;
  border: 2px solid var(--color-black);
  background: var(--color-white);
  min-width: 120px;
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
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.7);
  background: transparent;
  color: #cbd5f5;
  padding: 0.3rem 0.8rem;
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  cursor: pointer;
  box-shadow: none;
}

.friends-feed-filter--active {
  background: #f9fafb;
  color: #020617;
  border-color: transparent;
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
  color: #cbd5f5;
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
  color: #9ca3af;
}

.friends-feed__item {
  border-radius: 1.25rem;
  border: 1px solid rgba(148, 163, 184, 0.7);
  padding: var(--space-3) var(--space-4);
  background: rgba(15, 23, 42, 0.85);
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
  border: 2px solid rgba(255, 255, 255, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-bold);
  font-size: 0.9rem;
  color: #020617;
}

.friends-feed__name-button {
  border: none;
  background: transparent;
  padding: 0;
  margin: 0;
  cursor: pointer;
}

.friends-feed__name {
  font-weight: var(--font-semibold);
  color: var(--color-neutral-100);
}

.friends-feed__badge {
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.7);
  padding: 0.1rem 0.5rem;
  font-size: var(--text-xxs, 0.65rem);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  background: rgba(15, 23, 42, 0.6);
  color: #e5e7eb;
}

.friends-feed__date {
  font-size: var(--text-xs);
  color: #9ca3af;
}

.friends-feed__summary {
  margin: 0;
  font-size: var(--text-sm);
  color: #e5e7eb;
}

.friends-feed__detail {
  margin: 0;
  font-size: var(--text-sm);
  color: #cbd5f5;
}

.friends-feed__action {
  align-self: flex-start;
  margin-top: 0.35rem;
  border-radius: 999px;
  border: none;
  background: #f9fafb;
  color: #020617;
  padding: 0.25rem 0.8rem;
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  cursor: pointer;
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.7);
}

.friends-feed__action:hover {
  background: #e5e7eb;
}

.friends-feed__actions-row {
  margin-top: 0.35rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.friends-feed__tag {
  align-self: flex-start;
  margin-top: 0.15rem;
  padding: 0.1rem 0.5rem;
  font-size: var(--text-xxs, 0.65rem);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  background: var(--accent-secondary);
  color: #020617;
  border-radius: 999px;
  border: 1px solid var(--color-black);
}

.friends-feed__link {
  border: none;
  background: transparent;
  color: #9ca3af;
  font-size: var(--text-xs);
  text-decoration: underline;
  cursor: pointer;
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
