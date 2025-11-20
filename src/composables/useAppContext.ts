import { inject, provide, type InjectionKey } from 'vue'

import { useReadingShelf } from './useReadingShelf'
import { useGoals } from './useGoals'
import { useBookExplorer } from './useBookExplorer'
import { useModals } from './useModals'
import { useFriendsFeed } from './useFriendsFeed'
import { useFriendsRelations } from './useFriendsRelations'

type ReadingShelfApi = ReturnType<typeof useReadingShelf>
type GoalsApi = ReturnType<typeof useGoals>
type BookExplorerApi = ReturnType<typeof useBookExplorer>
type ModalsApi = ReturnType<typeof useModals>
type FriendsFeedApi = ReturnType<typeof useFriendsFeed>
type FriendsRelationsApi = ReturnType<typeof useFriendsRelations>

interface AppContext {
  shelf: ReadingShelfApi
  goals: GoalsApi
  explorer: BookExplorerApi
  modals: ModalsApi
  friendsFeed: FriendsFeedApi
  friendsRelations: FriendsRelationsApi
}

const AppContextKey: InjectionKey<AppContext> = Symbol('AppContext')

export function provideAppContext() {
  const shelf = useReadingShelf()
  const goals = useGoals()
  const explorer = useBookExplorer({
    isInShelf: shelf.isInShelf,
  })
  const modals = useModals()
  const friendsFeed = useFriendsFeed()
  const friendsRelations = useFriendsRelations()

  const context: AppContext = {
    shelf,
    goals,
    explorer,
    modals,
    friendsFeed,
    friendsRelations,
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
