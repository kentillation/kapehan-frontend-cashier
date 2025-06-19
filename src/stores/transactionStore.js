import { defineStore } from 'pinia';
import { TRANSACTION_API } from '@/api/transactionApi';

export const useTransactStore = defineStore('transactionData', {
    state: () => ({
        transactionData: null,
        loading: false,
        error: null,
        success: false
    }),

    actions: {
        async submitTransactStore(transactionData, orderedProducts) {
            this.loading = true;
            this.error = null;
            this.success = false;
            try {
                if (!transactionData || !Array.isArray(transactionData)) {
                    throw new Error('Invalid transaction data');
                }
                if (!orderedProducts || !Array.isArray(orderedProducts)) {
                    throw new Error('Invalid product data');
                }
                const payload = {
                    transactions: transactionData,
                    products: orderedProducts
                };
                const response = await TRANSACTION_API.submitTransactionApi(payload);
                if (!response || response.status !== true) {
                    throw new Error(response?.message || 'Failed to submit transaction');
                }
                this.transactionData = response.data;
                this.success = true;
                return response;
            } catch (error) {
                console.error('Transaction submission failed:', error);
                this.error = error.message || 'Failed to submit transaction';
                throw error;
            } finally {
                this.loading = false;
            }
        },
        clearState() {
            this.transactionData = null;
            this.error = null;
            this.success = false;
        }
    },
});