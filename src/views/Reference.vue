<!-- eslint-disable vue/multi-word-component-names -->
<template>
    <v-container>
        <div class="centered">
            <h3>{{ this.shopName }}</h3>
            <h5>{{ this.branchName }} Branch</h5>
            <h5>{{ this.branchLocation }}</h5>
            <h5>VAT Reg. TIN: 000-111-222-333</h5>
            <h3 class="mt-4">Reference #: {{ this.reference }}</h3>
        </div>
        <div class="left-content">
            <span>Date & Time: {{ this.formatCurrentDate }}</span><br />
            <span>Customer name: {{ this.customerName }}</span><br />
            <span>Number of items: {{ this.totalItems }}</span><br />
            <span>Table #: {{ this.tableNumber }}</span><br />
            <span>Order status: {{ this.orderStatus }}</span><br />
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

        <div class="payment">
            <div class="d-flex justify-space-between">
                <h4>Total charge: </h4>
                <h4>₱{{ this.totalAmount }}</h4>
            </div>
            <div class="d-flex justify-space-between">
                <h4>Cash render:</h4>
                <h4>₱{{ this.customerCash }}</h4>
            </div>
            <div class="d-flex justify-space-between">
                <h4>Discount:</h4>
                <h4>{{ this.customerDiscount }}%</h4>
            </div>
            <div class="d-flex justify-space-between">
                <h4>Change:</h4>
                <h4>₱{{ this.customerChange }}</h4>
            </div>
        </div>

        <div class="centered mt-10">
            <!-- Fetch QR from backend -->
             <img v-if="imgSrc" :src="imgSrc" width="120" height="120" alt="Order QR Code">
            <span>Scan the QR Code to track order</span><br />
        </div>

        <div class="centered mt-6">
            <span>Thank you for purchasing!</span><br />
            <span>You may follow us in our socials</span>
            <span>FB: @KapehanPH</span>
            <span>IG: @kapehan_ph</span><br />
            <span>This serve as official e-receipt.</span>
        </div>
    </v-container>
</template>

<script>
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
            shopName: '',
            branchName: '',
            branchLocation: '',
            customerName: '',
            totalAmount: 0,
            totalItems: 0,
            customerCash: 0,
            customerDiscount: 0,
            customerChange: 0,
            createdAt: '',
            updatedAt: '',
            tableNumber: 'N/A',
            orderStatus: '',
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
        return { transactStore, formatCurrentDate };
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
                // const response = await this.transactStore.fetchOrderDetailsStore(reference);
                const response = await this.transactStore.fetchOrderDetailsTempStore(reference);
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
                this.shopName = response?.data?.shop_name || 'N/A';
                this.branchName = response?.data?.branch_name || 'N/A';
                this.branchLocation = response?.data?.branch_location || 'N/A';
                this.totalItems = response?.data?.total_quantity ? parseFloat(response.data.total_quantity) : 0;
                this.totalAmount = response?.data?.total_amount ? parseFloat(response.data.total_amount) : 0;
                this.customerCash = response?.data?.customer_cash ? parseFloat(response.data.customer_cash) : 0;
                this.customerDiscount = response?.data?.customer_discount ? parseFloat(response.data.customer_discount) : 0;
                this.customerChange = response?.data?.customer_change ? parseFloat(response.data.customer_change) : 0;
                this.createdAt = response?.data?.created_at ? this.formatDateTime(response.data.created_at) : 'N/A';
                this.updatedAt = response?.data?.updated_at ? this.formatDateTime(response.data.updated_at) : 'N/A';
                this.tableNumber = response?.data?.table_number || 'N/A';
                this.orderStatus = response?.data?.order_status || 'N/A';
                this.totalQuantity = response?.data?.total_quantity ? parseInt(response.data.total_quantity, 10) : 0;
            } catch (error) {
                console.error('Error fetching order details:', error);
                this.orderDetails = [];
            }
        },

        async fetchQRCode(reference) {
            try {
                const qrCodeBlob = await this.transactStore.fetchQRcodeTempStore(reference);
                this.imgSrc = URL.createObjectURL(qrCodeBlob);
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
                customer_discount: order.customer_discount ? parseFloat(order.customer_discount) : 0,
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

.payment {
    display: flex;
    flex-direction: column;
    margin-top: 25px;
    padding: 10px 10px 0 0;
}

span {
    font-size: 14px;
}
</style>