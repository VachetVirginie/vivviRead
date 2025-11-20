import { ref, computed, onMounted } from 'vue'
import { supabase } from '../lib/supabaseClient'

export interface FriendActivity {
  id: string
  userId: string
  userName: string | null
  type: string
  createdAt: string
  bookTitle?: string
  bookAuthor?: string
  totalPages?: number
  coverUrl?: string
  goalTitle?: string
  summary: string
}

export function useFriendsFeed() {
  const activities = ref<FriendActivity[]>([])
  const loading = ref(false)

  async function loadFriendsActivities() {
    loading.value = true

    try {
      const { data: rawActivities, error: activitiesError } = await supabase
        .from('activities')
        .select('id, user_id, type, payload, created_at')
        .order('created_at', { ascending: false })
        .limit(50)

      if (activitiesError) {
        activities.value = []
        return
      }

      if (!rawActivities || !rawActivities.length) {
        activities.value = []
        return
      }

      const userIds = Array.from(new Set(rawActivities.map((row: any) => row.user_id as string)))

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, username')
        .in('id', userIds)

      if (profilesError) {
        console.warn('Erreur lors du chargement des profils pour le flux amis :', profilesError)
      }

      const profileById = new Map<string, { id: string; full_name: string | null; username: string | null }>()
      for (const profile of profiles ?? []) {
        profileById.set(profile.id as string, {
          id: profile.id as string,
          full_name: (profile.full_name as string | null) ?? null,
          username: (profile.username as string | null) ?? null,
        })
      }

      activities.value = rawActivities.map((row: any) => {
        const profile = profileById.get(row.user_id as string)
        const payload = (row.payload ?? {}) as any
        const type = row.type as string
        const userName = profile?.username || profile?.full_name || 'Un lecteur'

        let summary = ''
        if (type === 'book_finished') {
          summary = 'a terminé un livre'
        } else if (type === 'book_added') {
          summary = 'a ajouté un livre à sa bibliothèque'
        } else if (type === 'goal_completed') {
          summary = 'a atteint un objectif'
        } else if (type === 'goal_created') {
          summary = 'a créé un nouvel objectif'
        } else {
          summary = 'a mis à jour sa lecture'
        }

        return {
          id: row.id as string,
          userId: row.user_id as string,
          userName,
          type,
          createdAt: row.created_at as string,
          bookTitle: payload.title ?? undefined,
          bookAuthor: payload.author ?? undefined,
          totalPages: typeof payload.total_pages === 'number' ? payload.total_pages : undefined,
          coverUrl: typeof payload.cover_url === 'string' ? payload.cover_url : undefined,
          goalTitle: payload.title ?? undefined,
          summary,
        }
      })
    } catch (error) {
      console.warn('Erreur inattendue lors du chargement du flux amis :', error)
      activities.value = []
    } finally {
      loading.value = false
    }
  }

  const topActivities = computed(() => activities.value.slice(0, 3))

  onMounted(() => {
    loadFriendsActivities()
  })

  return {
    activities,
    topActivities,
    loading,
    loadFriendsActivities,
  }
}
