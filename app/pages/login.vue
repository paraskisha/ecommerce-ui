<template>
  <v-layout class="manager-login-layout" theme="light">
    <v-app-bar flat height="76" class="manager-login-header">
      <v-container class="d-flex align-center">
        <NuxtLink to="/" class="manager-login-brand d-flex align-center ga-2">
          <v-icon icon="mdi-shopping" color="primary" size="34" />
          <span class="text-h5 font-weight-bold">Shop<span class="text-primary">Kart</span></span>
        </NuxtLink>
        <v-spacer />
        <v-btn to="/" color="primary" variant="outlined" prepend-icon="mdi-arrow-left">Back to shop</v-btn>
      </v-container>
    </v-app-bar>

    <v-main class="manager-login-main">
      <v-container class="manager-login-container d-flex align-center justify-center">
        <v-card class="manager-login-card" rounded="xl" elevation="0">
          <v-card-text class="pa-6 pa-sm-8">
            <div class="manager-login-icon mb-5">
              <v-icon icon="mdi-shield-account-outline" size="28" color="primary" />
            </div>
            <p class="manager-login-eyebrow">Store manager</p>
            <h1 class="text-h4 font-weight-bold mb-2">Sign in</h1>
            <p class="text-medium-emphasis mb-6">
              Use your Store Manager account to manage products.
            </p>

            <v-alert v-if="errorMessage" class="mb-5" type="error" variant="tonal">
              {{ errorMessage }}
            </v-alert>

            <form class="manager-login-form" @submit.prevent="signIn">
              <label class="manager-login-field">
                <span>Username or email</span>
                <input
                  v-model="identifier"
                  type="text"
                  autocomplete="username"
                  placeholder="Enter your username or email"
                  :disabled="signingIn"
                  required
                >
              </label>
              <label class="manager-login-field">
                <span>Password</span>
                <input
                  v-model="password"
                  type="password"
                  autocomplete="current-password"
                  placeholder="Enter your password"
                  :disabled="signingIn"
                  required
                >
              </label>
              <v-btn
                block
                color="primary"
                size="large"
                rounded="lg"
                type="submit"
                :loading="signingIn"
                :disabled="!identifier.trim() || !password"
              >
                Sign In
              </v-btn>
            </form>
          </v-card-text>
        </v-card>
      </v-container>
    </v-main>
  </v-layout>
</template>

<script setup lang="ts">
useHead({ title: 'Manager sign in | ShopKart' })

const route = useRoute()
const { login } = useManagerAuth()
const identifier = ref('')
const password = ref('')
const signingIn = ref(false)
const errorMessage = ref(
  route.query.reason === 'access-denied'
    ? 'This account is not assigned the Store Manager role.'
    : route.query.reason === 'session-expired'
      ? 'Your session expired. Please sign in again.'
      : '',
)

async function signIn() {
  errorMessage.value = ''
  signingIn.value = true
  try {
    await login(identifier.value.trim(), password.value)
    const redirect = typeof route.query.redirect === 'string'
      && route.query.redirect.startsWith('/')
      && !route.query.redirect.startsWith('//')
      ? route.query.redirect
      : '/products'
    await navigateTo(redirect)
  } catch (error) {
    console.error('Store manager sign-in failed:', error)
    errorMessage.value = error instanceof Error
      ? error.message
      : 'Unable to sign in. Check your credentials and try again.'
  } finally {
    signingIn.value = false
  }
}
</script>

<style scoped>
.manager-login-layout { min-height: 100vh; background: #f7f9fc; color: #172b4d; }
.manager-login-header { background: white !important; border-bottom: 1px solid #e8eef8; }
.manager-login-brand { color: #172b4d; text-decoration: none; white-space: nowrap; }
.manager-login-main { min-height: 100vh; padding-top: 76px; }
.manager-login-container { min-height: calc(100vh - 76px); padding-top: 32px; padding-bottom: 32px; }
.manager-login-card { width: min(100%, 460px); border: 1px solid #e8eef6; background: white; }
.manager-login-card h1 { color: #172b4d; }
.manager-login-card .text-medium-emphasis { color: #65758c !important; }
.manager-login-icon { display: flex; width: 52px; height: 52px; align-items: center; justify-content: center; border: 1px solid #d5e5f7; border-radius: 15px; background: #edf4fc; }
.manager-login-eyebrow { margin-bottom: 8px; color: #3879c7; font-size: .75rem; font-weight: 800; letter-spacing: .13em; text-transform: uppercase; }
.manager-login-help { color: #728198; font-size: .85rem; text-align: center; }
.manager-login-form { display: grid; gap: 16px; }
.manager-login-field { display: grid; gap: 8px; color: #405570; font-size: .9rem; font-weight: 600; }
.manager-login-field input { box-sizing: border-box; width: 100%; min-height: 56px; padding: 14px 16px; border: 1px solid #bac9dc; border-radius: 10px; background: #fff; color: #172b4d; font: inherit; font-weight: 400; }
.manager-login-field input::placeholder { color: #78889e; opacity: 1; }
.manager-login-field input:focus { border-color: #3879c7; outline: 3px solid rgb(56 121 199 / 18%); }
.manager-login-field input:disabled { background: #f1f5fa; cursor: not-allowed; }
</style>
