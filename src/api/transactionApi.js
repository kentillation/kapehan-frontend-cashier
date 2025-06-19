import apiClient from '../axios';

export const TRANSACTION_API = {
    ENDPOINTS: {
        SUBMIT: '/submit-transaction',
    },

    async submitTransactionApi(payload) {
        if (!payload || !payload.reference_number || !Array.isArray(payload.products)) {
            throw new Error('Invalid transaction data');
        }
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
                payload, // Send direct payload without transactions wrapper
                config
            );
            if (!response.data) {
                throw new Error('Invalid response from server');
            }
            return response.data;
        } catch (error) {
            console.error('[TransactionAPI] Error submitting data:', error);
            const errorMessage = error.response?.data?.message ||
                error.message ||
                'Failed to submit transaction data';
            const enhancedError = new Error(errorMessage);
            enhancedError.response = error.response;
            enhancedError.status = error.response?.status;
            throw enhancedError;
        }
    },
};