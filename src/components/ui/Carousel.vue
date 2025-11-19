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

// Classes CSS dynamiques selon le nombre d'éléments
const trackClasses = computed(() => {
  const classes = ['carousel__track']
  if (props.itemsCount === 1) {
    classes.push('carousel__track--single')
  } else if (props.itemsCount === 2) {
    classes.push('carousel__track--double')
  }
  return classes.join(' ')
})

const carouselClasses = computed(() => {
  const classes = ['carousel']
  if (props.itemsCount === 1) {
    classes.push('carousel--single')
  }
  return classes.join(' ')
})

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
    :class="carouselClasses"
    role="region"
    :aria-label="props.ariaLabel"
    tabindex="0"
  >
    <div class="carousel__viewport">
      <div
        :class="trackClasses"
        :style="{
          '--carousel-page': String(currentPage),
          '--carousel-items-per-page': String(props.itemsPerPage),
        }"
      >
        <slot />
      </div>
    </div>
    <div v-if="totalPages > 1" class="carousel__controls">
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
  gap: var(--space-4);
}

.carousel--single {
  gap: var(--space-2);
}

.carousel__viewport {
  overflow: hidden;
  border-radius: var(--radius-xl);
}

.carousel__track {
  display: flex;
  gap: var(--space-6);
  transition: transform var(--transition-slow);
  transform: translateX(calc(var(--carousel-page, 0) * -100%));
  padding: var(--space-1);
}

.carousel__controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
}

.carousel__control {
  border-radius: var(--radius-full);
  border: 1px solid var(--color-neutral-200);
  background: var(--color-surface);
  padding: var(--space-2) var(--space-3);
  cursor: pointer;
  transition: all var(--transition-normal);
  box-shadow: var(--shadow-sm);
  font-size: var(--text-sm);
  color: var(--color-neutral-600);
}

.carousel__control:hover:not(:disabled) {
  background: var(--color-primary-yellow);
  color: var(--color-neutral-900);
  border-color: var(--color-primary-yellow-dark);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.carousel__control:disabled {
  opacity: 0.4;
  cursor: default;
  background: var(--color-neutral-100);
}

.carousel__status {
  margin: 0;
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--color-neutral-600);
  padding: var(--space-2) var(--space-3);
  background: var(--color-neutral-100);
  border-radius: var(--radius-full);
  min-width: 60px;
  text-align: center;
}

.carousel__slide {
  flex: 0 0 calc(100% / var(--carousel-items-per-page, 1));
  max-width: 320px;
  margin: 0 auto;
}

/* Ajustements pour différents nombres d'éléments */
.carousel__track--single {
  justify-content: center;
}

.carousel__track--single .carousel__slide {
  max-width: 400px;
}

.carousel__track--double {
  justify-content: center;
  gap: var(--space-8);
}

.carousel__track--double .carousel__slide {
  max-width: 280px;
}

@media (min-width: 768px) {
  .carousel__slide {
    max-width: 280px;
  }
  
  .carousel__track--single .carousel__slide {
    max-width: 420px;
  }
  
  .carousel__track--double .carousel__slide {
    max-width: 300px;
  }
}
</style>
