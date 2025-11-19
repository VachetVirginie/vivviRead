<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import homeIllustration from '../assets/home.svg'

const router = useRouter()
const route = useRoute()
const { newPassword, confirmPassword, loading, errorMessage, updatePassword } = useAuth()

const successMessage = ref('')
const isValidSession = ref(false)

onMounted(() => {
  // Vérifier si nous avons les paramètres nécessaires dans l'URL
  const accessToken = route.query.access_token
  const refreshToken = route.query.refresh_token
  
  if (accessToken && refreshToken) {
    isValidSession.value = true
  } else {
    // Rediriger vers la page de demande de réinitialisation si pas de tokens
    router.push('/forgot-password')
  }
})

async function handleUpdatePassword() {
  successMessage.value = ''
  const result = await updatePassword()
  
  if (result.success) {
    successMessage.value = 'Votre mot de passe a été mis à jour avec succès !'
    // Rediriger vers la page de connexion après 2 secondes
    setTimeout(() => {
      router.push('/login')
    }, 2000)
  }
}

function goBackToLogin() {
  router.push('/login')
}
</script>

<template>
  <main class="page login-page">
    <section class="login-layout">
      <section class="home-block login-card" aria-label="Nouveau mot de passe">
        <!-- Illustration -->
        <div class="login-illustration" aria-hidden="true">
          <img :src="homeIllustration" alt="" />
        </div>

        <header class="reset-header">
          <h1>Nouveau mot de passe</h1>
          <p>Choisissez un nouveau mot de passe sécurisé pour votre compte BoookNest.</p>
        </header>

        <div v-if="isValidSession" class="auth-block">
          <form class="auth-block__form" @submit.prevent="handleUpdatePassword">
            <label class="auth-block__field">
              <span>Nouveau mot de passe</span>
              <input 
                v-model="newPassword" 
                type="password" 
                autocomplete="new-password" 
                placeholder="Minimum 6 caractères"
                required 
                minlength="6"
              />
            </label>

            <label class="auth-block__field">
              <span>Confirmer le nouveau mot de passe</span>
              <input 
                v-model="confirmPassword" 
                type="password" 
                autocomplete="new-password" 
                placeholder="Retapez votre mot de passe"
                required 
                minlength="6"
              />
            </label>

            <div class="auth-block__actions">
              <button
                type="submit"
                class="page-header__action page-header__action--primary"
                :disabled="loading"
              >
                {{ loading ? 'Mise à jour...' : 'Mettre à jour le mot de passe' }}
              </button>
            </div>

            <div class="auth-block__messages">
              <p v-if="successMessage" class="auth-block__success">
                ✅ {{ successMessage }}
                <br><small>Redirection vers la connexion...</small>
              </p>
              <p v-if="errorMessage" class="auth-block__error">
                ❌ {{ errorMessage }}
              </p>
            </div>
          </form>
        </div>

        <div v-else class="auth-block">
          <div class="auth-block__error">
            ❌ Session invalide ou expirée. Veuillez demander un nouveau lien de réinitialisation.
          </div>
        </div>

        <div class="auth-block__back">
          <button type="button" class="back-link" @click="goBackToLogin">
            ← Retour à la connexion
          </button>
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
  border-color: var(--color-jaune-dore);
  box-shadow: 0 0 0 3px rgba(255, 209, 102, 0.1);
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
  color: var(--color-rouge-corail);
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
