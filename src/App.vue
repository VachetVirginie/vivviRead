<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { provideAppContext } from './composables/useAppContext'
import { useAuth } from './composables/useAuth'

provideAppContext()

const router = useRouter()
const { user, profile, loadCurrentUser } = useAuth()

onMounted(() => {
  loadCurrentUser()
})

const displayName = computed(() => profile.value?.full_name || user.value?.email || 'Utilisateur')

const avatarInitial = computed(() => displayName.value.charAt(0).toUpperCase())

function stringToColor(input: string): string {
  const colors = ['#F97316', '#F97373', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#FBBF24']
  let hash = 0
  for (let i = 0; i < input.length; i += 1) {
    hash = input.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % colors.length
  return colors[index] ?? '#111827'
}

const avatarColor = computed(() => stringToColor(displayName.value))

function goToProfile() {
  router.push('/profil')
}

function handleBack() {
  const publicPaths = ['/', '/login', '/forgot-password', '/reset-password']
  const historyState = router.options.history.state as { back?: string } | null
  const back = historyState?.back

  if (!back || publicPaths.includes(back)) {
    router.push('/home')
    return
  }

  router.back()
}
</script>

<template>
  <div class="app-shell">
    <div class="app-shell__content">
      <header v-if="user" class="app-shell__header">
        <button
          type="button"
          class="app-shell__back-button"
          @click="handleBack"
        >
          <span class="app-shell__back-icon" aria-hidden="true">←</span>
          <span>Retour</span>
        </button>
        <div class="app-shell__header-spacer" />
        <button
          type="button"
          class="app-shell__avatar-button"
          :style="{ backgroundColor: avatarColor, color: '#020617' }"
          @click="goToProfile"
        >
          {{ avatarInitial }}
        </button>
      </header>
      <RouterView />
    </div>

    <nav v-if="user" class="app-shell__nav" aria-label="Navigation principale">
      <RouterLink to="/home" class="app-shell__nav-link">Accueil</RouterLink>
      <RouterLink to="/amis" class="app-shell__nav-link">Feed</RouterLink>
      <RouterLink to="/livres" class="app-shell__nav-link">Livres</RouterLink>
      <RouterLink to="/objectifs" class="app-shell__nav-link">Objectifs</RouterLink>
      <RouterLink to="/explorer" class="app-shell__nav-link">Explorer</RouterLink>
    </nav>
  </div>
</template>

<style scoped>
.app-shell__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem 0.25rem;
}

.app-shell__header-spacer {
  flex: 1;
}

.app-shell__avatar-button {
  width: 2.4rem;
  height: 2.4rem;
  border-radius: 999px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.1rem;
  cursor: pointer;
}

.app-shell__back-button {
  border: none;
  padding: 0;
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  text-transform: none;
  background: transparent;
  color: #e5e7eb;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.app-shell__back-button:hover {
  text-decoration: underline;
}

.app-shell__back-icon {
  font-size: 0.9rem;
}
</style>
