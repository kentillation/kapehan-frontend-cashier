<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <v-container>
    <v-snackbar v-model="snackbar.visible" :color="snackbar.color" location="bottom" timeout="5000">
        <h3 class="text-center px-2">
          <span><v-icon icon="mdi-bell-outline"></v-icon></span>
          <span>&nbsp; {{ snackbar.message }}</span>
        </h3>
    </v-snackbar></v-container>
</template>
<script>
export default {
  data() {
    return {
      snackbar: {
        visible: false,
        message: '',
        color: ''
      },
    };
  },
  methods: {
    showSnackbar(message, color) {
      this.snackbar.message = message;
      this.snackbar.color = color;
      this.snackbar.visible = true;
    },
  },
};
</script>