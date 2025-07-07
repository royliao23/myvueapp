// src/pages/PurchaseView.vue
<template>
  <v-container>
    <v-card class="pa-4">
      <v-card-title class="text-h4">Purchase is the what you want</v-card-title>
      <v-card-text>
        <p v-if="code">Viewing purchase with code: <strong>{{ code }}</strong></p>
        <p v-else>No purchase code provided.</p>
        <v-btn color="secondary" @click="navigateTo('Home')">Back to Home</v-btn>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
// Define props for dynamic routes
interface PurchaseViewProps {
  code?: string; // The dynamic parameter
  navigateTo: (page: string, param?: string) => void;
}
const props = defineProps<PurchaseViewProps>();
</script>

<style scoped>
/* Scoped styles for PurchaseView if needed */
</style>
