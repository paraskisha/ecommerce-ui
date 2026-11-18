<template>
  <v-layout class="checkout-layout" theme="light">
    <v-app-bar flat height="76" class="checkout-header">
      <v-container class="d-flex align-center">
        <NuxtLink to="/" class="brand d-flex align-center ga-2">
          <v-icon icon="mdi-shopping" color="primary" size="34" />
          <span class="text-h5 font-weight-bold">Shop<span class="text-primary">Kart</span></span>
        </NuxtLink>
      </v-container>
    </v-app-bar>
    <v-main>
      <v-container class="checkout-container py-10 py-md-14">
        <div v-if="orderPlaced" class="confirmation-card">
          <div class="success-icon"><v-icon icon="mdi-check" size="42" color="white" /></div>
          <p class="eyebrow mt-6">All set</p>
          <h1 class="text-h4 font-weight-bold">Thanks for your order, {{ customer.firstName }}!</h1>
          <p class="text-medium-emphasis mt-3">
            Your order <strong>#{{ orderNumber }}</strong> is confirmed. We’ll send the details to {{ customer.email }}.
          </p>
          <v-btn class="mt-5" color="primary" to="/#shop" size="large" rounded="lg">Back to the shop</v-btn>
        </div>

        <template v-else>
          <div class="checkout-intro">
            <p class="eyebrow">Almost yours</p>
            <h1 class="checkout-title">Checkout</h1>
            <p class="text-medium-emphasis mb-0">Your good finds are one step away.</p>
          </div>

          <template v-if="cart.length">
            <v-card theme="light" rounded="xl" elevation="0" class="checkout-card order-summary">
              <v-card-text class="pa-4 pa-md-5">
                <h2 class="text-h6 font-weight-bold mb-2">
                  Your order <span class="text-medium-emphasis">({{ cartCount }} items)</span>
                </h2>
                <div class="summary-items">
                  <div v-for="item in cart" :key="item.documentId || item.id" class="summary-item">
                    <v-avatar rounded="lg" size="48" color="blue-lighten-5">
                      <v-img v-if="getImageUrl(item.image)" :src="getImageUrl(item.image)" :alt="item.name" cover />
                      <v-icon v-else icon="mdi-image-outline" />
                    </v-avatar>
                    <div class="summary-item-copy">
                      <div class="font-weight-bold">{{ item.name }}</div>
                      <div class="text-caption text-medium-emphasis">Qty {{ item.quantity }} · {{ formatPrice(item.price) }} each</div>
                    </div>
                    <div class="summary-item-total">{{ formatPrice(Number(item.price) * Number(item.quantity)) }}</div>
                  </div>
                </div>
                <v-divider class="my-3" />
                <div class="summary-totals">
                  <span>Subtotal: <strong>{{ formatPrice(orderTotal) }}</strong></span>
                  <span>Delivery: <strong class="text-success">Free</strong></span>
                  <span class="summary-grand-total">Total: {{ formatPrice(orderTotal) }}</span>
                </div>
              </v-card-text>
            </v-card>

            <v-card theme="light" rounded="xl" elevation="0" class="checkout-card">
              <v-card-text class="pa-6 pa-md-8">
                <h2 class="text-h6 font-weight-bold mb-5">Delivery details</h2>
                <v-form ref="checkoutForm" @submit.prevent="placeOrder">
                  <v-row>
                    <v-col cols="12" sm="6">
                      <v-text-field
                        v-model="customer.firstName"
                        label="First name"
                        variant="outlined"
                        :rules="[requiredRule]"
                        autocomplete="given-name"
                      />
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-text-field
                        v-model="customer.lastName"
                        label="Last name"
                        variant="outlined"
                        :rules="[requiredRule]"
                        autocomplete="family-name"
                      />
                    </v-col>
                    <v-col cols="12">
                      <v-text-field
                        v-model="customer.email"
                        label="Email address"
                        type="email"
                        variant="outlined"
                        :rules="[requiredRule, emailRule]"
                        autocomplete="email"
                      />
                    </v-col>
                    <v-col cols="12">
                      <v-text-field
                        v-model="customer.address"
                        label="Street address"
                        variant="outlined"
                        :rules="[requiredRule]"
                        autocomplete="street-address"
                      />
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-text-field
                        v-model="customer.city"
                        label="City"
                        variant="outlined"
                        :rules="[requiredRule]"
                        autocomplete="address-level2"
                      />
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-text-field
                        v-model="customer.postalCode"
                        label="Postal code"
                        variant="outlined"
                        :rules="[requiredRule]"
                        autocomplete="postal-code"
                      />
                    </v-col>
                    <v-col cols="12">
                      <v-textarea
                        v-model="customer.note"
                        label="Delivery note (optional)"
                        variant="outlined"
                        rows="2"
                        auto-grow
                      />
                    </v-col>
                  </v-row>
                </v-form>
              </v-card-text>
            </v-card>
          </template>
          <v-card v-else theme="light" rounded="xl" elevation="0" class="checkout-card empty-checkout">
            <v-icon icon="mdi-cart-outline" size="58" color="primary" />
            <h2 class="text-h6 font-weight-bold mt-4">Your cart is empty</h2>
            <p class="text-medium-emphasis">There’s nothing to check out just yet.</p>
            <v-btn color="primary" to="/#shop" rounded="lg">Explore the shop</v-btn>
          </v-card>
        </template>
      </v-container>
      <div v-if="cart.length && !orderPlaced" class="checkout-actionbar">
        <v-container class="d-flex align-center justify-space-between ga-4">
          <div class="actionbar-total">
            <span class="text-caption text-medium-emphasis">Total</span>
            <strong>{{ formatPrice(orderTotal) }}</strong>
          </div>
          <div class="actionbar-actions">
            <v-btn
              class="back-to-cart-button d-none d-sm-inline-flex"
              variant="outlined"
              size="large"
              rounded="lg"
              prepend-icon="mdi-arrow-left"
              @click="backToCart"
            >
              Back to cart
            </v-btn>
            <v-btn
              class="back-to-cart-icon d-sm-none"
              variant="outlined"
              icon="mdi-arrow-left"
              aria-label="Back to cart"
              rounded="lg"
              @click="backToCart"
            />
            <v-btn
              class="actionbar-button"
              color="primary"
              size="large"
              rounded="lg"
              :loading="placingOrder"
              @click="placeOrder"
            >
              Place order
            </v-btn>
          </div>
        </v-container>
      </div>
      <footer class="checkout-footer">
        <v-container class="d-flex flex-wrap justify-space-between ga-3">
          <span>© {{ new Date().getFullYear() }} ShopKart</span>
          <span>Thanks for shopping with us.</span>
        </v-container>
      </footer>
    </v-main>
  </v-layout>
