import { createRouter, createWebHistory } from 'vue-router';
// import NotFound from '@/views/NotFound.vue';
import LoginPage from '@/views/Login.vue';
import Register from '@/views/Register.vue';
import Cashier from '@/views/Cashier.vue';
import Barista from '@/views/Barista.vue';
import Settings from '@/views/Settings.vue';
import Help from '@/views/Help.vue';
import About from '@/views/About.vue';
import Reference from '@/views/Reference.vue';
import LoaderUI from '../components/LoaderUI.vue';
import { useAuthStore } from '@/stores/auth';

const routes = [
    // { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound },
    { path: '/', name: 'LoginPage', component: LoginPage, meta: { requiresAuth: false } },
    { path: '/register', name: 'Register', component: Register },
    { path: '/cashier', name: 'Cashier', component: Cashier, meta: { requiresAuth: true } },
    { path: '/barista', name: 'Barista', component: Barista, meta: { requiresAuth: true } },
    { path: '/settings', name: 'Settings', component: Settings, meta: { requiresAuth: true } },
    { path: '/help', name: 'Help', component: Help, meta: { requiresAuth: true } },
    { path: '/about', name: 'About', component: About, meta: { requiresAuth: true } },
    { path: '/reference/:reference', name: 'Reference', component: Reference },
    { path: '/loader', name: 'LoaderUI', component: LoaderUI, meta: { requiresAuth: true } },
];

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
});

router.beforeEach(async (to) => {
    const authStore = useAuthStore();
    authStore.checkAuth(); // Optional: Check token validity
    
    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        return '/';
    }
    
    if (to.path === '/' && authStore.isAuthenticated) {
        return '/cashier';
    }
});

export default router;
