<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { provideAppContext } from './composables/useAppContext'

provideAppContext()
</script>

<template>
  <div class="app-shell">
    <div class="app-shell__content">
      <RouterView />
    </div>

    <nav class="app-shell__nav" aria-label="Navigation principale">
      <RouterLink to="/home" class="app-shell__nav-link">Accueil</RouterLink>
      <RouterLink to="/livres" class="app-shell__nav-link">Livres</RouterLink>
      <RouterLink to="/objectifs" class="app-shell__nav-link">Objectifs</RouterLink>
      <RouterLink to="/explorer" class="app-shell__nav-link">Explorer</RouterLink>
    </nav>
  </div>
</template>
