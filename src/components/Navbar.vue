// src/components/Navbar.vue
<template>
  <v-app-bar app color="primary" dark>
    <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
    <v-toolbar-title>Construction App</v-toolbar-title>
    <v-spacer></v-spacer>
    <v-btn text @click="onLogout">
      <v-icon left>mdi-logout</v-icon>
      Logout
    </v-btn>
  </v-app-bar>

  <v-navigation-drawer v-model="drawer" app>
    <v-list dense nav>
      <v-list-item
        v-for="item in mainItems"
        :key="item.route"
        link
        @click="handleItemClick(item)"
      >
        <template v-slot:prepend>
          <v-icon>{{ item.icon }}</v-icon>
        </template>
        <v-list-item-title>{{ item.title }}</v-list-item-title>
      </v-list-item>
      <!-- HR Submenu -->
      <v-list-group value="HR">
        <template v-slot:activator="{ props }">
          <v-list-item
            v-bind="props"
            prepend-icon="mdi-account-tie"
            title="HR"
          ></v-list-item>
        </template>

        <v-list-item
          v-for="item in hrItems"
          :key="item.route"
          link
          @click="handleItemClick(item)"
        >
          <template v-slot:prepend>
            <v-icon>{{ item.icon }}</v-icon>
          </template>
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item>
      </v-list-group>

      <!-- Reports Submenu -->
      <v-list-group value="Reports">
        <template v-slot:activator="{ props }">
          <v-list-item
            v-bind="props"
            prepend-icon="mdi-chart-box"
            title="Reports"
          ></v-list-item>
        </template>

        <v-list-item
          v-for="item in reportItems"
          :key="item.route"
          link
          @click="handleItemClick(item)"
        >
          <template v-slot:prepend>
            <v-icon>{{ item.icon }}</v-icon>
          </template>
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item>
      </v-list-group>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface NavItem {
  title: string;
  icon: string;
  route: string;
  param?: string;
}

interface NavbarProps {
  onLogout: () => void;
  navigateTo: (page: string, param?: string) => void;
}

const props = defineProps<NavbarProps>();
const drawer = ref(false);

// Regular menu items
const mainItems = ref<NavItem[]>([
  { title: 'Home', icon: 'mdi-home', route: 'Home' },
  { title: 'Purchase', icon: 'mdi-cart', route: 'PurchaseComp' },
  { title: 'Task', icon: 'mdi-check-all', route: 'Task' },
  { title: 'Contact', icon: 'mdi-account-box', route: 'Contact' },
  { title: 'Articles', icon: 'mdi-newspaper', route: 'Articles' },
  { title: 'Category', icon: 'mdi-shape', route: 'Category' },
  { title: 'Job', icon: 'mdi-briefcase', route: 'JobComp' },
  { title: 'Project', icon: 'mdi-folder-multiple', route: 'ProjectComp' },
  { title: 'Contractor', icon: 'mdi-hard-hat', route: 'Contractor' },
  { title: 'Invoice', icon: 'mdi-receipt', route: 'InvoiceComp' },
  { title: 'Pay', icon: 'mdi-cash-multiple', route: 'PayComp' },
  { title: 'Budget', icon: 'mdi-wallet', route: 'Budget' },
  { title: 'Sample Purchase View', icon: 'mdi-eye', route: 'PurchaseView', param: '1' },
]);

// HR Submenu items
const hrItems = ref<NavItem[]>([
  { title: 'Company', icon: 'mdi-domain', route: 'Company' },
  { title: 'Employee', icon: 'mdi-account-group', route: 'Employee' },
  { title: 'Department', icon: 'mdi-office-building', route: 'DepartmentComponent' },
  { title: 'Payroll Dashboard', icon: 'mdi-account-cash', route: 'PayrollDashboard' }
]);

// Reports Submenu items
const reportItems = ref<NavItem[]>([
  { title: 'Creditor Aging', icon: 'mdi-calendar-clock', route: 'AgingReport' },
  { title: 'Bank Reconciliation', icon: 'mdi-bank-transfer', route: 'BankReconciliation' },
  { title: 'BAS Report', icon: 'mdi-file-document', route: 'BasReportPage' },
  { title: 'Ledger', icon: 'mdi-book-open', route: 'CategoryLedger' },
  { title: 'Chart Dashboard', icon: 'mdi-chart-bar', route: 'ChartDashboard' }
]);

const handleItemClick = (item: NavItem) => {
  props.navigateTo(item.route, item.param);
  if (window.innerWidth < 1000) {
    drawer.value = false;
  }
};
</script>

<style>
/* Your existing styles */
.v-navigation-drawer .v-list {
  background-color: rgb(243, 243, 124) !important;
}

.v-navigation-drawer .v-list-item {
  color: blue !important;
}

.v-navigation-drawer .v-list-item:hover {
  background-color: white !important;
}

.v-navigation-drawer .v-icon {
  color: red !important;
}

/* Style for list groups */
.v-list-group__items .v-list-item {
  padding-left: 32px !important;
}
</style>