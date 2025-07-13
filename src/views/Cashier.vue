<template>
    <v-container>
        <v-form ref="transactionForm" @submit.prevent="submitForm" v-model="isFormValid">
            <v-row>
                <!-- Main Section -->
                <v-col cols="12" lg="6" md="6" sm="12" xs="12">
                    <div class="d-flex align-items-center flex-column">
                        <div class="indication pa-2 text-white trnsct-head">
                            <h3 class="me-13">Quantity: <span>{{ totalQuantity }}</span></h3>
                            <h3 class="ms-15">Charge: ₱ <span>{{ totalCharge.toFixed() }}</span></h3>
                        </div>
                        <div class="d-flex align-items-center justify-content-center">
                            <v-text-field v-model="searchProduct" class="prdct-txt text-white w-50"
                                style="background: #696969;" placeholder="FIND PRODUCT..." outlined>
                            </v-text-field>
                            <v-btn class="bg-brown-darken-3 d-flex align-items-center py-7 w-50 rounded-0"
                                variant="tonal" @click="showCategoriesDialog" large>
                                <v-icon>mdi-magnify</v-icon>&nbsp; Category
                            </v-btn>
                        </div>
                    </div>
                    <v-data-table :headers="headersDisplay" :items="filteredProducts" :loading="loadingProducts"
                        :items-per-page="-1" height="400px" @click:row="(event, { item }) => selectProduct(item)"
                        density="comfortable" class="hover-table mt-2">
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

                <!-- Selected & Payment Section -->
                <v-col cols="12" lg="6" md="6" sm="12" xs="12">
                    <v-row>
                        <!-- Selected Products -->
                        <v-col cols="12"> <!-- style="margin-top: 130px; margin-bottom: 300px;" -->
                            <h3>Selected Products</h3>
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
                                    <v-btn @click="minusQuan(item)" class="bg-brown-darken-3 mini-btn ms-3">
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
                        <!--Payment Section  -->
                        <v-col cols="12">
                            <h3>Payment Section</h3>
                            <div class="payment-section mt-3">
                                <v-text-field class="payment-section-item me-2 mt-2" 
                                    v-model="customer_charge"
                                    label="*Total charge" 
                                    variant="outlined" 
                                    density="compact" type="number"
                                    :model-value="this.discountedTotalCharge.toFixed(2)" 
                                    prepend-inner-icon="mdi-cash" 
                                    readonly />
                                <v-text-field class="payment-section-item me-2 mt-2"
                                    v-model.number="customer_cash"
                                    label="*Cash render" 
                                    variant="outlined" 
                                    density="compact" type="number"
                                    :rules="[v => !isNaN(parseFloat(v)) || 'Required', v => parseFloat(v) >= this.totalCharge || 'Must be greater than or equal to total charge']"
                                    @input="e => customer_cash = e.target.value.replace(/[^0-9.]/g, '')"
                                    prepend-inner-icon="mdi-cash-plus" 
                                    placeholder="Enter cash amount" />
                                <v-text-field class="payment-section-item me-2 mt-2" 
                                    v-model="customer_change"
                                    label="*Change" 
                                    variant="outlined" 
                                    density="compact"
                                    :rules="[v => parseFloat(v) >= 0]" 
                                    prepend-inner-icon="mdi-cash-refund" 
                                    readonly />
                                <v-text-field class="payment-section-item me-2 mt-2" 
                                    v-model="customer_discount"
                                    label="Discount" 
                                    variant="outlined" 
                                    
                                    @input="e => customer_discount = e.target.value.replace(/[^0-9.]/g, '')"
                                    type="number"
                                    density="compact" 
                                    prepend-inner-icon="mdi-percent" 
                                    clearable />
                                <v-text-field class="payment-section-item me-2 mt-2" 
                                    v-model="table_number"
                                    label="*Table number" 
                                    variant="outlined" 
                                    density="compact" 
                                    type="number"
                                    :rules="[v => !!v || 'Required']" 
                                    prepend-inner-icon="mdi-table-chair"
                                    placeholder="Enter table number" />
                                <v-text-field class="payment-section-item me-2 mt-2" 
                                    v-model="customer_name"
                                    label="Customer (optional)" 
                                    variant="outlined" 
                                    density="compact" 
                                    type="text"
                                    prepend-inner-icon="mdi-account" 
                                    placeholder="Enter customer name" />
                            </div>

                            <div class="d-flex justify-end me-2 ms-1">
                                <v-btn class="bg-red-lighten-2 d-flex w-50 py-6 mt-3" variant="tonal"
                                    prepend-icon="mdi-refresh" @click="resetPaymentSection" :disabled="loading">
                                    Reset
                                </v-btn>&nbsp;
                                <v-btn class="bg-brown-darken-3 d-flex w-50 py-6 mt-3" variant="tonal"
                                    append-icon="mdi-send" type="submit" :loading="loading" :disabled="!isFormValid || loading ||
                                        Number(customer_cash) < totalCharge || Number(customer_change) < 0">
                                    Submit
                                </v-btn>
                            </div>

                        </v-col>
                    </v-row>
                </v-col>

                <!-- Current Orders Section -->
                <v-col cols="12" lg="6" md="6" sm="12" xs="12">
                    <h3>Current Orders</h3>
                    <v-data-table :headers="headersOrders" :items="currentOrders" :loading="loadingCurrentOrders"
                        density="comfortable" height="300px">
                        <template v-slot:item.table_number="{ item }">
                            <div class="d-flex align-center justify-space-between">
                                <h3># {{ item.table_number }}</h3>
                            </div>
                        </template>

                        <!--eslint-disable-next-line -->
                        <template v-slot:item.actions="{ item }">
                            <div class="d-flex" style="gap: 8px;">
                                <v-chip :color="getStatusColor(Number(item.order_status_id))"
                                    :prepend-icon="getStatusIcon(Number(item.order_status_id))" size="small" variant="flat"
                                    @click="changeStatus(item)" class="text-white"
                                    style="width: 80px; justify-content: flex-start;">
                                    <span v-if="Number(item.order_status_id) === 1" class="typewriter-fixed">Brewing</span>
                                    <span v-else>{{ getStatusName(Number(item.order_status_id)) }}</span>
                                    <span v-if="Number(item.order_status_id) === 1" class="smoke"></span>
                                    <span v-if="Number(item.order_status_id) === 1" class="smoke smoke2"></span>
                                    <span v-if="Number(item.order_status_id) === 1" class="smoke smoke3"></span>
                                    <span v-if="Number(item.order_status_id) === 1" class="smoke smoke4"></span>
                                    <span v-if="Number(item.order_status_id) === 1" class="smoke smoke5"></span>
                                </v-chip>

                                <!-- <v-chip color="gray" prepend-icon="mdi-printer" size="small" variant="flat"
                                    class="ps-5 text-white" @click="printOrders(item)">
                                </v-chip> -->

                                <v-chip color="gray" prepend-icon="mdi-qrcode" size="small" variant="flat"
                                    class="ps-5 text-white" @click="toReference(item.reference_number)">
                                </v-chip>
                            </div>
                        </template>

                    </v-data-table>
                </v-col>
            </v-row>

            <v-dialog v-model="categoriesDialog" max-width="500">
                <v-card>
                    <v-card-title class="d-flex justify-space-between">
                        <h3>Select categories</h3>
                        <v-btn prepend-icon="mdi-close-circle-outline" @click="categoriesDialog = false" class="pa-1"
                            size="medium"></v-btn>
                    </v-card-title>
                    <v-card-text class="d-flex align-center flex-column">
                        <v-list-item v-for="(category, i) in productsStore.getCategories" :key="i"
                            :prepend-icon="category.icon" class="bg-brown-darken-3 mt-2 w-75"
                            style="border-radius: 30px !important; font-size: 14px;"
                            @click="handleCategorySelect(category)">
                            <span>{{ category.label }}</span>
                        </v-list-item>
                    </v-card-text>
                </v-card>
            </v-dialog>

            <!-- Viewing products of current order -->
            <v-dialog v-model="ordersDialog" max-width="800px" persistent>
                <v-card>
                    <v-card-text>
                        <div class="d-flex flex-column">
                            <h4>Table #{{ this.selectedTableNumber }}</h4>
                            <h4>Customer name: {{ this.customerName }}</h4>
                        </div>

                        <v-data-table :headers="headersOrderDetails" :items="orderDetails" density="comfortable"
                            :items-per-page="5" class="elevation-1 mt-3">
                            <template v-slot:item.product_name="{ item }">
                                {{ item?.product_name || '' }}{{ item?.temp_label || '' }}{{ item?.size_label || ''
                                }}x{{ item?.quantity }}
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
                            <h4>Total Quantity: {{ totalOrderQuantity }} {{ itemIndicator }}</h4>
                            <h4>Total Amount: ₱{{ totalOrderAmount.toFixed(2) }}</h4>
                        </div>
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="red" variant="tonal" prepend-icon="mdi-close" class="me-2 mb-2"
                            @click="ordersDialog = false">Close</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-form>
        <Snackbar ref="snackbarRef" />
        <GlobalLoader :visible="validatingData" message="Informing kitchen..." />
    </v-container>
