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

// Responsive items per page avec window resize
const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1024)

const responsiveItemsPerPage = computed(() => {
  if (windowWidth.value <= 640) {
    // Mobile: force 1 item par page pour plus de pages
    return 1
  } else if (windowWidth.value <= 1024) {
    // Tablette: 2 items par page
    return Math.min(2, props.itemsPerPage)
  } else {
    // Desktop: utilise la prop normale
    return props.itemsPerPage
  }
})

function handleResize() {
  windowWidth.value = window.innerWidth
}

// Classes CSS dynamiques selon le nombre d'éléments
const trackClasses = computed(() => {
  const classes = ['carousel__track']
  if (props.itemsCount === 1) {
    classes.push('carousel__track--single')
  } else if (props.itemsCount === 2) {
    classes.push('carousel__track--double')
  }
  
  // Ajout de classes selon items-per-page responsive
  classes.push(`carousel__track--items-${responsiveItemsPerPage.value}`)
    
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
  if (!props.itemsCount || responsiveItemsPerPage.value <= 0) return 1
  return Math.max(1, Math.ceil(props.itemsCount / responsiveItemsPerPage.value))
})

const hasLessItemsThanCapacity = computed(() => {
  return props.itemsCount < responsiveItemsPerPage.value
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

// Variables pour les gestes tactiles
const touchStartX = ref(0)
const touchEndX = ref(0)

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

function handleTouchStart(event: TouchEvent) {
  if (event.touches[0]) {
    touchStartX.value = event.touches[0].clientX
  }
}

function handleTouchEnd(event: TouchEvent) {
  if (event.changedTouches[0]) {
    touchEndX.value = event.changedTouches[0].clientX
    handleSwipe()
  }
}

function handleSwipe() {
  const swipeThreshold = 50
  const diff = touchStartX.value - touchEndX.value
  
  if (Math.abs(diff) > swipeThreshold) {
    if (diff > 0) {
      // Swipe vers la gauche -> page suivante
      goNext()
    } else {
      // Swipe vers la droite -> page précédente
      goPrev()
    }
  }
}

onMounted(() => {
  if (rootEl.value) {
    rootEl.value.addEventListener('keydown', handleKeydown)
  }
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  if (rootEl.value) {
    rootEl.value.removeEventListener('keydown', handleKeydown)
  }
  window.removeEventListener('resize', handleResize)
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
    <div 
      class="carousel__viewport"
      @touchstart="handleTouchStart"
      @touchend="handleTouchEnd"
    >
      <div
        :class="trackClasses"
        :data-items-less-than-capacity="hasLessItemsThanCapacity"
        :style="{
          '--carousel-page': String(currentPage),
          '--carousel-items-per-page': String(responsiveItemsPerPage),
        }"
      >
        <slot />
      </div>
    </div>
    <div v-if="props.itemsCount > 0" class="carousel__controls">
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
  width: 100%;
  position: relative;
  box-sizing: border-box;
  /* DEBUG: border: 2px solid red; */
}

.carousel__track {
  display: flex;
  gap: var(--space-4);
  transition: transform var(--transition-slow);
  transform: translateX(calc(var(--carousel-page, 0) * -100%));
  padding: var(--space-3);
  align-items: stretch;
  min-height: 100%;
  justify-content: flex-start;
  box-sizing: border-box;
  width: 100%;
  /* DEBUG: border: 2px solid blue; */
}

/* Centrage automatique quand il y a moins d'éléments que la capacité */
.carousel__track[data-items-less-than-capacity="true"] {
  justify-content: center;
}

.carousel__controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
  margin-top: var(--space-4);
  padding: var(--space-2);
}

.carousel__control {
  border-radius: 0;
  border: 2px solid var(--color-black);
  background: var(--color-white);
  padding: var(--space-2) var(--space-3);
  cursor: pointer;
  transition: var(--transition-snap);
  box-shadow: var(--shadow-subtle);
  font-size: var(--text-sm);
  font-weight: bold;
  color: var(--color-black);
}

.carousel__control:hover:not(:disabled) {
  background: var(--accent-tertiary);
  transform: var(--transform-press);
  box-shadow: var(--shadow-hover);
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
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow: hidden;
}

/* Largeurs par défaut selon le nombre d'items par page */
.carousel__slide {
  width: 300px;
  max-width: 100%;
}

/* Reset pour éviter les conflits */
.carousel__track--items-1 .carousel__slide,
.carousel__track--items-2 .carousel__slide,
.carousel__track--items-3 .carousel__slide {
  width: auto;
}

/* 3 items par page = ~33% chacun */
.carousel__track--items-3 .carousel__slide {
  width: calc(33.333% - 1rem);
}

/* 2 items par page = ~50% chacun */  
.carousel__track--items-2 .carousel__slide {
  width: calc(50% - 1rem);
}

/* 1 item par page = largeur auto centrée */
.carousel__track--items-1 .carousel__slide {
  width: auto;
  max-width: 400px;
  min-width: 300px;
}

/* Ajustements pour différents nombres d'éléments */
.carousel__track--single {
  justify-content: center;
}

.carousel__track--single .carousel__slide {
  flex: 0 0 auto;
  width: auto;
  max-width: 400px;
  min-width: 300px;
}

.carousel__track--double {
  justify-content: center;
  gap: var(--space-8);
}

.carousel__track--double .carousel__slide {
  flex: 0 0 auto;
  width: auto;
  max-width: 350px;
  min-width: 280px;
}

/* === RESPONSIVE MOBILE FIRST === */

/* Mobile : 1 ou 2 items max */
@media (max-width: 640px) {
  .carousel__track {
    padding: var(--space-2);
    gap: var(--space-3);
  }
  
  /* Force 2 items sur mobile pour 3 items */
  .carousel__track--items-3 .carousel__slide {
    width: calc(50% - 0.75rem);
    max-width: calc(50% - 0.75rem);
  }
  
  /* 2 items = 50% chacun */
  .carousel__track--items-2 .carousel__slide {
    width: calc(50% - 0.75rem);
  }
  
  /* 1 item = centré et plus large sur mobile */
  .carousel__track--items-1 .carousel__slide {
    width: auto;
    max-width: 320px;
    min-width: 280px;
  }
}

/* Tablette : 2 ou 3 items */
@media (min-width: 641px) and (max-width: 1024px) {
  .carousel__track {
    gap: var(--space-4);
  }
  
  /* 3 items = 33% chacun */
  .carousel__track--items-3 .carousel__slide {
    width: calc(33.333% - 1rem);
  }
  
  /* 2 items = 50% chacun */
  .carousel__track--items-2 .carousel__slide {
    width: calc(50% - 1rem);
  }
  
  /* 1 item = centré */
  .carousel__track--items-1 .carousel__slide {
    width: auto;
    max-width: 350px;
    min-width: 280px;
  }
}

/* Desktop : 3 items confortables */
@media (min-width: 1025px) {
  .carousel__track {
    gap: var(--space-4);
  }
  
  /* 3 items = 33% chacun */
  .carousel__track--items-3 .carousel__slide {
    width: calc(33.333% - 1rem);
    max-width: 380px;
  }
  
  /* 2 items = 50% chacun */
  .carousel__track--items-2 .carousel__slide {
    width: calc(50% - 1rem);
    max-width: 400px;
  }
  
  /* 1 item = centré large */
  .carousel__track--items-1 .carousel__slide {
    width: auto;
    max-width: 450px;
    min-width: 350px;
  }
}
</style>
