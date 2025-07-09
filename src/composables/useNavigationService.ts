// src/composables/useNavigationService.ts

import { useRouter } from 'vue-router';
// Import your interfaces
import type { Purchase, Invoice, Pay } from '../models'; // Adjust path based on your project structure

export const useNavigationService = () => {
  const router = useRouter(); // This is the Vue 3 equivalent of React's useNavigate()

  const handleViewPurchase = (purchase: Purchase) => {
    console.log("po passed:", purchase);
    // Use router.push() to navigate programmatically.
    // The 'path' creates a dynamic URL.
    // The 'state' object makes the 'purchase' data available in window.history.state
    // on the target component (PurchaseView).
    router.push({
      path: `/PurchaseView/${purchase.code}`,
      query: { purchase: JSON.stringify(purchase) }
    });
  };

  const handleViewInvoice = (invoice: Invoice) => {
    console.log("invoice passed:", invoice);
    router.push({
      path: `/invoice/${invoice.code}`,
      query: { invoice: JSON.stringify(invoice) }
    });
  };

  const handleViewPay = (pay: Pay) => {
    console.log("view pay:", pay);
    router.push({
      path: `/pay/${pay.code}`,
      query: { pay: JSON.stringify(pay) }
    });
  };

  return {
    handleViewPurchase,
    handleViewInvoice,
    handleViewPay
  };
};