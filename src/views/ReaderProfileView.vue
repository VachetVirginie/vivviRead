<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '../lib/supabaseClient'
import { useAppContext } from '../composables/useAppContext'
import { useAuth } from '../composables/useAuth'

interface PublicProfile {
  id: string
  full_name: string | null
  username: string | null
  avatar_url: string | null
}

interface ProfileActivity {
  id: string
  type: string
  createdAt: string
  userName: string | null
  summary: string
  bookTitle?: string
  bookAuthor?: string
}

const route = useRoute()
const router = useRouter()
const { friendsRelations } = useAppContext()
const { user } = useAuth()

const profile = ref<PublicProfile | null>(null)
const activities = ref<ProfileActivity[]>([])
const loading = ref(true)
const errorMessage = ref<string | null>(null)
const stats = ref<{ totalBooks: number; completed: number; totalPagesRead: number } | null>(null)

const targetUserId = computed(() => (route.params.id as string | undefined) ?? null)
const currentUserId = computed(() => user.value?.id ?? null)
const isOwnProfile = computed(
  () => !!currentUserId.value && !!targetUserId.value && currentUserId.value === targetUserId.value,
)

const isFollowing = computed(() =>
  targetUserId.value ? friendsRelations.isFollowing(targetUserId.value) : false,
)

const followLabel = computed(() => {
  if (isOwnProfile.value) return 'C’est toi'
  return isFollowing.value ? 'Suivi' : 'Suivre'
})

const followDisabled = computed(() => isOwnProfile.value || !targetUserId.value)

