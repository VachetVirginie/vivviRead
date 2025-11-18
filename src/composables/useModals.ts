import { computed, ref } from 'vue'

export type ModalType = 'book' | 'goal'

type ActiveModal = ModalType | null

export function useModals() {
  const active = ref<ActiveModal>(null)

  function open(type: ModalType) {
    active.value = type
  }

  function close() {
    active.value = null
  }

  const isOpen = computed(() => active.value !== null)

  return {
    active,
    isOpen,
    open,
    close,
  }
}
