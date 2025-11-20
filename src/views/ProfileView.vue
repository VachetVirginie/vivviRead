<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { useAppContext } from '../composables/useAppContext'

const router = useRouter()
const {
  user,
  profile,
  role,
  updateProfileFullName,
  loading,
  errorMessage,
  signOut,
  username: usernameRef,
  updateProfileUsername,
} = useAuth()
const { friendsRelations } = useAppContext()

const displayName = computed(() => profile.value?.full_name || user.value?.email || 'Utilisateur')

const editableName = ref(displayName.value)
const editableUsername = ref(usernameRef.value || '')

watch(
  () => displayName.value,
  (value) => {
    editableName.value = value
  }
)

watch(
  () => usernameRef.value,
  (value) => {
    editableUsername.value = value || ''
  },
)

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

const targetUserId = computed(() => profile.value?.id ?? null)

const publicProfileUrl = computed(() => {
  if (!targetUserId.value) return ''
  if (typeof window === 'undefined') {
    return `/lecteur/${targetUserId.value}`
  }
  return `${window.location.origin}/lecteur/${targetUserId.value}`
})

const isOwnProfile = computed(
  () => !!user.value?.id && user.value.id === targetUserId.value,
)

const isFollowingTarget = computed(() =>
  targetUserId.value ? friendsRelations.isFollowing(targetUserId.value) : false,
)

const followButtonLabel = computed(() => {
  if (isOwnProfile.value) {
    return 'Impossible de se suivre soi-même'
  }
  return isFollowingTarget.value ? 'Suivi' : 'Suivre'
})

const followButtonDisabled = computed(
  () => loading.value || isOwnProfile.value || !targetUserId.value,
)

async function handleToggleFollow() {
  if (!targetUserId.value || isOwnProfile.value) {
    return
  }

  if (isFollowingTarget.value) {
    await friendsRelations.unfollowUser(targetUserId.value)
  } else {
    await friendsRelations.followUser(targetUserId.value)
  }
}

async function onSaveName() {
  await updateProfileFullName(editableName.value.trim())
}

async function onSaveUsername() {
  await updateProfileUsername(editableUsername.value.trim())
}

async function onSignOut() {
  await signOut()
  router.push('/')
}

function goToPublicProfile() {
  if (!targetUserId.value) return
  router.push({ name: 'readerProfile', params: { id: targetUserId.value } })
}

const publicProfileCopyLabel = ref('Copier le lien')

async function copyPublicProfileLink() {
  if (!publicProfileUrl.value) return

  try {
    await navigator.clipboard?.writeText(publicProfileUrl.value)
    publicProfileCopyLabel.value = 'Lien copié !'
    window.setTimeout(() => {
      publicProfileCopyLabel.value = 'Copier le lien'
    }, 2000)
  } catch (error) {
    console.warn('Impossible de copier le lien de profil public :', error)
  }
}
</script>

