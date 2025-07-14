<!-- eslint-disable vue/multi-word-component-names -->
<template>
    <v-container>
        <h3 class="text-brown-lighten-1">Barista</h3>
        <v-row class="mt-3">
            <v-col 
                v-for="order in currentOrders" 
                :key="order.reference_number"
                cols="12" 
                lg="4" 
                md="6" 
                sm="6">
                <v-card>
                    <v-card-title>
                        <h5><v-icon>mdi-table-chair</v-icon>&nbsp; Table: {{ order.table_number }}</h5>
                        <v-spacer></v-spacer>
                    </v-card-title>
                    <v-card-text>
                        <v-alert
                            v-if="!order.order_items || order.order_items.length === 0"
                            type="info"
                            variant="tonal">
                            No items found for this order
                        </v-alert>
                        <div 
                            v-else
                            v-for="(item, index) in order.order_items" 
                            :key="index"
                            class="d-flex align-center justify-space-between">
                            <p class="me-2" style="max-width: 120px;">
                                {{ item.product_name }}{{ item.temp_label }}{{ item.size_label }}
                            </p>
                            <p class="me-2">x{{ item.quantity }}</p>
                            <v-chip 
                                :color="getStatusColor(item.order_status_id)" 
                                :prepend-icon="getStatusIcon(item.order_status_id)"
                                @click="changeStatus(item)"
                                class="text-white">
                                {{ getStatusName(item.order_status_id) }}
                            </v-chip>
                        </div>
                    </v-card-text>
                    <v-card-actions>
                        <span class="ms-3">Ref. #: {{ order.reference_number }}</span>
                    </v-card-actions>
                </v-card>
            </v-col>

        </v-row>
        <Snackbar ref="snackbarRef" />
    </v-container>
</template>

<script>
import { useAuthStore } from '@/stores/auth';
import { useBranchStore } from '@/stores/branchStore';
import { useTransactStore } from '@/stores/transactionStore';
import Snackbar from '@/components/Snackbar.vue';

export default {
    // eslint-disable-next-line vue/multi-word-component-names
    name: 'Barista',
    components: {
        Snackbar,
    },
    data() {
        return {
            orders: [],
            loadingCurrentOrders: false,
            order_statuses: [],
        }
    },
    setup() {
        const authStore = useAuthStore();
        const branchStore = useBranchStore();
        const transactStore = useTransactStore();
        return { authStore, branchStore, transactStore };
    },
    mounted() {
        this.fetchCurrentOrders();
        this.fetchOrderStatus();
    },
    computed: {
        currentOrders() {
            return this.orders.map(order => ({
                ...order,
                order_items: order.order_items || []
            }));
        },
    },
    methods: {
        async fetchCurrentOrders() {
            this.loadingCurrentOrders = true;
            try {
                await this.transactStore.fetchAllCurrentOrdersStore();
                this.orders = this.transactStore.currentOrders;
                await Promise.all(this.orders.map(async order => {
                    try {
                        const response = await this.transactStore.fetchKitchenProductDetailsStore(order.transaction_id);
                        order.order_items = response?.data?.all_orders || [];
                    } catch (error) {
                        console.error(`Error fetching details for order ${order.transaction_id}:`, error);
                        order.order_items = [];
                    }
                }));
            } catch (error) {
                console.error('Error fetching current orders:', error);
                this.showError("Error fetching current orders!");
            } finally {
                this.loadingCurrentOrders = false;
            }
        },
        async fetchOrderStatus() {
            try {
                await this.transactStore.fetchAllOrderStatusStore();
                this.order_statuses = this.transactStore.orderStatuses;
            } catch (error) {
                console.error('Error fetching order status:', error);
                this.showError("Error fetching order status!");
            }
        },
        getStatusName(statusId) {
            const status = this.order_statuses.find(s => s.order_status_id === statusId);
            return status ? status.order_status : 'Unknown';
        },
        getStatusColor(statusId) {
            switch (statusId) {
                case 1: return 'orange';    // Brewing
                case 2: return 'blue';      // Ready
                case 3: return 'green';     // Served
                default: return 'grey';     // Unknown status
            }
        },
        getStatusIcon(statusId) {
            switch (statusId) {
                case 1: return 'mdi-coffee';        // Brewing
                case 2: return 'mdi-human-greeting'; // Ready
                case 3: return 'mdi-check';         // Served
                default: return 'mdi-help-circle';   // Unknown
            }
        },
        async changeStatus(order) {
            if (!order || !order.transaction_id) {
                this.showError("Invalid order data!");
                return;
            }
            const currentStatusIndex = this.order_statuses.findIndex(
                status => status.order_status_id === order.order_status_id
            );
            if (currentStatusIndex === -1) {
                this.showError("Cannot determine current order status");
                return;
            }
            const nextStatusIndex = (currentStatusIndex + 1) % this.order_statuses.length;
            const newStatus = this.order_statuses[nextStatusIndex].order_status_id;
            try {
                await this.transactStore.updateKitchenProductStatusStore(order.transaction_id, newStatus);
                // const statusName = this.getStatusName(newStatus);
                // this.showSuccess(`Table# ${order.table_number} is now ${statusName}`);
                order.order_status_id = newStatus;
            } catch (error) {
                console.error('Error updating order status:', error);
                this.showError("Failed to update order status. Please try again!");
            }
        },
        showError(message) {
            this.$refs.snackbarRef.showSnackbar(message, "error");
        },
        showSuccess(message) {
            this.$refs.snackbarRef.showSnackbar(message, "success");
        },
    },
};
</script>

<style scoped>
.descriptionColor {
    color: #a3a3a3;
}

.v-card {
    transition: all 0.3s ease;
}

.v-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.v-chip {
    cursor: pointer;
    transition: all 0.2s ease;
}

.v-chip:hover {
    opacity: 0.9;
    transform: scale(1.05);
}
</style>