<!-- eslint-disable vue/multi-word-component-names -->
<template>
    <v-container>
        <h3 class="text-brown-lighten-1">Barista</h3>
        <v-row class="mt-3">

            <!-- Loop this v-col -->
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
                    </v-card-title>
                    <v-card-text>
                        <div 
                            v-for="(item, index) in order.order_items" 
                            :key="index"
                            class="d-flex align-center justify-space-between mb-2">
                            <p class="me-3">Product: {{ item.product_name }}{{ item.temp_label }}{{ item.size_label }}</p>
                            <p class="me-3">Quantity: {{ item.quantity }}</p>
                            <v-chip 
                                :color="getStatusColor(Number(order.order_status_id))" 
                                :prepend-icon="getStatusIcon(Number(order.order_status_id))"
                                @click="changeStatus(order)">
                                <span>{{ getStatusName(Number(order.order_status_id)) }}</span>
                            </v-chip>
                        </div>
                    </v-card-text>
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
                order_items: this.formatOrderItems(order.order_items)
            }));
        },
    },
    methods: {
        async fetchCurrentOrders() {
            this.loadingCurrentOrders = true;
            try {
                await this.transactStore.fetchAllCurrentOrdersStore();
                this.orders = this.transactStore.currentOrders;
                this.loadingCurrentOrders = false;
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
        formatOrderItems(items) {
            if (!items) return [];
            return items.map(item => ({
                ...item,
                product_name: item.product_name || '',
                temp_label: item.temp_label || '',
                size_label: item.size_label || '',
                quantity: item.quantity || 0
            }));
        },
        getStatusName(statusId) {
            const status = this.order_statuses.find(s => Number(s.order_status_id) === Number(statusId));
            return status ? status.order_status : 'Unknown';
        },
        getStatusColor(statusId) {
            switch (Number(statusId)) {
                case 1: return 'orange';    // Brewing
                case 2: return 'blue';      // Ready
                case 3: return 'green';     // Served
                default: return 'grey';     // Unknown status
            }
        },
        getStatusIcon(statusId) {
            switch (Number(statusId)) {
                case 1: return 'mdi-coffee';        // Brewing
                case 2: return 'mdi-human-greeting';   // Ready
                case 3: return 'mdi-check'; // Served
                default: return 'mdi-help-circle';   // Unknown
            }
        },
        async changeStatus(order) {
            if (!order || !order.reference_number) {
                this.showError("Invalid order data!");
                return;
            }
            const currentStatusIndex = this.order_statuses.findIndex(
                status => Number(status.order_status_id) === Number(order.order_status_id)
            );
            const nextStatusIndex = (currentStatusIndex + 1) % this.order_statuses.length;
            const newStatus = Number(this.order_statuses[nextStatusIndex].order_status_id);
            
            try {
                await this.transactStore.updateOrderStatusStore(order.reference_number, newStatus);
                const statusName = this.getStatusName(newStatus);
                this.showSuccess(`Table# ${order.table_number} is now ${statusName}`);
                this.fetchCurrentOrders();
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
</style>