
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout'),
    children: [
      { path: '', component: () => import('pages/ItemsGallery'), name: 'Home' },
      { path: 'menu', component: () => import('pages/Menu') },
      { path: 'settings', component: () => import('pages/Settings') },
      { path: 'about', component: () => import('pages/About') },
      { path: 'tags', component: () => import('pages/Tags') },
      { path: 'intro', component: () => import('pages/Intro'), name: 'Intro'  },
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
