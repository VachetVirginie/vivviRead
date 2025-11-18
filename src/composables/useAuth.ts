import { ref, computed, onMounted } from 'vue'
import { supabase } from '../lib/supabaseClient'

interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  role: 'owner' | 'user' | 'premium' | string
}

const user = ref<null | { id: string; email: string | null }>(null)
const profile = ref<Profile | null>(null)
const loading = ref(false)
const errorMessage = ref<string | null>(null)

const email = ref('')
const password = ref('')
const fullName = ref('')

const role = computed(() => profile.value?.role ?? 'anonymous')

async function loadCurrentUser() {
  loading.value = true
  errorMessage.value = null
  try {
    const { data: userData, error } = await supabase.auth.getUser()
    if (error) throw error

    if (!userData.user) {
      user.value = null
      profile.value = null
      return
    }

    user.value = { id: userData.user.id, email: userData.user.email }

    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userData.user.id)
      .single()

    if (profileError && profileError.code !== 'PGRST116') {
      throw profileError
    }

    profile.value = (profiles as Profile) ?? null
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : String(err)
  } finally {
    loading.value = false
  }
}

async function signUpWithEmail() {
  loading.value = true
  errorMessage.value = null
  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
      options: {
        data: {
          full_name: fullName.value || null,
        },
      },
    })

    if (error) throw error

    if (data.user) {
      await loadCurrentUser()
    }
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : String(err)
  } finally {
    loading.value = false
  }
}

async function signInWithEmail() {
  loading.value = true
  errorMessage.value = null
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    })

    if (error) throw error

    if (data.user) {
      await loadCurrentUser()
    }
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : String(err)
  } finally {
    loading.value = false
  }
}

async function signOut() {
  loading.value = true
  errorMessage.value = null
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    user.value = null
    profile.value = null
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : String(err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadCurrentUser()

  supabase.auth.onAuthStateChange(async () => {
    await loadCurrentUser()
  })
})

export function useAuth() {
  return {
    user,
    profile,
    role,
    loading,
    errorMessage,
    email,
    password,
    fullName,
    signUpWithEmail,
    signInWithEmail,
    signOut,
  }
}
