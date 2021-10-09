import AuthGuard from "src/js/auth";

const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Index.vue') },
      { path: '/accounts/me', component: () => import('pages/MyAccount') },
      { path: '/accounts', component: () => import('pages/Accounts') },
      { path: '/reports', component: () => import('pages/Reports') },
      { path: '/items', component: () => import('pages/Items') }
    ],
    beforeEnter: AuthGuard
  },
  {
    path: '/login',
    component: () => import('layouts/LoginLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Login') }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/Error404.vue')
  }
]

export default routes
