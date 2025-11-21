<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()

const tabs = [
  { id: 'pal', label: 'PAL', routeName: 'libraryPal' },
  { id: 'in-progress', label: 'En cours', routeName: 'libraryInProgress' },
  { id: 'completed', label: 'Lus', routeName: 'libraryCompleted' },
  { id: 'abandoned', label: 'Abandonnés', routeName: 'libraryAbandoned' },
] as const

const currentName = computed(() => route.name)

function goTo(name: string) {
  if (currentName.value === name) return
  router.push({ name })
}
</script>

<template>
  <nav class="library-subnav" aria-label="Navigation dans la bibliothèque">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      type="button"
      class="library-subnav__tab"
      :class="{ 'library-subnav__tab--active': currentName === tab.routeName }"
      :aria-current="currentName === tab.routeName ? 'page' : undefined"
      @click="goTo(tab.routeName)"
    >
      <span class="library-subnav__tab-label">{{ tab.label }}</span>
    </button>
  </nav>
</template>

<style scoped>
.library-subnav {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
  padding: 0.6rem 0.8rem;
  margin-bottom: 1.5rem;
  background-color: hsla(246, 100%, 85%, 0.14);
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.24);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}

.library-subnav__tab {
  border: 1px solid rgba(148, 163, 184, 0.7);
  border-radius: 999px;
  padding: 0.35rem 0.9rem;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  background: transparent;
  color: #e5e7eb;
  cursor: pointer;
  transition: var(--transition-snap);
}

.library-subnav__tab:hover {
  background: rgba(15, 23, 42, 0.7);
}

.library-subnav__tab--active {
  background: #f9fafb;
  color: #020617;
  border-color: transparent;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.9);
}

.library-subnav__tab--active:hover {
  background: #e5e7eb;
}

.library-subnav__tab-label {
  white-space: nowrap;
}

.library-subnav__tab:focus-visible {
  outline: 2px solid var(--accent-tertiary);
  outline-offset: 3px;
}

@media (max-width: 640px) {
  .library-subnav {
    border-radius: 1.25rem;
    padding: 0.6rem 0.75rem;
  }

  .library-subnav__tab {
    flex: 1 1 calc(50% - 0.5rem);
    text-align: center;
  }
}
</style>
