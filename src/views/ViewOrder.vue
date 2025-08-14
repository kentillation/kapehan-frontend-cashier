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
                    height="220px"
                    density="compact"
                    class="bg-grey-darken-3 hover-table rounded"
                    @click:row="selectedOrder"
                    hide-default-footer>
                    <!--eslint-disable-next-line -->
                    <template v-slot:item.product_name="{ item }">
                        <span>{{ item?.product_name || '' }}{{ item?.temp_label || '' }}{{ item?.size_label || '' }}x{{ item?.quantity }}</span>
                    </template>
                    <!--eslint-disable-next-line -->
                    <template v-slot:item.product_price="{ item }">
                        <span>₱{{ item.product_price.toFixed(2) }}</span>
                    </template>
                    <!--eslint-disable-next-line -->
                    <template v-slot:item.subtotal="{ item }">
                        <span>₱{{ item.subtotal.toFixed(2) }}</span>
                    </template>
                </v-data-table>
                <v-dialog v-model="addVoidOrderDialog" height="260" width="400" transition="dialog-bottom-transition">
                    <v-card class="pa-2">
                        <v-card-title>
                            <h5>Void Confirmation</h5>
                        </v-card-title>
                        <v-card-text class="d-flex flex-column">
                            <span style="font-size: 16px;">
                                <strong>Table #: {{ this.selectedProduct.table_number }}</strong>
                            </span>
                            <span class="mb-3" style="font-size: 16px;">
                                <strong>{{ selectedProductText }} &nbsp; &nbsp; x{{ this.selectedProduct.quantity }}</strong>
                            </span>
                            <span class="text-center">Do you want to void this item?</span>
                        </v-card-text>
                        <v-card-actions class="d-flex">
                            <v-btn color="red" variant="tonal" class="px-3 pt-1 pb-6" prepend-icon="mdi-close"
                                @click="addVoidOrderDialog = false">No<span class="to-hide"> , I wont!</span>
                            </v-btn>
                            <v-spacer></v-spacer>
                            <v-btn color="green" variant="tonal" class="px-3 pt-1 pb-6" prepend-icon="mdi-check"
                                @click="openConfirmVoidOrderDialog">Yes<span class="to-hide"> , I want!</span>
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </v-dialog>
                <v-dialog v-model="confirmVoidOrderDialog" height="260" width="400" transition="dialog-bottom-transition">
                    <v-card class="pa-2">
                        <v-card-title>
                            <h5>Confirmation</h5>
                        </v-card-title>
                        <v-card-text class="d-flex flex-column">
                            <span style="font-size: 16px;">
                                <strong>Table #: {{ this.selectedProduct.table_number }}</strong>
                            </span>
                            <span class="mb-3" style="font-size: 16px;">
                                <strong>{{ selectedProductText }}</strong>
                            </span>
                            <div class="d-flex align-center justify-space-around">
                                <span style="font-size: 16px;">Quantity: </span>
                                <div class="mt-3">
                                    <v-btn @click="minusQuantity" color="#0090b6" class="mini-btn ms-3">
                                        <v-icon>mdi-minus</v-icon>
                                    </v-btn>
                                    <span class="mx-3" style="font-size: 16px;">{{ this.selectedProduct.quantity }}</span>
                                    <v-btn @click="addQuantity" color="#0090b6" class="mini-btn mx-1">
                                        <v-icon>mdi-plus</v-icon>
                                    </v-btn>
                                </div>
                            </div>
                        </v-card-text>
                        <v-card-actions>
                            <v-btn color="red" variant="tonal" class="px-3 pt-1 pb-6" prepend-icon="mdi-close"
                                @click="confirmVoidOrderDialog = false">Cancel
                            </v-btn>
                            <v-spacer></v-spacer>
                            <v-btn color="green" variant="tonal" class="px-3 pt-1 pb-6" prepend-icon="mdi-check"
                                @click="saveVoidOrder" :disabled="isSubmitting">
                                {{ isSubmitting ? 'Processing...' : 'Proceed' }}
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
    <Alert ref="alertRef" />
    <Snackbar ref="successRef" />
</template>

