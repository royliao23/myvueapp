// src/plugins/vuetify.ts
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

export default createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#1976D2',
          secondary: '#424242',
          background: '#FFFFFF',
          surface: '#FFFFFF',
        }
      }
    }
  },
  defaults: {
    VList: { density: 'comfortable' },
    VListItem: { activeClass: 'bg-primary-lighten-5' }
  }
})