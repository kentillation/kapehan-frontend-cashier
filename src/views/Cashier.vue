<template>
    <v-container>
        <v-form ref="transactionForm" @submit.prevent="submitForm" v-model="isFormValid">
            <v-row>
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
                        density="comfortable" class="hover-table" style="margin-top: 20px;">
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
                <v-col cols="12" lg="6" md="6" sm="12" xs="12">
                    <v-row>
                        <v-col cols="12"> <!-- style="margin-top: 130px; margin-bottom: 300px;" -->
                            <h2>Running Orders</h2>
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
                                <v-btn class="bg-brown-darken-3 d-flex w-50 py-7 mt-3" variant="tonal"
                                    append-icon="mdi-send" type="submit" :loading="loading"
                                    :disabled="!isFormValid || loading">
                                    <v-progress-circular v-if="validatingData" color="white" label="Loading..." large />
                                    <span v-else>Submit</span>
                                </v-btn>
                            </div>
                        </v-col>
                    </v-row>
                </v-col>
                <v-col cols="12" lg="6" md="6" sm="12" xs="12">
                    <h2>Current Orders</h2>
                    <v-data-table :headers="headersOrders" :items="currentOrders" density="comfortable" height="300px">
                        <template v-slot:item.reference_number="{ item }">
                            <div class="d-flex align-center justify-space-between">
                                ct-{{ item.reference_number }}
                            </div>
                        </template>

                        <template v-slot:item.status="{ item }">
                            <v-chip :color="item.status === 'Brewing...' ? 'orange' : 'green'"
                                    :prepend-icon="item.status === 'Brewing...' ? 'mdi-coffee' : 'mdi-check'"
                                    size="small" 
                                    variant="flat"
                                    @click="changeStatus(item)">
                                {{ item.status }}
                            </v-chip>
                        </template>

                    </v-data-table>
                </v-col>
            </v-row>
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
            customer_charge: '',
            customer_cash: '',
            customer_change: '',
            table_number: '',
            customer_name: '',
            customer_discount: null,
            loadingProducts: false,
            validatingData: false,
            searchProduct: '',
            isFormValid: false,
            loading: false,
            products: [],
            selectedProducts: [],
            orders: [
                {
                    reference_number: '001-003',
                    status: 'Brewing...',
                },
                {
                    reference_number: '001-002',
                    status: 'Served',
                },
                {
                    reference_number: '001-001',
                    status: 'Served',
                },
            ],
            headers: [
                { title: 'Product', value: 'product_name' },
                { title: 'Price', value: 'product_price' },
            ],
            headersSelected: [
                { title: 'Product', value: 'product_name', width: '60%' },
                { title: 'Actions', value: 'actions', sortable: false, width: '40%' },
            ],
            headersOrders: [
                { title: 'Order number', value: 'reference_number', width: '60%' },
                { title: 'Status', value: 'status', sortable: false, width: '40%' },
            ],
            discountOptions: [
                { discount_id: 1, discount_label: '5%' },
                { discount_id: 2, discount_label: '10%' },
                { discount_id: 3, discount_label: '15%' },
                { discount_id: 4, discount_label: '20%' },
                { discount_id: 5, discount_label: '30%' },
                { discount_id: 6, discount_label: '-' },
            ],
            dataRows: [
                {
                    reference_number: '',
                    table_number: null,
                    total_quantity: '',
                    customer_cash: '',
                    customer_charge: '',
                    customer_change: '',
                    customer_discount: '',
                },
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
        }
    },
    mounted() {
        this.fetchProducts();
        this.generateReferenceNumber();
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
                await this.productsStore.fetchAllProductsStore(1);
                if (this.productsStore.products.length === 0) {
                    this.products = [];
                } else {
                    this.products = this.productsStore.products;
                }
                this.loadingProducts = false;
            } catch (error) {
                console.error('Error fetching products:', error);
                this.showError("Error fetching products!");
            } finally {
                this.loadingProducts = false;
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
                const isValid = await this.$refs.transactionForm.validate();
                if (!isValid) {
                    this.loading = false;
                    return;
                }
                const orderedProducts = this.selectedProducts.map(product => ({
                    product_id: product.product_id,
                    quantity: product.quantity,
                }));
                const transactionData = this.dataRows.map(row => ({
                    reference_number: this.newRefNumber,
                    table_number: row.table_number,
                    total_quantity: this.totalQuantity,
                    customer_cash: parseFloat(row.customer_cash.replace(/[^0-9.]/g, '')) || 0,
                    customer_charge: this.totalCharge,
                    customer_change: parseFloat(row.customer_change.replace(/[^0-9.]/g, '')) || 0,
                    customer_discount: row.customer_discount,
                }));
                await this.transactStore.submitTransactStore(transactionData, orderedProducts);
                this.showSuccess("Transaction submitted successfully!");
                this.$refs.transactionForm.reset();
                this.transactStore.clearState();
            } catch (error) {
                console.error('Transaction submission error:', error);
                this.showError(error.message || "Failed to process transaction. Please try again!");
            } finally {
                this.loading = false;
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
</style>