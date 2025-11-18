<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { computed, ref, watchEffect } from 'vue'
import { useAuth } from '../composables/useAuth'
import homeIllustration from '../assets/home.svg'

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

// Mode: 'login' ou 'signup'
const mode = ref<'login' | 'signup'>('login')
const isLoginMode = computed(() => mode.value === 'login')

function switchToLogin() {
  mode.value = 'login'
}

function switchToSignup() {
  mode.value = 'signup'
}

async function handleSubmit() {
  if (isLoginMode.value) {
    await signInWithEmail()
  } else {
    await signUpWithEmail()
  }
}

watchEffect(() => {
  if (user.value) {
    router.replace(redirectPath.value)
  }
})
</script>

<template>
  <main class="page login-page">
    <section class="login-layout">
      <section class="home-block login-card" aria-label="Connexion et inscription">
        <!-- Illustration au-dessus du formulaire -->
        <div class="login-illustration" aria-hidden="true">
          <img :src="homeIllustration" alt="" />
        </div>

        <header class="login-tabs">
          <button
            type="button"
            class="login-tab"
            :class="{ 'login-tab--active': isLoginMode }"
            @click="switchToLogin"
          >
            Se connecter
          </button>
          <button
            type="button"
            class="login-tab"
            :class="{ 'login-tab--active': !isLoginMode }"
            @click="switchToSignup"
          >
            Créer un compte
          </button>
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

          <form class="auth-block__form" @submit.prevent="handleSubmit">
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
              <input
                v-model="fullName"
                type="text"
                autocomplete="name"
                :required="!isLoginMode"
              />
            </label>

            <div class="auth-block__actions">
              <button
                type="submit"
                class="page-header__action page-header__action--primary"
                :disabled="authLoading"
              >
                {{ isLoginMode ? 'Se connecter' : 'Créer un compte' }}
              </button>
            </div>

            <p v-if="authError" class="auth-block__error">
              {{ authError }}
            </p>
          </form>
        </div>

        <p class="home-block__hint login-hint">
          {{
            isLoginMode
              ? 'Une fois connecté·e, tu seras redirigé·e automatiquement vers ta page d\'accueil.'
              : 'Ton compte sera prêt en quelques secondes une fois le formulaire validé.'
          }}
        </p>
      </section>
    </section>
  </main>
</template>

<style scoped>
.login-page {
  padding-top: 2rem;
}

.login-layout {
  display: flex;
  flex-direction: column;
  gap: 1.8rem;
  align-items: center;
}

.login-illustration {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem 0;
}

.login-illustration img {
  max-width: 100%;
  height: auto;
  display: block;
}

.login-card {
  max-width: 420px;
  margin: 0 auto;
  background: #ffffff;
  border-radius: 1.75rem;
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.25);
  padding: 1.5rem 1.5rem 1.4rem;
}

/* Onglets login / signup */
.login-tabs {
  display: flex;
  gap: 0.5rem;
  background: #f3f4f6;
  border-radius: 999px;
  padding: 0.2rem;
  margin-bottom: 1.3rem;
}

.login-tab {
  flex: 1;
  border: none;
  border-radius: 999px;
  background: transparent;
  padding: 0.4rem 0.8rem;
  font-size: 0.85rem;
  font-weight: 500;
  color: #4b5563;
  cursor: pointer;
}

.login-tab--active {
  background: #111827;
  color: #f9fafb;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.35);
}

/* Bloc formulaire */
.auth-block {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.auth-block__status {
  font-size: 0.85rem;
  color: #6b7280;
}

.auth-block__form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.auth-block__field span {
  display: block;
  font-size: 0.8rem;
  color: #6b7280;
  margin-bottom: 0.2rem;
}

.auth-block__field input {
  width: 100%;
  padding: 0.5rem 0.7rem;
  border-radius: 0.75rem;
  border: 1px solid #d1d5db;
  font-size: 0.9rem;
  box-sizing: border-box;
}

.auth-block__field input:focus {
  outline: 2px solid #facc15;
  outline-offset: 1px;
  border-color: #facc15;
}

.auth-block__actions {
  margin-top: 0.4rem;
}

.home-block__hint.login-hint {
  margin-top: 0.8rem;
  font-size: 0.8rem;
  color: #6b7280;
}

.auth-block__error {
  margin-top: 0.4rem;
  font-size: 0.82rem;
}

@media (min-width: 768px) {
  .login-card {
    max-width: 480px;
  }
}
</style>
