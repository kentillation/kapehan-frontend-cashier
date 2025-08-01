<!-- eslint-disable vue/multi-word-component-names -->
<template>
    <v-container>
        <v-btn @click="this.fetchvoidOrders" color="#0090b6" class="refresh" variant="flat" icon>
            <v-icon>mdi-refresh</v-icon>
        </v-btn>
        <h3>Void Orders</h3>
        <v-card class="mt-3">
            <v-card-text>
                <v-data-table 
                    :headers="headersVoidOrders" 
                    :items="voidOrders" 
                    :loading="loadingVoidOrders"
                    density="comfortable" 
                    height="400px">

                <!--eslint-disable-next-line -->
                <template v-slot:item.void_status="{ item }">
                    <v-chip :color="item.void_status_id === 1 ? 'red' : 'green'" size="small" variant="tonal">
                        {{ item.void_status }}
                    </v-chip>
                </template>
                </v-data-table>
            </v-card-text>
        </v-card>
    </v-container>
    <Alert ref="alertRef" />
</template>

<script>
import { useTransactStore } from '@/stores/transactionStore';
import { useLoadingStore } from '@/stores/loading';
import Alert from '@/components/Alert.vue';

export default {
    // eslint-disable-next-line vue/multi-word-component-names
    name: 'VoidOrders',
    components: {
        Alert,
    },
    data () {
        return {
            loadingVoidOrders: false,
            voidOrders: [],
            headersVoidOrders: [
                { title: 'Status', value: 'void_status', width: '10%' },
                { title: 'Table#', value: 'table_number', width: '10%' },
                { title: 'Quantity', value: 'to_quantity', width: '10%' },
                { title: 'Product_name', value: 'display_product_name', width: '20%' },
                { title: 'Reference', value: 'reference_number', width: '10%' },
                { title: 'Date_updated', value: 'updated_at', width: '30%' },
            ],
        }
    },
    setup() {
        const transactStore = useTransactStore();
        const loadingStore = useLoadingStore();
        const currentDate = new Date().toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
        const formatCurrentDate = currentDate.replace(/,/g, '');
        return { transactStore, loadingStore, formatCurrentDate };
    },
    mounted () {
        this.fetchvoidOrders();
    },
    methods: {
        async fetchvoidOrders() {
            this.loadingVoidOrders = true;
            this.loadingStore.show('');
            try {
                await this.transactStore.fetchVoidOrderStore();
                this.voidOrders = this.transactStore.voidOrders;
                if (this.voidOrders && this.voidOrders.length > 0) {
                    this.voidOrders = this.voidOrders.map(order => this.formatvoidOrders(order));
                } else {
                    this.showAlert("No void orders found!");
                }
                this.loadingVoidOrders = false;
            } catch (error) {
                console.error('Error fetching void orders:', error);
                this.showAlert("Error fetching void orders!");
            } finally {
                this.loadingVoidOrders = false;
                this.loadingStore.hide();
            }
        },

        formatvoidOrders(order) {
            return {
                ...order,
                to_quantity: `x${order.to_quantity}`,
                display_product_name: `${ order.product_name }${ order.temp_label }${ order.size_label }` || '',
                updated_at: order.updated_at ? this.formatDateTime(order.updated_at) : 'N/A',
            };
        },
        formatDateTime(dateString) {
            if (!dateString) return 'N/A';
            const date = new Date(dateString);
            return date.toLocaleString('en-PH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                timeZone: 'Asia/Manila'
            });
        },
        showAlert(message) {
            this.$refs.alertRef.showSnackbarAlert(message, "error");
        },
    }
};
</script>

<style scoped>
.refresh {
    position: fixed;
    bottom: 15px;
    right: 15px;
    z-index: 1;
}
</style>