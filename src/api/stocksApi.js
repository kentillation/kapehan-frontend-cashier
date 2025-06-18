import apiClient from '../axios';

export const STOCK_API = {
    ENDPOINTS: {
        FETCH: '/stocks',
        SAVE: '/save-stock',
        UPDATE: '/update-stock'
    },

    /**
     * Stocks Information
     * @param {Object} stock - Stock data to update
     * @param {string|number} stock.stock_id - Required stock ID
     * @returns {Promise<Object>} Updated stock data
     * @throws {Error} Enhanced error with server response details
     */

    async fetchAllStocksApi(branchId) {
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
                `${this.ENDPOINTS.FETCH}/${branchId}`,
                config
            );
            if (!response.data) {
                throw new Error('Invalid response from server');
            }
            return response.data;
        } catch (error) {
            console.error('[StocksAPI] Error fetching stocks:', error);

            const enhancedError = new Error('Failed to fetch stocks');
            throw enhancedError;
        }
    },

    async saveStocksApi(stocks) {
        try {
            const authToken = localStorage.getItem('auth_token');
            if (!authToken) {
                throw new Error('No authentication token found');
            }
            const config = {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            };
            const response = await apiClient.post(
                this.ENDPOINTS.SAVE,
                stocks,
                config
            );
            if (!response.data) {
                throw new Error('Invalid response from server');
            }
            return response.data;
        } catch (error) {
            console.error('[StocksAPI] Error saving stocks:', error);
            const enhancedError = new Error(
                error.response?.data?.message ||
                error.message ||
                'Failed to save stocks'
            );
            enhancedError.response = error.response;
            enhancedError.status = error.response?.status;
            throw enhancedError;
        }
    },

    async updateStockApi(stock) {
        try {
            if (!stock?.stock_id) {
                throw new Error('Stock ID is required for update');
            }
            const authToken = localStorage.getItem('auth_token');
            if (!authToken) {
                throw new Error('Authentication token not found');
            }
            const config = {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            };
            const response = await apiClient.put(
                `${this.ENDPOINTS.UPDATE}/${stock.stock_id}`,
                stock,
                config
            );
            if (!response.data) {
                throw new Error('Invalid response from server');
            }
            return response.data;
        } catch (error) {
            console.error('[StockAPI] Error updating stock:', error);
            const enhancedError = new Error(
                error.response?.data?.message ||
                error.message ||
                'Failed to update stock'
            );
            enhancedError.response = error.response;
            enhancedError.status = error.response?.status;
            enhancedError.isApiError = true;
            throw enhancedError;
        }
    },
};