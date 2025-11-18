<script setup lang="ts">
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { computed, watchEffect } from 'vue'
import { useAuth } from '../composables/useAuth'

const route = useRoute()
const router = useRouter()

const {
  user,
  role,
  loading: authLoading,
  errorMessage: authError,
  email,
  password,
  fullName,
  signUpWithEmail,
  signInWithEmail,
} = useAuth()

const redirectPath = computed(() => (route.query.redirect as string | undefined) ?? '/home')

watchEffect(() => {
  if (user.value) {
    router.replace(redirectPath.value)
  }
})
</script>

<template>
  <main class="page login-page">
    <header class="page-header home-header">
      <div class="page-header__row">
        <div class="page-header__main">
          <p class="section-eyebrow">Connexion</p>
          <h2 class="page-header__title">Connecte-toi à VivviRead</h2>
          <p class="page-header__subtitle">
            Accède à ta bibliothèque, tes objectifs et tes recommandations personnalisées.
          </p>
        </div>
      </div>
    </header>

    <section class="home-block" aria-label="Connexion et inscription">
      <header class="home-block__header">
        <div class="home-block__header-main">
          <h2>Identifiants</h2>
          <p class="home-block__subtitle">
            Utilise ton email et ton mot de passe pour te connecter ou créer un compte.
          </p>
        </div>
      </header>

      <div class="auth-block">
        <div class="auth-block__status">
          <p v-if="user">
            Connecté en tant que <strong>{{ user.email }}</strong>
            <br />
            Rôle : <strong>{{ role }}</strong>
          </p>
          <p v-else>
            Non connecté.
          </p>
        </div>

        <form class="auth-block__form" @submit.prevent="signInWithEmail">
          <label class="auth-block__field">
            <span>Email</span>
            <input v-model="email" type="email" autocomplete="email" required />
          </label>

          <label class="auth-block__field">
            <span>Mot de passe</span>
            <input v-model="password" type="password" autocomplete="current-password" required />
          </label>

          <label class="auth-block__field">
            <span>Nom complet (pour l'inscription)</span>
            <input v-model="fullName" type="text" autocomplete="name" />
          </label>

          <div class="auth-block__actions">
            <button
              type="submit"
              class="page-header__action page-header__action--primary"
              :disabled="authLoading"
            >
              Se connecter
            </button>
            <button
              type="button"
              class="page-header__action page-header__action--secondary"
              :disabled="authLoading"
              @click.prevent="signUpWithEmail()"
            >
              Créer un compte
            </button>
          </div>

          <p v-if="authError" class="auth-block__error">
            {{ authError }}
          </p>
        </form>
      </div>

      <p class="home-block__hint">
        Une fois connecté·e, tu seras redirigé·e automatiquement vers ta page d'accueil.
      </p>
    </section>

  </main>
</template>
