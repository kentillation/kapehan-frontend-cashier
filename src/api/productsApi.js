import apiClient from '../axios';

export const PRODUCTS_API = {
    ENDPOINTS: {
        FETCH_PRODUCTS: '/products',
        FETCH_CATEGORIES: 'product-category-option',
        SAVE: '/save-product',
        SAVE_PRODUCT_INGREDIENTS: '/save-product-ingredients',
        UPDATE: '/update-product'
    },

    /**
     * Products Information
     * @returns {Promise<Object>} Products data for the branch
     * @throws {Error} Enhanced error with server response details
     */

    async fetchAllProductsApi() {
        try {
            const authToken = localStorage.getItem('auth_token');
            if (!authToken) {
                throw new Error('No authentication token found');
            }
            const config = {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
            };
            const response = await apiClient.get(
                `${this.ENDPOINTS.FETCH_PRODUCTS}`,
                config
            );

            if (!response.data) {
                throw new Error('Invalid response from server');
            }
            return response.data;
        } catch (error) {
            console.error('[PRODUCTS_API] Error fetching products:', error);
            const enhancedError = new Error(
                error.response?.data?.message ||
                error.message ||
                'Failed to fetch products'
            );
            enhancedError.response = error.response;
            enhancedError.status = error.response?.status;
            throw enhancedError;
        }
    },

    async fetchAllCategoriesApi() {
        try {
            const authToken = localStorage.getItem('auth_token');
            if (!authToken) {
                throw new Error('No authentication token found');
            }
            const config = {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
            };
            const response = await apiClient.get(
                this.ENDPOINTS.FETCH_CATEGORIES,
                config
            );
            if (!response.data) {
                throw new Error('Invalid response from server');
            }
            return response.data;
        } catch (error) {
            console.error('[API] Error fetching stocks:', error);

            const enhancedError = new Error('Failed to fetch categpries');
            throw enhancedError;
        }
    },
};