import { computed, ref } from 'vue'
import { supabase } from '../lib/supabaseClient'

export interface ReadingGoal {
  id: string
  title: string
  targetValue: number
  currentValue: number
  unit: 'livres' | 'pages' | 'heures'
  deadline?: string
  updatedAt: string
  trackingMode: 'manual' | 'auto_completed_books' | 'auto_pages_read'
  displayCurrentValue?: number
}

export function useGoals() {
  const goals = ref<ReadingGoal[]>([])

  async function getCurrentUserId(): Promise<string> {
    const { data, error } = await supabase.auth.getUser()
    if (error || !data.user) {
      throw new Error('Utilisateur non authentifié')
    }
    return data.user.id
  }

  function mapRowToGoal(row: {
    id: string
    title: string
    target_value: number
    current_value: number
    unit: string
    deadline: string | null
    updated_at: string
    tracking_mode?: string | null
  }): ReadingGoal {
    return {
      id: row.id,
      title: row.title,
      targetValue: row.target_value,
      currentValue: row.current_value,
      unit: row.unit as ReadingGoal['unit'],
      deadline: row.deadline ?? undefined,
      updatedAt: row.updated_at,
      trackingMode:
        row.tracking_mode === 'auto_completed_books' || row.tracking_mode === 'auto_pages_read'
          ? row.tracking_mode
          : 'manual',
    }
  }

  async function loadGoalsFromSupabase() {
    try {
      const userId = await getCurrentUserId()
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })

      if (error) {
        console.warn('Erreur lors du chargement des objectifs depuis Supabase :', error)
        return
      }

      if (!data) {
        goals.value = []
        return
      }

      goals.value = data.map(mapRowToGoal)
    } catch (error) {
      console.warn('Impossible de charger les objectifs depuis Supabase :', error)
    }
  }

  async function addGoal(goal: {
    title: string
    targetValue: number
    unit: ReadingGoal['unit']
    deadline?: string
    trackingMode?: ReadingGoal['trackingMode']
  }) {
    const normalizedTarget = Math.max(1, Math.floor(goal.targetValue))

    try {
      const userId = await getCurrentUserId()
      const { data, error } = await supabase
        .from('goals')
        .insert({
          user_id: userId,
          title: goal.title,
          target_value: normalizedTarget,
          current_value: 0,
          unit: goal.unit,
          deadline: goal.deadline ?? null,
          tracking_mode: goal.trackingMode ?? 'manual',
        })
        .select('*')
        .single()

      if (error || !data) {
        throw error
      }

      const readingGoal = mapRowToGoal(data)
      goals.value = [readingGoal, ...goals.value]
    } catch (error) {
      console.warn('Erreur lors de la création de l’objectif dans Supabase :', error)
    }
  }

  async function updateGoalProgress(id: string, value: number) {
    const targetGoal = goals.value.find((goal) => goal.id === id)
    if (!targetGoal) return

    if (targetGoal.trackingMode !== 'manual') {
      return
    }

    const nextGoals = goals.value.map((goal) =>
      goal.id === id
        ? {
            ...goal,
            currentValue: Math.max(0, Math.min(Math.floor(value), goal.targetValue)),
            updatedAt: new Date().toISOString(),
          }
        : goal
    )

    goals.value = nextGoals

    const updated = goals.value.find((g) => g.id === id)
    if (!updated) return

    try {
      const { error } = await supabase
        .from('goals')
        .update({
          current_value: updated.currentValue,
          updated_at: updated.updatedAt,
        })
        .eq('id', id)

      if (error) {
        console.warn("Erreur lors de la mise à jour de l'objectif dans Supabase :", error)
      }
    } catch (error) {
      console.warn("Erreur lors de la mise à jour de l'objectif dans Supabase :", error)
    }
  }

  async function removeGoal(id: string) {
    goals.value = goals.value.filter((goal) => goal.id !== id)

    try {
      const { error } = await supabase.from('goals').delete().eq('id', id)
      if (error) {
        console.warn("Erreur lors de la suppression de l'objectif dans Supabase :", error)
      }
    } catch (error) {
      console.warn("Erreur lors de la suppression de l'objectif dans Supabase :", error)
    }
  }

  // Chargement initial des objectifs pour l'utilisateur connecté
  loadGoalsFromSupabase().catch((error) => {
    console.warn('Erreur lors du chargement initial des objectifs :', error)
  })

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
