<!-- eslint-disable vue/multi-word-component-names -->
<template>
    <v-container>
        <h3>Reversal</h3>
        <v-card class="mt-3">
            <v-card-text>
                <v-data-table 
                    :headers="headersReversalOrders" 
                    :items="reversalOrders" 
                    :loading="loadingReversalOrders"
                    density="comfortable" 
                    height="400px">
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
    name: 'Reversal',
    components: {
        Alert,
    },
    data () {
        return {
            loadingReversalOrders: false,
            reversalOrders: [],
            headersReversalOrders: [
                { title: 'Reference', value: 'reference_number', width: '10%' },
                { title: 'Table#', value: 'table_number', width: '10%' },
                { title: 'Product', value: 'display_product_name', width: '20%' },
                { title: 'Quantity', value: 'to_quantity', width: '10%' },
                { title: 'Status', value: 'reversal_status', width: '10%' },
                { title: 'Date created', value: 'updated_at', width: '30%' },
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
        this.fetchReversalOrders();
    },
    methods: {
        async fetchReversalOrders() {
            this.loadingReversalOrders = true;
            try {
                await this.transactStore.fetchReversalStore();
                this.reversalOrders = this.transactStore.reversalOrders;
                if (this.reversalOrders && this.reversalOrders.length > 0) {
                    this.reversalOrders = this.reversalOrders.map(order => this.formatReversalOrders(order));
                } else {
                    this.showAlert("No reversal orders found!");
                }
                this.loadingReversalOrders = false;
            } catch (error) {
                console.error('Error fetching reversal orders:', error);
                this.showAlert("Error fetching reversal orders!");
            } finally {
                this.loadingReversalOrders = false;
            }
        },

        formatReversalOrders(order) {
            return {
                ...order,
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