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
.modal__backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  z-index: 20;
  animation: var(--animation-fade-in);
}

.modal__dialog {
  width: min(420px, 100%);
  background: var(--color-white);
  color: var(--color-black);
  border-radius: 0;
  border: 3px solid var(--color-black);
  padding: 1.7rem 1.7rem 1.4rem;
  position: relative;
  box-shadow: var(--shadow-brutal);
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
  animation: var(--animation-bounce-in);
  transform-origin: center;
}

.modal__dialog::after {
  content: '';
  position: absolute;
  top: -3px;
  right: -3px;
  width: 16px;
  height: 16px;
  background: var(--accent-primary);
  border: 2px solid var(--color-black);
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
  width: 100%;
  border-radius: 0;
  border: 2px solid var(--color-black);
  background: var(--color-white);
  color: var(--color-black);
  padding: 0.65rem 0.9rem;
  font-family: inherit;
  font-weight: 500;
  transition: var(--transition-snap);
  box-shadow: var(--shadow-inset);
}

.modal__form input:focus,
.modal__form select:focus,
.modal__form textarea:focus {
  outline: none;
  border-color: var(--accent-tertiary);
  box-shadow: var(--shadow-brutal);
  transform: var(--transform-float);
}

.modal__actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.modal__actions button {
  border: 2px solid var(--color-black);
  border-radius: 0;
  padding: 0.65rem 1.4rem;
  font-weight: bold;
  text-transform: uppercase;
  cursor: pointer;
  transition: var(--transition-snap);
  box-shadow: var(--shadow-brutal);
}

.modal__actions button:first-child {
  background: var(--accent-tertiary);
  color: var(--color-black);
}

.modal__actions button:first-child:hover {
  transform: var(--transform-press);
  box-shadow: var(--shadow-hover);
}
</style>
