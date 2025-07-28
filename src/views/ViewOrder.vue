<!-- eslint-disable vue/multi-word-component-names -->
<template>
    <v-dialog :model-value="modelValue" @update:modelValue="$emit('update:modelValue', $event)" width="auto"
        transition="dialog-bottom-transition" scrollable>
        <v-btn @click="$emit('update:modelValue', false)" color="#0090b6" class="position-absolute" size="small"
            style="top: -17px; left: -17px; z-index: 1;" icon>
            <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-card>
            <v-container class="pa-5">
                <div class="centered">
                    <img v-if="imgSrc" :src="imgSrc" width="120" height="120" alt="Order QR Code">
                    <span>Scan this QR Code to track order</span><br />
                    <h3>Table #: {{ this.tableNumber }}</h3>
                </div>
                <div class="left-content">
                    <span>Date & Time: {{ this.createdAt }}</span><br />
                    <span>Reference #: {{ this.referenceNumber }}</span><br />
                    <span>Customer name: {{ this.customerName }}</span><br />
                    <span>Number of items: {{ this.totalItems }}</span><br />
                    <span>Order status: {{ this.orderStatus }}</span><br />
                </div>

                <v-data-table
                    :headers="headersOrderDetails" 
                    :items="currentOrders"
                    height="250px"
                    density="compact"
                    class="bg-grey-darken-3 hover-table rounded"
                    @click:row="selectedOrder"
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
                <v-dialog v-model="addVoidBlotter" height="250" transition="dialog-bottom-transition">
                    <v-card class="pa-2">
                        <v-card-title>
                            <h4>Confirmation</h4>
                        </v-card-title>
                        <v-card-text>
                            <p class="mb-3">{{ selectedProductText }}</p>
                            <span>Do you want to file blotter for this item?</span>
                        </v-card-text>
                        <v-card-actions>
                            <v-btn color="red" variant="tonal" class="px-3" prepend-icon="mdi-close"
                                @click="addVoidBlotter = false">No, I wont!
                            </v-btn>
                            <v-spacer></v-spacer>
                            <v-btn color="green" variant="tonal" class="px-3" prepend-icon="mdi-check"
                                @click="addVoidBlotter = false">Yes
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </v-dialog>

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
            </v-container>
        </v-card>
    </v-dialog>
</template>

<script>
import { useTransactStore } from '@/stores/transactionStore';

export default {
    // eslint-disable-next-line vue/multi-word-component-names
    name: 'ViewOrder',
    data() {
        return {
            // reference: this.$route.params.reference || 'No reference provided',
            product_name: '',
            product_price: 0,
            subtotal: 0,
            selectedTableNumber: '',
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
            productName: '',
            quanTity: '',
            tempLabel: '',
            sizeLabel: '',
            totalQuantity: 0,
            orderDetails: [],
            headersOrderDetails: [
                { title: 'Item', value: 'product_name' },
                { title: 'Price', value: 'product_price' },
                { title: 'Subtotal', value: 'subtotal' },
            ],
            imgSrc: null,
            addVoidBlotter: false,
            selectedProduct: null,
        };
    },
    props: {
        modelValue: {
            type: Boolean,
            required: true
        },
        referenceNumber: {
            type: String,
        },
    },
    computed: {
        currentOrders() {
            return this.orderDetails;
        },
        selectedProductText() {
            if (!this.selectedProduct) return '';
            return `${this.selectedProduct.product_name || ''}
                ${this.selectedProduct.temp_label || ''}
                ${this.selectedProduct.size_label || ''} \t \t
                x${this.selectedProduct.quantity || ''}`;
        },
    },
    emits: ['update:modelValue'],
    watch: {
        referenceNumber: {
            immediate: true,
            handler(newVal) {
                if (newVal) {
                    this.fetchCustomerOrders(newVal);
                    this.fetchQRCode(newVal);
                }
            }
        },
        // modelValue: {
        //     handler(newVal) {
        //         if (newVal && this.referenceNumber) {
        //             this.fetchCustomerOrders(this.referenceNumber);
        //             this.fetchQRCode(this.referenceNumber);
        //         }
        //     }
        // }
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
    // mounted() {
    //     this.fetchCustomerOrders(this.referenceNumber);
    //     this.fetchQRCode(this.referenceNumber);
    // },
    beforeUnmount() {
        if (this.imgSrc) {
            URL.revokeObjectURL(this.imgSrc);
        }
    },
    methods: {
        async fetchCustomerOrders(referenceNumber) {
            try {
                const response = await this.transactStore.fetchOrderDetailsStore(referenceNumber);
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

        async fetchQRCode(referenceNumber) {
            try {
                const qrCodeBlob = await this.transactStore.fetchQRcodeTempStore(referenceNumber);
                this.imgSrc = URL.createObjectURL(qrCodeBlob);
                if (!this.imgSrc) {
                    console.error('Failed to create image URL from blob');
                }
            } catch (error) {
                console.error('Error fetching order details:', error);
                this.imgSrc = '';
            }
        },

        selectedOrder(event, { item }) {
            this.selectedProduct = item;
            this.addVoidBlotter = true;
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
.v-table,
.v-container {
    background-color: #fdfeff;
    color: #080808;
}

::v-deep(.hover-table .v-data-table__tr) {
    transition: background-color 0.5s ease-in-out;
    cursor: pointer;
}

::v-deep(.hover-table .v-data-table__tr:hover) {
    animation: backgroundFade 2s infinite;
}

@keyframes backgroundFade {
    0% {
        background-color: rgba(224, 247, 250, 0);
    }

    50% {
        background-color: rgba(62, 104, 117, 0.442);
    }

    100% {
        background-color: rgba(224, 247, 250, 0);
    }
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

.centered,
.left-content {
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