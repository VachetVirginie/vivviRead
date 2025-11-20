<script setup lang="ts">
import { onBeforeUnmount, reactive, ref } from 'vue'
import BaseModal from '../../ui/BaseModal.vue'
import type { AddBookForm } from '@/types/forms'

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'add', payload: { title: string; author: string; totalPages?: number }): void
}>()

const form = reactive<AddBookForm>({
  title: '',
  author: '',
  totalPages: null,
})

const errorMessage = ref<string | null>(null)

function resetForm() {
  form.title = ''
  form.author = ''
  form.totalPages = null
  errorMessage.value = null
}

function handleSubmit() {
  if (!form.title.trim() || !form.author.trim()) {
    errorMessage.value = 'Titre et auteur·ice sont requis.'
    return
  }

  emit('add', {
    title: form.title.trim(),
    author: form.author.trim(),
    totalPages: form.totalPages ?? undefined,
  })

  resetForm()
  emit('close')
}

onBeforeUnmount(() => {
  resetForm()
})
</script>

<template>
  <BaseModal title="Ajouter un livre" description="Complète les infos principales pour démarrer le suivi." @close="emit('close')">
    <form class="modal__form modal-add-book" @submit.prevent="handleSubmit">
      <label>
        <span>Titre du livre</span>
        <input v-model.trim="form.title" type="text" placeholder="Ex. Demain et tous les autres jours" required />
      </label>

      <label>
        <span>Auteur·ice</span>
        <input v-model.trim="form.author" type="text" placeholder="Ex. Sophie Astrabie" required />
      </label>

      <label>
        <span>Nombre de pages (optionnel)</span>
        <input v-model.number="form.totalPages" type="number" min="1" placeholder="320" />
      </label>

      <p v-if="errorMessage" class="state state--error">{{ errorMessage }}</p>

      <div class="modal__actions">
        <button type="submit">Ajouter</button>
      </div>
    </form>
  </BaseModal>
</template>

<style scoped>
.modal-add-book {
  margin-top: 0.6rem;
}

.modal-add-book label {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.modal-add-book label + label {
  margin-top: 0.35rem;
}

.modal-add-book label span {
  font-size: 0.8rem;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #cbd5f5;
}

.modal-add-book input {
  font-size: 0.95rem;
}

.modal-add-book input::placeholder {
  color: #9ca3af;
}

.modal-add-book input[type='number'] {
  appearance: textfield;
  -moz-appearance: textfield;
}

.modal-add-book input[type='number']::-webkit-outer-spin-button,
.modal-add-book input[type='number']::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>
