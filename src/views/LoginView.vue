<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { computed, ref, watchEffect } from 'vue'
import { useAuth } from '../composables/useAuth'
import homeIllustration from '../assets/4.svg'

const route = useRoute()
const router = useRouter()

const {
  user,
  loading: authLoading,
  errorMessage: authError,
  email,
  password,
  username,
  signUpWithEmail,
  signInWithEmail,
} = useAuth()

const redirectPath = computed(() => (route.query.redirect as string | undefined) ?? '/home')

// Mode: 'login' ou 'signup'
const mode = ref<'login' | 'signup'>('login')
const isLoginMode = computed(() => mode.value === 'login')

const signupToast = ref<string | null>(null)

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
    const result = await signUpWithEmail()
    if (result && result.success) {
      signupToast.value =
        "Inscription réussie. Vérifie ta boîte mail pour confirmer ton compte avant de te connecter."
      window.setTimeout(() => {
        signupToast.value = null
      }, 6000)
    }
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
          <div v-if="signupToast" class="login-toast">
            {{ signupToast }}
          </div>

          <form class="auth-block__form" @submit.prevent="handleSubmit">
            <label v-if="!isLoginMode" class="auth-block__field">
              <span>Pseudo</span>
              <input
                v-model="username"
                type="text"
                autocomplete="nickname"
                :required="!isLoginMode"
              />
            </label>

            <label class="auth-block__field">
              <span>Email</span>
              <input v-model="email" type="email" autocomplete="email" required />
            </label>

            <label class="auth-block__field">
              <span>Mot de passe</span>
              <input v-model="password" type="password" autocomplete="current-password" required />
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

            <div v-if="isLoginMode" class="auth-block__forgot">
              <router-link to="/forgot-password" class="forgot-link">
                Mot de passe oublié ?
              </router-link>
            </div>

            <p v-if="authError" class="auth-block__error">
              {{ authError }}
            </p>
          </form>
        </div>

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
  background: var(--color-white);
  border-radius: 0;
  border: 3px solid var(--color-black);
  box-shadow: var(--shadow-brutal);
  padding: 1.5rem 1.5rem 1.4rem;
  position: relative;
  animation: var(--animation-bounce-in);
}

.login-card::after {
  content: '🔐';
  position: absolute;
  top: -3px;
  right: -3px;
  width: 20px;
  height: 20px;
  background: var(--accent-tertiary);
  color: var(--color-black);
  border: 2px solid var(--color-black);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

/* Onglets login / signup */
.login-tabs {
  display: flex;
  gap: 2px;
  background: var(--color-black);
  border-radius: 0;
  padding: 2px;
  margin-bottom: 1.3rem;
}

.login-tab {
  flex: 1;
  border: none;
  border-radius: 0;
  background: var(--color-white);
  padding: 0.4rem 0.8rem;
  font-size: 0.85rem;
  font-weight: bold;
  text-transform: uppercase;
  color: var(--color-black);
  cursor: pointer;
  transition: var(--transition-snap);
}

.login-tab--active {
  background: var(--color-black);
  color: var(--color-white);
  box-shadow: var(--shadow-brutal);
  transform: var(--transform-float);
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
  outline: 2px solid var(--color-jaune-dore);
  outline-offset: 1px;
  border-color: var(--color-jaune-dore);
}

.auth-block__actions {
  margin-top: 0.4rem;
}

.home-block__hint.login-hint {
  margin-top: 0.8rem;
  font-size: 0.8rem;
  color: #6b7280;
}

.login-toast {
  border-radius: 0;
  border: 2px solid var(--color-black);
  background: var(--color-jaune-dore);
  padding: 0.4rem 0.75rem;
  font-size: 0.8rem;
  margin-bottom: 0.75rem;
}

.auth-block__forgot {
  margin-top: 0.75rem;
  text-align: center;
}

.forgot-link {
  color: #6b7280;
  text-decoration: none;
  font-size: 0.85rem;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: color 0.2s ease, background-color 0.2s ease;
}

.forgot-link:hover {
  color: #111827;
  background-color: #f9fafb;
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
