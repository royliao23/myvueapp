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
        v-for="item in navItems"
        :key="item.route"
        link
        @click="navigateTo(item.route)"
      >
        <template v-slot:prepend>
          <v-icon>{{ item.icon }}</v-icon>
        </template>
        <v-list-item-title>{{ item.title }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// Define props for the component
interface NavbarProps {
  onLogout: () => void;
  navigateTo: (page: string, param?: string) => void;
}
const props = defineProps<NavbarProps>();

// Reactive state for the navigation drawer
const drawer = ref(false);

// Define navigation items
const navItems = ref([
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
  { title: 'Creditor Aging', icon: 'mdi-calendar-clock', route: 'AgingReport' },
  { title: 'Chart Dashboard', icon: 'mdi-chart-bar', route: 'ChartDashboard' },
  { title: 'Bank Reconciliation', icon: 'mdi-bank-transfer', route: 'BankReconciliation' },
  { title: 'Payroll Dashboard', icon: 'mdi-account-cash', route: 'PayrollDashboard' },
  { title: 'Company', icon: 'mdi-domain', route: 'Company' },
  { title: 'Employee', icon: 'mdi-account-group', route: 'Employee' },
  { title: 'BAS Report', icon: 'mdi-file-document', route: 'BASReportPage' },
  { title: 'Department', icon: 'mdi-office-building', route: 'DepartmentComponent' },
  { title: 'Ledger', icon: 'mdi-book-open', route: 'CategoryLedger' },
  { title: 'Budget', icon: 'mdi-wallet', route: 'Budget' },
  // Example for a dynamic route, you'd navigate to it with a param
  { title: 'Sample Purchase View', icon: 'mdi-eye', route: 'PurchaseView', param: '123' },
]);
</script>

<style scoped>
/* Scoped styles for Navbar if needed */
</style>
