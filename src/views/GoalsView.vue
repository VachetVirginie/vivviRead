<script setup lang="ts">
import { computed } from 'vue'

import { useAppContext } from '../composables/useAppContext'

import GoalsSection from '../components/sections/GoalsSection.vue'
import ModalAddGoal from '../components/sections/modals/ModalAddGoal.vue'

const { goals, modals } = useAppContext()

const goalsList = computed(() => goals.goals.value)
const isGoalModalOpen = computed(() => modals.active.value === 'goal')

function handleGoalProgress(payload: { id: string; value: number }) {
  goals.updateGoalProgress(payload.id, payload.value)
}
</script>

<template>
  <main class="page">
    <header class="page-header">
      <div class="page-header__row">
        <div class="page-header__main">
          <h1 class="page-header__title">Objectifs de lecture</h1>
        </div>
        <div class="page-header__actions">
          <button
            type="button"
            class="page-header__action page-header__action--primary"
            @click="modals.open('goal')"
          >
            Ajouter un objectif
          </button>
        </div>
      </div>
    </header>

    <GoalsSection
      :goals="goalsList"
      @update-progress="handleGoalProgress"
      @remove="goals.removeGoal"
    />

    <ModalAddGoal
      v-if="isGoalModalOpen"
      @close="modals.close"
      @add="goals.addGoal"
    />
  </main>
</template>
