import { useState, useCallback, useRef } from 'react'

const STORAGE_KEY = 'vellum_customer'
const TOKEN_KEY   = 'vellum_token'

const APP_URL   = 'https://vellum-headless.pages.dev'
const STORE_ID  = '78243332234'
const CLIENT_ID = import.meta.env.VITE_SHOPIFY_CUSTOMER_CLIENT_ID || '14332c7f-c20f-492a-9800-54b0e484cf1b'

const AUTH_URL   = `https://shopify.com/authentication/${STORE_ID}/oauth/authorize`
const TOKEN_URL  = `https://shopify.com/authentication/${STORE_ID}/oauth/token`
const LOGOUT_URL = `https://shopify.com/authentication/${STORE_ID}/logout`

const SHOP_DOMAIN = import.meta.env.VITE_SHOPIFY_STORE_DOMAIN || 'vellum-6492.myshopify.com'

async function discoverGraphQL() {
  const res = await fetch(`https://${SHOP_DOMAIN}/.well-known/customer-account-api`)
  const data = await res.json()
  return data.graphql_api
}

function generateVerifier() {
  const arr = new Uint8Array(32)
  crypto.getRandomValues(arr)
  return btoa(String.fromCharCode(...arr))
    .replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,'')
}

async function generateChallenge(verifier) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,'')
}

function generateState() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

function decodeJWT(token) {
  try {
    const payload = token.split('.')[1]
    const padded  = payload + '='.repeat((4 - payload.length % 4) % 4)
    return JSON.parse(atob(padded.replace(/-/g,'+').replace(/_/g,'/')))
  } catch { return null }
}

export function useCustomer() {
  const [customer, setCustomer] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) } catch { return null }
  })
  const [token,   setToken]   = useState(() => localStorage.getItem(TOKEN_KEY) || null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)
  const callbackRan = useRef(false)

  const resolvedCustomer = customer || (() => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) } catch { return null } })()
  const resolvedToken    = token || localStorage.getItem(TOKEN_KEY)
  const isLoggedIn       = !!(resolvedCustomer && resolvedToken)

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = useCallback(async () => {
    setError(null)
    try {
      const verifier  = generateVerifier()
      const challenge = await generateChallenge(verifier)
      const state     = generateState()

      localStorage.setItem('pkce_verifier', verifier)
      localStorage.setItem('pkce_state',    state)

      const params = new URLSearchParams({
        client_id:             CLIENT_ID,
        response_type:         'code',
        redirect_uri:          `${APP_URL}/account/callback`,
        scope:                 'openid email customer-account-api:full',
        state,
        code_challenge:        challenge,
        code_challenge_method: 'S256',
      })

      window.location.href = `${AUTH_URL}?${params}`
    } catch(err) {
      setError('Login failed. Please try again.')
      console.error(err)
    }
  }, [])

  // ── Handle callback ───────────────────────────────────────────────────────
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
    if (state !== savedState) { setError('Security check failed.'); return false }

    setLoading(true)
    try {
      const tokenRes = await fetch(TOKEN_URL, {
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

      const tokenData   = await tokenRes.json()
      const accessToken = tokenData.access_token
      const idToken     = tokenData.id_token
      if (!accessToken) throw new Error('No access token')

      // Get customer profile
      let customerData = null
      try {
        const graphqlUrl = await discoverGraphQL()
        const profileRes = await fetch(graphqlUrl, {
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

      localStorage.setItem(TOKEN_KEY,   accessToken)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customerData))
      setToken(accessToken)
      setCustomer(customerData)
      localStorage.removeItem('pkce_verifier')
      localStorage.removeItem('pkce_state')

      return true
    } catch(err) {
      console.error('Callback error:', err)
      setError('Sign in failed. Please try again.')
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  // ── Fetch orders ──────────────────────────────────────────────────────────
  const fetchOrders = useCallback(async () => {
    const t = resolvedToken
    if (!t) return []
    try {
      const graphqlUrl = await discoverGraphQL()
      const res = await fetch(graphqlUrl, {
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
      const json = await res.json()
      return json?.data?.customer?.orders?.nodes || []
    } catch { return [] }
  }, [resolvedToken])

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(TOKEN_KEY)
    setCustomer(null)
    setToken(null)
    setError(null)
    callbackRan.current = false
    window.location.href = `${LOGOUT_URL}?post_logout_redirect_uri=${APP_URL}`
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
