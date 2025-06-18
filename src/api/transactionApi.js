import apiClient from '../axios';

export const TRANSACTION_API = {
    ENDPOINTS: {
        SUBMIT: '/submit-transaction',
    },

    async submitTransactionApi(transactionData) {
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
                this.ENDPOINTS.SUBMIT,
                transactionData,
                config
            );
            if (!response.data) {
                throw new Error('Invalid response from server');
            }
            return response.data;
        } catch (error) {
            console.error('[TransactionAPI] Error submitting data:', error);
            const enhancedError = new Error(
                error.response?.data?.message ||
                error.message ||
                'Failed to submit data'
            );
            enhancedError.response = error.response;
            enhancedError.status = error.response?.status;
            throw enhancedError;
        }
    },

};