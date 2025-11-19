<script setup lang="ts">
const props = defineProps<{
  title?: string
  description?: string
}>()

defineEmits<{ (e: 'close'): void }>()
</script>

<template>
  <div class="modal" role="dialog" aria-modal="true">
    <div class="modal__dialog">
      <button class="modal__close" type="button" aria-label="Fermer" @click="$emit('close')">×</button>
      <div v-if="props.title" class="modal__intro">
        <h3>{{ props.title }}</h3>
        <p v-if="props.description">{{ props.description }}</p>
      </div>
      <slot />
    </div>
  </div>
</template>

<style scoped>
.modal {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  z-index: 20;
}

.modal__dialog {
  width: min(420px, 100%);
  background: #ffffff;
  color: #111827;
  border-radius: 1rem;
  border: 1px solid #e5e7eb;
  padding: 1.7rem 1.7rem 1.4rem;
  position: relative;
  box-shadow: 0 22px 45px rgba(15, 23, 42, 0.2);
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}

.modal__close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  border: none;
  background: transparent;
  color: #9ca3af;
  font-size: 1.2rem;
  cursor: pointer;
}

.modal__intro h3 {
  margin: 0 0 0.25rem;
}

.modal__intro p {
  margin: 0;
  color: #4b5563;
}

.modal__form {
  display: flex;
  flex-direction: column;
  gap: 1.05rem;
}

.modal__form input,
.modal__form select,
.modal__form textarea {
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  color: #111827;
  padding: 0.65rem 0.9rem;
  font-family: inherit;
}

.modal__form input:focus,
.modal__form select:focus,
.modal__form textarea:focus {
  outline: none;
  border-color: var(--color-jaune-dore);
  box-shadow: 0 0 0 1px rgba(255, 209, 102, 0.18);
  background: #ffffff;
}

.modal__actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.modal__actions button {
  border: none;
  border-radius: 999px;
  padding: 0.65rem 1.4rem;
  font-weight: 600;
  cursor: pointer;
}

.modal__actions button:first-child {
  background: var(--color-jaune-dore);
  color: #111827;
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.2);
}
</style>