</template>

<script setup lang="ts">
interface ProductImage {
  url?: string | null
  data?: { attributes?: ProductImage | null } | null
}

interface CheckoutProduct {
  id?: number
  documentId?: string
  name: string
  price: number
  stock: number
  quantity: number
  image?: ProductImage | null
}

useHead({ title: 'Checkout | ShopKart' })

const config = useRuntimeConfig()
const strapiUrl = String(config.public.strapiUrl).replace(/\/$/, '')
const cart = useState<CheckoutProduct[]>('shopkart-cart', () => [])
const openCartOnHome = useState<boolean>('shopkart-open-cart-on-home', () => false)
const checkoutForm = ref()
const placingOrder = ref(false)
const orderPlaced = ref(false)
const orderNumber = ref('')
const customer = reactive({
  firstName: '',
  lastName: '',
  email: '',
  address: '',
  city: '',
  postalCode: '',
  note: '',
})
const cartCount = computed(() => cart.value.reduce((total, item) => total + Number(item.quantity || 0), 0))
const orderTotal = computed(() => cart.value.reduce((total, item) => total + Number(item.price || 0) * Number(item.quantity || 0), 0))

const requiredRule = (value: string) => Boolean(value?.trim()) || 'This field is required'
const emailRule = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || 'Enter a valid email address'

