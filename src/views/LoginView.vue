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
  <main class="page login-page" aria-labelledby="login-title">
    <section class="login-layout">
      <section class="login-hero" aria-labelledby="login-title">
        <p class="login-hero__eyebrow">MyBookNest</p>
        <h1 id="login-title" class="login-hero__title">
          Lis mieux.
          <br />
          Souviens-toi plus.
        </h1>
        <p class="login-hero__subtitle">
          Suis tes lectures, garde une trace de tes impressions et découvre ce que lisent tes amis.
        </p>
      </section>

      <section class="home-block login-card" aria-label="Connexion et inscription">
        <!-- Illustration au-dessus du formulaire -->
        <!-- <div class="login-illustration" aria-hidden="true">
          <img :src="homeIllustration" alt="Illustration de lecture pour BoookNest" />
        </div> -->

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

            <p v-if="authError && authError !== 'Auth session missing!'" class="auth-block__error">
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
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: none;
  margin: 0;
  padding: var(--space-12) var(--space-4);
  position: relative;
}

.login-layout {
  width: 100%;
  max-width: 1040px;
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
  justify-content: center;
  align-items: center;
  position: relative;
  z-index: 1;
}

.login-hero {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  text-align: center;
  color: #e5e7eb;
}

.login-hero__eyebrow {
  margin: 0;
  font-size: var(--text-xs);
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-neutral-100);
  font-weight: bolder;
}

.login-hero__title {
  margin: 0;
  font-size: var(--text-4xl);
  line-height: 1.1;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-weight: bolder;
}

.login-hero__subtitle {
  margin: 0;
  max-width: 26rem;
  font-size: var(--text-sm);
  color: #d1d5db;
  font-weight: bolder;
}

.login-illustration {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-bottom: var(--space-4);
}

.login-illustration img {
  max-width: 72px;
  height: auto;
  display: block;
  filter: drop-shadow(0 8px 16px rgba(15, 23, 42, 0.12));
}

.login-card {
  width: 100%;
  max-width: 420px;
  margin: 0 auto;
  background-color: hsla(246, 100%, 85%, 0.102);
  border-radius: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 26px 60px rgba(15, 23, 42, 0.45);
  padding: var(--space-6) var(--space-6) var(--space-5);
  position: relative;
  backdrop-filter: blur(22px);
  -webkit-backdrop-filter: blur(22px);
  animation: var(--animation-fade-in);
}
/* Onglets login / signup - style sobre */
.login-tabs {
  display: flex;
  gap: var(--space-2);
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  color: var(--color-neutral-100);
}

.login-tab {
  flex: 1;
  position: relative;
  border: none;
  border-radius: 0;
  background: transparent;
  padding: 0.5rem 0.25rem 0.75rem;
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  text-transform: none;
  color: var(--color-neutral-100);
  cursor: pointer;
  transition: color var(--transition-normal);
}

.login-tab--active {
  color: white;
}

.login-tab--active::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -1px;
  height: 2px;
  background: var(--accent-primary);
}

.login-tab:focus-visible {
  outline: 2px solid var(--color-jaune-dore);
  outline-offset: 2px;
}

/* Bloc formulaire */
.auth-block {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.auth-block__status {
  font-size: 0.85rem;
  color: #6b7280;
}

.auth-block__form {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.auth-block__field span {
  display: block;
  font-size: var(--text-xs);
  color: white;
  margin-bottom: 0.25rem;
}

.auth-block__field input {
  width: 100%;
  padding: 0.6rem 0.8rem;
  border-radius: 999px;
  border: 1px solid var(--color-neutral-300);
  font-size: var(--text-sm);
  background: rgba(248, 250, 252, 0.9);
  box-sizing: border-box;
}

.auth-block__field input:focus-visible {
  outline: 2px solid var(--color-jaune-dore);
  outline-offset: 1px;
  border-color: var(--color-jaune-dore);
}

.auth-block__actions {
  margin-top: var(--space-3);
}

.home-block__hint.login-hint {
  margin-top: 0.8rem;
  font-size: 0.8rem;
  color: #6b7280;
}

.login-toast {
  border-radius: 999px;
  border: 1px solid rgba(22, 163, 74, 0.35);
  background: #ecfdf3;
  color: #166534;
  padding: 0.5rem 0.9rem;
  font-size: var(--text-xs);
  margin-bottom: var(--space-3);
}

.auth-block__forgot {
  margin-top: var(--space-3);
  text-align: center;
}

.forgot-link {
  color: white;
  text-decoration: underline;
  text-underline-offset: 2px;
  font-size: var(--text-xs);
  padding: 0.25rem 0.5rem;
  border-radius: 999px;
  transition: var(--transition-smooth);
}

.forgot-link:hover {
  color: var(--color-neutral-900);
  background-color: var(--color-neutral-100);
}

.forgot-link:focus-visible {
  outline: 2px solid var(--color-jaune-dore);
  outline-offset: 2px;
}

.auth-block__error {
  margin-top: var(--space-2);
  font-size: var(--text-sm);
  color: #b91c1c;
  background-color: #fef2f2;
  border-radius: 0.75rem;
  border: 1px solid #fecaca;
  padding: 0.6rem 0.85rem;
}

/* Bouton principal – override du style global pour un rendu plus épuré */
.login-card .page-header__action {
  width: 100%;
  border-radius: 999px;
  border: none;
  padding: 0.75rem 1rem;
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  text-transform: none;
  background: var(--color-neutral-900);
  color: var(--color-surface);
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.35);
  transition: background var(--transition-normal), box-shadow var(--transition-normal), transform var(--transition-fast);
}

.login-card .page-header__action--primary:hover:not(:disabled) {
  background: #020617;
  box-shadow: 0 20px 45px rgba(15, 23, 42, 0.45);
  transform: translateY(-1px);
}

.login-card .page-header__action:disabled {
  opacity: 0.7;
  cursor: progress;
  box-shadow: none;
}

.login-card .page-header__action:focus-visible {
  outline: 2px solid var(--color-jaune-dore);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  .login-card {
    animation: none;
  }
}

@media (min-width: 768px) {
  .login-layout {
    flex-direction: row;
    align-items: center;
    gap: var(--space-10);
  }

  .login-hero {
    flex: 1;
    align-items: flex-start;
    text-align: left;
  }

  .login-card {
    flex: 1;
    max-width: 460px;
  }
}
</style>
