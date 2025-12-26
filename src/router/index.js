import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: () => import('../views/HomeView.vue'),
            meta: { title: 'Dashboard' }
        },
        {
            path: '/habits',
            name: 'habits',
            component: () => import('../views/HabitsView.vue'),
            meta: { title: 'Hábitos Diários' }
        },
        {
            path: '/missions',
            name: 'missions',
            component: () => import('../views/MissionsView.vue'),
            meta: { title: 'Missões Diárias' }
        },
        {
            path: '/shop',
            name: 'shop',
            component: () => import('../views/ShopView.vue'),
            meta: { title: 'Loja' }
        },
        {
            path: '/reflection',
            name: 'reflection',
            component: () => import('../views/ReflectionView.vue'),
            meta: { title: 'Checkpoint' }
        }
    ]
})

export default router
