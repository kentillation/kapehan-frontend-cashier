import { defineStore } from 'pinia';
import { PRODUCTS_API } from '@/api/productsApi';

export const useProductsStore = defineStore('products', {
    state: () => ({
        products: [],
        categories: [],
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

        async fetchAllCategoriesStore() {
            this.loading = true;
            this.error = null;
            try {
                if (!PRODUCTS_API || typeof PRODUCTS_API.fetchAllCategoriesApi !== 'function') {
                    throw new Error('PRODUCTS_API service is not properly initialized');
                }
                const response = await PRODUCTS_API.fetchAllCategoriesApi();
                if (response && response.status === true) {
                    this.categories = response.data;
                } else {
                    throw new Error('Failed to fetch categories');
                }
            } catch (error) {
                console.error('Error in fetchAllCategoriesApi:', error);
                this.error = 'Failed to fetch categories';
                throw error;
            } finally {
                this.loading = false;
            }
        },
    },

    getters: {
        getCategories: (state) => {
            return state.categories.map(category => ({
                label: typeof category === 'object' ? category.category_label : category,
                icon: 'mdi-store-outline'
            }));
        },

        getategoryById: (state) => (id) => {
            return state.categories.find(category => category.category_id === id);
        }
    }
});