import { useState, useEffect, useRef } from 'react'
import { shopifyClient, COUNTRY_CODE } from '../lib/shopify'
import { SEARCH_PRODUCTS } from '../lib/queries'
import { formatPrice } from '../lib/currency'

export default function Navbar({ page, onNav, totalItems, onCartOpen, onViewProduct }) {
  const [scrolled,      setScrolled]      = useState(false)
  const [menuOpen,      setMenuOpen]      = useState(false)
  const [searchOpen,    setSearchOpen]    = useState(false)
  const [query,         setQuery]         = useState('')
  const [results,       setResults]       = useState([])
  const [searching,     setSearching]     = useState(false)
  const inputRef  = useRef(null)
  const timerRef  = useRef(null)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus()
  }, [searchOpen])

  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const { data } = await shopifyClient.request(SEARCH_PRODUCTS, {
          variables: { query, country: COUNTRY_CODE }
        })
        setResults(data?.products?.edges?.map(e => e.node) || [])
      } catch { setResults([]) }
      finally { setSearching(false) }
    }, 350)
    return () => clearTimeout(timerRef.current)
  }, [query])

  function closeSearch() { setSearchOpen(false); setQuery(''); setResults([]) }

  const links = [
    { id:'home', label:'Home' },
    { id:'shop', label:'Shop' },
    { id:'collections', label:'Collections' },
    { id:'about', label:'About' },
  ]

  return (
    <>
      <style>{`
        .nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          transition: all 0.4s var(--slow);
        }
        .nav.scrolled {
          background: rgba(237,232,223,0.96);
          backdrop-filter: blur(10px);
          border-bottom: 1.5px solid var(--ink);
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
        }
        .nav-inner {
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 48px; transition: padding 0.4s;
        }
        .nav.scrolled .nav-inner { padding: 14px 48px; }
        .nav-logo {
          display: flex; align-items: center; gap: 10px;
          cursor: pointer;
        }
        .nav-logo-text {
          font-family: var(--type); font-size: 20px;
          letter-spacing: 0.5em; text-transform: uppercase; color: var(--ink);
        }
        .nav-links { display: flex; gap: 32px; }
        .nav-link {
          font-family: var(--type); font-size: 10px; letter-spacing: 0.2em;
          text-transform: uppercase; color: var(--ink-lt); background: none;
          border: none; cursor: pointer; transition: color 0.2s; position: relative;
          padding-bottom: 2px;
        }
        .nav-link::after {
          content: ''; position: absolute; bottom: 0; left: 0; right: 100%;
          height: 1px; background: var(--wax); transition: right 0.3s var(--slow);
        }
        .nav-link:hover, .nav-link.active { color: var(--ink); }
        .nav-link:hover::after, .nav-link.active::after { right: 0; }
        .nav-right { display: flex; align-items: center; gap: 18px; }
        .nav-btn {
          font-family: var(--type); font-size: 10px; letter-spacing: 0.18em;
          text-transform: uppercase; color: var(--ink-lt); background: none;
          border: none; cursor: pointer; transition: color 0.2s; padding: 0;
          display: flex; align-items: center; gap: 6px;
        }
        .nav-btn:hover { color: var(--ink); }
        .nav-sep { width: 1px; height: 14px; background: rgba(28,26,22,0.2); }
        .cart-badge {
          width: 18px; height: 18px; background: var(--wax); color: var(--cream);
          border-radius: 50%; font-size: 9px; display: flex;
          align-items: center; justify-content: center; font-family: var(--type);
        }
        .hamburger {
          display: none; flex-direction: column; gap: 5px;
          background: none; border: none; cursor: pointer; padding: 4px;
        }
        .hamburger span { display: block; width: 22px; height: 1.5px; background: var(--ink); }

        /* Search overlay */
        .search-overlay {
          position: fixed; inset: 0; background: rgba(237,232,223,0.98);
          z-index: 200; display: flex; flex-direction: column;
          align-items: center; padding: 120px 48px 40px;
          animation: fadeIn 0.25s ease;
          overflow-y: auto;
        }
        .search-close {
          position: fixed; top: 24px; right: 40px;
          font-size: 28px; color: var(--ink-lt); background: none;
          border: none; cursor: pointer; transition: color 0.2s;
          font-family: var(--serif);
        }
        .search-close:hover { color: var(--ink); }
        .search-wrap {
          width: 100%; max-width: 580px;
          border-bottom: 1.5px solid var(--ink); padding-bottom: 12px;
          display: flex; align-items: center; gap: 16px; margin-bottom: 40px;
        }
        .search-input {
          flex: 1; border: none; outline: none; background: none;
          font-family: var(--serif); font-size: 32px; font-weight: 300;
          font-style: italic; color: var(--ink); letter-spacing: 0.02em;
        }
        .search-input::placeholder { color: rgba(28,26,22,0.2); }
        .search-results { width: 100%; max-width: 580px; }
        .search-hint {
          font-family: var(--type); font-size: 10px; letter-spacing: 0.2em;
          text-transform: uppercase; color: var(--ink-xs); margin-bottom: 20px;
        }
        .search-item {
          display: flex; gap: 16px; padding: 16px 0;
          border-bottom: 1px solid rgba(28,26,22,0.1);
          cursor: pointer; transition: opacity 0.2s;
        }
        .search-item:hover { opacity: 0.65; }
        .search-item-img {
          width: 52px; height: 64px; background: var(--parch);
          flex-shrink: 0; overflow: hidden;
          border: 1px solid rgba(28,26,22,0.1);
        }
        .search-item-img img { width:100%;height:100%;object-fit:cover; }
        .search-item-name { font-size: 15px; font-style: italic; margin-bottom: 4px; }
        .search-item-price { font-family: var(--type); font-size: 12px; color: var(--wax); }
        .search-none { font-family: var(--serif); font-size: 18px; font-style: italic; color: var(--ink-xs); }

        /* Mobile menu */
        .mobile-menu {
          position: fixed; inset: 0; background: var(--cream);
          z-index: 200; display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 28px;
          animation: fadeIn 0.3s ease;
        }
        .mobile-menu-link {
          font-family: var(--serif); font-size: 36px; font-weight: 300;
          font-style: italic; background: none; border: none;
          cursor: pointer; color: var(--ink); transition: color 0.2s;
        }
        .mobile-menu-link:hover { color: var(--wax); }
        .mobile-close {
          position: absolute; top: 24px; right: 28px;
          font-size: 28px; background: none; border: none;
          cursor: pointer; color: var(--ink-lt); font-family: var(--serif);
        }

        @media (max-width: 768px) {
          .nav-links { display: none; }
          .nav-inner { padding: 16px 20px; }
          .nav.scrolled .nav-inner { padding: 12px 20px; }
          .hamburger { display: flex; }
          .search-overlay { padding: 80px 20px 40px; }
          .search-input { font-size: 24px; }
        }
      `}</style>

      <nav className={`nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-inner">
          <div className="nav-logo" onClick={() => onNav('home')}>
            <div className="wax-seal">V</div>
            <div className="nav-logo-text">Vellum</div>
          </div>

          <div className="nav-links">
            {links.map(l => (
              <button key={l.id}
                className={`nav-link ${page === l.id ? 'active' : ''}`}
                onClick={() => onNav(l.id)}>
                {l.label}
              </button>
            ))}
          </div>

          <div className="nav-right">
            <button className="nav-btn" onClick={() => setSearchOpen(true)}>Search</button>
            <div className="nav-sep"/>
            <button className="nav-btn" onClick={onCartOpen}>
              Cart {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
            </button>
            <button className="hamburger" onClick={() => setMenuOpen(true)}>
              <span/><span/><span/>
            </button>
          </div>
        </div>
      </nav>

      {/* Search */}
      {searchOpen && (
        <div className="search-overlay">
          <button className="search-close" onClick={closeSearch}>×</button>
          <div className="search-wrap">
            <input ref={inputRef} className="search-input"
              placeholder="Search paper goods..."
              value={query} onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Escape' && closeSearch()}/>
            {searching && <span style={{fontFamily:'var(--type)',fontSize:11,color:'var(--ink-xs)'}}>...</span>}
          </div>
          <div className="search-results">
            {!query && <div className="search-hint">Type to search our collection</div>}
            {query && !searching && results.length === 0 && (
              <div className="search-none">No results for "{query}"</div>
            )}
            {results.map(p => {
              const price = p.priceRange?.minVariantPrice
              return (
                <div className="search-item" key={p.id}
                  onClick={() => { closeSearch(); onViewProduct?.(p) }}>
                  <div className="search-item-img">
                    {p.featuredImage
                      ? <img src={p.featuredImage.url} alt={p.title}/>
                      : <div style={{width:'100%',height:'100%',background:'var(--parch)',display:'flex',alignItems:'center',justifyContent:'center',fontStyle:'italic',fontSize:18,color:'rgba(28,26,22,0.12)'}}>V</div>
                    }
                  </div>
                  <div>
                    <div className="search-item-name">{p.title}</div>
                    {price && <div className="search-item-price">{formatPrice(price.amount, price.currencyCode)}</div>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Mobile menu */}
      {menuOpen && (
        <div className="mobile-menu">
          <button className="mobile-close" onClick={() => setMenuOpen(false)}>×</button>
          {links.map(l => (
            <button key={l.id} className="mobile-menu-link"
              onClick={() => { onNav(l.id); setMenuOpen(false) }}>
              {l.label}
            </button>
          ))}
        </div>
      )}
    </>
  )
}
