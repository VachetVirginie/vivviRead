<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBookRecommendations, type BookRecommendation } from '../composables/useBookRecommendations'
import { useAppContext } from '../composables/useAppContext'
import { useToasts } from '../composables/useToasts'

const router = useRouter()
const { shelf } = useAppContext()
const { showToast } = useToasts()

const {
  incoming,
  loading,
  loadIncoming,
  markAsSeen,
  markAsAddedToList,
  dismiss,
} = useBookRecommendations()

const hasRecommendations = computed(() => incoming.value.length > 0)

function stringToColor(input: string): string {
  const colors = ['#F97316', '#F97373', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#FBBF24']
  let hash = 0
  for (let i = 0; i < input.length; i += 1) {
    hash = input.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % colors.length
  return colors[index] ?? '#111827'
}

function avatarInitialForName(name: string | null): string {
  if (!name) return '?'
  const trimmed = name.trim()
  return trimmed.charAt(0).toUpperCase() || '?'
}

function avatarColorForName(name: string | null): string {
  return stringToColor(name || '?')
}

async function handleAddToShelf(rec: BookRecommendation) {
  if (!rec.bookTitle || !rec.bookAuthor) return

  if (!shelf.isInShelf(rec.bookTitle, rec.bookAuthor)) {
    shelf.addFromSearch({
      title: rec.bookTitle,
      author: rec.bookAuthor,
      coverUrl: rec.coverUrl,
    })
  }

  await markAsAddedToList(rec.id)

  showToast({
    message: 'Ajouté à ta bibliothèque',
    variant: 'success',
  })
}

async function handleMarkSeen(rec: BookRecommendation) {
  if (rec.status === 'sent') {
    await markAsSeen(rec.id)
  }
}

async function handleDismiss(rec: BookRecommendation) {
  await dismiss(rec.id)
}

onMounted(() => {
  void loadIncoming()
})
</script>

<template>
  <main class="friends-page">
    <header class="page-header">
      <div class="page-header__row">
        <div class="page-header__main">
          <p class="section-eyebrow">Communauté</p>
          <h1 class="page-header__title">Livres recommandés par tes amis</h1>
          <p class="page-header__subtitle">
            Retrouve ici les livres que tes amis t'ont conseillés directement.
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

    <section class="friends-layout" aria-label="Recommandations de livres des amis">
      <section class="friends-card friends-card--feed" aria-label="Liste de recommandations">
        <h2 class="friends-card__title">Recommandations reçues</h2>

        <p v-if="loading && !hasRecommendations" class="friends-empty">
          Chargement de tes recommandations…
        </p>

        <ul v-else-if="hasRecommendations" class="friends-feed">
          <li
            v-for="rec in incoming"
            :key="rec.id"
            class="friends-reco"
          >
            <div class="friends-reco__header">
              <div class="friends-reco__header-main">
                <div
                  class="friends-reco__avatar"
                  :style="{ backgroundColor: avatarColorForName(rec.fromUserName) }"
                  aria-hidden="true"
                >
                  {{ avatarInitialForName(rec.fromUserName) }}
                </div>
                <div class="friends-reco__text">
                  <p class="friends-reco__from">
                    {{ rec.fromUserName || 'Un lecteur' }} t’a recommandé :
                  </p>
                  <p class="friends-reco__book">
                    « {{ rec.bookTitle }} »
                    <span v-if="rec.bookAuthor">· {{ rec.bookAuthor }}</span>
                  </p>
                </div>
              </div>
              <span class="friends-reco__date">
                {{ new Date(rec.createdAt).toLocaleDateString() }}
              </span>
            </div>

            <p v-if="rec.message" class="friends-reco__message">
              « {{ rec.message }} »
            </p>

            <div class="friends-reco__actions">
              <button
                type="button"
                class="friends-reco__action friends-reco__action--primary"
                :disabled="rec.status === 'added_to_list'"
                @click="handleAddToShelf(rec)"
              >
                {{
                  rec.status === 'added_to_list'
                    ? 'Déjà ajouté à ta bibliothèque'
                    : 'Ajouter à ma bibliothèque'
                }}
              </button>
              <button
                v-if="rec.status === 'sent'"
                type="button"
                class="friends-reco__action"
                @click="handleMarkSeen(rec)"
              >
                Marquer comme vu
              </button>
              <button
                type="button"
                class="friends-reco__link"
                @click="handleDismiss(rec)"
              >
                Ignorer
              </button>
            </div>
          </li>
        </ul>

        <p v-else class="friends-empty">
          Aucun ami ne t’a encore recommandé de livre. Quand ce sera le cas, tout apparaîtra ici.
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
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  margin-bottom: 2em;
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

.friends-reco {
  border-radius: 1.25rem;
  border: 1px solid rgba(148, 163, 184, 0.7);
  padding: var(--space-3) var(--space-4);
  background: rgba(15, 23, 42, 0.85);
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.friends-reco__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-3);
}

.friends-reco__header-main {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.friends-reco__avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 999px;
  border: 2px solid rgba(255, 255, 255, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-bold);
  font-size: 0.9rem;
  color: #020617;
}

.friends-reco__text {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.friends-reco__from {
  margin: 0;
  font-size: var(--text-xs);
  color: #cbd5f5;
}

.friends-reco__book {
  margin: 0;
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: #f9fafb;
}

.friends-reco__date {
  font-size: var(--text-xs);
  color: #9ca3af;
}

.friends-reco__message {
  margin: 0.3rem 0 0.1rem;
  font-size: var(--text-sm);
  color: #e5e7eb;
}

.friends-reco__actions {
  margin-top: 0.4rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.friends-reco__action {
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.7);
  padding: 0.35rem 0.9rem;
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  cursor: pointer;
  background: rgba(15, 23, 42, 0.9);
  color: #e5e7eb;
}

.friends-reco__action--primary {
  background: #f9fafb;
  color: #020617;
  border-color: transparent;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.8);
}

.friends-reco__action--primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.friends-reco__link {
  border: none;
  background: transparent;
  color: #9ca3af;
  font-size: var(--text-xs);
  text-decoration: underline;
  cursor: pointer;
}

@media (max-width: 640px) {
  .friends-page {
    padding: var(--space-10) var(--space-4) var(--space-14);
  }

  .friends-reco__header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
