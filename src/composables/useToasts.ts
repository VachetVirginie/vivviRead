import { ref } from 'vue'

export type ToastVariant = 'default' | 'success' | 'error'

export interface ToastInput {
  message: string
  actionLabel?: string
  onAction?: () => void
  variant?: ToastVariant
  timeoutMs?: number
}

export interface Toast extends Omit<ToastInput, 'timeoutMs'> {
  id: string
}

const toasts = ref<Toast[]>([])

let idCounter = 0

function nextId() {
  idCounter += 1
  return `toast-${idCounter}-${Date.now()}`
}

function dismiss(id: string) {
  toasts.value = toasts.value.filter((toast) => toast.id !== id)
}

function showToast(input: ToastInput) {
  const { timeoutMs, ...rest } = input
  const id = nextId()

  const toast: Toast = {
    id,
    message: rest.message,
    actionLabel: rest.actionLabel,
    onAction: rest.onAction,
    variant: rest.variant ?? 'default',
  }

  toasts.value = [...toasts.value, toast]

  const ms = typeof timeoutMs === 'number' ? timeoutMs : 4000
  if (ms > 0) {
    setTimeout(() => {
      dismiss(id)
    }, ms)
  }
}

export function useToasts() {
  return {
    toasts,
    showToast,
    dismiss,
  }
}
