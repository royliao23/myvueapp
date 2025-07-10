import { createRouter, createWebHashHistory } from 'vue-router';
import Login from '../pages/Login.vue';
import Home from '../pages/Home.vue';
import PurchaseComp from '../pages/Purchase.vue';
import PurchaseView from '../pages/PurchaseView.vue';
// import InvoiceView from '../pages/InvoiceView.vue';
// import PayView from '../pages/PayView.vue';

import Contractor from '../pages/Contractor.vue';
import Category from '../pages/Category.vue';
import ProjectComp from '../pages/Project.vue';
import JobComp from '../pages/Job.vue';
import Nav from '../components/Navbar.vue';
// import Signup from '../pages/Signup.vue';
// import ForgotPassword from './Pages/ForgotPassword.vue';
// import ResetPassword from './Pages/ResetPassword.vue';
// import InvoiceComp from './Pages/Invoice.vue';
// import PayComp from './Pages/Pay.vue';
// import AgingReport from './Pages/AgingReport.vue';
// import BankReconciliation from './Pages/BankReconciliation.vue';
// import PayrollDashboard from './Pages/PayrollDashboard.vue';
// import Company from './Pages/Company.vue';
// import Employee from './Pages/Employee.vue';
// import ChartDashboard from './Pages/ChartDashBoard.vue';
// import CategoryLedger from './Pages/Ledger.vue';
// import EasterEvent from './Pages/HomeCOG.vue';
// import DepartmentComponent from './Pages/Department.vue';
// import BASReportPage from './Pages/BasReportPage.vue';
// import Budget from './Pages/Budget.vue';
// Import all other components...

const routes = [
  { 
    path: '/login', 
    component: Login,
    props: { onLoginSuccess: () => {} } // This will be set by the parent
  },
  { path: '/', component: Home, meta: { requiresAuth: true } },
  { path: '/home', component: Home, meta: { requiresAuth: true } },
  { path: '/purchase', component: PurchaseComp, meta: { requiresAuth: true } },
  // Add all other routes with meta: { requiresAuth: true } for protected routes
  { path: '/purchase/:code', component: PurchaseView, meta: { requiresAuth: true } },
//   { path: '/invoice/:code', component: InvoiceView, meta: { requiresAuth: true } },
//   { path: '/pay/:code', component: PayView, meta: { requiresAuth: true } },
  { path: '/:pathMatch(.*)*', component: Login }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

// Navigation guard for auth
router.beforeEach((to, from, next) => {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  
  if (to.meta.requiresAuth && !isLoggedIn) {
    next('/login');
  } else if ((to.path === '/login' || to.path === '/signup') && isLoggedIn) {
    next('/');
  } else {
    next();
  }
});

export default router;