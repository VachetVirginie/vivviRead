import { ref, computed, onMounted } from 'vue'
import { supabase } from '../lib/supabaseClient'

export interface PublicProfile {
  id: string
  full_name: string | null
  avatar_url: string | null
  username: string | null
}

async function getCurrentUserId(): Promise<string | null> {
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) {
    return null
  }
  return data.user.id
}

export function useProfilesDirectory() {
  const profiles = ref<PublicProfile[]>([])
  const search = ref('')
  const loading = ref(false)

  async function loadProfiles() {
    loading.value = true

    try {
      const userId = await getCurrentUserId()

      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, username')
        .order('full_name', { ascending: true })
        .neq('id', userId ?? '')

      if (error) {
        console.warn('Erreur lors du chargement des profils publics :', error)
        profiles.value = []
        return
      }

      profiles.value = (data ?? []) as PublicProfile[]
    } catch (error) {
      console.warn('Erreur inattendue lors du chargement des profils publics :', error)
      profiles.value = []
    } finally {
      loading.value = false
    }
  }

  function setSearch(value: string) {
    search.value = value
  }

  async function applySearch() {
    await loadProfiles()
  }

  const hasProfiles = computed(() => profiles.value.length > 0)

  onMounted(() => {
    void loadProfiles()
  })

  return {
    profiles,
    search,
    loading,
    hasProfiles,
    setSearch,
    applySearch,
    loadProfiles,
  }
}
