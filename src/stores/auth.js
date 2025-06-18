import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import apiClient from '@/axios';
import { useRouter } from 'vue-router';

export const useAuthStore = defineStore('auth', () => {
    const router = useRouter();

    // State
    const shopName = ref(localStorage.getItem('shop_name') || null);
    const token = ref(localStorage.getItem('auth_token') || null);
    const shopId = ref(localStorage.getItem('shop_id') || null);
    const error = ref(null);

    // Getters
    const isAuthenticated = computed(() => !!token.value);
    const getShopName = computed(() => shopName.value);

    // Actions
    const login = async (credentials) => {
        error.value = null;
        try {
            const response = await apiClient.post('/login', credentials);

            if (response.status === 200) {
                token.value = response.data.access_token;
                shopId.value = response.data.shop_id;
                shopName.value = response.data.shop_name;

                localStorage.setItem('auth_token', token.value);
                localStorage.setItem('shop_id', shopId.value);
                localStorage.setItem('shop_name', shopName.value);

                router.push('/cashier');
            }
        } catch (err) {
            error.value = err.response?.data?.message ||
                err.message ||
                'Login failed. Please try again.';
            throw error.value; // Re-throw for component handling
        }
    };

    const logout = async () => {
        // Store token temporarily for the API call
        const currentToken = token.value;

        // Immediately clear client-side state
        token.value = null;
        shopId.value = null;
        shopName.value = null;
        error.value = null;
        localStorage.clear();

        try {
            if (currentToken) {
                // Use the stored token for the API call
                await apiClient.post('/logout', null, {
                    headers: {
                        Authorization: `Bearer ${currentToken}`
                    },
                    timeout: 3000 // 3-second timeout
                });
            }
        } catch (err) {
            console.error('Logout API error:', err);
            // Continue regardless of API success
        }

        // Hard redirect - prevents any Vue/Pinia state issues
        window.location.href = '/';
    };

    // Auto-logout if token expires
    const checkAuth = () => {
        if (!isAuthenticated.value && router.currentRoute.value.meta.requiresAuth) {
            logout();
        }
    };

    return {
        token,
        shopId,
        shopName,
        error,
        isAuthenticated,
        getShopName,
        login,
        logout,
        checkAuth,
    };
});