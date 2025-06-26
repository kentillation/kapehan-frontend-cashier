<template>
    <v-container>
        <v-card justify="center" class="pa-10" elevation="3" rounded="lg">
            <v-card-title>
                <h1>Cashier</h1>
            </v-card-title>
            <v-card-text>
                <v-form ref="form" @submit.prevent="handleLogin" v-model="isFormValid">
                    <div class="text-subtitle-1 text-medium-emphasis">Email</div>
                    <v-text-field v-model="cashier_email" :rules="[requiredRule, emailFormatRule]" placeholder="Type here..."
                        prepend-inner-icon="mdi-email-outline" variant="outlined" autocomplete="username" />

                    <div class="text-subtitle-1 text-medium-emphasis mt-2">Password</div>
                    <v-text-field v-model="cashier_password" :rules="[requiredRule]" :type="showPassword ? 'text' : 'password'"
                        :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye-outline'" placeholder="Type here..."
                        prepend-inner-icon="mdi-lock-outline" variant="outlined" autocomplete="current-password"
                        @click:append-inner="showPassword = !showPassword" />

                    <v-btn type="submit" color="brown-darken-3" :loading="loading" :disabled="!isFormValid || loading"
                        block size="large" class="mt-5" height="45" rounded>
                        Proceed
                    </v-btn>
                </v-form>
            </v-card-text>
        </v-card>
        <v-snackbar v-model="snackbar.visible" :color="snackbar.color" timeout="4000" top>
            {{ snackbar.message }}
        </v-snackbar>
    </v-container>
</template>

<script>
import { useAuthStore } from '@/stores/auth';

export default {
    name: 'LoginPage',
    data() {
        return {
            cashier_email: '',
            cashier_password: '',
            showPassword: false,
            isFormValid: false,
            loading: false,
            snackbar: {
                visible: false,
                message: '',
                color: ''
            },
        };
    },
    methods: {
        requiredRule(v) {
            return !!v || 'This field is required';
        },
        emailFormatRule(v) {
            const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return pattern.test(v) || 'Invalid email format';
        },
        async handleLogin() {
            const isValid = await this.$refs.form.validate();
            if (!isValid) return;

            this.loading = true;
            try {
                const authStore = useAuthStore();
                await authStore.login({ cashier_email: this.cashier_email, cashier_password: this.cashier_password });

                // this.$router.push('/dashboard');
                window.location.href = '/cashier';
            } catch (error) {
                this.showSnackbar(error || 'Login failed. Please try again!', 'error');
            } finally {
                this.loading = false;
            }
        },
        showSnackbar(message, color) {
            this.snackbar.message = message;
            this.snackbar.color = color;
            this.snackbar.visible = true;
        }
    }
};
</script>

<style scoped>
.v-container {
    display: grid;
    place-items: center;
    height: 100vh;
}

</style>