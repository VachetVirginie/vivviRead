<script setup lang="ts">
import type { ReadingGoal } from '../../composables/useGoals'

defineProps<{ goals: ReadingGoal[] }>()

const emit = defineEmits<{
  (e: 'remove', id: string): void
  (e: 'update-progress', payload: { id: string; value: number }): void
}>()
</script>

<template>
  <section id="goals" class="goals" aria-label="Objectifs de lecture">
    <header>
      <p class="section-eyebrow">Objectifs</p>
      <h2>Fixe-toi un cap et suis tes progrès en un clin d'œil.</h2>
    </header>
    <p class="state">Utilise les actions rapides pour créer ou modifier tes objectifs.</p>

    <div v-if="goals.length" class="goals__grid">
      <article
        v-for="goal in goals"
        :key="goal.id"
        class="goals__card"
        :class="{ 'goals__card--completed': (goal.displayCurrentValue ?? goal.currentValue) >= goal.targetValue }"
      >
        <div class="goals__header">
          <div>
            <p class="goals__label">{{ goal.unit }}</p>
            <h3>{{ goal.title }}</h3>
          </div>
          <span
            v-if="(goal.displayCurrentValue ?? goal.currentValue) >= goal.targetValue"
            class="goals__badge"
          >Atteint</span>
          <button class="shelf__remove" type="button" @click="emit('remove', goal.id)">Supprimer</button>
        </div>
        <p class="goals__value">
          {{ goal.displayCurrentValue ?? goal.currentValue }} / {{ goal.targetValue }} {{ goal.unit }}
        </p>
        <div class="goals__progress">
          <span
            :style="{
              width: `${Math.min(
                100,
                Math.round(((goal.displayCurrentValue ?? goal.currentValue) / goal.targetValue) * 100),
              )}%`,
            }"
          ></span>
        </div>
        <label class="goals__input-group">
          <span>{{ goal.trackingMode === 'manual' ? 'Mise à jour' : 'Suivi automatique' }}</span>
          <input
            type="number"
            min="0"
            :max="goal.targetValue"
            :value="goal.displayCurrentValue ?? goal.currentValue"
            :disabled="goal.trackingMode !== 'manual'"
            @change="emit('update-progress', { id: goal.id, value: Number(($event.target as HTMLInputElement).value) })"
          />
        </label>
        <p v-if="goal.deadline" class="goals__deadline">Limite : {{ goal.deadline }}</p>
      </article>
    </div>
    <p v-else class="state">Aucun objectif défini. Lance-toi un défi !</p>
  </section>
</template>

<style scoped>
.goals {
  background-color: var(--glass-surface);
  border-radius: 1.5rem;
  padding: 1.75rem 1.75rem;
  border: 1px solid rgba(255, 255, 255, 0.22);
  box-shadow: 0 22px 45px rgba(15, 23, 42, 0.75);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  position: relative;
  margin-bottom: 2em;
  color: #e5e7eb;
  backdrop-filter: blur(22px);
  -webkit-backdrop-filter: blur(22px);
}

.goals::after {
  content: none;
}

.goals__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

.goals__card {
  border-radius: 1.25rem;
  padding: 1.25rem 1.4rem;
  background-color: var(--glass-surface);
  border: 1px solid rgba(148, 163, 184, 0.7);
  box-shadow: 0 18px 36px rgba(15, 23, 42, 0.75);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  transition: var(--transition-snap);
  cursor: pointer;
  position: relative;
}

.goals__card:hover {
  transform: var(--transform-lift);
  box-shadow: var(--shadow-hover);
}

.goals__card--completed {
  border-color: #22c55e;
  box-shadow: 0 18px 40px rgba(34, 197, 94, 0.32);
  background:
    radial-gradient(circle at top left, rgba(34, 197, 94, 0.22), transparent 55%),
    var(--glass-surface);
}

.goals__header {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  align-items: flex-start;
}

.goals__badge {
  align-self: flex-start;
  margin-right: 0.35rem;
  padding: 0.15rem 0.55rem;
  border-radius: 999px;
  background: rgba(34, 197, 94, 0.16);
  color: #bbf7d0;
  font-size: 0.7rem;
  font-weight: 600;
}

.goals__label {
  margin: 0 0 0.35rem;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.15em;
  color: #6ee7b7;
}

.goals__value {
  margin: 0;
  font-weight: 700;
  color: #e5e7eb;
}

.goals__progress {
  width: 100%;
  height: 10px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.7);
}

.goals__progress span {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #22c55e, #a855f7);
}

.goals__input-group {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  font-size: 0.9rem;
  color: #cbd5f5;
}

.goals__input-group input {
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.7);
  background: rgba(15, 23, 42, 0.9);
  padding: 0.45rem 0.75rem;
  font-family: inherit;
  font-size: 0.9rem;
  color: #e5e7eb;
}

.goals__input-group input:focus {
  outline: none;
  border-color: #a855f7;
  box-shadow: 0 0 0 1px rgba(168, 85, 247, 0.4);
}

.goals__deadline {
  margin: 0;
  color: #9ca3af;
  font-size: 0.9rem;
}

.goals .state {
  color: #cbd5f5;
}
</style>
