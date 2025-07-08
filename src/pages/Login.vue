<template>
  <div class="login">
    <div class="login-container">
      <h2>Login</h2>
      <form @submit.prevent="handleLogin" class="login_form">
        <label for="username" class="login_label">
          Username or Email
        </label>
        <input
          type="text"
          id="username"
          placeholder="Enter your username"
          v-model="username"
          aria-label="Username or Email"
          class="login_box"
          required
        />

        <label for="password" class="login_label">
          Password
        </label>
        <div class="password-input">
          <input
            :type="showPassword ? 'text' : 'password'"
            id="password"
            placeholder="Enter your password"
            v-model="password"
            aria-label="Password"
            class="login_box"
            required
          />
          <span @click="togglePasswordVisibility" class="password-toggle">
            <component :is="showPassword ? EyeOff : Eye" :size="20" />
          </span>
        </div>

        <p class="forgot-password">
          <router-link to="/forgot-password">Forgot Password?</router-link>
        </p>

        <p class="signup-prompt">
          Not registered yet?
          <router-link to="/signup">Sign up here</router-link>
        </p>

        <button type="submit" :disabled="isLoading" class="login_button">
          {{ isLoading ? 'Logging in...' : 'Log In' }}
        </button>
        <p v-if="error" class="error">{{ error }}</p>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { Eye, EyeOff } from 'lucide-vue-next'
import axios from 'axios'

interface LoginProps {
  onLoginSuccess?: (username: string) => void
}

const props = defineProps<LoginProps>()

const API_BASE_URL = import.meta.env.VITE_API_NODE
if (!API_BASE_URL) {
  throw new Error('VITE_API_NODE is not defined in .env')
}

const username = ref('')
const password = ref('')
const error = ref<string | null>(null)
const isLoading = ref(false)
const showPassword = ref(false)
const router = useRouter()
const store = useAuthStore()

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const handleLogin = async () => {
  error.value = null
  isLoading.value = true

  try {
    const response = await axios.post(
      `${API_BASE_URL}/auth/login`,
      {
        username: username.value,
        password: password.value
      },
      {
        headers: {
          apikey: import.meta.env.VITE_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    )

    localStorage.setItem('authToken', response.data.token)
    localStorage.setItem('username', username.value)
    localStorage.setItem('email', response.data.user.email)
    localStorage.setItem('refreshToken', response.data.refresh_token)
    localStorage.setItem('id', response.data.user.id)

    props.onLoginSuccess?.(username.value)
    store.login({
      username: username.value,
      email: response.data.user.email,
      id: response.data.user.id
    })
    router.push('/home')
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Invalid login credentials.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.login {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
}

.login-container {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  background-color: white;
}

h2 {
  text-align: center;
  margin-bottom: 1.5rem;
}

.login_form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.login_label {
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.login_box {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
}

.password-input {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  display: flex;
  align-items: center;
}

.forgot-password,
.signup-prompt {
  margin-top: 0.5rem;
  font-size: 0.9rem;
}

.signup-prompt {
  margin-bottom: 1rem;
}

a {
  color: blue;
  text-decoration: underline;
  margin-left: 0.25rem;
}

.login_button {
  padding: 0.75rem;
  background-color: #1976d2;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.login_button:hover {
  background-color: #1565c0;
}

.login_button:disabled {
  background-color: #b0bec5;
  cursor: not-allowed;
}

.error {
  color: red;
  text-align: center;
  margin-top: 1rem;
}
</style>