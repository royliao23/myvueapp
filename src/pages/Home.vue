// src/pages/Home.vue
<template>
  <v-container>
    <v-card class="pa-4">
      <v-card-title class="text-h4">Welcome Home!</v-card-title>
      <v-card-text>
        <p>This is your construction app dashboard.</p>
        <p>Feel free to explore the navigation.</p>
        <v-btn color="primary" @click="navigateTo('PurchaseComp')">Go to Purchases</v-btn>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
// Define props if this component needs to receive any from App.vue
interface HomeProps {
  navigateTo: (page: string, param?: string) => void;
}
const props = defineProps<HomeProps>();
</script>

<style scoped>
/* Scoped styles for Home if needed */
</style>
