import { useState, useCallback, useRef } from 'react'

const STORAGE_KEY   = 'vellum_customer'
const TOKEN_KEY     = 'vellum_token'
const ID_TOKEN_KEY  = 'vellum_id_token'
const REFRESH_KEY   = 'vellum_refresh_token'

const APP_URL   = 'https://vellum-headless.pages.dev'
const CLIENT_ID = import.meta.env.VITE_SHOPIFY_CUSTOMER_CLIENT_ID || '14332c7f-c20f-492a-9800-54b0e484cf1b'
const SHOP_DOMAIN = import.meta.env.VITE_SHOPIFY_STORE_DOMAIN || 'vellum-6492.myshopify.com'

// ── Discovery ────────────────────────────────────────────────────────────────
// Docs recommend discovering endpoints dynamically rather than hardcoding
let _openidConfig    = null
let _customerApiConf = null

async function getOpenIDConfig() {
  if (_openidConfig) return _openidConfig
  const res  = await fetch(`https://${SHOP_DOMAIN}/.well-known/openid-configuration`)
  _openidConfig = await res.json()
  return _openidConfig
}

async function getCustomerApiConfig() {
  if (_customerApiConf) return _customerApiConf
  const res  = await fetch(`https://${SHOP_DOMAIN}/.well-known/customer-account-api`)
  _customerApiConf = await res.json()
  return _customerApiConf
}

// ── PKCE helpers ─────────────────────────────────────────────────────────────
function generateRandomCode() {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return String.fromCharCode.apply(null, Array.from(array))
}

