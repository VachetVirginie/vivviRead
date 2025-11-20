import { ref, computed, onMounted } from 'vue'
import { supabase } from '../lib/supabaseClient'

async function getCurrentUserId(): Promise<string | null> {
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) {
    return null
  }
  return data.user.id
}

export function useFriendsRelations() {
  const followingIds = ref<string[]>([])
  const followersCount = ref(0)
  const followingCount = ref(0)
  const loading = ref(false)

  const isFollowing = (targetUserId: string | null | undefined) => {
    if (!targetUserId) return false
    return followingIds.value.includes(targetUserId)
  }

  async function loadRelations() {
    loading.value = true

    try {
      const userId = await getCurrentUserId()
      if (!userId) {
        followingIds.value = []
        followersCount.value = 0
        followingCount.value = 0
        return
      }

      const { data: followingRows, error: followingError } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', userId)

      if (followingError) {
        console.warn('Erreur lors du chargement des utilisateurs suivis :', followingError)
      }

      const followed = (followingRows ?? []).map((row: any) => row.following_id as string)
      followingIds.value = followed
      followingCount.value = followed.length

      const { count: followers, error: followersError } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', userId)

      if (followersError) {
        console.warn('Erreur lors du comptage des abonnés :', followersError)
      }

      followersCount.value = followers ?? 0
    } catch (error) {
      console.warn('Erreur inattendue lors du chargement des relations amis :', error)
      followingIds.value = []
      followersCount.value = 0
      followingCount.value = 0
    } finally {
      loading.value = false
    }
  }

  async function followUser(targetUserId: string) {
    const userId = await getCurrentUserId()
    if (!userId) {
      console.warn('Impossible de suivre un utilisateur sans être connecté')
      return
    }

    if (!targetUserId || targetUserId === userId) {
      return
    }

    if (isFollowing(targetUserId)) {
      return
    }

    const { error } = await supabase.from('follows').insert({
      follower_id: userId,
      following_id: targetUserId,
    })

    if (error) {
      console.warn("Erreur lors du follow de l'utilisateur :", error)
      return
    }

    followingIds.value = [...followingIds.value, targetUserId]
    followingCount.value = followingIds.value.length
  }

  async function unfollowUser(targetUserId: string) {
    const userId = await getCurrentUserId()
    if (!userId) {
      console.warn('Impossible de se désabonner sans être connecté')
      return
    }

    if (!isFollowing(targetUserId)) {
      return
    }

    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', userId)
      .eq('following_id', targetUserId)

    if (error) {
      console.warn("Erreur lors du unfollow de l'utilisateur :", error)
      return
    }

    followingIds.value = followingIds.value.filter((id) => id !== targetUserId)
    followingCount.value = followingIds.value.length
  }

  const hasFollowers = computed(() => followersCount.value > 0)
  const hasFollowing = computed(() => followingCount.value > 0)

  onMounted(() => {
    loadRelations()
  })

  return {
    followingIds,
    followersCount,
    followingCount,
    loading,
    hasFollowers,
    hasFollowing,
    isFollowing,
    loadRelations,
    followUser,
    unfollowUser,
  }
}
