<script setup lang="ts">
import type { StatCard } from '../../types/dashboard'

defineProps<{ stats: StatCard[] }>()

// Fonction pour obtenir l'icône appropriée selon le label
function getIconForStat(label: string): string {
  if (label.toLowerCase().includes('livre')) return '📚'
  if (label.toLowerCase().includes('lecture')) return '📖'
  if (label.toLowerCase().includes('page')) return '📄'
  return '📊'
}

// Fonction pour obtenir la couleur du gradient selon l'index
function getGradientClass(index: number): string {
  const gradients = ['gradient-warm', 'gradient-cool', 'gradient-purple']
  return gradients[index % gradients.length] || 'gradient-warm'
}
</script>

<template>
  <section id="stats" class="stats stagger-children" aria-label="Statistiques clé viviRead">
    <article 
      v-for="(stat, index) in stats" 
      :key="stat.label" 
      class="stats__card animate-fade-in-scale"
      :style="{ '--stagger-delay': index }"
    >
      <div class="stats__icon">
        <div class="stats__icon-circle" :class="`stats__icon-circle--${getGradientClass(index)}`">
          <span class="stats__icon-emoji">{{ getIconForStat(stat.label) }}</span>
        </div>
      </div>
      <div class="stats__content">
        <p class="stats__value">{{ stat.value }}</p>
        <p class="stats__label">{{ stat.label }}</p>
        <p class="stats__sub">{{ stat.subLabel }}</p>
      </div>
      <div class="stats__decoration"></div>
    </article>
  </section>
</template>

<style scoped>
.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--space-6);
}

@media (max-width: 640px) {
  .stats {
    grid-template-columns: 1fr;
    gap: var(--space-4);
  }
}

.stats__card {
  background: var(--color-white);
  border: 3px solid var(--color-black);
  border-radius: 0;
  padding: var(--space-8) var(--space-6);
  text-align: center;
  position: relative;
  transition: var(--transition-snap);
  box-shadow: var(--shadow-brutal);
  cursor: pointer;
  animation: var(--animation-pop-in);
  animation-fill-mode: both;
}

.stats__card:nth-child(1) {
  animation-delay: 0s;
}

.stats__card:nth-child(2) {
  animation-delay: 0.1s;
}

.stats__card:nth-child(3) {
  animation-delay: 0.2s;
}

/* Texte sombre sur toutes les cards pour meilleure lisibilité */
.stats__card:nth-child(1),
.stats__card:nth-child(2),
.stats__card:nth-child(3) {
  color: var(--color-black);
}

/* === DYNAMIC MINIMALISM 2025 === */
.stats__card:nth-child(1) {
  border-left: 8px solid var(--accent-tertiary);
}

.stats__card:nth-child(2) {
  border-left: 8px solid var(--accent-secondary);
}

.stats__card:nth-child(3) {
  border-left: 8px solid var(--accent-primary);
}

/* Version couleurs solides premium - décommentez pour tester */
/*
.stats__card:nth-child(1) {
  background: var(--color-orange);
}

.stats__card:nth-child(2) {
  background: var(--color-emerald);
}

.stats__card:nth-child(3) {
  background: var(--color-violet);
}
*/

/* Version couleurs modernes audacieuses - décommentez pour tester */
/*
.stats__card:nth-child(1) {
  background: var(--color-coral);
}

.stats__card:nth-child(2) {
  background: var(--color-teal);
}

.stats__card:nth-child(3) {
  background: var(--color-indigo);
}
*/

/* Version monochrome élégante - décommentez pour tester */
/*
.stats__card:nth-child(1) {
  background: var(--color-neutral-800);
}

.stats__card:nth-child(2) {
  background: var(--color-neutral-700);
}

.stats__card:nth-child(3) {
  background: var(--color-neutral-600);
}
*/

.stats__card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: transparent;
  opacity: 0;
  transition: var(--transition-snap);
  z-index: 1;
}

.stats__card:hover::before {
  opacity: 0;
}

.stats__card:hover {
  transform: var(--transform-lift);
  box-shadow: var(--shadow-hover);
}

.stats__card:hover * {
  position: relative;
  z-index: 2;
}

.stats__icon {
  flex-shrink: 0;
}

.stats__icon-circle {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-full);
  background: var(--color-white);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--color-black);
  position: relative;
  transition: all var(--transition-normal);
}

.stats__card:hover .stats__icon-circle {
  transform: rotate(5deg) scale(1.1);
}

/* Icônes spécifiques pour les cards équilibre dynamique */
.stats__card:nth-child(1) .stats__icon-circle {
  background: var(--accent-tertiary);
  border-color: var(--color-black);
}

.stats__card:nth-child(2) .stats__icon-circle {
  background: var(--accent-secondary);
  border-color: var(--color-black);
}

.stats__card:nth-child(3) .stats__icon-circle {
  background: var(--accent-primary);
  border-color: var(--color-black);
}

.stats__icon-circle::before {
  content: '';
  position: absolute;
  inset: 2px;
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0) 50%);
  pointer-events: none;
}

.stats__icon-emoji {
  font-size: var(--text-xl);
  position: relative;
  z-index: 1;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
}

.stats__content {
  flex: 1;
  min-width: 0;
}

.stats__value {
  margin: 0 0 var(--space-1);
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  color: var(--color-black);
  line-height: var(--leading-tight);
  transition: all var(--transition-normal);
}

.stats__card:hover .stats__value {
  transform: scale(1.05);
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.stats__label {
  margin: 0 0 var(--space-1);
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  color: var(--color-black);
  line-height: var(--leading-normal);
}

.stats__sub {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--color-black);
  line-height: var(--leading-normal);
}

/* Styles spécifiques pour les cards équilibre dynamique */
.stats__card:nth-child(1) .stats__value,
.stats__card:nth-child(2) .stats__value {
  color: var(--color-black);
  text-shadow: none;
}

.stats__card:nth-child(1) .stats__label,
.stats__card:nth-child(2) .stats__label {
  color: var(--color-black);
  text-shadow: none;
}

.stats__card:nth-child(1) .stats__sub,
.stats__card:nth-child(2) .stats__sub {
  color: var(--color-black);
  text-shadow: none;
}

.stats__card:nth-child(3) .stats__value,
.stats__card:nth-child(3) .stats__label,
.stats__card:nth-child(3) .stats__sub {
  color: var(--color-black);
  text-shadow: none;
}

.stats__decoration {
  position: absolute;
  top: var(--space-4);
  right: var(--space-4);
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.15);
  opacity: 0.8;
  animation: pulse 3s ease-in-out infinite;
}

.stats__decoration::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 16px;
  height: 16px;
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.25);
}

/* Décorations spécifiques pour les cards équilibre dynamique */
.stats__card:nth-child(1) .stats__decoration,
.stats__card:nth-child(2) .stats__decoration {
  background: rgba(0, 0, 0, 0.08);
}

.stats__card:nth-child(1) .stats__decoration::before,
.stats__card:nth-child(2) .stats__decoration::before {
  background: rgba(0, 0, 0, 0.12);
}

.stats__card:nth-child(3) .stats__decoration {
  background: rgba(255, 255, 255, 0.15);
}

.stats__card:nth-child(3) .stats__decoration::before {
  background: rgba(255, 255, 255, 0.25);
}

@media (min-width: 768px) {
  .stats {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .stats__value {
    font-size: var(--text-4xl);
  }
}

@media (min-width: 1024px) {
  .stats__card {
    padding: var(--space-10) var(--space-8);
  }
}
</style>
