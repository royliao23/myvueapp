import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isLoggedIn: false,
    user: null as null | { username: string; email: string; id: string }
  }),
  actions: {
    login(userData: { username: string; email: string; id: string }) {
      this.isLoggedIn = true
      this.user = userData
    },
    logout() {
      this.isLoggedIn = false
      this.user = null
    }
  }
})