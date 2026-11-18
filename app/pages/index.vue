<template>
  <v-layout class="store-layout">
    <v-app-bar flat height="76" class="store-header">
      <v-container class="d-flex align-center">
        <NuxtLink to="/" class="brand d-flex align-center ga-2">
          <v-icon icon="mdi-shopping" color="primary" size="34" />
          <span class="text-h5 font-weight-bold">Shop<span class="text-primary">Kart</span></span>
        </NuxtLink>
        <v-spacer />
        <nav class="store-desktop-nav d-flex align-center ga-2">
          <v-btn variant="text" href="#shop">Shop</v-btn>
          <v-btn variant="text" href="#categories">Categories</v-btn>
          <v-btn variant="text" href="#about">About</v-btn>
        </nav>
        <v-btn
          class="ml-2"
          color="primary"
          variant="tonal"
          prepend-icon="mdi-cart-outline"
          @click="cartOpen = true"
        >
          Cart
          <v-badge v-if="cartCount" :content="cartCount" color="error" floating />
        </v-btn>
        <v-btn class="store-manage-button ml-2 d-none d-sm-flex" to="/login?redirect=/products" variant="text" prepend-icon="mdi-cog-outline">
          Manage Products
        </v-btn>
      </v-container>
    </v-app-bar>
    <nav class="mobile-store-nav align-center justify-center ga-1" aria-label="Shop navigation">
      <v-btn variant="text" density="comfortable" href="#shop">Shop</v-btn>
      <v-btn variant="text" density="comfortable" href="#categories">Categories</v-btn>
      <v-btn variant="text" density="comfortable" href="#about">About</v-btn>
    </nav>

    <v-main>
      <section class="hero-section">
        <v-container class="hero-content">
          <v-row align="center">
            <v-col cols="12" md="9" lg="8">
              <v-chip color="primary" variant="tonal" prepend-icon="mdi-sparkles" class="mb-5">
                Good finds, delivered to you
              </v-chip>
              <h1 class="hero-title">Everything you need, in one place.</h1>
              <p class="hero-copy">
                Curated fashion, tech, and daily essentials just a click away.
              </p>
              <div class="d-flex flex-wrap ga-3 mt-7">
                <v-btn color="primary" size="large" rounded="lg" href="#shop" append-icon="mdi-arrow-down">
                  Explore the shop
                </v-btn>
                <v-btn variant="outlined" size="large" rounded="lg" href="#categories">
                  Browse categories
                </v-btn>
              </div>
              <div class="hero-promise d-flex flex-wrap ga-6 mt-8">
                <span><v-icon icon="mdi-truck-fast-outline" color="primary" /> Easy delivery</span>
                <span><v-icon icon="mdi-heart-outline" color="primary" /> Picks you'll love</span>
              </div>
            </v-col>
          </v-row>
        </v-container>
      </section>

      <section id="categories" class="category-section">
        <v-container>
          <div class="section-heading d-flex flex-wrap align-end justify-space-between ga-3">
            <div>
              <p class="eyebrow">A good place to start</p>
              <h2 class="section-title">Shop by category</h2>
            </div>
          </div>
          <div class="category-list d-flex flex-wrap ga-2 mt-6">
            <v-btn
              v-for="category in categories"
              :key="category"
              :color="selectedCategory === category ? 'primary' : undefined"
              :variant="selectedCategory === category ? 'flat' : 'outlined'"
              rounded="pill"
              @click="selectedCategory = category"
            >
              {{ category }}
            </v-btn>
          </div>
        </v-container>
      </section>

      <section id="shop" class="shop-section">
        <v-container>
          <div class="d-flex flex-wrap align-end justify-space-between ga-4 mb-7">
            <div>
              <p class="eyebrow">Handpicked for you</p>
              <h2 class="section-title">The good stuff</h2>
            </div>
            <v-text-field
              v-model="search"
              class="search-field"
              label="Search products"
              placeholder="Name, description, category..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="comfortable"
              clearable
              hide-details
            />
          </div>

          <div v-if="loading" class="state-panel">
            <v-progress-circular indeterminate color="primary" size="44" />
            <p class="mt-4 mb-0 text-medium-emphasis">Finding your good stuff...</p>
          </div>
          <v-card v-else-if="loadError" rounded="xl" class="state-panel">
            <v-icon icon="mdi-cloud-alert-outline" size="48" color="error" />
            <h3 class="mt-3">We couldn't load the shop</h3>
            <p class="text-medium-emphasis">Please check back in a moment.</p>
            <v-btn color="primary" @click="loadProducts">Try again</v-btn>
          </v-card>
          <v-card v-else-if="filteredProducts.length === 0" rounded="xl" class="state-panel">
            <v-icon icon="mdi-magnify" size="48" color="primary" />
            <h3 class="mt-3">No products found</h3>
            <p class="text-medium-emphasis">Try a different search or browse all categories.</p>
            <v-btn color="primary" variant="tonal" @click="resetFilters">Show all products</v-btn>
          </v-card>
          <v-row v-else>
            <v-col v-for="product in filteredProducts" :key="product.documentId || product.id" cols="12" sm="6" lg="3">
              <v-card class="product-card h-100" rounded="xl" elevation="0">
                <div class="product-image-wrap">
                  <v-img
                    v-if="getImageUrl(product.image)"
                    :src="getImageUrl(product.image)"
                    :alt="product.name"
                    height="230"
                    cover
                  />
                  <div v-else class="image-placeholder">
                    <v-icon icon="mdi-image-outline" size="56" />
                  </div>
                  <v-chip class="category-tag" color="white" size="small">{{ product.category || 'Everyday finds' }}</v-chip>
                </div>
                <v-card-text class="pa-5">
                  <div class="d-flex align-start justify-space-between ga-2">
                    <h3 class="product-name">{{ product.name }}</h3>
                    <span class="product-price">{{ formatPrice(product.price) }}</span>
                  </div>
                  <p class="product-description">{{ product.description || 'A little something to make your day.' }}</p>
                  <div class="d-flex align-center justify-space-between mt-4">
                    <span :class="Number(product.stock) > 0 ? 'stock-available' : 'stock-empty'">
                      {{ Number(product.stock) > 0 ? `${product.stock} in stock` : 'Out of stock' }}
                    </span>
                    <v-btn
                      color="primary"
                      size="small"
                      rounded="lg"
                      :disabled="Number(product.stock) <= 0"
                      prepend-icon="mdi-cart-plus"
                      @click="addToCart(product)"
                    >
                      Add to cart
                    </v-btn>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </section>

      <section id="about" class="promo-section">
        <v-container>
          <v-row align="center" class="promo-card">
            <v-col cols="12" md="8">
              <p class="eyebrow text-white">FOR YOUR NEXT ORDER</p>
              <h2 class="promo-title">Treat yourself to something new.</h2>
              <p class="promo-copy">Browse our latest picks for your everyday routine.</p>
            </v-col>
            <v-col cols="12" md="4" class="text-md-right">
              <v-btn color="white" variant="flat" size="large" rounded="lg" href="#shop" append-icon="mdi-arrow-right">
                Shop Now
              </v-btn>
            </v-col>
          </v-row>
        </v-container>
      </section>

      <section class="newsletter-section">
        <v-container>
          <v-row align="center" justify="space-between">
            <v-col cols="12" md="5">
              <p class="eyebrow">NEWSLETTER</p>
              <h2 class="section-title">Stay in the loop.</h2>
              <p class="text-medium-emphasis mb-0">Be the first to know about new drops and deals.</p>
            </v-col>
            <v-col cols="12" md="6">
              <v-form class="newsletter-form" @submit.prevent="subscribe">
                <v-text-field
                  v-model="email"
                  label="Your email address"
                  type="email"
                  variant="outlined"
                  density="comfortable"
                  hide-details
                  :rules="[emailRule]"
                  required
                />
                <v-btn color="primary" size="large" type="submit">Sign Up</v-btn>
              </v-form>
              <p v-if="newsletterMessage" class="text-primary text-caption mt-2 mb-0">{{ newsletterMessage }}</p>
            </v-col>
          </v-row>
        </v-container>
      </section>

      <footer class="store-footer">
        <v-container>
          <div class="d-flex flex-wrap justify-space-between align-center ga-4">
            <NuxtLink to="/" class="brand d-flex align-center ga-2">
              <v-icon icon="mdi-shopping" color="white" size="28" />
              <span class="text-h6 font-weight-bold text-white">ShopKart</span>
            </NuxtLink>
            <div class="d-flex flex-wrap ga-4">
              <a href="#shop">Shop</a>
              <a href="#categories">Categories</a>
              <NuxtLink to="/login?redirect=/products">Manage Products</NuxtLink>
            </div>
            <span class="footer-caption">© {{ new Date().getFullYear() }} ShopKart. Made for good finds.</span>
          </div>
        </v-container>
      </footer>
    </v-main>

    <v-navigation-drawer
      v-model="cartOpen"
      location="right"
      temporary
      width="440"
      theme="light"
      class="cart-drawer"
    >
      <div class="cart-header">
        <div class="cart-header-icon"><v-icon icon="mdi-cart-outline" size="24" /></div>
        <div class="d-flex align-center ga-2">
          <h2 class="text-h6 font-weight-bold mb-0">My Cart</h2>
          <v-chip size="x-small" color="blue-lighten-5" class="cart-count-chip" variant="flat">
            {{ cartCount }} {{ cartCount === 1 ? 'item' : 'items' }}
          </v-chip>
        </div>
        <v-spacer />
        <v-btn icon="mdi-close" variant="text" color="primary" aria-label="Close cart" @click="cartOpen = false" />
      </div>
      <v-divider class="cart-divider" />
      <div v-if="cart.length === 0" class="cart-empty">
        <div class="cart-empty-icon"><v-icon icon="mdi-cart-outline" size="34" /></div>
        <h3 class="text-h6 font-weight-bold mt-4">Your cart is empty</h3>
        <p class="text-medium-emphasis mt-2">Add something you love to get started.</p>
        <v-btn color="primary" variant="tonal" rounded="lg" class="mt-2" @click="cartOpen = false">
          Continue shopping
        </v-btn>
      </div>
      <div v-else class="cart-content">
        <div class="cart-lines">
          <div v-for="item in cart" :key="item.documentId || item.id" class="cart-line">
            <v-avatar rounded="lg" size="72" class="cart-product-image">
              <v-img v-if="getImageUrl(item.image)" :src="getImageUrl(item.image)" :alt="item.name" cover />
              <v-icon v-else icon="mdi-image-outline" color="blue-grey-lighten-2" />
            </v-avatar>
            <div class="cart-line-info">
              <div class="cart-product-heading">
                <span class="font-weight-bold">{{ item.name }}</span>
                <v-btn
                  icon="mdi-delete-outline"
                  size="x-small"
                  variant="text"
                  color="error"
                  :aria-label="`Remove ${item.name}`"
                  @click="removeFromCart(item)"
                />
              </div>
              <div class="cart-product-meta">
                {{ formatPrice(item.price) }} each · {{ item.stock }} in stock
              </div>
              <div class="cart-product-controls">
                <div class="cart-quantity">
                  <v-btn
                    icon="mdi-minus"
                    size="small"
                    variant="outlined"
                    aria-label="Decrease quantity"
                    :disabled="item.quantity <= 1"
                    @click="changeQuantity(item, -1)"
                  />
                  <span>{{ item.quantity }}</span>
                  <v-btn
                    icon="mdi-plus"
                    size="small"
                    variant="outlined"
                    aria-label="Increase quantity"
                    :disabled="item.quantity >= Number(item.stock)"
                    @click="changeQuantity(item, 1)"
                  />
                </div>
                <span class="cart-line-total">{{ formatPrice(Number(item.price) * item.quantity) }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="cart-summary">
          <div class="cart-total-row">
            <span>Total items</span><strong>{{ cartCount }}</strong>
          </div>
          <div class="cart-total-row cart-total-amount">
            <span>Total amount</span><strong>{{ formatPrice(cartTotal) }}</strong>
          </div>
          <v-btn block color="primary" size="large" rounded="lg" prepend-icon="mdi-credit-card-outline" @click="goToCheckout">
            Checkout All
          </v-btn>
          <v-btn block variant="text" class="continue-shopping" @click="cartOpen = false">
            Continue Shopping
          </v-btn>
        </div>
      </div>
    </v-navigation-drawer>
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" location="bottom end">
      {{ snackbar.message }}
    </v-snackbar>
  </v-layout>
</template>

<script setup lang="ts">
interface ProductImage {
  url?: string | null
  data?: { attributes?: ProductImage | null } | null
}

interface CartItem extends ShopProduct {
  quantity: number
}

interface ShopProduct {
  id?: number
  documentId?: string
  name: string
  description?: string | null
  price: number
  stock: number
  category?: string | null
  is_active?: boolean
  image?: ProductImage | null
}

useHead({ title: 'ShopKart | Good finds for every day' })

const config = useRuntimeConfig()
const strapiUrl = String(config.public.strapiUrl).replace(/\/$/, '')
const products = ref<ShopProduct[]>([])
const loading = ref(true)
const loadError = ref(false)
const search = ref('')
const selectedCategory = ref('All Categories')
const cartOpen = useState<boolean>('shopkart-cart-open', () => false)
const email = ref('')
const newsletterMessage = ref('')
const cart = useState<CartItem[]>('shopkart-cart', () => [])
const openCartOnHome = useState<boolean>('shopkart-open-cart-on-home', () => false)
const snackbar = reactive({ show: false, message: '', color: 'success' })

const categories = computed(() => [
  'All Categories',
  ...new Set(products.value.map((product) => product.category?.trim()).filter((category): category is string => Boolean(category))),
])
const filteredProducts = computed(() => {
  const keyword = search.value.trim().toLowerCase()
  return products.value.filter((product) => {
    const matchesCategory = selectedCategory.value === 'All Categories' || product.category?.trim() === selectedCategory.value
    const matchesSearch = !keyword || [product.name, product.description, product.category]
      .some((value) => value?.toLowerCase().includes(keyword))
    return matchesCategory && matchesSearch
  })
})
const cartCount = computed(() => cart.value.reduce((total, item) => total + Number(item.quantity || 0), 0))
const cartTotal = computed(() => cart.value.reduce((total, item) => total + Number(item.price || 0) * Number(item.quantity || 0), 0))

async function loadProducts() {
  loading.value = true
  loadError.value = false
  try {
    const response = await $fetch<{ data?: ShopProduct[] }>(`${strapiUrl}/api/products`, {
      query: {
        populate: 'image',
        'filters[is_active][$eq]': true,
        sort: 'createdAt:desc',
        'pagination[pageSize]': 100,
      },
    })
    products.value = (response.data || []).filter((product) => product.is_active !== false)
  } catch (error) {
    console.error('Unable to load active products from Strapi:', error)
    loadError.value = true
  } finally {
    loading.value = false
  }
}

function getImageUrl(image?: ProductImage | null): string {
  const media = image?.data?.attributes || image
  const url = media?.url
  if (!url) return ''
  return url.startsWith('http://') || url.startsWith('https://') ? url : `${strapiUrl}${url}`
}

function addToCart(product: ShopProduct) {
  const key = product.documentId || product.id
  const existing = cart.value.find((item) => (item.documentId || item.id) === key)
  if (existing) {
    if (Number(existing.quantity) >= Number(product.stock)) {
      notify('You have added all available stock to your cart.', 'info')
      return
    }
    existing.quantity = Number(existing.quantity || 0) + 1
  } else {
    cart.value.push({ ...product, quantity: 1 })
  }
  notify(`${product.name} added to your cart.`)
}

function changeQuantity(item: CartItem, amount: number) {
  const next = item.quantity + amount
  if (next < 1 || next > Number(item.stock)) return
  item.quantity = next
}

function removeFromCart(item: CartItem) {
  const key = item.documentId || item.id
  cart.value = cart.value.filter((product) => (product.documentId || product.id) !== key)
}

async function goToCheckout() {
  cartOpen.value = false
  await navigateTo('/checkout')
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(price || 0))
}

