import { ref } from 'vue';
import type { Purchase,Invoice, Pay } from '../models';

const currentPage = ref('Home');
const currentRouteParam = ref<string | null>(null);
const selectedPurchase = ref<Purchase | null>(null);  
const selectedInvoice = ref<Invoice | null>(null); // For invoice selection if needed
const selectedPay = ref<Pay | null>(null); // For pay selection if needed

export function useCurrentPage() {
  return currentPage;
}

export function useCurrentRouteParam() {
  return currentRouteParam;
}

export function useSelectedPurchase() {
  return selectedPurchase;
}

export function useSelectedInvoice() {
  return selectedInvoice;
}

export function useSelectedPay() {
  return selectedPay;
}
