<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import homeIllustration from '../assets/home.svg'

const router = useRouter()
const { resetEmail, loading, errorMessage, resetPassword } = useAuth()

const successMessage = ref('')

async function handleResetPassword() {
  successMessage.value = ''
  const result = await resetPassword()
  
  if (result.success) {
    successMessage.value = 'Un email de réinitialisation a été envoyé à votre adresse email. Vérifiez votre boîte de réception.'
  }
}

function goBackToLogin() {
  router.push('/login')
}
</script>

<template>
  <main class="page login-page">
    <section class="login-layout">
      <section class="home-block login-card" aria-label="Réinitialisation du mot de passe">
        <!-- Illustration -->
        <div class="login-illustration" aria-hidden="true">
          <img :src="homeIllustration" alt="" />
        </div>

        <header class="reset-header">
          <h1>Mot de passe oublié ?</h1>
          <p>Pas de problème ! Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.</p>
        </header>

        <div class="auth-block">
          <form class="auth-block__form" @submit.prevent="handleResetPassword">
            <label class="auth-block__field">
              <span>Adresse email</span>
              <input 
                v-model="resetEmail" 
                type="email" 
                autocomplete="email" 
                placeholder="votre@email.com"
                required 
              />
            </label>

            <div class="auth-block__actions">
              <button
                type="submit"
                class="page-header__action page-header__action--primary"
                :disabled="loading"
              >
                {{ loading ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation' }}
              </button>
            </div>

            <div class="auth-block__messages">
              <p v-if="successMessage" class="auth-block__success">
                ✅ {{ successMessage }}
              </p>
              <p v-if="errorMessage" class="auth-block__error">
                ❌ {{ errorMessage }}
              </p>
            </div>
          </form>

          <div class="auth-block__back">
            <button type="button" class="back-link" @click="goBackToLogin">
              ← Retour à la connexion
            </button>
          </div>
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
  background: #ffffff;
  border-radius: 1.75rem;
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.25);
  padding: 1.5rem 1.5rem 1.4rem;
}

.reset-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.reset-header h1 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
}

.reset-header p {
  margin: 0;
  font-size: 0.9rem;
  color: #6b7280;
  line-height: 1.5;
}

.auth-block {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.auth-block__form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.auth-block__field span {
  display: block;
  font-size: 0.8rem;
  color: #6b7280;
  margin-bottom: 0.2rem;
  font-weight: 500;
}

.auth-block__field input {
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  border: 1px solid #d1d5db;
  font-size: 0.9rem;
  box-sizing: border-box;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.auth-block__field input:focus {
  outline: none;
  border-color: #facc15;
  box-shadow: 0 0 0 3px rgba(250, 204, 21, 0.1);
}

.auth-block__actions {
  margin-top: 0.5rem;
}

.auth-block__actions button {
  width: 100%;
}

.auth-block__messages {
  margin-top: 0.5rem;
}

.auth-block__success {
  margin: 0;
  padding: 0.75rem 1rem;
  background-color: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 0.5rem;
  color: #166534;
  font-size: 0.85rem;
  line-height: 1.4;
}

.auth-block__error {
  margin: 0;
  padding: 0.75rem 1rem;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 0.5rem;
  color: #dc2626;
  font-size: 0.85rem;
  line-height: 1.4;
}

.auth-block__back {
  margin-top: 1rem;
  text-align: center;
}

.back-link {
  background: none;
  border: none;
  color: #6b7280;
  font-size: 0.85rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: color 0.2s ease, background-color 0.2s ease;
}

.back-link:hover {
  color: #111827;
  background-color: #f9fafb;
}

@media (min-width: 768px) {
  .login-card {
    max-width: 480px;
  }
  
  .reset-header h1 {
    font-size: 1.75rem;
  }
}
</style>
