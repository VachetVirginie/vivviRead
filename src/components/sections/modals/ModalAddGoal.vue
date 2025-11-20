<script setup lang="ts">
import { onBeforeUnmount, reactive, ref } from 'vue'
import BaseModal from '../../ui/BaseModal.vue'
import type { GoalForm } from '@/types/forms'

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'add', payload: {
    title: string
    targetValue: number
    unit: GoalForm['unit']
    deadline?: string
    trackingMode: GoalForm['trackingMode']
  }): void
}>()

const form = reactive<GoalForm>({
  title: '',
  targetValue: 4,
  unit: 'livres',
  deadline: '',
  trackingMode: 'manual',
})

const errorMessage = ref<string | null>(null)

function resetForm() {
  form.title = ''
  form.targetValue = 4
  form.unit = 'livres'
  form.deadline = ''
   form.trackingMode = 'manual'
  errorMessage.value = null
}

function handleSubmit() {
  if (!form.title.trim()) {
    errorMessage.value = "Le titre de l'objectif est requis."
    return
  }

  if (!Number.isFinite(form.targetValue) || form.targetValue <= 0) {
    errorMessage.value = 'Définis une valeur cible positive.'
    return
  }

  emit('add', {
    title: form.title.trim(),
    targetValue: form.targetValue,
    unit: form.unit,
    deadline: form.deadline || undefined,
    trackingMode: form.trackingMode,
  })

  resetForm()
  emit('close')
}

onBeforeUnmount(() => {
  resetForm()
})
</script>

<template>
  <BaseModal title="Créer un objectif" description="Définis une cible claire et suis ton avancement." @close="emit('close')">
    <form class="modal__form modal-add-goal" @submit.prevent="handleSubmit">
      <label>
        <span>Nom de l'objectif</span>
        <input v-model.trim="form.title" type="text" placeholder="Ex. 5 romans SFFF" required />
      </label>

      <div class="modal__form-row">
        <label>
          <span>Valeur cible</span>
          <input v-model.number="form.targetValue" type="number" min="1" placeholder="4" required />
        </label>
        <label class="modal-add-goal__units">
          <span>Unité</span>
          <div class="modal-add-goal__chips">
            <button
              v-for="unit in ['livres', 'pages', 'heures']"
              :key="unit"
              type="button"
              :class="['modal-add-goal__chip', { 'modal-add-goal__chip--active': form.unit === unit }]"
              @click="form.unit = unit as GoalForm['unit']"
            >
              {{ unit }}
            </button>
          </div>
        </label>
      </div>

      <label>
        <span>Mode de suivi</span>
        <div class="modal-add-goal__chips">
          <button
            type="button"
            :class="['modal-add-goal__chip', { 'modal-add-goal__chip--active': form.trackingMode === 'manual' }]"
            @click="form.trackingMode = 'manual'"
          >
            Manuel
          </button>
          <button
            type="button"
            :class="[
              'modal-add-goal__chip',
              { 'modal-add-goal__chip--active': form.trackingMode === 'auto_completed_books' },
            ]"
            @click="form.trackingMode = 'auto_completed_books'"
          >
            Livres terminés
          </button>
          <button
            type="button"
            :class="[
              'modal-add-goal__chip',
              { 'modal-add-goal__chip--active': form.trackingMode === 'auto_pages_read' },
            ]"
            @click="form.trackingMode = 'auto_pages_read'"
          >
            Pages lues
          </button>
        </div>
      </label>

      <label>
        <span>Date limite (optionnel)</span>
        <input v-model="form.deadline" type="date" />
      </label>

      <p v-if="errorMessage" class="state state--error">{{ errorMessage }}</p>

      <div class="modal__actions">
        <button type="submit">Enregistrer</button>
      </div>
    </form>
  </BaseModal>
</template>

<style scoped>
.modal-add-goal {
  margin-top: 0.6rem;
}

.modal-add-goal label {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.modal-add-goal label span {
  font-size: 0.8rem;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #cbd5f5;
}

.modal-add-goal label:last-of-type {
  margin-top: 0.75rem;
}

.modal-add-goal input,
.modal-add-goal select {
  font-size: 0.95rem;
}

.modal-add-goal__units {
  align-self: flex-end;
}

.modal-add-goal__chips {
  display: flex;
  gap: 0.4rem;
  margin-bottom: 0.4rem;
}

.modal-add-goal__chip {
  border-radius: 999px;
  padding: 0.35rem 0.9rem;
  border: 1px solid rgba(148, 163, 184, 0.7);
  background: transparent;
  color: #cbd5f5;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  cursor: pointer;
  transition: var(--transition-snap);
  box-shadow: none;
}

.modal-add-goal__chip--active {
  background: #f9fafb;
  border-color: transparent;
  color: #020617;
}

.modal-add-goal input::placeholder {
  color: #9ca3af;
}

.modal-add-goal input[type='number'] {
  appearance: textfield;
  -moz-appearance: textfield;
}

.modal-add-goal input[type='number']::-webkit-outer-spin-button,
.modal-add-goal input[type='number']::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>
