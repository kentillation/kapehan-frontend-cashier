<template>
  <v-app dark>
    <div v-if="connectionStatus !== 'online'" class="connection-container">
      <div class="connection-banner" :class="connectionStatus">
        <v-icon left>
          {{ connectionStatusIcon }}
        </v-icon>
        <span>&nbsp;{{ connectionStatusText }}</span>
      </div>
    </div>
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
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import { useTheme } from 'vuetify';
import { useAuthStore } from '@/stores/auth';
import { useLoadingStore } from '@/stores/loading';
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
    const loadingStore = useLoadingStore();
    const branchStore = useBranchStore();
    const connectionStatus = ref('online'); // 'online', 'offline', 'slow', 'waiting'

    const toggleTheme = () => {
      const newTheme = theme.global.name.value === 'light' ? 'dark' : 'light';
      theme.global.name.value = newTheme;
      localStorage.setItem('theme', newTheme);
    };

    // Simple network check
    const updateStatus = () => {
      if (!navigator.onLine) {
        connectionStatus.value = 'offline';
      } else {
        connectionStatus.value = 'online';
      }
    };

    // Optional: Simulate slow/waiting (replace with real logic as needed)
    let waitingTimeout;
    const simulateWaiting = () => {
      connectionStatus.value = 'waiting';
      waitingTimeout = setTimeout(() => {
        connectionStatus.value = navigator.onLine ? 'online' : 'offline';
      }, 3000);
    };

    onMounted(() => {
      window.addEventListener('online', updateStatus);
      window.addEventListener('offline', updateStatus);

      // Example: simulate waiting for connection on mount
      simulateWaiting();

      // Optional: Check for slow connection using Network Information API
      if ('connection' in navigator) {
        navigator.connection.addEventListener('change', () => {
          if (navigator.connection.downlink < 1) {
            connectionStatus.value = 'slow';
          } else if (navigator.onLine) {
            connectionStatus.value = 'online';
          }
        });
      }
    });

    onBeforeUnmount(() => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
      if (waitingTimeout) clearTimeout(waitingTimeout);
    });

    const connectionStatusText = computed(() => {
      switch (connectionStatus.value) {
        case 'offline':
          return 'No internet connection';
        case 'slow':
          return 'Low internet connection';
        case 'waiting':
          return 'Waiting for connection...';
        default:
          return '';
      }
    });

    const connectionStatusIcon = computed(() => {
      switch (connectionStatus.value) {
        case 'offline':
          return 'mdi-wifi-off';
        case 'slow':
          return 'mdi-wifi-alert';
        case 'waiting':
          return 'mdi-timer-sand';
        default:
          return '';
      }
    });

    return {
      theme,
      connectionStatus,
      connectionStatusText,
      connectionStatusIcon,
      toggleTheme,
      authStore,
      loadingStore,
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
      this.drawer = false;
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

.connection-container {
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.connection-banner {
  text-align: center;
  padding: 6px 30px;
  border-radius: 0 0 30px 30px;
  font-size: 12px;
  gap: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.connection-banner.offline {
  background: #8a1515;
  color: #fffafa;
}
.connection-banner.slow {
  background: #b88d20;
  color: #fffafa;
}
.connection-banner.waiting {
  background: #118aa0;
  color: #fffafa;
}
</style>
