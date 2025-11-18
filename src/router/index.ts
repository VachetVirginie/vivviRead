import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../views/HomeView.vue'
import LibraryView from '../views/LibraryView.vue'
import GoalsView from '../views/GoalsView.vue'
import ExplorerView from '../views/ExplorerView.vue'
import LoginView from '../views/LoginView.vue'
import ProfileView from '../views/ProfileView.vue'
import { supabase } from '../lib/supabaseClient'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/home',
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
    {
      path: '/profil',
      name: 'profile',
      component: ProfileView,
    },
  ],
})

router.beforeEach(async (to, from, next) => {
  if (to.name === 'login') {
    return next()
  }

  const { data } = await supabase.auth.getSession()
  const session = data.session

  if (!session) {
    return next({
      name: 'login',
      query: { redirect: to.fullPath },
    })
  }

  return next()
})

export default router