function resetFilters() {
  search.value = ''
  selectedCategory.value = 'All Categories'
}

function notify(message: string, color = 'success') {
  snackbar.message = message
  snackbar.color = color
  snackbar.show = true
}

function emailRule(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || 'Enter a valid email address'
}

function subscribe() {
  if (!emailRule(email.value)) {
    newsletterMessage.value = 'Please enter a valid email address.'
    return
  }
  newsletterMessage.value = 'Thanks for signing up! Watch your inbox for shop updates.'
  email.value = ''
}

onMounted(() => {
  loadProducts()
  if (openCartOnHome.value) {
    cartOpen.value = true
    openCartOnHome.value = false
  }
})
</script>

<style scoped>
.store-layout { min-height: 100vh; background: #fff; color: #172b4d; }
.store-header { position: fixed !important; top: 0 !important; right: 0; left: 0; z-index: 1006 !important; background: rgba(255,255,255,.96) !important; border-bottom: 1px solid #e8eef8; }
.store-desktop-nav { display: flex; }
.mobile-store-nav { position: fixed; z-index: 1005; top: 76px; right: 0; left: 0; display: none; min-height: 48px; padding: 0 8px; border-bottom: 1px solid #e8eef8; background: rgba(255,255,255,.97); }
.mobile-store-nav .v-btn { min-width: 0; padding: 0 10px; font-size: .85rem; }
.store-layout :deep(#shop), .store-layout :deep(#categories), .store-layout :deep(#about) { scroll-margin-top: 132px; }
.brand { color: #172b4d; text-decoration: none; white-space: nowrap; }
.hero-section { overflow: hidden; background: linear-gradient(115deg, #f1f7ff 0%, #f8fbff 57%, #e8f2ff 100%); }
.hero-content { padding-top: 78px; padding-bottom: 78px; }
.hero-title { max-width: 650px; color: #14294b; font-size: clamp(2.7rem, 5vw, 4.65rem); line-height: 1.07; letter-spacing: -.055em; font-weight: 800; }
.hero-title span { color: #2874d0; }
.hero-copy { max-width: 540px; margin-top: 20px; color: #65758c; font-size: 1.08rem; line-height: 1.8; }
.hero-promise { color: #596b84; font-size: .9rem; }
.hero-promise span { display: inline-flex; align-items: center; gap: 7px; }
.category-section { padding: 54px 0 60px; }
.section-heading { align-items: end; }
.eyebrow { margin-bottom: 8px; color: #3879c7; font-size: .75rem; font-weight: 800; letter-spacing: .13em; text-transform: uppercase; }
.section-title { color: #172b4d; font-size: clamp(1.7rem, 3vw, 2.25rem); font-weight: 800; letter-spacing: -.035em; }
.category-list .v-btn { text-transform: none; }
.shop-section { padding: 50px 0 76px; background: #f7f9fc; }
.search-field { width: min(100%, 360px); }
.product-card { overflow: hidden; border: 1px solid #eaf0f8; background: white; transition: transform .2s ease, box-shadow .2s ease; }
.product-card:hover { transform: translateY(-4px); box-shadow: 0 16px 34px rgba(26, 63, 107, .1) !important; }
.product-image-wrap { position: relative; background: #edf4fc; }
.category-tag { position: absolute; top: 12px; left: 12px; color: #315d8c; font-weight: 700; }
.image-placeholder { display: flex; height: 230px; align-items: center; justify-content: center; color: #91a6bf; }
.product-name { display: -webkit-box; overflow: hidden; color: #192f51; font-size: 1rem; font-weight: 750; line-height: 1.35; -webkit-box-orient: vertical; -webkit-line-clamp: 2; line-clamp: 2; }
.product-price { flex-shrink: 0; color: #256dc1; font-weight: 800; }
.product-description { display: -webkit-box; min-height: 42px; overflow: hidden; margin: 10px 0 0; color: #728198; font-size: .84rem; line-height: 1.55; -webkit-box-orient: vertical; -webkit-line-clamp: 2; line-clamp: 2; }
.stock-available, .stock-empty { font-size: .76rem; font-weight: 700; }
.stock-available { color: #24835c; }
.stock-empty { color: #bd4d55; }
.state-panel { display: flex; min-height: 290px; flex-direction: column; align-items: center; justify-content: center; padding: 28px; text-align: center; }
.promo-section { padding: 16px 0 70px; background: #f7f9fc; }
.promo-card { padding: 34px 42px; border-radius: 22px; background: linear-gradient(115deg, #2369b5 0%, #3b8bdc 100%); box-shadow: 0 18px 40px rgba(36, 105, 181, .2); }
.promo-card .eyebrow { color: #d7eaff; }
.promo-title { max-width: 590px; color: white; font-size: clamp(1.8rem, 3.5vw, 2.75rem); font-weight: 800; letter-spacing: -.04em; }
.promo-copy { margin: 12px 0 0; color: #e3f0ff; }
.promo-card .v-btn { color: #245f9f; }
.newsletter-section { padding: 58px 0; background: #fff; }
.newsletter-form { display: flex; align-items: flex-start; gap: 12px; }
.newsletter-form .v-btn { flex-shrink: 0; }
.store-footer { padding: 28px 0; background: #142b4b; }
.store-footer a { color: #dce8f8; font-size: .88rem; text-decoration: none; }
.store-footer a:hover { color: white; text-decoration: underline; }
.footer-caption { color: #a9bad0; font-size: .8rem; }
.cart-drawer {
  position: fixed !important;
  top: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  left: auto !important;
  z-index: 1100 !important;
  display: flex;
  width: min(440px, 100vw) !important;
  max-width: 100vw !important;
  height: 100vh !important;
  height: 100dvh !important;
  max-height: 100vh !important;
  flex-direction: column;
  overflow: hidden;
  background: #f7f9fc !important;
  color: #172b4d !important;
  box-shadow: -16px 0 40px rgba(27, 62, 105, .15);
}
.cart-drawer.v-navigation-drawer--active { transform: translateX(0) !important; transition: none !important; }
.cart-drawer :deep(.v-navigation-drawer__content) { display: flex; flex-direction: column; overflow: hidden; }
.cart-header { display: flex; min-height: 82px; flex-shrink: 0; align-items: center; gap: 12px; padding: 16px; background: #fff; }
.cart-header h2 { color: #172b4d; }
.cart-count-chip { color: #256dc1 !important; }
.cart-header-icon, .cart-empty-icon { display: flex; width: 44px; height: 44px; flex-shrink: 0; align-items: center; justify-content: center; border: 1px solid #d5e5f7; border-radius: 13px; background: #edf4fc; color: #2874d0; }
.cart-divider { flex-shrink: 0; border-color: #e8eef6 !important; opacity: 1; }
.cart-empty { display: flex; min-height: 0; flex: 1; flex-direction: column; align-items: center; justify-content: center; padding: 24px; color: #172b4d; text-align: center; }
.cart-empty-icon { width: 68px; height: 68px; border-radius: 20px; }
.cart-empty .text-medium-emphasis { color: #65758c !important; }
.cart-content { display: flex; min-height: 0; flex: 1; flex-direction: column; overflow: hidden; }
.cart-lines { min-height: 0; flex: 1; overflow-y: auto; padding: 16px; scrollbar-color: #c5d6e8 transparent; }
.cart-line { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px; padding: 14px; border: 1px solid #e8eef6; border-radius: 18px; background: #fff; }
.cart-product-image { flex-shrink: 0; background: #edf4fc; }
.cart-line-info { flex: 1; min-width: 0; }
.cart-product-heading { display: flex; align-items: center; justify-content: space-between; gap: 8px; color: #172b4d; }
.cart-product-heading > span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cart-product-meta { overflow: hidden; color: #728198; font-size: .8rem; text-overflow: ellipsis; white-space: nowrap; }
.cart-product-controls { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: 10px; }
.cart-quantity { display: flex; align-items: center; gap: 8px; }
.cart-quantity > span { min-width: 34px; padding: 5px 8px; border: 1px solid #d7e3f1; border-radius: 8px; color: #172b4d; text-align: center; }
.cart-line-total { color: #256dc1; font-size: .95rem; font-weight: 750; white-space: nowrap; }
.cart-summary { flex-shrink: 0; padding: 16px; border-top: 1px solid #e8eef6; background: #fff; box-shadow: 0 -8px 24px rgba(27, 62, 105, .06); }
.cart-total-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; color: #65758c; }
.cart-total-row strong { color: #172b4d; }
.cart-total-amount strong { color: #256dc1; font-size: 1.05rem; }
.continue-shopping { margin-top: 4px; color: #256dc1 !important; font-weight: 700; }
@media (max-width: 600px) {
  .store-desktop-nav { display: none; }
  .mobile-store-nav { display: flex; }
  .hero-content { padding-top: 54px; padding-bottom: 58px; }
  .promo-card { padding: 28px 24px; }
  .newsletter-form { flex-direction: column; }
  .newsletter-form .v-btn { width: 100%; }
}
@media (min-width: 600px) and (max-width: 839px) {
  .store-manage-button { display: none !important; }
}
</style>
