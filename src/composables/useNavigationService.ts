// src/composables/useNavigationService.ts

import type { Purchase, Invoice, Pay } from '../models'; // Adjust path based on your project structure
import { useCurrentPage, useCurrentRouteParam, useSelectedPurchase, useSelectedInvoice, useSelectedPay } from './useGlobalState';

export function useNavigationService() {
  const currentPage = useCurrentPage(); // or import directly
  const currentRouteParam = useCurrentRouteParam(); // if you’re tracking that separately
  const selectedPurchase = useSelectedPurchase();
  const selectedInvoice = useSelectedInvoice();
  const selectedPay = useSelectedPay();

  const handleViewPurchase = (purchase: Purchase) => {
    currentRouteParam.value = purchase.code.toString(); // store route param
    console.log('Navigating to PurchaseView with code:', purchase.code);
    console.log('Current page before navigation:', currentPage.value, purchase);
    currentPage.value = 'PurchaseView';                 // switch component
    console.log('Current page after navigation:', currentPage.value);
    selectedPurchase.value = purchase; // store selected purchase
    console.log('Selected purchase set:', selectedPurchase.value);
  };
  const handleViewInvoice = (invoice: any) => {
    try {
      if (invoice?.by_id && typeof invoice.by_id !== "number" && typeof invoice.by_id !== "string") {
          console.log("Invoice whose by_id is an object, converting to code", invoice);
          invoice.by_id = invoice.by_id.code;
          console.log("Converted by_id to code", invoice);
        }
      selectedInvoice.value = invoice; // store selected invoice
      console.log('Selected invoice set:', selectedInvoice.value);
      console.log('Navigating to InvoiceView with code:', invoice.code);
      currentRouteParam.value = invoice.code.toString();
      currentPage.value = 'InvoiceView';
      
    } catch (error) {
      console.error('Navigation error:', error);
      currentPage.value = 'Home';
    }
  };

  const handleViewPay = (pay: Pay) => {
    try {
      selectedPay.value = pay; // store selected pay
      console.log('Selected pay set:', selectedPay.value);
      console.log('Navigating to PayView with code:', pay.code);
      currentRouteParam.value = pay.code.toString();
      currentPage.value = 'PayView';
      
    } catch (error) {
      console.error('Navigation error:', error);
      currentPage.value = 'Home';
    }
  };

  return { 
    handleViewPurchase,
    handleViewInvoice,
    handleViewPay
  };
}