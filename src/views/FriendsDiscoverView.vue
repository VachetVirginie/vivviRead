<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAppContext } from '../composables/useAppContext'
import { useProfilesDirectory } from '../composables/useProfilesDirectory'

const router = useRouter()
const { friendsRelations } = useAppContext()

const { profiles, search, loading, applySearch, setSearch } = useProfilesDirectory()

const hasSearch = computed(() => search.value.trim().length > 0)

const filteredProfiles = computed(() => {
  const term = search.value.trim().toLowerCase()
  if (!term) {
    return profiles.value
  }

  return profiles.value.filter((profile) =>
    (profile.username ?? '').toLowerCase().includes(term)
      || (profile.full_name ?? '').toLowerCase().includes(term),
  )
})

const hasVisibleProfiles = computed(() => filteredProfiles.value.length > 0)

function handleSearchSubmit() {
  void applySearch()
}

function handleSearchInput(value: string) {
  setSearch(value)
}

function isFollowingProfile(profileId: string) {
  return friendsRelations.isFollowing(profileId)
}

async function handleToggleFollow(profileId: string) {
  if (!profileId) return
  if (isFollowingProfile(profileId)) {
    await friendsRelations.unfollowUser(profileId)
  } else {
    await friendsRelations.followUser(profileId)
  }
}
</script>

<template>
  <main class="friends-page">
    <header class="page-header">
      <div class="page-header__row">
        <div class="page-header__main">
          <p class="section-eyebrow">Communauté</p>
          <h1 class="page-header__title">Trouver des amis</h1>
          <p class="page-header__subtitle">
            Découvre d'autres lecteurs et commence à suivre leurs lectures.
          </p>
        </div>
        <div class="page-header__actions">
          <button
            type="button"
            class="page-header__action"
            @click="router.push({ name: 'friends' })"
          >
            Retour au flux d'amis
          </button>
        </div>
      </div>
    </header>

    <section class="friends-layout" aria-label="Découverte de profils">
      <section class="friends-card" aria-label="Recherche de profils">
        <h2 class="friends-card__title">Rechercher des lecteurs</h2>
        <form class="friends-search" @submit.prevent="handleSearchSubmit">
          <label class="friends-search__label" for="friends-search-input">Nom affiché</label>
          <input
            id="friends-search-input"
            :value="search"
            type="text"
            class="friends-search__input"
            placeholder="Cherche un prénom ou un pseudo…"
            @input="handleSearchInput(($event.target as HTMLInputElement).value)"
          />
          <button type="submit" class="friends-search__button">
            Rechercher
          </button>
        </form>
        <p class="friends-empty" v-if="!hasSearch">
          Saisis un nom pour filtrer la liste ou laisse vide pour explorer tous les profils disponibles.
        </p>
      </section>

      <section class="friends-card friends-card--feed" aria-label="Liste de profils">
        <h2 class="friends-card__title">Lecteurs à suivre</h2>

        <p v-if="loading" class="friends-empty">
          Chargement des profils…
        </p>

        <ul v-else-if="hasVisibleProfiles" class="friends-feed">
          <li v-for="profile in filteredProfiles" :key="profile.id" class="friends-feed__item">
            <div class="friends-feed__header">
              <button
                type="button"
                class="friends-feed__name-button"
                @click="router.push({ name: 'readerProfile', params: { id: profile.id } })"
              >
                <span class="friends-feed__name">
                  {{ profile.username ? `@${profile.username}` : (profile.full_name || 'Lecteur anonyme') }}
                </span>
              </button>
            </div>
            <p class="friends-feed__summary">
              Profil public. Suis cette personne pour voir ses futures activités de lecture.
            </p>
            <div class="friends-feed__actions">
              <button
                type="button"
                class="page-header__action"
                @click="handleToggleFollow(profile.id)"
              >
                {{ isFollowingProfile(profile.id) ? 'Suivi' : 'Suivre' }}
              </button>
            </div>
          </li>
        </ul>

        <p v-else class="friends-empty">
          Aucun profil trouvé pour le moment. Essaie un autre terme de recherche.
        </p>
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
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
  gap: var(--space-6);
  margin-bottom: 2em;
}

@media (max-width: 900px) {
  .friends-layout {
    grid-template-columns: minmax(0, 1fr);
    margin-bottom: 2em;
  }
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
  border-top: 2px solid var(--color-jaune-dore);
}

.friends-card__title {
  margin: 0;
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
}

.friends-search {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.friends-search__label {
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #cbd5f5;
}

.friends-search__input {
  padding: 0.5rem 0.75rem;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.7);
  background: rgba(15, 23, 42, 0.9);
  font-size: var(--text-sm);
  color: #e5e7eb;
}

.friends-search__button {
  align-self: flex-start;
  margin-top: var(--space-2);
  border-radius: 999px;
  border: none;
  background: #f9fafb;
  color: #020617;
  padding: 0.35rem 0.9rem;
  font-size: var(--text-xs);
  text-transform: none;
  letter-spacing: 0.08em;
  cursor: pointer;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.8);
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

.friends-feed__item {
  border-radius: 1.25rem;
  border: 1px solid rgba(148, 163, 184, 0.7);
  padding: var(--space-3) var(--space-4);
  background: rgba(15, 23, 42, 0.9);
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

.friends-feed__name {
  font-weight: var(--font-semibold);
}

.friends-feed__name-button {
  border: none;
  background: transparent;
  padding: 0;
  margin: 0;
  cursor: pointer;
}

.friends-feed__summary {
  margin: 0;
  font-size: var(--text-sm);
  color: #e5e7eb;
}

.friends-feed__actions {
  margin-top: 0.25rem;
}
</style>
