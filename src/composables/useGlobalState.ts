import { ref } from 'vue';
import type { Purchase } from '../models';

const currentPage = ref('Home');
const currentRouteParam = ref<string | null>(null);
const selectedPurchase = ref<Purchase | null>(null);  

export function useCurrentPage() {
  return currentPage;
}

export function useCurrentRouteParam() {
  return currentRouteParam;
}

export function useSelectedPurchase() {
  return selectedPurchase;
}
