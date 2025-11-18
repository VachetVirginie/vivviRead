import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../views/HomeView.vue'
import LibraryView from '../views/LibraryView.vue'
import GoalsView from '../views/GoalsView.vue'
import ExplorerView from '../views/ExplorerView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/livres',
      name: 'library',
      component: LibraryView,
    },
    {
      path: '/objectifs',
      name: 'goals',
      component: GoalsView,
    },
    {
      path: '/explorer',
      name: 'explorer',
      component: ExplorerView,
    },
  ],
})

export default router
