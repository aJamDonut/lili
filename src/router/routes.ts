import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: '/job/:type/:id?', component: () => import('pages/ViewJob.vue') },
      { path: '/messages/:type/:id?', component: () => import('pages/JobDetail.vue') },
      { path: '/history/:type?', component: () => import('pages/JobHistory.vue') },
      { path: '/settings', component: () => import('src/pages/UserSettings.vue') },
      {
        path: '/:catchAll(.*)*',
        component: () => import('pages/ErrorNotFound.vue'),
      },
    ],
  },
];

export default routes;