<script>
import { useAuthStore } from '@/stores/auth';
import { useTransactStore } from '@/stores/transactionStore';
import { useLoadingStore } from '@/stores/loading';
import Alert from '@/components/Alert.vue';
import Snackbar from '@/components/Snackbar.vue';

export default {
    // eslint-disable-next-line vue/multi-word-component-names
    name: 'ViewOrder',
    components: {
        Alert,
        Snackbar,
    },
    data() {
        return {
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
            addVoidOrderDialog: false,
            confirmVoidOrderDialog: false,
            selectedProduct: null,
            selectedProductOriginalQuantity: 0,
            isSubmitting: false,
            submittedVoidOrders: new Set(),
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
                ${this.selectedProduct.size_label || ''}`;
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
    },
    setup() {
        const authStore = useAuthStore();
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
        return { authStore, transactStore, loadingStore, formatCurrentDate };
    },
    beforeUnmount() {
        if (this.imgSrc) {
            URL.revokeObjectURL(this.imgSrc);
        }
    },
    methods: {
        async fetchCustomerOrders(referenceNumber) {
            try {
                const response = await this.transactStore.fetchOrderDetailsStore(referenceNumber);
                console.log('API Response:', response);
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
            this.selectedProduct = { ...item };
            this.selectedProductOriginalQuantity = item.quantity; // Store original quantity
            this.addVoidOrderDialog = true;
        },

        openConfirmVoidOrderDialog () {
            this.addVoidOrderDialog = false;
            this.confirmVoidOrderDialog = true;
        },

        addQuantity() {
            if (this.selectedProduct && this.selectedProduct.quantity < this.selectedProductOriginalQuantity) {
                this.selectedProduct.quantity += 1;
            } else {
                this.showAlert("Can't exceed to original quantity");
            }
        },

        minusQuantity() {
            if (this.selectedProduct && this.selectedProduct.quantity == 0) {
                this.showAlert("Can't reduce quantity below 0");
            } else {
                this.selectedProduct.quantity -= 1;
            }
        },

        async saveVoidOrder() {
            this.loadingStore.show("Saving void order...");
            const voidKey = `${this.selectedProduct.transaction_id}-${this.selectedProduct.product_id}-${this.referenceNumber}`;
            if (this.submittedVoidOrders.has(voidKey)) {
                this.loadingStore.hide();
                this.showAlert('Void is already in progress.');
                this.confirmVoidOrderDialog = false;
                this.addVoidOrderDialog = false;
                return;
            }
            if (this.selectedProduct.station_status_id === 2) {
                this.loadingStore.hide();
                this.showAlert('Unable to void! Order already done.');
                return;
            }
            this.submittedVoidOrders.add(voidKey);
            this.isSubmitting = true;
            this.confirmVoidOrderDialog = false;
            this.addVoidOrderDialog = false;
            try {
                if (!this.selectedProduct || this.selectedProduct.quantity < 0) {
                    this.$emit('update:modelValue', false);
                    this.loadingStore.hide();
                    return;
                }
                const voidOrderData = {
                    reference_number: this.referenceNumber,
                    transaction_id: this.selectedProduct.transaction_id,
                    table_number: this.selectedProduct.table_number,
                    product_id: this.selectedProduct.product_id,
                    from_quantity: this.selectedProductOriginalQuantity,
                    to_quantity: this.selectedProduct.quantity,
                };
                const response = await this.transactStore.saveVoidOrderStore(voidOrderData);
                if (response.status === true)
                {
                    window.location.reload();
                }
                this.showSuccess('Void has been saved successfully');
            } catch (error) {
                console.error('Error saving void order:', error);
                this.showAlert(error.message);
            } finally {
                // this.confirmVoidOrderDialog = false;
                // this.addVoidOrderDialog = false;
                this.$emit('update:modelValue', false);
                this.loadingStore.hide();
                this.isSubmitting = false;
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
                table_number: order.table_number || 'N/A',
                station_status_id: order.station_status_id || 'N/A',
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

        showSuccess(message) {
            this.$refs.successRef.showSnackbar(message, "success");
        },

        showAlert(message) {
            this.$refs.alertRef.showSnackbarAlert(message, "error");
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

.mini-btn {
    font-size: 15px;
    width: 35px !important;
    height: 27px !important;
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