// src/App.vue
<template>
  <v-app>
    <!-- Navbar and Navigation Drawer (conditionally rendered) -->
    <Navbar
      v-if="isLoggedIn && !hideNavPages.includes(currentPage)"
      :on-logout="handleLogout"
      :navigate-to="navigateTo"
    />

    <v-main>
      <!-- Main content area for pages -->
      <component
        :is="currentPageComponent"
        :on-login-success="handleLoginSuccess"
        :navigate-to="navigateTo"
        :code="currentRouteParam"
      />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, defineAsyncComponent } from 'vue';
import Navbar from './components/Navbar.vue';
import { useCurrentPage, useCurrentRouteParam } from './composables/useGlobalState';

const currentPage = useCurrentPage();
const currentRouteParam = useCurrentRouteParam();
// Define the type for page components for better type safety
type PageComponent = ReturnType<typeof defineAsyncComponent> | null;

// Reactive state for authentication and current page
const isLoggedIn = ref(localStorage.getItem('isLoggedIn') === 'true');

// List of pages that should hide the navigation bar
const hideNavPages = ['Login', 'Signup', 'ForgotPassword', 'ResetPassword', 'EasterEvent'];

// Function to handle successful login
const handleLoginSuccess = () => {
  isLoggedIn.value = true;
  localStorage.setItem('isLoggedIn', 'true');
  navigateTo('Home'); // Navigate to home after successful login
};

// Function to handle logout
const handleLogout = () => {
  isLoggedIn.value = false;
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('username');
  localStorage.removeItem('authToken');
  localStorage.removeItem('id');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('email');
  navigateTo('Login'); // Navigate back to login page
};

// Function to navigate to a different page
const navigateTo = (page: string, param?: string) => {
  currentPage.value = page;
  currentRouteParam.value = param || null;
  // Simulate URL change for dynamic routes, though not reflected in browser URL in this environment
  if (param) {
    console.log(`Navigating to /${page.toLowerCase()}/${param}`);
  } else {
    console.log(`Navigating to /${page.toLowerCase()}`);
  }
};

// Dynamic component loading based on currentPage
const currentPageComponent = computed<PageComponent>(() => {
  // if (currentPage.value === 'PurchaseView') return PurchaseView;
  
  switch (currentPage.value) {
    // case 'Home':
    case 'Home':
      return defineAsyncComponent(() => import('./pages/Home.vue'));
    //   return defineAsyncComponent(() => import('./pages/Task.vue'));
    // case 'Contact':
    //   return defineAsyncComponent(() => import('./pages/Contact.vue'));
    // case 'Articles':
    //   return defineAsyncComponent(() => import('./pages/Articles.vue'));
    // case 'Login':
    //   return defineAsyncComponent(() => import('./pages/Login.vue'));
    // case 'Signup':
    //   return defineAsyncComponent(() => import('./pages/Signup.vue'));
    // case 'ForgotPassword':
    //   return defineAsyncComponent(() => import('./pages/ForgotPassword.vue'));
    // case 'ResetPassword':
    //   return defineAsyncComponent(() => import('./pages/ResetPassword.vue'));
    case 'Contractor':
      return defineAsyncComponent(() => import('./pages/Contractor.vue'));
    case 'Category':
      return defineAsyncComponent(() => import('./pages/Category.vue'));
    case 'ProjectComp': // Renamed to avoid conflict with 'Project' folder
      return defineAsyncComponent(() => import('./pages/Project.vue'));
    case 'JobComp': // Renamed to avoid conflict with 'Job' folder
      return defineAsyncComponent(() => import('./pages/Job.vue'));
    case 'PurchaseComp': // Renamed to avoid conflict with 'Purchase' folder
      return defineAsyncComponent(() => import('./pages/Purchase.vue'));
    case 'PurchaseView': // Dynamic route for PurchaseView
      return defineAsyncComponent(() => import('./pages/PurchaseView.vue'));

    case 'InvoiceComp': // Renamed to avoid conflict with 'Invoice' folder
      return defineAsyncComponent(() => import('./pages/Invoice.vue'));
    case 'InvoiceView':
      return defineAsyncComponent(() => import('./pages/InvoiceView.vue'));
    case 'PayComp': // Renamed to avoid conflict with 'Pay' folder
      return defineAsyncComponent(() => import('./pages/Pay.vue'));
    case 'PayView':
      return defineAsyncComponent(() => import('./pages/PayView.vue'));
    // case 'AgingReport':
    //   return defineAsyncComponent(() => import('./pages/AgingReport.vue'));
    // case 'BankReconciliation':
    //   return defineAsyncComponent(() => import('./pages/BankReconciliation.vue'));
    // case 'PayrollDashboard':
    //   return defineAsyncComponent(() => import('./pages/PayrollDashboard.vue'));
    case 'Company':
      return defineAsyncComponent(() => import('./pages/Company.vue'));
    // case 'Employee':
    //   return defineAsyncComponent(() => import('./pages/Employee.vue'));
    // case 'ChartDashboard':
    //   return defineAsyncComponent(() => import('./pages/ChartDashboard.vue'));
    // case 'CategoryLedger':
    //   return defineAsyncComponent(() => import('./pages/CategoryLedger.vue'));
    // case 'EasterEvent':
    //   return defineAsyncComponent(() => import('./pages/EasterEvent.vue'));
    case 'DepartmentComponent': // Renamed to avoid conflict with 'Department' folder
      return defineAsyncComponent(() => import('./pages/Department.vue'));
    case 'BASReportPage':
    //   return defineAsyncComponent(() => import('./pages/BASReportPage.vue'));
    case 'Budget':
      return defineAsyncComponent(() => import('./pages/Budget.vue'));
    default:
      // Fallback to Login if the route is not found or not logged in
      return defineAsyncComponent(() => import('./pages/Login.vue'));
  }
});

// On component mount, check authentication status and redirect
onMounted(() => {
  const publicPaths = ['Login', 'Signup', 'ForgotPassword', 'ResetPassword', 'EasterEvent'];
  const currentPath = currentPage.value; // Get current path from ref
  if (!isLoggedIn.value && !publicPaths.includes(currentPath)) {
    navigateTo('Login');
  } else if (isLoggedIn.value && publicPaths.includes(currentPath)) {
    navigateTo('Home'); // If logged in, but on a public path, redirect to home
  }
});
</script>

<style>
/* Global styles from main.css will be applied */
/* Tailwind will handle most styles, but not directly imported here */
</style>
