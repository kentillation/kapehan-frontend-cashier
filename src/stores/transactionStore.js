import { defineStore } from 'pinia';
import { TRANSACTION_API } from '@/api/transactionApi';

export const useTransactStore = defineStore('transactionData', {
    state: () => ({
        transactionData: null,
        currentOrders: [],
        orderStatuses: [],
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
                if (!transactionData?.[0] || !Array.isArray(orderedProducts)) {
                    throw new Error('Invalid data');
                }
                const payload = {
                    ...transactionData[0],  // Flatten transaction object
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

        async fetchAllCurrentOrdersStore() {
            this.loading = true;
            this.error = null;
            try {
                if (!TRANSACTION_API || typeof TRANSACTION_API.fetchAllCurrentOrdersApi !== 'function') {
                    throw new Error('TRANSACTION_API service is not properly initialized');
                }
                const response = await TRANSACTION_API.fetchAllCurrentOrdersApi();
                if (response && response.status === true) {
                    this.currentOrders = response.data;
                } else {
                    throw new Error('Failed to fetch currentOrders');
                }
            } catch (error) {
                console.error('Error in fetchAllCurrentOrdersApi:', error);
                this.error = 'Failed to fetch currentOrders';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async fetchAllOrderStatusStore() {
            this.loading = true;
            this.error = null;
            try {
                if (!TRANSACTION_API || typeof TRANSACTION_API.fetchAllOrderStatusApi !== 'function') {
                    throw new Error('TRANSACTION_API service is not properly initialized');
                }
                const response = await TRANSACTION_API.fetchAllOrderStatusApi();
                if (response && response.status === true) {
                    this.orderStatuses = response.data;
                } else {
                    throw new Error('Failed to fetch orderStatuses');
                }
            } catch (error) {
                console.error('Error in fetchAllOrderStatusApi:', error);
                this.error = 'Failed to fetch order status';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async fetchOrderDetailsStore(referenceNumber) {
            this.loading = true;
            this.error = null;
            try {
                if (!referenceNumber) {
                    throw new Error('Invalid referenceNumber');
                }
                const response = await TRANSACTION_API.fetchOrderDetailsApi(referenceNumber);
                if (response && response.status === true) {
                    return response.data;
                } else {
                    throw new Error(response?.message || 'Failed to fetch order details');
                }
            } catch (error) {
                console.error('Error fetching order details:', error);
                this.error = error.message || 'Failed to fetch order details';
                throw error;
            }
            finally {
                this.loading = false;
            }
        },

        async updateOrderStatusStore(referenceNumber, orderStatus) {
            this.loading = true;
            this.error = null;
            try {
                if (!referenceNumber || !orderStatus) {
                    throw new Error('Invalid referenceNumber or orderStatus');
                }
                const response = await TRANSACTION_API.updateOrderStatusApi(referenceNumber, orderStatus);
                if (response && response.status === true) {
                    this.currentOrders = this.currentOrders.map(order =>
                        order.id === referenceNumber ? { ...order, orderStatus } : order
                    );
                    return response;
                } else {
                    throw new Error(response?.message || 'Failed to update order orderStatus');
                }
            } catch (error) {
                console.error('Error updating order orderStatus:', error);
                this.error = error.message || 'Failed to update order orderStatus';
                throw error;
            }
            finally {
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