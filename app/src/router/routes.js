
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Index.vue'), name: 'Home' },
      { path: 'pack/:id', component: () => import('pages/PackDetails') },
      { path: 'category', component: () => import('pages/Category') },
      { path: 'settings', component: () => import('pages/Settings') },
      { path: 'category/:id/packs', component: () => import('pages/PacksByCategory') },
      { path: 'packs/search', component: () => import('pages/PackSearchResult') },
      { path: 'about', component: () => import('pages/About') },
    ]
  },
  {
    path: '/pack/:id/gallery',
    component: () => import('layouts/EmptyLayout'),
    children: [
      { path: '', component: () => import('pages/ItemsGallery') },
    ]
  },
  {
    path: '/intro',
    component: () => import('layouts/EmptyLayout'),
    children: [
      { path: '', component: () => import('pages/Intro'), name: 'Intro' },
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
