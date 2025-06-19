<template>
    <v-container>
        <v-form ref="transactionForm" @submit.prevent="submitForm" v-model="isFormValid">
            <v-row>
                <!-- Main Section -->
                <v-col cols="12" lg="6" md="6" sm="12" xs="12">
                    <div class="trnsctn-indctn-cntnr">
                        <div class="d-flex align-items-center flex-column">
                            <div class="indication pa-2 text-white" style="background: #696969;">
                                <h3 class="me-13">Quantity: <span>{{ totalQuantity }}</span></h3>
                                <h3 class="ms-15">Charge: ₱ <span>{{ totalCharge.toFixed() }}</span></h3>
                            </div>
                            <div class="d-flex align-items-center justify-content-center">
                                <v-text-field v-model="searchProduct" class="prdct-txt text-white w-50"
                                    style="background: #696969;" label="FIND PRODUCT..." outlined>
                                </v-text-field>
                                <v-btn class="bg-brown-darken-3 d-flex align-items-center py-7 w-50 rounded-0"
                                    variant="tonal" large>
                                    <v-icon>mdi-magnify</v-icon>&nbsp; Category
                                </v-btn>
                            </div>
                        </div>
                    </div>
                    <v-data-table :headers="headers" :items="filteredProducts" :loading="loadingProducts"
                        :items-per-page="-1" height="400px" @click:row="(event, { item }) => selectProduct(item)"
                        density="comfortable" class="hover-table">
                        <!-- eslint-disable vue/valid-v-slot -->
                        <template v-slot:item.product_name="{ item }">
                            <span class="small">{{ item.product_name }}{{ item.temp_label }}{{ item.size_label
                                }}</span>&nbsp;
                        </template>
                        <template v-slot:item.product_price="{ item }">
                            <span class="small">₱{{ item.product_price }}</span>
                        </template>
                    </v-data-table>
                </v-col>

                <!-- Selected Products Section -->
                <v-col cols="12" lg="6" md="6" sm="12" xs="12">
                    <v-row>
                        <v-col cols="12"> <!-- style="margin-top: 130px; margin-bottom: 300px;" -->
                            <h2>Selected Products</h2>
                            <v-data-table :headers="headersSelected" :items="selectedProducts" density="comfortable"
                                height="300px">
                                <template v-slot:item.product_name="{ item }">
                                    <div class="d-flex align-center justify-space-between">
                                        <span>{{ item.product_name }}{{ item.temp_label }}{{ item.size_label }} x {{
                                            item.quantity }}</span>
                                        <span>&nbsp;&nbsp;₱{{ item.product_price }}</span>
                                    </div>
                                </template>
                                <template v-slot:item.actions="{ item }">
                                    <v-btn @click="minusQuan(item)" class="bg-brown-darken-3 mini-btn">
                                        <v-icon>mdi-minus</v-icon>
                                    </v-btn>
                                    <v-btn @click="addQuan(item)" class="bg-brown-darken-3 mini-btn mx-1">
                                        <v-icon>mdi-plus</v-icon>
                                    </v-btn>
                                    <v-btn @click="removeProduct(item)" class="bg-red-darken-4 mini-btn">
                                        <v-icon>mdi-delete</v-icon>
                                    </v-btn>
                                </template>
                            </v-data-table>
                        </v-col>
                        <v-col cols="12">
                            <h2>Payment Section</h2>
                            <div class="payment-section mt-3">
                                <v-text-field class="payment-section-item me-2 mt-2" v-model="customer_charge"
                                    label="Total charge" variant="outlined" density="compact" type="number"
                                    :model-value="this.totalCharge.toFixed(2)" readonly />
                                <v-text-field class="payment-section-item me-2 mt-2" v-model="customer_cash"
                                    label="Cash render" variant="outlined" density="compact" type="number"
                                    :rules="[v => !isNaN(parseFloat(v)) || 'Required' || 'Must be a valid number']"
                                    @input="e => customer_cash = e.target.value.replace(/[^0-9.]/g, '')" />
                                <v-text-field class="payment-section-item me-2 mt-2" v-model="customer_change"
                                    label="Change" variant="outlined" density="compact" type="number" readonly />
                                <v-autocomplete class="payment-section-item me-2 mt-2" v-model="customer_discount"
                                    label="Discount" :items="discountOptions" :rules="[v => !!v || 'Required']"
                                    item-title="discount_label" item-value="discount_id" variant="outlined"
                                    density="compact" />
                                <v-text-field class="payment-section-item me-2 mt-2" v-model="table_number"
                                    label="Table number" variant="outlined" density="compact" type="number"
                                    :rules="[v => !!v || 'Required']" />
                                <v-text-field class="payment-section-item me-2 mt-2" v-model="customer_name"
                                    label="Customer name (optional)" variant="outlined" density="compact" type="text" />
                            </div>
                            <div class="d-flex justify-end">
                                <v-btn class="bg-brown-darken-3 d-flex w-50 py-7 mt-3 me-2" variant="tonal"
                                    append-icon="mdi-send" type="submit" :loading="loading"
                                    :disabled="!isFormValid || loading">
                                    <v-progress-circular v-if="validatingData" color="white" label="Loading..." large />
                                    <span v-else>Submit</span>
                                </v-btn>
                            </div>
                        </v-col>
                    </v-row>
                </v-col>

                <!-- Current Orders Section -->
                <v-col cols="12" lg="6" md="6" sm="12" xs="12">
                    <h2>Current Orders</h2>
                    <v-data-table :headers="headersOrders" :items="currentOrders" :loading="loadingCurrentOrders" density="comfortable" height="300px">
                        <template v-slot:item.table_number="{ item }">
                            <div class="d-flex align-center justify-space-between">
                                # {{ item.table_number }}
                            </div>
                        </template>

                        <!--eslint-disable-next-line -->
                        <template v-slot:item.actions="{ item }">
                            <div class="d-flex" style="gap: 8px;">
                                <v-chip 
                                    :color="getStatusColor(item.order_status_id)"
                                    prepend-icon="mdi-eye-outline"
                                    size="small" 
                                    variant="flat" 
                                    class="ps-5 text-white"
                                    @click="viewOrders(item)"
                                    >
                                </v-chip>

                                <v-chip 
                                    :color="getStatusColor(item.order_status_id)"
                                    :prepend-icon="getStatusIcon(item.order_status_id)"
                                    size="small" 
                                    variant="flat" 
                                    @click="changeStatus(item)"
                                    class="text-white">
                                    
                                    <!-- Show typewriter effect only if Brewing -->
                                    <span v-if="item.order_status_id === 1" class="typewriter">Brewing</span>
                                    <span v-else>{{ getStatusName(item.order_status_id) }}</span>
                                    <div>
                                        <span v-if="item.order_status_id === 1" class="smoke"></span>
                                        <span v-if="item.order_status_id === 1" class="smoke smoke2"></span>
                                        <span v-if="item.order_status_id === 1" class="smoke smoke3"></span>
                                        <span v-if="item.order_status_id === 1" class="smoke smoke4"></span>
                                    </div>
                                </v-chip>
                            </div>
                        </template>

                    </v-data-table>
                </v-col>
            </v-row>

            <v-dialog v-model="ordersDialog" max-width="800px" persistent>
                <v-card>
                    <v-card-title class="text-h6">
                        Table #{{ selectedTableNumber }}
                    </v-card-title>
                    <v-card-text>
                        <v-data-table 
                            :headers="headersOrderDetails" 
                            :items="orderDetails" 
                            density="comfortable"
                            :items-per-page="5"
                            class="elevation-1"
                        >
                            <template v-slot:item.product_name="{ item }">
                                {{ item?.product_name || '' }}{{ item?.temp_label || '' }}{{ item?.size_label || '' }}x{{ item?.quantity }}
                            </template>
                            <template v-slot:item.product_price="{ item }">
                                ₱{{ item.product_price.toFixed(2) }}
                            </template>
                            <template v-slot:item.subtotal="{ item }">
                                ₱{{ item.subtotal.toFixed(2) }}
                            </template>
                        </v-data-table>
                        
                        <v-divider class="my-4"></v-divider>
                        
                        <div class="d-flex flex-column">
                            <h3>Total Quantity: {{ totalOrderQuantity }}</h3>
                            <h3>Total Amount: ₱{{ totalOrderAmount.toFixed(2) }}</h3>
                        </div>
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="red" variant="tonal" prepend-icon="mdi-close" class="me-2 mb-2" @click="ordersDialog = false">Close</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-form>
        <Snackbar ref="snackbarRef" />
        <LoaderUI :visible="validatingData" message="Saving..." />
    </v-container>
