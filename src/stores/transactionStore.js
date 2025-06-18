import { defineStore } from 'pinia';
import { TRANSACTION_API } from '@/api/transactionApi';

export const useTransactStore = defineStore('transactionData', {
    state: () => ({
        transactionData: [],
        loading: false,
        error: null
    }),

    actions: {
        async submitTransactStore(transactionData) {
            this.loading = true;
            this.error = null;
            try {
                if (!TRANSACTION_API || typeof TRANSACTION_API.submitTransactionApi !== 'function') {
                    throw new Error('TRANSACTION_API service is not properly initialized');
                }
                const response = await TRANSACTION_API.submitTransactionApi(transactionData);
                if (response && (response.status === true)) {
                    return response;
                } else {
                    throw new Error('Failed to submit transaction');
                }
            } catch (error) {
                console.error('Error in submitTransactionApi:', error);
                this.error = 'Failed to submit transaction';
                throw error;
            } finally {
                this.loading = false;
            }
        },
    },
});