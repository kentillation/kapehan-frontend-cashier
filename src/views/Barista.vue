<!-- eslint-disable vue/multi-word-component-names -->
<template>
    <v-container>
        <h3 class="text-brown-lighten-1">Barista</h3>
        <v-row>
            <v-col cols="12" lg="4" md="6" sm="6">
                <v-card class="mt-3">
                    <v-card-title>
                        <h5><v-icon>mdi-table-chair</v-icon>&nbsp; Table #5</h5>
                    </v-card-title>
                    <v-card-text>
                        <div class="d-flex align-center justify-space-between">
                            <p class="me-3">Choco-Iced-M</p>
                            <p class="me-3">x2</p>
                            <v-chip color="orange" prepend-icon="mdi-coffee">
                                <span>Brewing</span>
                            </v-chip>
                        </div>
                    </v-card-text>
                </v-card>
                <v-card class="mt-3">
                    <v-card-title>
                        <h5><v-icon>mdi-table-chair</v-icon>&nbsp; Table #4</h5>
                    </v-card-title>
                    <v-card-text>
                        <div class="d-flex align-center justify-space-between mt-2">
                            <p class="me-3">Choco-Iced-M</p>
                            <p class="me-3">x5</p>
                            <v-chip color="blue" prepend-icon="mdi-check">
                                <span>Done</span>
                            </v-chip>
                        </div>
                        <div class="d-flex align-center justify-space-between mt-2">
                            <p class="me-3">Coffee-Iced-L</p>
                            <p class="me-3">x3</p>
                            <v-chip color="blue" prepend-icon="mdi-check">
                                <span>Done</span>
                            </v-chip>
                        </div>
                    </v-card-text>
                </v-card>
                <v-card class="mt-3">
                    <v-card-title>
                        <h5><v-icon>mdi-table-chair</v-icon>&nbsp; Table #3</h5>
                    </v-card-title>
                    <v-card-text>
                        <div class="d-flex align-center justify-space-between mt-2">
                            <p class="me-3">Choco-Hot-</p>
                            <p class="me-3">x2</p>
                            <v-chip color="blue" prepend-icon="mdi-check">
                                <span>Done</span>
                            </v-chip>
                        </div>
                        <div class="d-flex align-center justify-space-between mt-2">
                            <p class="me-3">Coffee-Iced-S</p>
                            <p class="me-3">x3</p>
                            <v-chip color="blue" prepend-icon="mdi-check">
                                <span>Done</span>
                            </v-chip>
                        </div>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
// import { useTheme } from 'vuetify';
// import { ref, computed } from 'vue';

export default {
    // eslint-disable-next-line vue/multi-word-component-names
    name: 'Barista',
    data() {
        return {

        }
    },
    setup() {

    },
};
</script>

<style scoped>
.descriptionColor {
    color: #a3a3a3;
}
</style>