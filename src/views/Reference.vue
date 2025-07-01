<!-- eslint-disable vue/multi-word-component-names -->
<template>
    <v-container>
        <div class="centered">
            <h5>{{ authStore.shopName }}</h5>
            <h5>{{ authStore.branchName }} Branch</h5>
            <h5>{{ authStore.branchLocation }}</h5>
            <h5>VAT Reg. TIN: 000-111-222-333</h5>
            <h3 class="mt-4">Reference #: {{ this.reference }}</h3>
        </div>
        <div class="left-content">
            <span>Date & Time: {{ this.formatCurrentDate }}</span><br />
            <span>Customer name: {{ this.customerName }}</span><br />
            <span>Number of items: {{ this.totalItems }}</span>
            <span>Table #: {{ this.tableNumber }}</span><br />
        </div>

        <v-data-table :headers="headersOrderDetails" 
            :items="orderDetails" 
            density="compact" 
            hide-default-footer>
            <!--eslint-disable-next-line -->
            <template v-slot:item.product_name="{ item }">
                {{ item?.product_name || '' }}{{ item?.temp_label || '' }}{{ item?.size_label || ''
                }}x{{ item?.quantity }}
            </template>
            <!--eslint-disable-next-line -->
            <template v-slot:item.product_price="{ item }">
                ₱{{ item.product_price.toFixed(2) }}
            </template>
            <!--eslint-disable-next-line -->
            <template v-slot:item.subtotal="{ item }">
                ₱{{ item.subtotal.toFixed(2) }}
            </template>
        </v-data-table>

        <div class="d-flex flex-column mt-5 me-5 pe-5">
            <h4>Total charge: ₱{{ this.totalAmount }}</h4>
            <h4>Cash render: ₱{{ this.customerCash }}</h4>
            <h4>Change: ₱{{ this.customerChange }}</h4>
        </div>

        <div class="centered mt-10">
            <!-- Fetch QR from backend -->
             <img v-if="imgSrc" :src="imgSrc" width="120" height="120" alt="Order QR Code">
            <span>Scan the QR Code to view order</span><br />
        </div>

        <div class="centered mt-6">
            <span>Thank you for purchasing!</span><br />
            <span>You may follow us in our socials</span>
            <span>FB: @KapehanPH</span>
            <span>IG: @kapehan_ph</span><br />
            <span>This serve as official receipt.</span>
        </div>
    </v-container>
</template>

<script>
import { useAuthStore } from '@/stores/auth';
import { useBranchStore } from '@/stores/branchStore';
import { useProductsStore } from '@/stores/productsStore';
import { useTransactStore } from '@/stores/transactionStore';

export default {
    // eslint-disable-next-line vue/multi-word-component-names
    name: 'Reference',
    data() {
        return {
            reference: this.$route.params.reference || 'No reference provided',
            product_name: '',
            product_price: 0,
            subtotal: 0,
            selectedTableNumber: '',
            customerName: '',
            totalAmount: 0,
            totalItems: 0,
            customerCash: 0,
            customerChange: 0,
            createdAt: '',
            updatedAt: '',
            tableNumber: 'N/A',
            tempLabel: '',
            sizeLabel: '',
            totalQuantity: 0,
            orderDetails: [],
            headersOrderDetails: [
                { title: 'Item', value: 'product_name' },
                { title: 'Price', value: 'product_price' },
                { title: 'Amount', value: 'subtotal' },
            ],
            imgSrc: null,
        };
    },
    setup() {
        const authStore = useAuthStore();
        const branchStore = useBranchStore();
        const productsStore = useProductsStore();
        const transactStore = useTransactStore();
        const currentDate = new Date().toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
        const formatCurrentDate = currentDate.replace(/,/g, '');
        return { authStore, branchStore, productsStore, transactStore, formatCurrentDate };
    },
    mounted() {
        this.fetchCustomerOrders(this.reference);
        this.fetchQRCode(this.reference);
    },
    beforeUnmount() {
        if (this.imgSrc) {
            URL.revokeObjectURL(this.imgSrc);
        }
    },
    methods: {
        async fetchCustomerOrders(reference) {
            try {
                const response = await this.transactStore.fetchOrderDetailsStore(reference);
                let allOrders = [];
                if (response?.data?.all_orders) {
                    allOrders = response.data.all_orders;
                    this.selectedTableNumber = response.data.table_number;
                    this.customerName = response.data.customer_name;
                }
                else if (this.transactStore.orderDtls?.data?.all_orders) {
                    allOrders = this.transactStore.orderDtls.data.all_orders;
                    this.selectedTableNumber = this.transactStore.orderDtls.data.table_number;
                    this.customerName = this.transactStore.orderDtls.data.customer_name;
                }
                else {
                    console.error('Invalid response structure:', {
                        response: response,
                        storeData: this.transactStore.orderDtls
                    });
                    this.orderDetails = [];
                }
                this.orderDetails = allOrders.map(order => this.formatOrder(order));
                this.totalItems = response?.data?.total_quantity ? parseFloat(response.data.total_quantity) : 0;
                this.totalAmount = response?.data?.total_amount ? parseFloat(response.data.total_amount) : 0;
                this.customerCash = response?.data?.customer_cash ? parseFloat(response.data.customer_cash) : 0;
                this.customerChange = response?.data?.customer_change ? parseFloat(response.data.customer_change) : 0;
                this.createdAt = response?.data?.created_at ? this.formatDateTime(response.data.created_at) : 'N/A';
                this.updatedAt = response?.data?.updated_at ? this.formatDateTime(response.data.updated_at) : 'N/A';
                this.tableNumber = response?.data?.table_number || 'N/A';
                this.totalQuantity = response?.data?.total_quantity ? parseInt(response.data.total_quantity, 10) : 0;
            } catch (error) {
                console.error('Error fetching order details:', error);
                this.orderDetails = [];
            }
        },

        async fetchQRCode(reference) {
            try {
                const qrCodeBlob = await this.transactStore.fetchQRcodeStore(reference);
                this.imgSrc = URL.createObjectURL(qrCodeBlob);  // qrCodeBlob is already the blob data
                if (!this.imgSrc) {
                    console.error('Failed to create image URL from blob');
                }
            } catch (error) {
                console.error('Error fetching order details:', error);
                this.imgSrc = '';
            }
        },

        formatOrder(order) {
            return {
                ...order,
                product_name: order.product_name || '',
                product_price: order.product_price ? parseFloat(order.product_price) : 0,
                subtotal: order.subtotal ? parseFloat(order.subtotal) : 0,
                quantity: order.quantity ? parseInt(order.quantity, 10) : 0,
                temp_label: order.temp_label || '',
                size_label: order.size_label || '',
                total_quantity: order.total_quantity ? parseInt(order.total_quantity, 10) : 0,
                total_amount: order.total_amount ? parseFloat(order.total_amount) : 0,
                customer_cash: order.customer_cash ? parseFloat(order.customer_cash) : 0,
                customer_change: order.customer_change ? parseFloat(order.customer_change) : 0,
                table_number: order.table_number || 'N/A',
                created_at: order.created_at ? this.formatDateTime(order.created_at) : 'N/A',
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
    },
};
</script>

<style scoped>
.v-table, .v-container {
    background-color: #fdfeff;
    color: #080808;
}

.v-table > .v-table__wrapper > table > tbody > tr > td {
    padding: 0;
}

.v-table--density-compact {
    --v-table-row-height: 0;
}

.centered {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.centered, .left-content {
    margin-bottom: 25px;
}

h2,
h3,
h4 {
    margin: 0;
}
</style>