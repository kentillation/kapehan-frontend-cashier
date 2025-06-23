<template>
  <v-app dark>
    <v-main>
      <v-app-bar v-if="showSidebar" prominent>
        <v-app-bar-nav-icon v-if="showMenu" variant="text" @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
        <v-toolbar-title>
          <span>{{ authStore.shopName }}</span>
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click="toggleTheme" :title="themeText">
          <v-icon>mdi-theme-light-dark</v-icon>
        </v-btn>
      </v-app-bar>
      <v-navigation-drawer class="h-screen pa-3" v-model="drawer" v-if="showSidebar">
        <v-list density="compact" nav>
          <v-list-subheader size="30">Menu</v-list-subheader>
          <v-list-item prepend-icon="mdi-account-cash-outline" @click="toCashier" class="ps-5 bg-brown-darken-3"
            style="border-radius: 30px;">Main</v-list-item>
          <v-list-item prepend-icon="mdi-help-circle-outline" @click="toHelp" class="ps-5 bg-brown-darken-3"
            style="border-radius: 30px;">Help</v-list-item>
          <v-list-item prepend-icon="mdi-information-outline" @click="toAbout" class="ps-5 bg-brown-darken-3"
            style="border-radius: 30px;">About</v-list-item>
          <v-list-item prepend-icon="mdi-logout" @click="showLogout" class="ps-5 bg-brown-darken-3"
            style="border-radius: 30px;">Sign Out</v-list-item>
        </v-list>
      </v-navigation-drawer>
      <v-layout>
        <router-view />
        <GlobalLoader />
      </v-layout>
    </v-main>
  </v-app>
</template>

<script>
import { useTheme } from 'vuetify';
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useBranchStore } from '@/stores/branchStore';
import GlobalLoader from '@/components/GlobalLoader.vue';


export default {
  name: 'App',
  components: {
    GlobalLoader,
  },
  setup() {
    const theme = useTheme();
    const authStore = useAuthStore();
    const branchStore = useBranchStore();

    const toggleTheme = () => {
      const newTheme = theme.global.name.value === 'light' ? 'dark' : 'light';
      theme.global.name.value = newTheme;
      localStorage.setItem('theme', newTheme);
    };

    return {
      theme,
      toggleTheme,
      authStore,
      branchStore,
      drawer: ref(true),
      open: ref(false),
    };
  },
  computed: {
    showSidebar() {
      return this.$route.name !== 'LoginPage';
    },
    showMenu() {
      return this.$route.name !== 'LoginPage';
    },
    themeText() {
      return this.theme.global.name.value === 'light' ? 'Dark Mode' : 'Light Mode';
    }
  },
  mounted() {
    this.fetchBranches();
  },
  methods: {
    async fetchBranches() {
      try {
        this.fetchingBranches = true;
        await this.branchStore.fetchAllBranch();
      } catch (error) {
        console.error('Error fetching branches:', error);
      }
    },
    toCashier() {
      this.$router.push('/cashier');
    },
    async showLogout() {
      await this.authStore.logout();

    },
    toHelp() {
      this.$router.push('/help');
    },
    toAbout() {
      this.$router.push('/about');
    },
  }
};
</script>

<style scoped>
::v-deep(.hover-table .v-data-table__tr) {
  background-color: rgba(159, 164, 165, 0);
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
    background-color: rgba(117, 62, 62, 0.442);
  }

  100% {
    background-color: rgba(224, 247, 250, 0);
  }
}
</style>
