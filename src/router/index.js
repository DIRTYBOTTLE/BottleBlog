import {createRouter, createWebHistory} from 'vue-router'

const routes = [
    {
        path: '/',
        component: () => import('../views/BottleBlog.vue')
    },
    {
        path: '/blogedit',
        component: () => import('../views/BlogEdit.vue'),
    },
    {
        path: '/blogcontent',
        component: () => import('../views/BlogContent.vue'),
    }
]

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
})

export default router
