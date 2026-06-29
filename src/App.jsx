import { useState, useEffect } from 'react'
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
import { useProducts, useCollections } from './hooks/useProducts'
import { useCart }     from './hooks/useCart'
import { useCustomer } from './hooks/useCustomer'

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
        background:'var(--cream)',
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

function getInitialPage() {
  const path   = window.location.pathname
  const search = window.location.search
  const hasToken    = !!localStorage.getItem('vellum_token')
  const hasCustomer = !!localStorage.getItem('vellum_customer')

  if (path.includes('/account/callback') && search.includes('code=') && search.includes('state=')) {
    if (hasToken && hasCustomer) { window.history.replaceState({}, '', '/'); return 'account' }
    return 'callback'
  }
  if (search.includes('account=1')) {
    window.history.replaceState({}, '', '/')
    return 'account'
  }
  return 'home'
}

export default function App() {
  const [page,             setPage]             = useState(getInitialPage)
  const [activeCollection, setActiveCollection]  = useState(null)
  const [activeProduct,    setActiveProduct]     = useState(null)
  const [prevPage,         setPrevPage]          = useState('home')
  const [cartOpen,         setCartOpen]          = useState(false)

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

  useEffect(() => {
    if (page !== 'product') window.scrollTo({ top:0, behavior:'smooth' })
    else window.scrollTo({ top:0 })
  }, [page, activeProduct])

  useEffect(() => {
    window._vellumViewProduct = viewProduct
    return () => { delete window._vellumViewProduct }
  }, [page])

  function navigate(p, extra) {
    if (p === 'collection') {
      setActiveCollection(extra)
      setPage('collections')
    } else {
      setPage(p)
      setActiveCollection(null)
    }
  }

  function viewProduct(product) {
    setPrevPage(page)
    setActiveProduct(product)
    setPage('product')
  }

  function goBack() {
    setPage(prevPage)
    setActiveProduct(null)
  }

  const shared = { onAddToCart:addToCart, cartLoading, onViewProduct:viewProduct }

  function renderPage() {
    switch(page) {
      case 'home': return (
        <HomePage products={products} collections={collections}
          loading={productsLoading} onNav={navigate} {...shared}/>
      )
      case 'shop': return (
        <ShopPage products={products} loading={productsLoading} {...shared}/>
      )
      case 'collections': return (
        <CollectionsPage collections={collections} activeCollection={activeCollection}
          onNav={navigate} {...shared}/>
      )
      case 'product': return (
        <ProductPage product={activeProduct} onAddToCart={addToCart}
          cartLoading={cartLoading} onBack={goBack}/>
      )
      case 'about': return <AboutPage onNav={navigate}/>
      case 'callback': return <CallbackPage handleCallback={handleCallback}/>
      case 'account': {
        const c = customer || (() => { try { return JSON.parse(localStorage.getItem('vellum_customer')) } catch { return null } })()
        const t = localStorage.getItem('vellum_token')
        return c && t
          ? <AccountPage customer={c} onLogout={() => { logout(); navigate('home') }} fetchOrders={fetchOrders} onNav={navigate}/>
          : <LoginPage onLogin={login} error={authError}/>
      }
      default: return (
        <HomePage products={products} collections={collections}
          loading={productsLoading} onNav={navigate} {...shared}/>
      )
    }
  }

  return (
    <div>
      <Navbar
        page={page}
        onNav={navigate}
        totalItems={totalItems}
        onCartOpen={() => setCartOpen(true)}
        onViewProduct={viewProduct}
        customer={customer}
        onLogin={login}
        onAccount={() => navigate('account')}
      />
      <main>{renderPage()}</main>
      {page !== 'callback' && <Footer onNav={navigate}/>}
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
