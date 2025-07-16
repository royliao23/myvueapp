<template>
  <v-container class="fill-height">
    <v-row align="center" justify="center" class="fill-height">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="pa-4 custom-card-lift"> <v-card-title class="text-h4">Welcome Home!</v-card-title>
          <v-card-text>
            <p>This is your construction app dashboard.</p>
            <p>Feel free to explore the navigation.</p>
            <!-- <v-btn color="primary" @click="navigateTo('PurchaseComp')">Go to Purchases</v-btn> -->
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
interface HomeProps {
  navigateTo: (page: string, param?: string) => void;
}
defineProps<HomeProps>();
</script>

<style scoped>
.custom-card-lift {
  transform: translateY(-65%); /* Moves the card up by 65% of its own height */
  text-align: center;
  align-items: center;
 
}


</style>