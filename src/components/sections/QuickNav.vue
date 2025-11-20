<script setup lang="ts">
interface NavLink {
  id: string
  label: string
}

const props = defineProps<{
  links: NavLink[]
}>()

const emit = defineEmits<{
  (e: 'open-modal', type: 'book' | 'goal'): void
}>()

function handleOpen(type: 'book' | 'goal') {
  emit('open-modal', type)
}
</script>

<template>
  <nav class="quick-nav" aria-label="Navigation rapide">
    <a v-for="link in props.links" :key="link.id" :href="`#${link.id}`">
      {{ link.label }}
    </a>
    <span class="quick-nav__separator" aria-hidden="true"></span>
    <button type="button" @click="handleOpen('book')">Ajouter un livre</button>
    <button type="button" @click="handleOpen('goal')">Créer un objectif</button>
  </nav>
</template>

<style scoped>
.quick-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
  align-items: center;
  background-color: hsla(246, 100%, 85%, 0.102);
  padding: 0.75rem 1rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.24);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}

.quick-nav a {
  color: #e5e7eb;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95rem;
}

.quick-nav__separator {
  flex: 1;
  height: 1px;
  background: rgba(148, 163, 184, 0.35);
}

.quick-nav button {
  border: none;
  border-radius: 999px;
  padding: 0.5rem 1.25rem;
  font-weight: 600;
  cursor: pointer;
  background: #f9fafb;
  color: #020617;
}
</style>
