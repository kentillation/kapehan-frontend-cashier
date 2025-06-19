import { defineStore } from 'pinia';
import { PRODUCTS_API } from '@/api/productsApi';

export const useProductsStore = defineStore('products', {
    state: () => ({
        products: [],
        loading: false,
        error: null
    }),

    actions: {
        async fetchAllProductsStore() {
            this.loading = true;
            this.error = null;
            try {
                if (!PRODUCTS_API || typeof PRODUCTS_API.fetchAllProductsApi !== 'function') {
                    throw new Error('PRODUCTS_API service is not properly initialized');
                }
                const response = await PRODUCTS_API.fetchAllProductsApi();
                if (response && response.status === true) {
                    this.products = response.data;
                } else {
                    throw new Error('Failed to fetch products');
                }
            } catch (error) {
                console.error('Error in fetchAllProductsApi:', error);
                this.error = 'Failed to fetch products';
                throw error;
            } finally {
                this.loading = false;
            }
        },
    },
});