// src/main.ts
import 'vuetify/styles'
import { createApp } from 'vue'
import { createPinia } from 'pinia' // Import Pinia
import App from './App.vue'
import vuetify from './plugins/vuetify'
import '@mdi/font/css/materialdesignicons.css'

import axios from 'axios';

// Get CSRF token when app loads
axios.get('/api/csrf/').then(response => {
  axios.defaults.headers.common['X-CSRFToken'] = response.data.csrfToken;
});

// Configure axios to send cookies
axios.defaults.withCredentials = true;
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';

// Create app instance
const app = createApp(App)

// Create Pinia instance
const pinia = createPinia()

// Use plugins
app.use(vuetify) // Vuetify
app.use(pinia)   // Pinia (order doesn't matter)

app.mount('#app')