// src/composables/useNavigationService.ts

import type { Purchase, Invoice, Pay } from '../models'; // Adjust path based on your project structure
import { useCurrentPage, useCurrentRouteParam, useSelectedPurchase } from './useGlobalState';

export function useNavigationService() {
  const currentPage = useCurrentPage(); // or import directly
  const currentRouteParam = useCurrentRouteParam(); // if you’re tracking that separately
  const selectedPurchase = useSelectedPurchase();

  const handleViewPurchase = (purchase: Purchase) => {
    currentRouteParam.value = purchase.code.toString(); // store route param
    console.log('Navigating to PurchaseView with code:', purchase.code);
    console.log('Current page before navigation:', currentPage.value, purchase);
    currentPage.value = 'PurchaseView';                 // switch component
    console.log('Current page after navigation:', currentPage.value);
    selectedPurchase.value = purchase; // store selected purchase
  };

  return { handleViewPurchase };
}