function stringToColor(input: string): string {
  const colors = ['#F97316', '#F97373', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#FBBF24']
  let hash = 0
  for (let i = 0; i < input.length; i += 1) {
    hash = input.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % colors.length
  return colors[index] ?? '#111827'
}

const displayName = computed(() => profile.value?.username || profile.value?.full_name || 'Lecteur')
const avatarInitial = computed(() => displayName.value.charAt(0).toUpperCase())
const avatarColor = computed(() => stringToColor(displayName.value))

function activitySummary(type: string): string {
  if (type === 'book_finished') return 'a terminé un livre'
  if (type === 'book_added') return 'a ajouté un livre à sa bibliothèque'
  if (type === 'goal_completed') return 'a atteint un objectif'
  if (type === 'goal_created') return 'a créé un objectif'
  return 'a mis à jour sa lecture'
}

async function loadProfile() {
  loading.value = true
  errorMessage.value = null

  try {
    const id = targetUserId.value
    if (!id) {
      errorMessage.value = 'Profil introuvable.'
      return
    }

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, username, avatar_url')
      .eq('id', id)
      .single()

    if (profileError || !profileData) {
      throw profileError || new Error('Profil introuvable')
    }

    profile.value = profileData as PublicProfile

    const { data: shelfRows, error: shelfError } = await supabase
      .from('user_books')
      .select('status, total_pages, current_page')
      .eq('user_id', id)

    if (shelfError) {
      throw shelfError
    }

    const rows = (shelfRows ?? []) as { status: string; total_pages: number | null; current_page: number | null }[]
    const totalBooks = rows.length
    const completed = rows.filter((row) => row.status === 'lu').length
    const totalPagesRead = rows.reduce((sum, row) => {
      const total = row.total_pages ?? 0
      const current = row.current_page ?? 0
      return sum + Math.min(current, total)
    }, 0)

    stats.value = { totalBooks, completed, totalPagesRead }

    const { data: rawActivities, error: activitiesError } = await supabase
      .from('activities')
      .select('id, type, payload, created_at')
      .eq('user_id', id)
      .order('created_at', { ascending: false })
      .limit(10)

    if (activitiesError) {
      throw activitiesError
    }

    activities.value = (rawActivities ?? []).map((row: any) => {
      const payload = (row.payload ?? {}) as any
      const type = row.type as string

      return {
        id: row.id as string,
        type,
        createdAt: row.created_at as string,
        userName: displayName.value,
        summary: activitySummary(type),
        bookTitle: payload.title ?? undefined,
        bookAuthor: payload.author ?? undefined,
      }
    })
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : String(err)
  } finally {
    loading.value = false
  }
}

async function handleToggleFollow() {
  const id = targetUserId.value
  if (!id || followDisabled.value) return

  if (isFollowing.value) {
    await friendsRelations.unfollowUser(id)
  } else {
    await friendsRelations.followUser(id)
  }
}

onMounted(() => {
  friendsRelations.loadRelations()
  void loadProfile()
})
</script>

<template>
  <main class="reader-page">
    <header class="page-header">
      <div class="page-header__row">
        <div class="page-header__main">
          <p class="section-eyebrow">Lecteur</p>
          <h1 class="page-header__title">Profil public</h1>
        </div>
        <div class="page-header__actions">
          <button
            type="button"
            class="page-header__action"
            @click="router.back()"
          >
            Retour
          </button>
        </div>
      </div>
    </header>

    <section class="reader-card" aria-label="Profil public du lecteur">
      <div class="reader-header">
        <div
          class="reader-avatar"
          :style="{ backgroundColor: avatarColor, color: '#ffffff' }"
          aria-hidden="true"
        >
          {{ avatarInitial }}
        </div>
        <div class="reader-header__main">
          <h2 class="reader-name">{{ displayName }}</h2>
          <p v-if="profile?.username" class="reader-username">@{{ profile.username }}</p>
          <div class="reader-stats">
            <div class="reader-stats__item">
              <span class="reader-stats__label">Livres suivis</span>
              <span class="reader-stats__value">{{ stats?.totalBooks ?? 0 }}</span>
            </div>
            <div class="reader-stats__item">
              <span class="reader-stats__label">Livres lus</span>
              <span class="reader-stats__value">{{ stats?.completed ?? 0 }}</span>
            </div>
            <div class="reader-stats__item">
              <span class="reader-stats__label">Pages lues</span>
              <span class="reader-stats__value">{{ stats?.totalPagesRead ?? 0 }}</span>
            </div>
          </div>
        </div>
        <button
          type="button"
          class="page-header__action page-header__action--primary reader-follow"
          :disabled="followDisabled"
          @click="handleToggleFollow"
        >
          {{ followLabel }}
        </button>
      </div>

      <section class="reader-activities" aria-label="Dernières activités publiques">
        <h3 class="reader-activities__title">Dernières activités</h3>
        <p v-if="loading" class="reader-state">Chargement du profil…</p>
        <p v-else-if="errorMessage" class="reader-state reader-state--error">
          {{ errorMessage }}
        </p>
        <ul v-else-if="activities.length" class="reader-activities__list">
          <li
            v-for="activity in activities"
            :key="activity.id"
            class="reader-activities__item"
          >
            <p class="reader-activities__summary">
              <strong>{{ activity.userName }}</strong> {{ activity.summary }}
            </p>
            <p v-if="activity.bookTitle" class="reader-activities__detail">
              « {{ activity.bookTitle }} »
              <span v-if="activity.bookAuthor">· {{ activity.bookAuthor }}</span>
            </p>
            <p class="reader-activities__date">
              {{ new Date(activity.createdAt).toLocaleDateString() }}
            </p>
          </li>
        </ul>
        <p v-else class="reader-state">
          Aucune activité publique pour le moment.
        </p>
      </section>
    </section>
  </main>
</template>

<style scoped>
.reader-page {
  max-width: 900px;
  margin: 0 auto;
  padding: var(--space-8) var(--space-4) var(--space-12);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.reader-card {
  background: var(--color-white);
  border-radius: 0;
  border: 3px solid var(--color-black);
  box-shadow: var(--shadow-brutal);
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.reader-header {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
  align-items: center;
  justify-content: space-between;
}

.reader-avatar {
  width: 3rem;
  height: 3rem;
  border-radius: 999px;
  border: 2px solid var(--color-black);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  font-weight: var(--font-bold);
}

.reader-header__main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.reader-name {
  margin: 0;
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
}

.reader-username {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--color-neutral-600);
}

.reader-stats {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
}

.reader-stats__item {
  background: var(--color-neutral-50);
  border-radius: 0;
  border: 2px solid var(--color-black);
  padding: var(--space-2) var(--space-3);
}

.reader-stats__label {
  display: block;
  font-size: var(--text-xxs, 0.65rem);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--color-neutral-600);
}

.reader-stats__value {
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
}

.reader-follow {
  align-self: flex-start;
}

.reader-activities {
  border-top: 2px dashed var(--color-neutral-300);
  padding-top: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.reader-activities__title {
  margin: 0;
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
}

.reader-activities__list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.reader-activities__item {
  border-radius: 0;
  border: 2px solid var(--color-black);
  padding: var(--space-3) var(--space-4);
  background: var(--color-neutral-50);
}

.reader-activities__summary {
  margin: 0 0 0.25rem;
  font-size: var(--text-sm);
}

.reader-activities__detail {
  margin: 0 0 0.25rem;
  font-size: var(--text-sm);
  color: var(--color-neutral-700);
}

.reader-activities__date {
  margin: 0;
  font-size: var(--text-xs);
  color: var(--color-neutral-500);
}

.reader-state {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--color-neutral-600);
}

.reader-state--error {
  color: var(--color-rouge-corail);
}

@media (max-width: 640px) {
  .reader-card {
    padding: var(--space-5) var(--space-4);
  }
}
</style>
