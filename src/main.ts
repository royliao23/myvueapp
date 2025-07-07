// src/main.ts
import { createApp } from 'vue';
import App from './App.vue';

// Vuetify
// import 'vuetify/styles'; // Import Vuetify styles
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import '@mdi/font/css/materialdesignicons.css'; // Ensure you have mdi/font installed for icons

// Create Vuetify instance
const vuetify = createVuetify({
  components,
  directives,
  // You can customize your theme here if needed
  theme: {
    defaultTheme: 'light', // Or 'dark'
    themes: {
      light: {
        colors: {
          primary: '#1976D2', // Example primary color
          secondary: '#424242',
          accent: '#82B1FF',
          error: '#FF5252',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FFC107',
        },
      },
    },
  },
});

const app = createApp(App);

// Use Vuetify
app.use(vuetify);

app.mount('#app');
