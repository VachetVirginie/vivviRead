import { inject, provide, type InjectionKey } from 'vue'

import { useReadingShelf } from './useReadingShelf'
import { useGoals } from './useGoals'
import { useBookExplorer } from './useBookExplorer'
import { useModals } from './useModals'

type ReadingShelfApi = ReturnType<typeof useReadingShelf>
type GoalsApi = ReturnType<typeof useGoals>
type BookExplorerApi = ReturnType<typeof useBookExplorer>
type ModalsApi = ReturnType<typeof useModals>

interface AppContext {
  shelf: ReadingShelfApi
  goals: GoalsApi
  explorer: BookExplorerApi
  modals: ModalsApi
}

const AppContextKey: InjectionKey<AppContext> = Symbol('AppContext')

export function provideAppContext() {
  const shelf = useReadingShelf()
  const goals = useGoals()
  const explorer = useBookExplorer({
    isInShelf: shelf.isInShelf,
  })
  const modals = useModals()

  const context: AppContext = {
    shelf,
    goals,
    explorer,
    modals,
  }

  provide(AppContextKey, context)

  return context
}

export function useAppContext(): AppContext {
  const context = inject(AppContextKey)
  if (!context) {
    throw new Error('useAppContext must be used within an AppContext provider')
  }
  return context
}