onMounted(() => {
  window.scrollTo(0, 0)
})

async function backToCart() {
  openCartOnHome.value = true
  await navigateTo('/')
}

function getImageUrl(image?: ProductImage | null): string {
  const media = image?.data?.attributes || image
  const url = media?.url
  if (!url) return ''
  return url.startsWith('http://') || url.startsWith('https://') ? url : `${strapiUrl}${url}`
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(price || 0))
}

async function placeOrder() {
  const validation = await checkoutForm.value?.validate()
  if (!validation?.valid || cart.value.length === 0) return
  placingOrder.value = true
  try {
    orderNumber.value = Math.random().toString(36).slice(2, 8).toUpperCase()
    orderPlaced.value = true
    cart.value = []
  } finally {
    placingOrder.value = false
  }
}
</script>

<style scoped>
.checkout-layout { min-height: 100vh; background: #f7f9fc; color: #172b4d; }
.checkout-header { background: white !important; border-bottom: 1px solid #e8eef8; }
.brand { color: #172b4d; text-decoration: none; white-space: nowrap; }
.checkout-container { min-height: calc(100vh - 146px); padding-top: 24px !important; padding-bottom: 130px !important; }
.checkout-intro { margin-bottom: 16px; }
.eyebrow { margin-bottom: 8px; color: #3879c7; font-size: .75rem; font-weight: 800; letter-spacing: .13em; text-transform: uppercase; }
.checkout-title { color: #172b4d; font-size: clamp(1.8rem, 3.5vw, 2.4rem); font-weight: 800; letter-spacing: -.04em; }
.checkout-card { border: 1px solid #e8eef6; background: white; color: #172b4d !important; }
.checkout-card h2, .summary-item-copy .font-weight-bold { color: #172b4d !important; }
.checkout-card .text-medium-emphasis, .summary-item-copy .text-caption { color: #65758c !important; }
.checkout-card :deep(.v-field-label), .checkout-card :deep(.v-field__input), .checkout-card :deep(.v-field__input input), .checkout-card :deep(textarea) { color: #172b4d !important; }
.order-summary { margin-bottom: 16px; }
.summary-items { display: grid; max-height: 132px; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 0 20px; overflow-y: auto; }
.summary-item { display: flex; min-width: 0; align-items: center; gap: 10px; padding: 7px 0; border-bottom: 1px solid #f0f3f8; }
.summary-item-copy { flex: 1; min-width: 0; }
.summary-item-copy .font-weight-bold { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.summary-item-total { flex-shrink: 0; color: #256dc1; font-weight: 750; }
.summary-totals { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px 18px; font-size: .88rem; }
.summary-grand-total { color: #246bc0; font-size: 1rem; font-weight: 800; }
.checkout-actionbar { position: fixed; z-index: 5; right: 0; bottom: 0; left: 0; border-top: 1px solid #dfe8f4; background: rgba(255, 255, 255, .97); box-shadow: 0 -8px 24px rgba(27, 62, 105, .08); }
.checkout-actionbar .v-container { min-height: 88px; }
.actionbar-actions { display: flex; flex-shrink: 0; align-items: center; gap: 8px; }
.actionbar-total { display: flex; flex-direction: column; line-height: 1.3; }
.actionbar-total strong { color: #246bc0; font-size: 1.1rem; }
.actionbar-button { min-width: 190px; }
.empty-checkout, .confirmation-card { display: flex; min-height: 340px; flex-direction: column; align-items: center; justify-content: center; padding: 36px; text-align: center; }
.confirmation-card { min-height: 55vh; }
.success-icon { display: flex; width: 76px; height: 76px; align-items: center; justify-content: center; border-radius: 50%; background: #2e9b69; box-shadow: 0 12px 24px rgba(46, 155, 105, .22); }
.checkout-footer { padding: 20px 0; color: #a9bad0; background: #142b4b; font-size: .85rem; }
@media (max-width: 600px) {
  .checkout-actionbar .v-container { min-height: 76px; padding-right: 16px; padding-left: 16px; }
  .actionbar-button { min-width: 150px; }
}
</style>