</template>

<script>
import { useAuthStore } from '@/stores/auth';
import { useBranchStore } from '@/stores/branchStore';
import { useProductsStore } from '@/stores/productsStore';
import { useTransactStore } from '@/stores/transactionStore';
import Snackbar from '@/components/Snackbar.vue';
import GlobalLoader from '@/components/GlobalLoader.vue';

export default {
    // eslint-disable-next-line vue/multi-word-component-names
    name: 'Cashier',
    components: {
        Snackbar,
        GlobalLoader,
    },
    data() {
        return {
            referenceNumber: '',
            table_number: null,
            total_quantity: '',
            customer_cash: '',
            customer_charge: '',
            customer_change: '',
            customer_discount: 0,
            customer_name: '',
            loadingProducts: false,
            loadingCurrentOrders: false,
            validatingData: false,
            searchProduct: '',
            isFormValid: false,
            loading: false,
            ordersDialog: false,
            categories: [],
            loadingCategories: false,
            categoriesDialog: false,
            products: [],
            selectedProducts: [],
            selectedTableNumber: null,
            customerName: '',
            orders: [],
            order_statuses: [],
            totalAmount: 0,
            totalItems: 0,
            customerCash: 0,
            customerChange: 0,
            createdAt: '',
            updatedAt: '',
            tableNumber: 'N/A',
            tempLabel: '',
            sizeLabel: '',
            totalQuan: 0,
            imgSrc: null,
            orderDetails: [],
            headersDisplay: [
                { title: '', value: 'product_name' },
                { title: '', value: 'product_price' },
            ],
            headersSelected: [
                { title: '', value: 'product_name', width: '50%' },
                { title: '', value: 'actions', sortable: false, width: '50%' },
            ],
            headersOrders: [
                { title: 'Table Number', value: 'table_number', width: '50%' },
                { title: 'Status', value: 'actions', sortable: false, width: '50%' },
            ],
            headersOrderDetails: [
                { title: '______PRODUCT_NAME______', value: 'product_name' },
                { title: 'Price', value: 'product_price' },
                { title: 'Subtotal', value: 'subtotal' },
            ],
        };
    },
    beforeUnmount() {
        if (this.imgSrc) {
            URL.revokeObjectURL(this.imgSrc);
        }
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
    watch: {
        customer_cash() {
            const customerCharge = parseFloat(this.customer_cash) - this.discountedTotalCharge;
            this.customer_change = customerCharge.toFixed(2);
            if (this.discountedTotalCharge == 0) {
                this.customer_change = 0;
            }
            if (this.customer_cash === '') {
                this.customer_change = 0;
            }
        },
        customer_discount() {
            this.customer_charge = this.discountedTotalCharge.toFixed(2);
            if (this.customer_cash) {
                const change = parseFloat(this.customer_cash) - parseFloat(this.customer_charge);
                this.customer_change = change.toFixed(2);
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
        itemIndicator() {
            let item_indicator = '';
            if (this.totalOrderQuantity > 1) {
                item_indicator = 'items';
            } else {
                item_indicator = 'item';
            }
            return item_indicator;
        },
        totalOrderAmount() {
            return Array.isArray(this.orderDetails)
                ? this.orderDetails.reduce((sum, item) => sum + (item.product_price * item.quantity || 0), 0)
                : 0;
        },
        discountedTotalCharge() {
            if (!this.customer_discount || isNaN(this.customer_discount) || this.customer_discount <= 0) {
                return this.totalCharge;
            }
            const discountDecimal = parseFloat(this.customer_discount) / 100;
            return this.totalCharge * (1 - discountDecimal);
        }
    },
    mounted() {
        this.fetchProducts();
        this.fetchOrderStatus();
        this.fetchCurrentOrders();
        this.fetchCategories();
    },
    methods: {
        async generateReferenceNumber() {
            // Random 10 numbers
            const generatedNumber = Math.random().toString().slice(2, 14);
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

        async fetchCategories() {
            this.loadingCategories = true;
            try {
                await this.productsStore.fetchAllCategoriesStore();
                this.categories = this.productsStore.categories;
                this.loadingCategories = false;
            } catch (error) {
                console.error('Error fetching categories:', error);
                this.showError("Error fetching categories!");
            } finally {
                this.loadingCategories = false;
            }
        },

        showCategoriesDialog() {
            this.categoriesDialog = true;
        },

        handleCategorySelect(category) {
            this.categoriesDialog = false;
            if (!category || !category.label) {
                this.showError("Invalid category selected!");
                return;
            }
            this.products = this.productsStore.products.filter(
                product => product.category_label === category.label
            );
            if (this.products.length === 0) {
                this.showError(`No products in ${category.label} category`);
            } else {
                this.searchProduct = '';
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
            this.customer_cash = '';
            this.customer_change = '';
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
                this.validatingData = true;
                if (!this.$refs.transactionForm.validate()) {
                    this.validatingData = false;
                    return;
                }
                const orderedProducts = this.selectedProducts.map(p => ({
                    product_id: p.product_id,
                    quantity: p.quantity
                }));
                let refNumber = typeof this.newRefNumber === 'function' || typeof this.newRefNumber?.then === 'function'
                    ? await this.newRefNumber
                    : this.newRefNumber;
                if (!refNumber || !this.table_number) {
                    this.showError("Reference number and table number are required.");
                    this.validatingData = false;
                    return;
                }
                const transactionData = [{
                    reference_number: refNumber,
                    table_number: this.table_number,
                    customer_name: this.customer_name,
                    total_quantity: this.totalQuantity,
                    customer_cash: parseFloat(this.customer_cash.replace(/[^0-9.]/g, '')) || 0,
                    customer_charge: this.customer_charge,
                    customer_change: parseFloat(this.customer_change.replace(/[^0-9.]/g, '')) || 0,
                    customer_discount: this.customer_discount,
                }];
                await this.transactStore.submitTransactStore(transactionData, orderedProducts);
                this.fetchCurrentOrders();
                this.$refs.transactionForm.reset();
                this.totalCharge = 0;
                this.totalQuantity = 0;
                this.selectedProducts = [];

                // Print receipt

            } catch (error) {
                this.showError("Failed to transact. Please try again!");
                console.error('Transaction submission error:', error);
            } finally {
                // this.loading = false;
                this.validatingData = false;
            }
        },

        async printOrders(order) {
            if (!order || !order.reference_number) {
                this.showError("Invalid order data!");
                return;
            }
            try {
                const response = await this.transactStore.fetchOrderDetailsStore(order.reference_number);
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
                    this.showError("Failed to load order details - invalid format");
                }
                await this.fetchQRCode(order.reference_number);
                this.orderDetails = allOrders.map(order => this.formatOrder(order));
                this.referenceNumber = response?.data?.reference_number || 'N/A';
                this.totalItems = response?.data?.total_quantity ? parseFloat(response.data.total_quantity) : 0;
                this.totalAmount = response?.data?.total_amount ? parseFloat(response.data.total_amount) : 0;
                this.customerCash = response?.data?.customer_cash ? parseFloat(response.data.customer_cash) : 0;
                this.customerChange = response?.data?.customer_change ? parseFloat(response.data.customer_change) : 0;
                this.createdAt = response?.data?.created_at ? this.formatDateTime(response.data.created_at) : 'N/A';
                this.updatedAt = response?.data?.updated_at ? this.formatDateTime(response.data.updated_at) : 'N/A';
                this.tableNumber = response?.data?.table_number || 'N/A';
                this.totalQuan = response?.data?.total_quantity ? parseInt(response.data.total_quantity, 10) : 0;
                if (allOrders.length === 0) {
                    alert('No transaction available to print.');
                    return;
                }
                const printWindow = window.open('', '_blank');
                if (!printWindow) {
                    alert('Please allow popups for this website to print the report.');
                    return;
                }
                printWindow.document.write(`
                <html>
                    <head>
                        <title>Receipt</title>
                        <style>
                            body {
                                font-family: Arial, sans-serif;
                            }
                            .v-table, .v-container {
                                background-color: #fdfeff;
                                color: #080808;
                            }
                            .v-table > .v-table__wrapper > table > tbody > tr > td {
                                padding: 0;
                                text-align: left;
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
                            .left-content {
                                margin-bottom: 25px;
                            }
                            .item-head {
                                font-weight: bold;
                            }
                            .orders {
                                display: flex;
                                flex-direction: column;
                            }
                            .orders-item {
                                display: flex;
                                justify-content: space-between;
                                text-align: left;
                            }
                            .orders-item-twin {
                                margin-left: 15px;
                            }
                            h4, h5 {
                                margin: 0 !important;
                                font-weight: normal;
                            }
                            .main-heading {
                                margin-bottom: 0;
                            }
                            .payment {
                                display: flex;
                                flex-direction: column;
                                margin-top: 25px;
                            }
                            span {
                                font-size: 14px !important;
                                margin-top: 3px !important;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="centered">
                            <h3 class="main-heading">${this.authStore.shopName}</h3>
                            <h5>${this.authStore.branchName} Branch</h5>
                            <h5>${this.authStore.branchLocation}</h5>
                            <h5>VAT Reg. TIN: 000-111-222-333</h5>
                            <h3>Reference #: ${this.referenceNumber}</h3>
                        </div>
                        <div class="left-content">
                            <span>Date & time: ${this.formatCurrentDate}</span><br />
                            <span>Customer name: ${this.customerName}</span><br />
                            <span>Number of items: ${this.totalItems}</span><br />
                            <span>Table #: ${this.selectedTableNumber}</span>
                        </div>
                        <div class="orders">
                            <div class="orders-item">
                                <span class="item-head">Item</span>
                                <span class="orders-item">
                                    <span class="orders-item-twin item-head">Price</span>
                                    <span class="orders-item-twin item-head">Subtotal</span>
                                <span>
                            </div>
                            ${allOrders.map(oD => `
                            <div class="orders-item">
                                <span>${oD.product_name || ''}${oD.temp_label || ''}${oD.size_label || ''}x${oD.quantity || ''}</span>
                                <span class="orders-item">
                                    <span class="orders-item-twin">₱${oD.product_price?.toFixed ? oD.product_price.toFixed(2) : oD.product_price || ''}</span>
                                    <span class="orders-item-twin">₱${(oD.product_price * oD.quantity || 0).toFixed(2)}</span>
                                <span>
                            </div>
                            `).join('')}
                        </div>
                        <div class="payment">
                            <div class="orders-item">
                                <span>Total charge</span>
                                <span>₱${ this.totalAmount }</span>
                            </div>
                            <div class="orders-item">
                                <span>Cash render:</span>
                                <span>₱${ this.customerCash }</span>
                            </div>
                            <div class="orders-item">
                                <span>Change:</span>
                                <span>₱${ this.customerChange }</span>
                            </div>
                        </div>
                        <div class="centered mt-10">
                            <img v-if="${this.imgSrc}" src="${this.imgSrc}" width="120" height="120" alt="Order QR Code">
                            <span>Scan the QR Code to view order</span><br />
                        </div>

                        <div class="centered mt-6">
                            <span>Thank you for purchasing!</span><br />
                            <span>You may follow us in our socials</span>
                            <span>FB: @KapehanPH</span>
                            <span>IG: @kapehan_ph</span><br />
                            <span>This serve as official receipt.</span>
                        </div>
                    </body>
                </html>`);
                printWindow.document.close();
                printWindow.print();
            } catch (error) {
                console.error('Error fetching order details:', error);
                this.orderDetails = [];
                this.showError("Failed to fetch order details.");
            }
        },

        async fetchQRCode(reference) {
            try {
                const qrCodeBlob = await this.transactStore.fetchQRcodeStore(reference);
                this.imgSrc = URL.createObjectURL(qrCodeBlob);
                if (!this.imgSrc) {
                    console.error('Failed to create image URL from blob');
                }
            } catch (error) {
                console.error('Error fetching order details:', error);
                this.imgSrc = '';
            }
        },

        async toReference(reference) {
            // this.$router.push({ name: 'Reference', params: { reference } });
            window.open(`/reference/${reference}`, '_blank');
        },

        changeStatus(order) {
            if (!order || !order.reference_number) {
                this.showError("Invalid order data!");
                return;
            }
            const currentStatusIndex = this.order_statuses.findIndex(
                status => Number(status.order_status_id) === Number(order.order_status_id)
            );
            const nextStatusIndex = (currentStatusIndex + 1) % this.order_statuses.length;
            const newStatus = Number(this.order_statuses[nextStatusIndex].order_status_id);
            this.transactStore.updateOrderStatusStore(order.reference_number, newStatus)
                .then(() => {
                    const statusName = this.getStatusName(newStatus);
                    this.showSuccess(`Table# ${order.table_number} is ${statusName}`);
                    this.fetchCurrentOrders();
                })
                .catch(error => {
                    console.error('Error updating order status:', error);
                    this.showError("Failed to update order status. Please try again!");
                });
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

        resetPaymentSection() {
            this.customer_cash = '';
            this.customer_change = '';
            this.customer_discount = '-select-';
            this.table_number = null;
            this.customer_name = '';
        },

        showError(message) {
            this.$refs.snackbarRef.showSnackbar(message, "error");
        },

        showSuccess(message) {
            this.$refs.snackbarRef.showSnackbar(message, "success");
        },

        generatedQRCode(referenceNumber) {
            const baseUrl = 'https://poofsa-yals.vercel.app/v1/qr-code/';
            const size = '150x150';
            const data = `Reference Number: ${referenceNumber}`;
            return `${baseUrl}?size=${size}&data=${encodeURIComponent(data)}`;
        },
    }
};
</script>

<style>
.trnsct-head {
    border-radius: 10px 10px 0 0 !important;
    background: #696969;
}

.v-data-table {
    border-radius: 0 0 10px 10px !important;
}

.v-field__input {
    padding: 15px;
}

table th {
    height: 0 !important;
}

.indication {
    display: flex;
    justify-content: space-between;
    position: sticky;
}

.mini-btn {
    font-size: 15px;
    width: 35px !important;
    height: 27px !important;
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
    left: 20%;
    top: 5%;
    width: 2px;
    height: 5px;
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
    left: 15%;
    animation-delay: 2.5s;
    opacity: 0.5;
}

.smoke4 {
    left: 17%;
    animation-delay: 1s;
    opacity: 0.5;
}

.smoke5 {
    left: 11%;
    animation-delay: 1.5s;
    opacity: 0.5;
}

@keyframes smokeUp {
    0% {
        opacity: 0.7;
        top: 5%;
        transform: translateX(-50%) scale(1);
    }

    25% {
        opacity: 0.4;
        top: -15%;
        transform: translateX(-50%) scale(1.2);
    }

    75% {
        opacity: 0.4;
        top: -15%;
        transform: translateX(-50%) scale(1.2);
    }

    100% {
        opacity: 0;
        top: -40%;
        transform: translateX(-50%) scale(1.4);
    }
}

.typewriter-fixed {
    display: inline-block;
    overflow: hidden;
    white-space: nowrap;
    width: 70px;
    /* Fixed width for the animation */
    animation:
        typing-fixed 3s steps(8, end) infinite,
        blink-caret .75s step-end infinite;
}

@keyframes typing-fixed {
    0% {
        width: 0;
    }

    50% {
        width: 70px;
    }

    100% {
        width: 0;
    }
}

@keyframes blink-caret {

    from,
    to {
        border-color: transparent;
    }

    50% {
        border-color: orange;
    }
}
</style>
