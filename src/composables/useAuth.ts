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
const resetEmail = ref('')
const newPassword = ref('')
const confirmPassword = ref('')

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

    user.value = { id: userData.user.id, email: userData.user.email ?? null }

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

async function updateProfileFullName(newFullName: string) {
  loading.value = true
  errorMessage.value = null

  try {
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData.user) {
      throw userError || new Error('Aucun utilisateur connecté')
    }

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: newFullName || null })
      .eq('id', userData.user.id)

    if (error) {
      throw error
    }

    await loadCurrentUser()
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

async function resetPassword() {
  loading.value = true
  errorMessage.value = null
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.value, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) throw error
    return { success: true }
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : String(err)
    return { success: false }
  } finally {
    loading.value = false
  }
}

async function updatePassword() {
  loading.value = true
  errorMessage.value = null
  
  if (newPassword.value !== confirmPassword.value) {
    errorMessage.value = 'Les mots de passe ne correspondent pas'
    loading.value = false
    return { success: false }
  }

  if (newPassword.value.length < 6) {
    errorMessage.value = 'Le mot de passe doit contenir au moins 6 caractères'
    loading.value = false
    return { success: false }
  }

  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword.value
    })
    if (error) throw error
    return { success: true }
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : String(err)
    return { success: false }
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
    resetEmail,
    newPassword,
    confirmPassword,
    signUpWithEmail,
    signInWithEmail,
    signOut,
    updateProfileFullName,
    resetPassword,
    updatePassword,
    loadCurrentUser,
  }
}