<template>
  <main class="page">
    <header class="page-header home-header">
      <div class="page-header__row">
        <div class="page-header__main">
          <p class="section-eyebrow">Profil</p>
          <h2 class="page-header__title">Mon profil</h2>
          <p class="page-header__subtitle">
            Gère les informations de ton compte BoookNest.
          </p>
        </div>
      </div>
    </header>

    <section class="home-block" aria-label="Informations du profil">
      <header class="home-block__header">
        <div class="home-block__header-main">
          <h2>Informations du compte</h2>
          <p class="home-block__subtitle">
            Tu es connecté·e à BoookNest. Utilise les options ci-dessous pour gérer ton profil.
          </p>
        </div>
      </header>

      <div class="auth-block">
        <div class="profile-header">
          <div
            class="profile-avatar"
            :style="{ backgroundColor: avatarColor, color: '#ffffff' }"
            aria-hidden="true"
          >
            {{ avatarInitial }}
          </div>
          <div class="profile-header__main">
            <p class="profile-header__name">{{ displayName }}</p>
            <p v-if="usernameRef" class="profile-header__username">@{{ usernameRef }}</p>
          </div>
        </div>

        <div class="auth-block__fields">
          <p class="auth-block__status">
            <span class="auth-block__label">Nom affiché</span>
            <input
              v-model="editableName"
              type="text"
              class="profile-input"
              autocomplete="name"
            />
            <button
              type="button"
              class="page-header__action page-header__action--primary"
              :disabled="loading"
              @click="onSaveName"
            >
              Enregistrer
            </button>
          </p>
          <p class="auth-block__status">
            <span class="auth-block__label">Pseudo</span>
            <input
              v-model="editableUsername"
              type="text"
              class="profile-input"
              autocomplete="nickname"
            />
            <button
              type="button"
              class="page-header__action page-header__action--primary"
              :disabled="loading"
              @click="onSaveUsername"
            >
              Enregistrer le pseudo
            </button>
          </p>
          <p class="auth-block__status">
            <span class="auth-block__label">Email</span>
            <strong>{{ user?.email }}</strong>
          </p>
          <p class="auth-block__status">
            <span class="auth-block__label">Rôle</span>
            <strong>{{ role }}</strong>
          </p>
        </div>
        <div class="public-profile" aria-label="Profil public partageable">
          <span class="auth-block__label">Profil public</span>
          <p v-if="publicProfileUrl" class="public-profile__url">
            {{ publicProfileUrl }}
          </p>
          <div class="public-profile__actions">
            <button
              type="button"
              class="page-header__action"
              :disabled="!publicProfileUrl"
              @click="goToPublicProfile"
            >
              Voir mon profil public
            </button>
            <button
              type="button"
              class="page-header__action"
              :disabled="!publicProfileUrl"
              @click="copyPublicProfileLink"
            >
              {{ publicProfileCopyLabel }}
            </button>
          </div>
        </div>
        <p class="auth-block__status">
          <span class="auth-block__label">Relations sociales</span>
          <button
            type="button"
            class="page-header__action"
            :disabled="followButtonDisabled"
            @click="handleToggleFollow"
          >
            {{ followButtonLabel }}
          </button>
        </p>
        <div class="auth-block__actions">
          <button
            type="button"
            class="page-header__action"
            @click="onSignOut"
          >
            Se déconnecter
          </button>
        </div>
        <p v-if="errorMessage" class="auth-block__error">
          {{ errorMessage }}
        </p>
      </div>
    </section>

    <section class="danger-block" aria-label="Suppression du compte">
      <header class="home-block__header">
        <div class="home-block__header-main">
          <p class="section-eyebrow">Zone sensible</p>
          <h2>Supprimer mon compte</h2>
          <p class="home-block__subtitle">
            Cette fonctionnalité supprimera ton compte et tes données associées. Elle nécessite une étape
            serveur supplémentaire et sera activée plus tard.
          </p>
        </div>
      </header>

      <div class="danger-block__content">
        <p>
          La suppression de compte n’est pas encore disponible dans cette version. Si tu souhaites supprimer ton
          compte, tu pourras bientôt le faire depuis ici.
        </p>
        <button type="button" class="danger-block__button" disabled>
          Supprimer définitivement mon compte (bientôt)
        </button>
      </div>
    </section>
  </main>
</template>

<style scoped>
.profile-avatar {
  width: 3rem;
  height: 3rem;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.4rem;
  margin-bottom: 1rem;
}

.profile-input {
  display: block;
  margin: 0.4rem 0 0.6rem;
  padding: 0.4rem 0.6rem;
  border-radius: 0;
  border: 2px solid var(--color-black);
  background: var(--color-white);
  min-width: 0;
  font-weight: 500;
  transition: var(--transition-snap);
  box-shadow: var(--shadow-inset);
}

.profile-input:focus {
  outline: none;
  border-color: var(--accent-tertiary);
  box-shadow: var(--shadow-brutal);
  transform: var(--transform-float);
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.profile-header__main {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.profile-header__name {
  margin: 0;
  font-weight: var(--font-semibold);
}

.profile-header__username {
  margin: 0;
  font-size: 0.85rem;
  color: #6b7280;
}

.auth-block__fields {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.auth-block__error {
  margin-top: 0.5rem;
  color: var(--color-rouge-corail);
  font-size: 0.85rem;
}

.auth-block__label {
  display: block;
  font-size: 0.85rem;
  color: #6b7280;
}

.public-profile {
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: 1px dashed var(--color-neutral-300);
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.public-profile__url {
  margin: 0;
  font-size: 0.8rem;
  color: var(--color-neutral-700);
  word-break: break-all;
}

.public-profile__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.danger-block {
  margin-top: 1.5rem;
  background: var(--color-white);
  border-radius: 0;
  padding: 1.6rem 1.5rem 1.4rem;
  border: 3px solid var(--color-black);
  border-left: 6px solid var(--accent-primary);
  box-shadow: var(--shadow-brutal);
  position: relative;
}

.danger-block::after {
  content: '⚠️';
  position: absolute;
  top: -3px;
  right: -3px;
  width: 18px;
  height: 18px;
  background: var(--accent-primary);
  color: white;
  border: 2px solid var(--color-black);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
}

.danger-block__content {
  margin-top: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  font-size: 0.9rem;
  color: #7f1d1d;
}

.danger-block__button {
  align-self: flex-start;
  border-radius: 999px;
  border: none;
  padding: 0.5rem 1.2rem;
  background: var(--color-rouge-corail);
  color: white;
  font-size: 0.85rem;
  font-weight: 600;
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
