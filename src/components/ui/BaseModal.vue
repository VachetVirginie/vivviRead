<script setup lang="ts">
const props = defineProps<{
  title?: string
  description?: string
}>()

defineEmits<{ (e: 'close'): void }>()
</script>

<template>
  <div class="modal__backdrop" role="dialog" aria-modal="true">
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
  background: radial-gradient(circle at top left, rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.95));
  backdrop-filter: blur(18px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  z-index: 20;
  animation: var(--animation-fade-in);
}

.modal__dialog {
  width: min(640px, 100%);
  max-height: min(80vh, 640px);
  background-color: hsla(246, 100%, 85%, 0.16);
  color: #e5e7eb;
  border-radius: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.22);
  padding: 1.7rem 1.9rem 1.6rem;
  position: relative;
  box-shadow: 0 26px 60px rgba(15, 23, 42, 0.9);
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
  animation: var(--animation-bounce-in);
  transform-origin: center;
  overflow-y: auto;
}

.modal__dialog::after {
  content: none;
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
  color: #f9fafb;
}

.modal__intro p {
  margin: 0;
  color: #d1d5db;
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
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.7);
  background: rgba(15, 23, 42, 0.9);
  color: #e5e7eb;
  padding: 0.65rem 0.9rem;
  font-family: inherit;
  font-weight: 500;
  transition: var(--transition-snap);
  box-shadow: 0 0 0 1px rgba(15, 23, 42, 0.8);
}

.modal__form input:focus,
.modal__form select:focus,
.modal__form textarea:focus {
  outline: none;
  border-color: #a855f7;
  box-shadow: 0 0 0 1px rgba(168, 85, 247, 0.4);
}

.modal__actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.modal__actions button {
  border: none;
  border-radius: 999px;
  padding: 0.7rem 1.6rem;
  font-weight: 600;
  text-transform: none;
  cursor: pointer;
  transition: var(--transition-snap);
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.8);
}

.modal__actions button:first-child {
  background: #f9fafb;
  color: #020617;
}

.modal__actions button:first-child:hover {
  background: #e5e7eb;
}
</style>
