import { computed, ref, watch } from 'vue'

export interface ReadingGoal {
  id: string
  title: string
  targetValue: number
  currentValue: number
  unit: 'livres' | 'pages' | 'heures'
  deadline?: string
  updatedAt: string
}

const STORAGE_KEY = 'viviread-reading-goals'

function loadInitialGoals(): ReadingGoal[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as ReadingGoal[]
      if (Array.isArray(parsed)) {
        return parsed.map((goal) => ({
          ...goal,
          updatedAt: goal.updatedAt ?? new Date().toISOString(),
        }))
      }
    }
  } catch (error) {
    console.warn('Impossible de charger les objectifs :', error)
  }

  return [
    {
      id: 'goal-demo-1',
      title: 'Lire 4 livres en novembre',
      targetValue: 4,
      currentValue: 2,
      unit: 'livres',
      deadline: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString(),
    },
  ]
}

export function useGoals() {
  const goals = ref<ReadingGoal[]>(loadInitialGoals())

  watch(
    goals,
    (value) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
    },
    { deep: true }
  )

  function addGoal(goal: { title: string; targetValue: number; unit: ReadingGoal['unit']; deadline?: string }) {
    const id = crypto.randomUUID ? crypto.randomUUID() : `goal-${Date.now()}`
    goals.value = [
      {
        id,
        title: goal.title,
        targetValue: Math.max(1, Math.floor(goal.targetValue)),
        currentValue: 0,
        unit: goal.unit,
        deadline: goal.deadline,
        updatedAt: new Date().toISOString(),
      },
      ...goals.value,
    ]
  }

  function updateGoalProgress(id: string, value: number) {
    goals.value = goals.value.map((goal) =>
      goal.id === id
        ? {
            ...goal,
            currentValue: Math.max(0, Math.min(Math.floor(value), goal.targetValue)),
            updatedAt: new Date().toISOString(),
          }
        : goal
    )
  }

  function removeGoal(id: string) {
    goals.value = goals.value.filter((goal) => goal.id !== id)
  }

  const goalProgress = computed(() =>
    goals.value.map((goal) => ({
      id: goal.id,
      percent: Math.round((goal.currentValue / goal.targetValue) * 100),
    }))
  )

  return {
    goals,
    goalProgress,
    addGoal,
    updateGoalProgress,
    removeGoal,
  }
}
