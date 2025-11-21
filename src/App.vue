<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { provideAppContext } from './composables/useAppContext'
import { useAuth } from './composables/useAuth'
import { useToasts } from './composables/useToasts'

provideAppContext()

const router = useRouter()
const { user, profile, loadCurrentUser } = useAuth()
const { toasts, dismiss } = useToasts()

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

function handleToastAction(id: string, handler?: () => void) {
  if (handler) {
    handler()
  }
  dismiss(id)
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

    <div
      v-if="toasts.length"
      class="toast-stack"
      aria-live="polite"
      aria-atomic="true"
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast"
        :class="`toast--${toast.variant}`"
      >
        <span class="toast__message">{{ toast.message }}</span>
        <button
          v-if="toast.actionLabel"
          type="button"
          class="toast__action"
          @click="handleToastAction(toast.id, toast.onAction)"
        >
          {{ toast.actionLabel }}
        </button>
        <button
          type="button"
          class="toast__close"
          aria-label="Fermer"
          @click="dismiss(toast.id)"
        >
          ×
        </button>
      </div>
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

.toast-stack {
  position: fixed;
  right: 1rem;
  bottom: 4.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  z-index: 40;
}

.toast {
  min-width: 260px;
  max-width: 320px;
  background: var(--color-neutral-50);
  color: var(--color-neutral-900);
  border-radius: 0;
  border: 2px solid var(--color-black);
  box-shadow: var(--shadow-brutal);
  padding: 0.5rem 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: var(--text-sm);
  animation: var(--animation-pop-in);
}

.toast--success {
  border-color: var(--accent-secondary);
}

.toast--error {
  border-color: var(--accent-primary);
}

.toast__message {
  flex: 1;
}

.toast__action {
  border-radius: 0;
  border: 2px solid var(--color-black);
  background: var(--color-jaune-dore);
  color: var(--color-black);
  padding: 0.15rem 0.6rem;
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-weight: var(--font-semibold);
  cursor: pointer;
}

.toast__close {
  border: none;
  background: transparent;
  color: var(--color-neutral-600);
  cursor: pointer;
  font-size: 0.9rem;
}
</style>
