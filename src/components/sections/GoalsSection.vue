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
        :class="{ 'goals__card--completed': goal.currentValue >= goal.targetValue }"
      >
        <div class="goals__header">
          <div>
            <p class="goals__label">{{ goal.unit }}</p>
            <h3>{{ goal.title }}</h3>
          </div>
          <span v-if="goal.currentValue >= goal.targetValue" class="goals__badge">Atteint</span>
          <button class="shelf__remove" type="button" @click="emit('remove', goal.id)">Supprimer</button>
        </div>
        <p class="goals__value">
          {{ goal.currentValue }} / {{ goal.targetValue }} {{ goal.unit }}
        </p>
        <div class="goals__progress">
          <span :style="{ width: `${Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100))}%` }"></span>
        </div>
        <label class="goals__input-group">
          <span>Mise à jour</span>
          <input
            type="number"
            min="0"
            :max="goal.targetValue"
            :value="goal.currentValue"
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
  background: #ffffff;
  border-radius: 1.5rem;
  padding: 1.75rem 1.5rem;
  border: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.goals__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

.goals__card {
  border-radius: 1.25rem;
  padding: 1.25rem;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.goals__card--completed {
  border-color: #16a34a;
  box-shadow: 0 12px 32px rgba(22, 163, 74, 0.22);
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
  background: #ecfdf3;
  color: #166534;
  font-size: 0.7rem;
  font-weight: 600;
}

.goals__label {
  margin: 0 0 0.35rem;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.15em;
  color: #16a34a;
}

.goals__value {
  margin: 0;
  font-weight: 700;
  color: #111827;
}

.goals__progress {
  width: 100%;
  height: 10px;
  border-radius: 999px;
  background: #e5e7eb;
}

.goals__progress span {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: #111827;
}

.goals__input-group {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  font-size: 0.9rem;
  color: #4b5563;
}

.goals__input-group input {
  border-radius: 0.8rem;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  padding: 0.45rem 0.75rem;
  font-family: inherit;
  font-size: 0.9rem;
}

.goals__input-group input:focus {
  outline: none;
  border-color: var(--color-jaune-dore);
  box-shadow: 0 0 0 1px rgba(255, 209, 102, 0.4);
}

.goals__deadline {
  margin: 0;
  color: #4b5563;
  font-size: 0.9rem;
}
</style>