function base64UrlEncode(str) {
  const base64 = btoa(str)
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

export async function generateCodeVerifier() {
  return base64UrlEncode(generateRandomCode())
}

export async function generateCodeChallenge(codeVerifier) {
  const digestOp = await crypto.subtle.digest(
    { name: 'SHA-256' },
    new TextEncoder().encode(codeVerifier)
  )
  const hash = String.fromCharCode(...new Uint8Array(digestOp))
  return base64UrlEncode(hash)
}

// ── State ────────────────────────────────────────────────────────────────────
async function generateState() {
  const timestamp    = Date.now().toString()
  const randomString = Math.random().toString(36).substring(2)
  return timestamp + randomString
}

// ── Nonce — per docs, mitigates replay attacks ────────────────────────────────
function generateNonce(length = 16) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let nonce = ''
  for (let i = 0; i < length; i++) {
    nonce += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return nonce
}

function decodeJWT(token) {
  try {
    const payload = token.split('.')[1]
    const padded  = payload + '='.repeat((4 - payload.length % 4) % 4)
    return JSON.parse(atob(padded.replace(/-/g, '+').replace(/_/g, '/')))
  } catch { return null }
}

// ── Token refresh ─────────────────────────────────────────────────────────────
async function refreshAccessToken() {
  const refreshToken = localStorage.getItem(REFRESH_KEY)
  if (!refreshToken) return null
  try {
    const config = await getOpenIDConfig()
    const res = await fetch(config.token_endpoint, {
      method:  'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin':       APP_URL,
      },
      body: new URLSearchParams({
        grant_type:    'refresh_token',
        client_id:     CLIENT_ID,
        refresh_token: refreshToken,
      }),
    })
    if (!res.ok) return null
    const data = await res.json()
    if (data.access_token) {
      localStorage.setItem(TOKEN_KEY, data.access_token)
      if (data.refresh_token) localStorage.setItem(REFRESH_KEY, data.refresh_token)
      if (data.id_token)      localStorage.setItem(ID_TOKEN_KEY, data.id_token)
    }
    return data.access_token || null
  } catch { return null }
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useCustomer() {
  const [customer, setCustomer] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) } catch { return null }
  })
  const [token,   setToken]   = useState(() => localStorage.getItem(TOKEN_KEY) || null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)
  const callbackRan = useRef(false)

  const resolvedCustomer = customer || (() => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) } catch { return null } })()
  const resolvedToken    = token    || localStorage.getItem(TOKEN_KEY)
  const isLoggedIn       = !!(resolvedCustomer && resolvedToken)

  // ── Login ────────────────────────────────────────────────────────────────
  const login = useCallback(async () => {
    setError(null)
    try {
      // Discover endpoints per docs recommendation
      const config    = await getOpenIDConfig()
      const verifier  = await generateCodeVerifier()
      const challenge = await generateCodeChallenge(verifier)
      const state     = await generateState()
      const nonce     = generateNonce()

      localStorage.setItem('pkce_verifier', verifier)
      localStorage.setItem('pkce_state',    state)
      localStorage.setItem('pkce_nonce',    nonce)

      const url = new URL(config.authorization_endpoint)
      url.searchParams.append('scope',                 'openid email customer-account-api:full')
      url.searchParams.append('client_id',             CLIENT_ID)
      url.searchParams.append('response_type',         'code')
      url.searchParams.append('redirect_uri',          `${APP_URL}/account/callback`)
      url.searchParams.append('state',                 state)
      url.searchParams.append('nonce',                 nonce)
      url.searchParams.append('code_challenge',        challenge)
      url.searchParams.append('code_challenge_method', 'S256')

      window.location.href = url.toString()
    } catch(err) {
      setError('Login failed. Please try again.')
      console.error(err)
    }
  }, [])

  // ── Handle callback ──────────────────────────────────────────────────────
  const handleCallback = useCallback(async () => {
    if (callbackRan.current) return !!localStorage.getItem(TOKEN_KEY)
    callbackRan.current = true

    if (localStorage.getItem(TOKEN_KEY) && localStorage.getItem(STORAGE_KEY)) return true

    const params   = new URLSearchParams(window.location.search)
    const code     = params.get('code')
    const state    = params.get('state')
    const errParam = params.get('error')

    if (errParam) { setError('Login cancelled.'); return false }
    if (!code)    { setError('No code received.'); return false }

    const savedState    = localStorage.getItem('pkce_state')
    const savedVerifier = localStorage.getItem('pkce_verifier')
    const savedNonce    = localStorage.getItem('pkce_nonce')

    if (state !== savedState) { setError('Security check failed.'); return false }

    setLoading(true)
    try {
      // Discover token endpoint
      const config   = await getOpenIDConfig()

      const tokenRes = await fetch(config.token_endpoint, {
        method:  'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Origin':       APP_URL,
        },
        body: new URLSearchParams({
          grant_type:    'authorization_code',
          client_id:     CLIENT_ID,
          redirect_uri:  `${APP_URL}/account/callback`,
          code,
          code_verifier: savedVerifier,
        }),
      })

      if (!tokenRes.ok) {
        const txt = await tokenRes.text()
        throw new Error(`Token exchange ${tokenRes.status}: ${txt}`)
      }

      const tokenData    = await tokenRes.json()
      const accessToken  = tokenData.access_token
      const idToken      = tokenData.id_token
      const refreshToken = tokenData.refresh_token

      if (!accessToken) throw new Error('No access token')

      // Validate nonce from id_token per docs
      if (idToken && savedNonce) {
        const decoded = decodeJWT(idToken)
        if (decoded?.nonce && decoded.nonce !== savedNonce) {
          throw new Error('Nonce mismatch — possible replay attack')
        }
      }

      // Get customer profile from discovered GraphQL endpoint
      let customerData = null
      try {
        const apiConfig  = await getCustomerApiConfig()
        const profileRes = await fetch(apiConfig.graphql_api, {
          method:  'POST',
          headers: {
            'Content-Type':  'application/json',
            'Authorization': accessToken,
            'Origin':        APP_URL,
          },
          body: JSON.stringify({
            query: `{ customer { id firstName lastName emailAddress { emailAddress } } }`
          }),
        })
        if (profileRes.ok) {
          const { data } = await profileRes.json()
          const c = data?.customer
          if (c) {
            customerData = {
              id:        c.id || '',
              email:     c.emailAddress?.emailAddress || '',
              firstName: c.firstName || '',
              lastName:  c.lastName  || '',
              name:      `${c.firstName||''} ${c.lastName||''}`.trim() || c.emailAddress?.emailAddress || 'Customer',
            }
          }
        }
      } catch { /* fallback to id_token */ }

      // Fallback — decode id_token
      if (!customerData && idToken) {
        const decoded = decodeJWT(idToken)
        if (decoded) {
          customerData = {
            id:        decoded.sub         || '',
            email:     decoded.email       || '',
            firstName: decoded.given_name  || '',
            lastName:  decoded.family_name || '',
            name:      decoded.name        || decoded.email || 'Customer',
          }
        }
      }

      if (!customerData) customerData = { id:'', email:'Customer', firstName:'Customer', lastName:'', name:'Customer' }

      // Store all tokens
      localStorage.setItem(TOKEN_KEY,   accessToken)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customerData))
      if (idToken)      localStorage.setItem(ID_TOKEN_KEY, idToken)
      if (refreshToken) localStorage.setItem(REFRESH_KEY,  refreshToken)

      // Clean up PKCE params
      localStorage.removeItem('pkce_verifier')
      localStorage.removeItem('pkce_state')
      localStorage.removeItem('pkce_nonce')

      setToken(accessToken)
      setCustomer(customerData)
      return true
    } catch(err) {
      console.error('Callback error:', err)
      setError('Sign in failed. Please try again.')
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  // ── Fetch orders (with token refresh) ────────────────────────────────────
  const fetchOrders = useCallback(async () => {
    let t = resolvedToken
    if (!t) return []
    try {
      const apiConfig = await getCustomerApiConfig()
      let res = await fetch(apiConfig.graphql_api, {
        method:  'POST',
        headers: { 'Content-Type':'application/json', 'Authorization':t, 'Origin':APP_URL },
        body: JSON.stringify({ query: `{
          customer {
            orders(first: 10) {
              nodes {
                id name number processedAt
                financialStatus fulfillmentStatus
                totalPrice    { amount currencyCode }
                totalShipping { amount currencyCode }
                totalTax      { amount currencyCode }
                shippingAddress {
                  firstName lastName address1 address2
                  city province country zip
                }
                lineItems(first: 10) {
                  nodes { title quantity variantTitle }
                }
                fulfillments(first: 5) {
                  nodes {
                    status estimatedDeliveryAt latestShipmentStatus
                    trackingInformation { company number url }
                  }
                }
              }
            }
          }
        }` }),
      })

      // If 401 — try refreshing the token
      if (res.status === 401) {
        t = await refreshAccessToken()
        if (!t) return []
        res = await fetch(apiConfig.graphql_api, {
          method:  'POST',
          headers: { 'Content-Type':'application/json', 'Authorization':t, 'Origin':APP_URL },
          body: JSON.stringify({ query: `{ customer { orders(first:10) { nodes { id name number processedAt financialStatus fulfillmentStatus totalPrice { amount currencyCode } lineItems(first:10) { nodes { title quantity variantTitle } } } } } }` }),
        })
      }

      const json = await res.json()
      return json?.data?.customer?.orders?.nodes || []
    } catch { return [] }
  }, [resolvedToken])

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    const idToken = localStorage.getItem(ID_TOKEN_KEY)

    // Clean up all stored data
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(ID_TOKEN_KEY)
    localStorage.removeItem(REFRESH_KEY)
    setCustomer(null)
    setToken(null)
    setError(null)
    callbackRan.current = false

    try {
      // Discover end_session_endpoint per docs
      const config = await getOpenIDConfig()
      const logoutUrl = new URL(config.end_session_endpoint)
      if (idToken) logoutUrl.searchParams.append('id_token_hint', idToken)
      logoutUrl.searchParams.append('post_logout_redirect_uri', APP_URL)
      window.location.href = logoutUrl.toString()
    } catch {
      // Fallback if discovery fails
      window.location.href = APP_URL
    }
  }, [])

  return {
    customer: resolvedCustomer,
    token: resolvedToken,
    isLoggedIn,
    loading,
    error,
    setError,
    login,
    logout,
    handleCallback,
    fetchOrders,
  }
}
