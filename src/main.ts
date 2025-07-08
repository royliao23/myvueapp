// src/main.ts
import 'vuetify/styles'
import { createApp } from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify' // Import from plugins
import '@mdi/font/css/materialdesignicons.css'

const app = createApp(App)
app.use(vuetify) // Use the imported Vuetify instance
app.mount('#app')