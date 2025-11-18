import { onMounted } from 'vue'
import { supabase } from '../lib/supabaseClient'

export function useSupabaseTest() {
  onMounted(async () => {
    console.log('[SupabaseTest] Début du test…')

    const { data, error } = await supabase.from('books').select('*').limit(5)

    if (error) {
      console.error('[SupabaseTest] Erreur lors de la récupération des livres :', error)
    } else {
      console.log('[SupabaseTest] Livres récupérés depuis Supabase :', data)
    }
  })
}
