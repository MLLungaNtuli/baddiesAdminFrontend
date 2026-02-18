<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'
import { auth } from '../services/auth'

// PrimeVue
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Checkbox from 'primevue/checkbox'

const username = ref('')
const password = ref('')
const rememberMe = ref(false)
const loading = ref(false)
const error = ref('')

const router = useRouter()

const login = async () => {
  loading.value = true
  error.value = ''

  try {
    const res = await api.post('/api/admin/auth/login', {
      username: username.value,
      password: password.value
    })

    auth.setTokens({
      accessToken: res.data.accessToken,
      refreshToken: res.data.refreshToken
    })

    router.push('/')
  } catch (err) {
    error.value = err.response?.data || 'Invalid credentials or access denied'
  } finally {
    loading.value = false
  }
}

// =====================
// Mouse move for gradients and parallax
// =====================
let gradientEl
let cardEl

const onMouseMove = (e) => {
  const x = e.clientX / window.innerWidth
  const y = e.clientY / window.innerHeight

  // Gradient background
  if (gradientEl) {
    gradientEl.style.background = `radial-gradient(circle at ${x * 100}% ${y * 100}%, #4f46e5, #6366f1, #a5b4fc, #e0e7ff)`
  }

  // Parallax card
  if (cardEl) {
    const rotateX = (y - 0.5) * 10 // max tilt 10deg
    const rotateY = (x - 0.5) * -10
    const translateX = (x - 0.5) * -10 // px
    const translateY = (y - 0.5) * -10
    cardEl.style.transform = `translate(${translateX}px, ${translateY}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
  }
}

onMounted(() => {
  gradientEl = document.querySelector('.animated-gradient')
  cardEl = document.querySelector('.login-card')
  window.addEventListener('mousemove', onMouseMove)
})

onBeforeUnmount(() => {
  window.removeEventListener('mousemove', onMouseMove)
})
</script>

<template>
  <div class="login-page">
    <div class="background-gradient"></div>
    <div class="animated-gradient"></div>

    <div class="login-card fade-in">
      <h2>Admin Access</h2>
      <p class="subtitle">Escort Agency Control Panel</p>

      <InputText
        v-model="username"
        placeholder="Email or Username"
        class="input"
      />

      <Password
        v-model="password"
        toggleMask
        :feedback="false"
        placeholder="Password"
        class="input"
      />

      <div class="security-row">
        <Checkbox v-model="rememberMe" binary />
        <label>Remember me</label>
      </div>

      <Button
        label="Sign In"
        icon="pi pi-lock"
        class="login-btn"
        :loading="loading"
        @click="login"
      />

      <p v-if="error" class="error">{{ error }}</p>
    </div>
  </div>
</template>

<style scoped>
/* ===============================
   Page & Background
================================= */
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  font-family: 'Inter', sans-serif;
  position: relative;
  overflow: hidden;
  background: #f9fafb;
}

.background-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
  z-index: -2;
}

.animated-gradient {
  position: absolute;
  inset: -50%;
  background: radial-gradient(circle at 50% 50%, #4f46e5, #6366f1, #a5b4fc, #e0e7ff);
  background-size: 600% 600%;
  border-radius: 50%;
  filter: blur(150px);
  transition: background 0.3s ease;
  z-index: -1;
}

/* ===============================
   Card
================================= */
.login-card {
  background: #ffffff;
  padding: 3rem 2.5rem;
  border-radius: 1rem;
  box-shadow: 0 25px 60px rgba(0,0,0,0.08);
  width: 100%;
  max-width: 400px;
  text-align: center;
  transition: transform 0.1s ease, opacity 0.3s ease;
  position: relative;
  z-index: 1;
}

.fade-in {
  opacity: 0;
  transform: translateY(20px);
  animation: fadeIn 0.6s forwards;
}

@keyframes fadeIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ===============================
   Typography
================================= */
.login-card h2 {
  font-size: 1.75rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.25rem;
}

.login-card .subtitle {
  font-size: 0.95rem;
  color: #6b7280;
  margin-bottom: 2rem;
}

/* ===============================
   Inputs
================================= */
.input {
  width: 100%;
  margin-bottom: 1.2rem;
}

.security-row {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
  color: #4b5563;
}

/* ===============================
   Button
================================= */
.login-btn {
  width: 100%;
  background: #4f46e5;
  border: none;
  color: #ffffff;
  font-weight: 500;
  border-radius: 0.6rem;
  padding: 0.8rem 1rem;
  transition: background 0.3s ease, transform 0.2s ease;
}

.login-btn:hover {
  background: #4338ca;
  transform: translateY(-1px);
}

.login-btn:active {
  transform: translateY(0);
}

/* ===============================
   Error
================================= */
.error {
  color: #ef4444;
  margin-top: 1rem;
  font-size: 0.875rem;
}

/* ===============================
   Responsive
================================= */
@media (max-width: 480px) {
  .login-card {
    padding: 2rem 1.5rem;
  }
}
</style>
