<script setup lang="ts">
import { reactive, ref } from 'vue'
import BaseModal from '../../ui/BaseModal.vue'

interface FriendOption {
  id: string
  label: string
}

const props = defineProps<{
  bookTitle: string
  bookAuthor: string
  userBookId: string
  friends: FriendOption[]
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', payload: { toUserId: string; userBookId: string; message?: string }): void
}>()

const form = reactive<{
  friendId: string
  message: string
}>({
  friendId: '',
  message: '',
})

const errorMessage = ref<string | null>(null)

function handleSubmit() {
  if (!form.friendId) {
    errorMessage.value = 'Sélectionne un·e ami·e à qui recommander ce livre.'
    return
  }

  emit('submit', {
    toUserId: form.friendId,
    userBookId: props.userBookId,
    message: form.message.trim() || undefined,
  })

  errorMessage.value = null
}
</script>

<template>
  <BaseModal
    title="Recommander ce livre"
    :description="`Partage ${bookTitle} avec un·e ami·e de viviRead.`"
    @close="emit('close')"
  >
    <form class="modal__form modal-recommend-book" @submit.prevent="handleSubmit">
      <div class="modal-recommend-book__book">
        <p class="modal-recommend-book__title">{{ bookTitle }}</p>
        <p class="modal-recommend-book__author">{{ bookAuthor }}</p>
      </div>

      <label>
        <span>Choisir un·e ami·e</span>
        <select v-model="form.friendId" required>
          <option value="" disabled>Choisis dans ta liste d'ami·es</option>
          <option
            v-for="friend in friends"
            :key="friend.id"
            :value="friend.id"
          >
            {{ friend.label }}
          </option>
        </select>
      </label>

      <label>
        <span>Message (optionnel)</span>
        <textarea
          v-model="form.message"
          rows="3"
          placeholder="Explique pourquoi tu as pensé à cette personne, ou ce que ce livre peut lui apporter."
        />
      </label>

      <p v-if="errorMessage" class="state state--error">{{ errorMessage }}</p>

      <div class="modal__actions">
        <button type="submit">Envoyer la recommandation</button>
      </div>
    </form>
  </BaseModal>
</template>

<style scoped>
.modal-recommend-book {
  margin-top: 0.4rem;
}

.modal-recommend-book label {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.modal-recommend-book label + label {
  margin-top: 0.6rem;
}

.modal-recommend-book label span {
  font-size: 0.8rem;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #cbd5f5;
}

.modal-recommend-book textarea {
  border-radius: 0.9rem;
  min-height: 4.5rem;
}

.modal-recommend-book__book {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  margin-bottom: 0.6rem;
}

.modal-recommend-book__title {
  margin: 0;
  font-weight: 600;
  color: #f9fafb;
}

.modal-recommend-book__author {
  margin: 0;
  font-size: 0.9rem;
  color: #d1d5db;
}
</style>
