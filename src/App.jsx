import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation, useParams } from 'react-router-dom'
import Navbar          from './components/Navbar'
import Footer          from './components/Footer'
import CartDrawer      from './components/CartDrawer'
import HomePage        from './pages/HomePage'
import ShopPage        from './pages/ShopPage'
import CollectionsPage from './pages/CollectionsPage'
import ProductPage     from './pages/ProductPage'
import AboutPage       from './pages/AboutPage'
import AccountPage     from './pages/AccountPage'
import CallbackPage    from './pages/CallbackPage'
import { useProducts, useCollections, useCollection } from './hooks/useProducts'
import { useCart }     from './hooks/useCart'
import { useCustomer } from './hooks/useCustomer'

// ── Wrapper components that read URL params ───────────────────────────────────

function CollectionRoute({ onAddToCart, cartLoading, onViewProduct }) {
  const { handle } = useParams()
  const navigate   = useNavigate()
  return (
    <CollectionsPage
      collections={[]}
      activeCollection={handle}
      onNav={(p, extra) => {
        if (p === 'collection') navigate(`/collections/${extra}`)
        else navigate(`/${p === 'home' ? '' : p}`)
      }}
      onAddToCart={onAddToCart}
      cartLoading={cartLoading}
      onViewProduct={onViewProduct}
    />
  )
}

function ProductRoute({ onAddToCart, cartLoading }) {
  const { handle } = useParams()
  const navigate   = useNavigate()
  const { products } = useProducts(20)

  // Find product by handle from already-loaded products
  const product = products.find(p => p.handle === handle)

  if (!product && products.length > 0) {
    navigate('/shop')
    return null
  }

  return (
    <ProductPage
      product={product}
      onAddToCart={onAddToCart}
      cartLoading={cartLoading}
      onBack={() => navigate(-1)}
    />
  )
}

function LoginPage({ onLogin, error }) {
  return (
    <div style={{
      minHeight:'100vh', paddingTop:100, display:'flex',
      alignItems:'center', justifyContent:'center',
      background:'var(--cream)',
    }}>
      <div style={{
        maxWidth:400, width:'100%', padding:'56px 48px',
        border:'1.5px solid var(--ink)', textAlign:'center',
      }}>
        <div style={{fontFamily:'var(--serif)',fontSize:36,fontWeight:300,fontStyle:'italic',marginBottom:8}}>
          Welcome back
        </div>
        <p style={{fontFamily:'var(--type)',fontSize:11,letterSpacing:'0.06em',color:'var(--ink-xs)',lineHeight:1.8,marginBottom:32}}>
          Sign in to view your orders and manage your account.
        </p>
        <button onClick={onLogin} className="btn-ink" style={{width:'100%'}}>
          Sign In
        </button>
        {error && (
          <div style={{marginTop:14,fontFamily:'var(--type)',fontSize:11,color:'var(--wax)',letterSpacing:'0.04em'}}>
            {error}
          </div>
        )}
        <p style={{marginTop:20,fontFamily:'var(--type)',fontSize:10,color:'var(--ink-xs)',letterSpacing:'0.04em',lineHeight:1.7}}>
          New customer? You can create an account on the sign in page.
        </p>
      </div>
    </div>
  )
}

// ── Main App ──────────────────────────────────────────────────────────────────

export default function App() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const [cartOpen, setCartOpen] = useState(false)

  const { products, loading: productsLoading } = useProducts(20)
  const { collections }                         = useCollections()
  const {
    lines, totalItems, totalPrice, currency, loading: cartLoading,
    addToCart, updateQuantity, removeLine, goToCheckout
  } = useCart()
  const {
    customer, isLoggedIn, error: authError,
    login, logout, handleCallback, fetchOrders
  } = useCustomer()

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top:0, behavior:'smooth' })
  }, [location.pathname])

  function nav(p, extra) {
    if (p === 'collection') navigate(`/collections/${extra}`)
    else if (p === 'home')  navigate('/')
    else                    navigate(`/${p}`)
  }

  function viewProduct(product) {
    navigate(`/products/${product.handle}`)
  }

  const shared = { onAddToCart:addToCart, cartLoading, onViewProduct:viewProduct }
  const isCallback = location.pathname.includes('/account/callback')

  return (
    <div>
      <Navbar
        page={location.pathname}
        onNav={nav}
        totalItems={totalItems}
        onCartOpen={() => setCartOpen(true)}
        onViewProduct={viewProduct}
        customer={customer}
        onLogin={login}
        onAccount={() => navigate('/account')}
      />

      <main>
        <Routes>
          {/* Home */}
          <Route path="/" element={
            <HomePage products={products} collections={collections}
              loading={productsLoading} onNav={nav} {...shared}/>
          }/>

          {/* Shop */}
          <Route path="/shop" element={
            <ShopPage products={products} loading={productsLoading} {...shared}/>
          }/>

          {/* Collections list */}
          <Route path="/collections" element={
            <CollectionsPage collections={collections} activeCollection={null}
              onNav={nav} {...shared}/>
          }/>

          {/* Single collection */}
          <Route path="/collections/:handle" element={
            <CollectionRoute {...shared}/>
          }/>

          {/* Single product */}
          <Route path="/products/:handle" element={
            <ProductRoute onAddToCart={addToCart} cartLoading={cartLoading}/>
          }/>

          {/* About */}
          <Route path="/about" element={<AboutPage onNav={nav}/>}/>

          {/* Auth callback */}
          <Route path="/account/callback" element={
            <CallbackPage handleCallback={handleCallback}/>
          }/>

          {/* Account */}
          <Route path="/account" element={
            (() => {
              const c = customer || (() => { try { return JSON.parse(localStorage.getItem('vellum_customer')) } catch { return null } })()
              const t = localStorage.getItem('vellum_token')
              return c && t
                ? <AccountPage customer={c} onLogout={() => { logout(); navigate('/') }} fetchOrders={fetchOrders} onNav={nav}/>
                : <LoginPage onLogin={login} error={authError}/>
            })()
          }/>

          {/* Fallback */}
          <Route path="*" element={
            <HomePage products={products} collections={collections}
              loading={productsLoading} onNav={nav} {...shared}/>
          }/>
        </Routes>
      </main>

      {!isCallback && <Footer onNav={nav}/>}

      {cartOpen && (
        <CartDrawer
          lines={lines} totalPrice={totalPrice} currency={currency}
          onClose={() => setCartOpen(false)} onCheckout={goToCheckout}
          loading={cartLoading} onUpdateQuantity={updateQuantity} onRemoveLine={removeLine}
        />
      )}
    </div>
  )
}
