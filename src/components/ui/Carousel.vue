<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    itemsCount: number
    ariaLabel: string
    itemsPerPage?: number
  }>(),
  {
    itemsPerPage: 1,
  },
)

const currentPage = ref(0)

const totalPages = computed(() => {
  if (!props.itemsCount || props.itemsPerPage <= 0) return 1
  return Math.max(1, Math.ceil(props.itemsCount / props.itemsPerPage))
})

const canPrev = computed(() => currentPage.value > 0)
const canNext = computed(() => currentPage.value < totalPages.value - 1)

function goTo(page: number) {
  if (page < 0 || page > totalPages.value - 1) return
  currentPage.value = page
}

function goPrev() {
  if (!canPrev.value) return
  goTo(currentPage.value - 1)
}

function goNext() {
  if (!canNext.value) return
  goTo(currentPage.value + 1)
}

const rootEl = ref<HTMLElement | null>(null)

watch(
  () => props.itemsCount,
  () => {
    const lastPageIndex = totalPages.value - 1
    if (currentPage.value > lastPageIndex) {
      currentPage.value = Math.max(0, lastPageIndex)
    }
  },
)

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowRight') {
    event.preventDefault()
    goNext()
  } else if (event.key === 'ArrowLeft') {
    event.preventDefault()
    goPrev()
  }
}

onMounted(() => {
  if (rootEl.value) {
    rootEl.value.addEventListener('keydown', handleKeydown)
  }
})

onBeforeUnmount(() => {
  if (rootEl.value) {
    rootEl.value.removeEventListener('keydown', handleKeydown)
  }
})
</script>

<template>
  <section
    ref="rootEl"
    class="carousel"
    role="region"
    :aria-label="props.ariaLabel"
    tabindex="0"
  >
    <div class="carousel__viewport">
      <div
        class="carousel__track"
        :style="{
          '--carousel-page': String(currentPage),
          '--carousel-items-per-page': String(props.itemsPerPage),
        }"
      >
        <slot />
      </div>
    </div>
    <div class="carousel__controls">
      <button
        type="button"
        class="carousel__control carousel__control--prev"
        :disabled="!canPrev"
        aria-label="Élément précédent"
        @click="goPrev"
      >
        ◀
      </button>
      <p class="carousel__status" aria-live="polite">
        {{ currentPage + 1 }} / {{ totalPages }}
      </p>
      <button
        type="button"
        class="carousel__control carousel__control--next"
        :disabled="!canNext"
        aria-label="Élément suivant"
        @click="goNext"
      >
        ▶
      </button>
    </div>
  </section>
</template>

<style scoped>
.carousel {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.carousel__viewport {
  overflow: hidden;
}

.carousel__track {
  display: flex;
  gap: 1.25rem;
  transition: transform 220ms ease-out;
  transform: translateX(calc(var(--carousel-page, 0) * -100%));
}

.carousel__controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.carousel__control {
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  padding: 0.35rem 0.7rem;
  cursor: pointer;
}

.carousel__control:disabled {
  opacity: 0.5;
  cursor: default;
}

.carousel__status {
  margin: 0;
  font-size: 0.85rem;
  color: #6b7280;
}

.carousel__slide {
  flex: 0 0 calc(100% / var(--carousel-items-per-page, 1));
}
</style>