</template>

<script>
import { useProductsStore } from '@/stores/productsStore';
import { useTransactStore } from '@/stores/transactionStore';
import Snackbar from '@/components/Snackbar.vue';

export default {
    // eslint-disable-next-line vue/multi-word-component-names
    name: 'Cashier',
    components: {
        Snackbar
    },
    data() {
        return {
            reference_number: '',
            table_number: null,
            total_quantity: '',
            customer_cash: '',
            customer_charge: '',
            customer_change: '',
            customer_discount: '',
            customer_name: '',
            loadingProducts: false,
            loadingCurrentOrders: false,
            validatingData: false,
            searchProduct: '',
            isFormValid: false,
            loading: false,
            ordersDialog: false,
            products: [],
            selectedProducts: [],
            orders: [],
            order_statuses: [],
            orderDetails: [],
            headers: [
                { title: 'Product', value: 'product_name' },
                { title: 'Price', value: 'product_price' },
            ],
            headersSelected: [
                { title: 'Product', value: 'product_name', width: '60%' },
                { title: 'Actions', value: 'actions', sortable: false, width: '40%' },
            ],
            headersOrders: [
                { title: 'Table #', value: 'table_number', width: '50%' },
                { title: 'Status', value: 'actions', sortable: false, width: '50%' },
            ],
            headersOrderDetails: [
                { title: 'Product', value: 'product_name' },
                { title: 'Price', value: 'product_price' },
                { title: 'Subtotal', value: 'subtotal' },
            ],
            discountOptions: [
                { discount_id: 1, discount_label: '5%' },
                { discount_id: 2, discount_label: '10%' },
                { discount_id: 3, discount_label: '15%' },
                { discount_id: 4, discount_label: '20%' },
                { discount_id: 5, discount_label: '30%' },
                { discount_id: 6, discount_label: '-' },
            ],
        };
    },
    setup() {
        const productsStore = useProductsStore();
        const transactStore = useTransactStore();
        return { productsStore, transactStore };
    },
    watch: {
        customer_cash() {
            const customerCharge = this.customer_cash - this.totalCharge;
            this.customer_change = customerCharge.toFixed(2);
            if (this.totalCharge == '') {
                this.customer_change = '';
            }
            if (this.customer_cash === '') {
                this.customer_change = '';
            }
        }
    },
    computed: {
        newRefNumber() {
            return this.generateReferenceNumber();
        },
        filteredProducts() {
            if (!this.searchProduct) {
                return this.products;
            }
            return this.products.filter(product =>
                product.product_name.toLowerCase().includes(this.searchProduct.toLowerCase())
            );
        },
        totalQuantity() {
            return this.selectedProducts.reduce((sum, p) => sum + p.quantity, 0);
        },
        totalCharge() {
            return this.selectedProducts.reduce((sum, p) => sum + (p.product_price * p.quantity), 0);
        },
        currentOrders() {
            return this.orders;
        },
        totalOrderQuantity() {
            return Array.isArray(this.orderDetails) 
                ? this.orderDetails.reduce((sum, item) => sum + (item.quantity || 0), 0)
                : 0;
        },
        totalOrderAmount() {
            return Array.isArray(this.orderDetails) 
                ? this.orderDetails.reduce((sum, item) => sum + (item.product_price * item.quantity || 0), 0)
                : 0;
        },
        selectedTableNumber() {
            return this.transactStore.orderDtls?.data?.table_number || 'N/A';
        },
    },
    mounted() {
        this.fetchProducts();
        this.fetchOrderStatus();
        this.fetchCurrentOrders();
    },
    methods: {
        async generateReferenceNumber() {
            // Random 10 numbers
            const generatedNumber = "ct-01-" + Math.random().toString().slice(2, 14);
            console.log('Generated Reference Number:', generatedNumber);
            return generatedNumber;
        },

        async fetchProducts() {
            this.loadingProducts = true;
            try {
                await this.productsStore.fetchAllProductsStore();
                this.products = this.productsStore.products;
                this.loadingProducts = false;
            } catch (error) {
                console.error('Error fetching products:', error);
                this.showError("Error fetching products!");
            } finally {
                this.loadingProducts = false;
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

        selectProduct(product) {
            if (!product || !product.product_name || !product.product_price) {
                console.error("Product data is missing!", product);
                return;
            }
            const index = this.selectedProducts.findIndex(p => p.product_id === product.product_id);
            if (index === -1) {
                this.selectedProducts.push({ ...product, quantity: 1 });
            } else {
                this.selectedProducts[index].quantity++;
            }
        },

        minusQuan(product) {
            const index = this.selectedProducts.findIndex(p => p.product_id === product.product_id);
            if (this.selectedProducts[index].quantity > -1) {
                this.selectedProducts[index].quantity--;
            }
            if (this.selectedProducts[index].quantity === 0) {
                this.selectedProducts.splice(index, 1);
            }
        },

        addQuan(product) {
            const index = this.selectedProducts.findIndex(p => p.product_id === product.product_id);
            if (this.selectedProducts[index].quantity > -1) {
                this.selectedProducts[index].quantity++;
            }
        },

        removeProduct(product) {
            this.selectedProducts = this.selectedProducts.filter(p => p.product_id !== product.product_id);
        },

        capitalizeFirstLetter(text) {
            if (!text) return '';
            return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
        },

        async submitForm() {
            try {
                this.loading = true;
                if (!this.$refs.transactionForm.validate()) {
                    this.loading = false;
                    return;
                }
                const orderedProducts = this.selectedProducts.map(p => ({
                    product_id: p.product_id,
                    quantity: p.quantity
                }));
                const refNumber = typeof this.newRefNumber === 'function' || typeof this.newRefNumber?.then === 'function'
                    ? await this.newRefNumber
                    : this.newRefNumber;

                if (!refNumber || !this.table_number) {
                    this.showError("Reference number and table number are required.");
                    this.loading = false;
                    return;
                }
                const transactionData = [{
                    reference_number: refNumber,
                    table_number: this.table_number,
                    total_quantity: this.totalQuantity,
                    customer_cash: parseFloat(this.customer_cash.replace(/[^0-9.]/g, '')) || 0,
                    customer_charge: this.totalCharge,
                    customer_change: parseFloat(this.customer_change.replace(/[^0-9.]/g, '')) || 0,
                    customer_discount: this.customer_discount,
                }];
                await this.transactStore.submitTransactStore(transactionData, orderedProducts);
                this.fetchCurrentOrders();
                this.showSuccess("Transaction submitted successfully!");
                this.$refs.transactionForm.reset();
                this.totalCharge = 0;
                this.totalQuantity = 0;
                this.selectedProducts = [];
            } catch (error) {
                this.showError("Failed to transact. Please try again!");
                console.error('Transaction submission error:', error);
            } finally {
                this.loading = false;
            }
        },

        async viewOrders(order) {
            if (!order || !order.reference_number) {
                this.showError("Invalid order data!");
                return;
            }
            this.ordersDialog = true;
            try {
                const response = await this.transactStore.fetchOrderDetailsStore(order.reference_number);
                
                // Debug: Log the complete response
                console.log("Complete API response:", response);
                console.log("Store orderDtls:", this.transactStore.orderDtls);
                
                // Check response structure
                if (response?.data?.all_orders) {
                    this.orderDetails = response.data.all_orders;
                    this.selectedTableNumber = response.data.table_number;
                    console.log("Successfully loaded order details:", this.orderDetails);
                } 
                else if (this.transactStore.orderDtls?.data?.all_orders) {
                    this.orderDetails = this.transactStore.orderDtls.data.all_orders;
                    this.selectedTableNumber = this.transactStore.orderDtls.data.table_number;
                    console.log("Successfully loaded order details from store:", this.orderDetails);
                }
                else {
                    console.error('Invalid response structure:', {
                        response: response,
                        storeData: this.transactStore.orderDtls
                    });
                    this.orderDetails = [];
                    this.showError("Failed to load order details - invalid format");
                }
            } catch (error) {
                console.error('Error fetching order details:', error);
                this.orderDetails = [];
                this.showError("Failed to fetch order details.");
            }
        },

        changeStatus(order) {
            if (!order || !order.reference_number) {
                this.showError("Invalid order data!");
                return;
            }
            const currentStatusIndex = this.order_statuses.findIndex(
                status => status.order_status_id === order.order_status_id
            );
            const nextStatusIndex = (currentStatusIndex + 1) % this.order_statuses.length;
            const newStatus = this.order_statuses[nextStatusIndex].order_status_id;
            this.transactStore.updateOrderStatusStore(order.reference_number, newStatus)
                .then(() => {
                    const statusName = this.getStatusName(newStatus);
                    this.showSuccess(`Order status updated to ${statusName}`);
                    this.fetchCurrentOrders();
                })
                .catch(error => {
                    console.error('Error updating order status:', error);
                    this.showError("Failed to update order status. Please try again!");
                });
        },

        getStatusName(statusId) {
            const status = this.order_statuses.find(s => s.order_status_id === statusId);
            return status ? status.order_status : 'Unknown';
        },

        getStatusColor(statusId) {
            switch(statusId) {
                case 1: return 'orange';    // Brewing
                case 2: return 'blue';      // Ready
                case 3: return 'green';     // Served
                default: return 'grey';     // Unknown status
            }
        },

        getStatusIcon(statusId) {
            switch(statusId) {
                case 1: return 'mdi-coffee';        // Brewing
                case 2: return 'mdi-human-greeting';   // Ready
                case 3: return 'mdi-check'; // Served
                default: return 'mdi-help-circle';   // Unknown
            }
        },

        showError(message) {
            this.$refs.snackbarRef.showSnackbar(message, "error");
        },

        showSuccess(message) {
            this.$refs.snackbarRef.showSnackbar(message, "success");
        },
    }
};
</script>

<style>
.trnsctn-indctn-cntnr {
    position: sticky;
    top: 0;
}

.indication {
    display: flex;
    justify-content: space-between;
    position: sticky;
}

.mini-btn {
    font-size: 13px;
    width: 32px !important;
    height: 23px !important;
}

.payment-section {
    display: flex;
    flex-wrap: wrap;
}

.payment-section-item {
    width: 200px;
}

.v-input__details {
    display: none;
}

.smoke {
  position: absolute;
  left: 10%;
  bottom: 5%;
  width: 3px;
  height: 5;
  background: radial-gradient(ellipse at center, #797373 60%, transparent 100%);
  opacity: 0.5;
  border-radius: 50%;
  transform: translateX(-50%);
  animation: smokeUp 3s infinite ease-in;
  pointer-events: none;
  z-index: 999;
}

.smoke2 {
  left: 13%;
  animation-delay: 2s;
  opacity: 0.5;
}

.smoke3 {
  left: 16%;
  animation-delay: 2.5s;
  opacity: 0.5;
}

.smoke4 {
  left: 19%;
  animation-delay: 1s;
  opacity: 0.5;
}

@keyframes smokeUp {
  0% {
    opacity: 0.7;
    top: 10%;
    transform: translateX(-50%) scale(1);
  }
  25% {
    opacity: 0.4;
    top: -10%;
    transform: translateX(-50%) scale(1.2);
  }
  75% {
    opacity: 0.4;
    top: -10%;
    transform: translateX(-50%) scale(1.2);
  }
  100% {
    opacity: 0;
    top: -30%;
    transform: translateX(-50%) scale(1.4);
  }
}

.typewriter {
  display: inline-block;
  overflow: hidden;
  border-right: .15em solid orange;
  white-space: nowrap;
  letter-spacing: .1em;
  animation:
    typing 2s steps(8, end) infinite,
    blink-caret .75s step-end infinite;
}

@keyframes typing {
  0% {
    width: 0;
  }
  50% {
    width: 8ch;
  }
  100% {
    width: 0;
  }
}

@keyframes blink-caret {
  from, to {
    border-color: transparent;
  }
  50% {
    border-color: orange;
  }
}
</style>