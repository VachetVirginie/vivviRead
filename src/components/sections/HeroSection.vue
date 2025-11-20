<script setup lang="ts">
interface HeroSession {
  title: string
  meta: string
  status: string
  percent: number
  coverUrl?: string
}

const props = defineProps<{
  heroSession: HeroSession
  loading: boolean
}>()

const emit = defineEmits<{
  (e: 'fetch-books'): void
  (e: 'open-modal', type: 'book' | 'goal'): void
}>()
</script>

<template>
  <section class="hero">
    <div class="hero__content">
      <p class="hero__eyebrow">Trackeur de lecture nouvelle génération</p>
      <h1>Transforme tes lectures en un parcours clair, motivant et inspirant.</h1>
      <p>
        Myboooknest centralise ta bibliothèque, tes envies, tes sessions et tes statistiques pour que chaque page tournée
        compte vraiment.
      </p>
      <div class="hero__actions">
        <button type="button" @click="emit('fetch-books')" :disabled="props.loading">
          {{ props.loading ? 'Chargement…' : 'Explorer les livres' }}
        </button>
        <a href="#explorer">Voir un aperçu</a>
      </div>
      <ul class="hero__badges">
        <li>+4 listes intelligentes</li>
        <li>Rappels multi-appareils</li>
        <li>Analyse détaillée</li>
      </ul>
      <div class="quick-actions">
        <button type="button" @click="emit('open-modal', 'book')">Ajouter un livre</button>
        <button type="button" @click="emit('open-modal', 'goal')">Définir un objectif</button>
      </div>
    </div>
    <div class="hero__panel" aria-label="Carte de progression">
      <p class="hero__panel-label">Session du jour</p>
      <h2>{{ props.heroSession.title }}</h2>
      <p class="hero__panel-meta">{{ props.heroSession.meta }}</p>
      <div class="hero__progress">
        <span :style="{ width: `${props.heroSession.percent}%` }"></span>
      </div>
      <p class="hero__panel-status">{{ props.heroSession.status }}</p>
      <div class="hero__cover-slot">
        <img
          v-if="props.heroSession.coverUrl"
          class="hero__cover"
          :src="props.heroSession.coverUrl"
          :alt="`Couverture de ${props.heroSession.title}`"
        />
        <div v-else class="hero__cover hero__cover--placeholder" aria-hidden="true"></div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  padding: clamp(1.5rem, 4vw, 2.4rem);
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-8);
  position: relative;
  animation: var(--animation-fade-in);
}

.hero__eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-size: var(--text-xs);
  color: #9ca3af;
  margin-bottom: var(--space-3);
  font-weight: var(--font-medium);
}

.hero h1 {
  font-size: clamp(2rem, 4vw, 3.1rem);
  margin: 0 0 var(--space-4);
  color: #f9fafb;
  font-weight: var(--font-bold);
}

.hero p {
  margin: 0 0 var(--space-4);
  color: #d1d5db;
  line-height: var(--leading-relaxed);
}

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.hero__actions button {
  border: none;
  border-radius: 999px;
  padding: 0.85rem 1.75rem;
  font-weight: 600;
  font-size: 1rem;
  background: #111827;
  color: #f9fafb;
  cursor: pointer;
}

.hero__actions button:disabled {
  opacity: 0.65;
}

.hero__actions a {
  align-self: center;
  color: #111827;
  text-decoration: none;
  font-weight: 600;
}

.hero__badges {
  list-style: none;
  padding: 0;
  margin: 0.25rem 0 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.hero__badges li {
  background: #111827;
  color: #f5eee2;
  border-radius: 999px;
  padding: 0.3rem 0.8rem;
  font-size: 0.85rem;
}

.quick-actions {
  margin-top: 1.25rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.quick-actions button {
  border: 1px solid rgba(15, 23, 42, 0.12);
  border-radius: var(--radius-full);
  padding: var(--space-3) var(--space-5);
  background: var(--color-surface);
  color: var(--color-neutral-900);
  font-weight: var(--font-semibold);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.quick-actions button:hover {
  background: var(--color-neutral-100);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

@media (max-width: 640px) {
  .hero {
    padding: 1.4rem 1.1rem 1.7rem;
    gap: 1.5rem;
  }

  .hero__panel {
    max-width: 100%;
    min-width: 300px;
  }
}

@media (min-width: 1024px) {
  .hero {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.8fr);
  }
    .hero__panel {
    min-width: 500px;
  }
}

.hero__panel {
  background-color: hsla(246, 100%, 85%, 0.12);
  border-radius: 1.5rem;
  padding: 1.8rem 2.4rem;
  border: 1px solid rgba(255, 255, 255, 0.22);
  align-self: stretch;
  box-shadow: 0 22px 45px rgba(15, 23, 42, 0.6);
  margin: 0 auto;
  backdrop-filter: blur(22px);
  -webkit-backdrop-filter: blur(22px);
}

.hero__panel-label {
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.2em;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.hero__panel h2 {
  margin: 0 0 0.25rem;
}

.hero__panel-meta {
  margin: 0 0 1.25rem;
  color: #4b5563;
}

.hero__progress {
  width: 100%;
  background: #e5e7eb;
  border-radius: 999px;
  height: 8px;
  margin-bottom: 0.75rem;
}

.hero__progress span {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: #16a34a;
}

.hero__panel-status {
  margin: 0;
  color: #4b5563;
}

.hero__cover {
  width: 100%;
  max-width: 220px;
  margin-top: 1rem;
  border-radius: 1rem;
  box-shadow: 0 14px 26px rgba(15, 23, 42, 0.18);
  aspect-ratio: 3 / 4;
  object-fit: cover;
  align-self: center;
  height: 400px;
}

.hero__cover-slot {
  display: flex;
  justify-content: center;
}

.hero__cover--placeholder {
  background: linear-gradient(135deg, #e5e7eb 0%, #f3f4f6 50%, #e5e7eb 100%);
  border: 1px dashed #cbd5f5;
}
</style>
