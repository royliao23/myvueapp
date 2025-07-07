// src/pages/Login.vue
<template>
  <v-container class="fill-height d-flex align-center justify-center">
    <v-card class="pa-6" max-width="400px" width="100%">
      <v-card-title class="text-h5 text-center mb-4">Login</v-card-title>
      <v-card-text>
        <v-form @submit.prevent="handleLogin">
          <v-text-field
            v-model="username"
            label="Username"
            variant="outlined"
            class="mb-4"
            required
          ></v-text-field>
          <v-text-field
            v-model="password"
            label="Password"
            type="password"
            variant="outlined"
            class="mb-4"
            required
          ></v-text-field>
          <v-btn type="submit" color="primary" block class="mb-2">Login</v-btn>
          <v-btn text block @click="navigateTo('Signup')">Don't have an account? Sign Up</v-btn>
          <v-btn text block @click="navigateTo('ForgotPassword')">Forgot Password?</v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// Define props for the component
interface LoginProps {
  onLoginSuccess: () => void;
  navigateTo: (page: string, param?: string) => void;
}
const props = defineProps<LoginProps>();

// Reactive state for form inputs
const username = ref('');
const password = ref('');

// Handle login logic
const handleLogin = () => {
  // In a real app, you'd send these credentials to your backend
  // and handle the response. For this example, we'll just simulate success.
  if (username.value === 'user' && password.value === 'password') {
    props.onLoginSuccess(); // Call the parent's login success handler
    props.navigateTo('Home'); // Navigate to the home page
  } else {
    // In a real app, display an error message
    console.error('Invalid credentials');
    alert('Invalid username or password. Try "user" and "password".'); // Using alert for simplicity in this environment
  }
};
</script>

<style scoped>
/* Scoped styles for Login if needed */
</style>
