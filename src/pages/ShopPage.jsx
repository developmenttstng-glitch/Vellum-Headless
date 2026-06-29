import { useState } from 'react'
import { formatPrice } from '../lib/currency'

function ProductPlaceholder({ index = 0 }) {
  const bgs = ['#ddd6c8','#c8d4c0','#d0c8b8','#e4ddd1','#c8c0b8','#d4c8b4']
  const bg = bgs[index % bgs.length]
  return (
    <svg width="100%" height="100%" viewBox="0 0 160 200" preserveAspectRatio="xMidYMid slice">
      <rect width="160" height="200" fill={bg}/>
      {Array.from({length:10},(_,i)=><line key={i} x1="16" y1={32+i*14} x2="144" y2={32+i*14} stroke="rgba(28,26,22,0.08)" strokeWidth="0.7"/>)}
      <text x="80" y="18" textAnchor="middle" fontSize="9" fill="rgba(28,26,22,0.15)" fontFamily="'Courier New',monospace" letterSpacing="2">VELLUM</text>
    </svg>
  )
}

export default function ShopPage({ products, loading, onAddToCart, cartLoading, onViewProduct }) {
  const [activeTag, setActiveTag] = useState('all')

  const allTags = ['all', ...new Set(products.flatMap(p => p.tags || []))]
  const filtered = activeTag === 'all' ? products : products.filter(p => p.tags?.includes(activeTag))

  return (
    <>
      <style>{`
        .shop-page { padding-top: 100px; min-height: 100vh; }
        .shop-hero {
          padding: 56px 0 40px; border-bottom: 1.5px solid var(--ink); margin-bottom: 0;
          background: var(--parch); position: relative; overflow: hidden;
        }
        .shop-hero::before {
          content: ''; position: absolute; inset: 0;
          background-image:
            repeating-linear-gradient(0deg, transparent, transparent 23px, rgba(28,26,22,0.04) 23px, rgba(28,26,22,0.04) 24px),
            repeating-linear-gradient(90deg, transparent, transparent 23px, rgba(28,26,22,0.04) 23px, rgba(28,26,22,0.04) 24px);
          pointer-events: none;
        }
        .shop-title {
          font-family: var(--serif); font-size: clamp(36px,5vw,68px);
          font-weight: 300; font-style: italic; margin-bottom: 8px;
          position: relative;
        }
        .shop-sub {
          font-family: var(--type); font-size: 11px; letter-spacing: 0.15em;
          color: var(--ink-xs); position: relative;
        }
        .shop-filters-wrap { position: relative; background: var(--cream); border-bottom: 1.5px solid var(--ink); }
        .shop-filters {
          display: flex; gap: 0; overflow-x: auto;
          scrollbar-width: none; -ms-overflow-style: none;
        }
        .shop-filters::-webkit-scrollbar { display: none; }
        .filter-btn {
          padding: 14px 24px; border: none; border-right: 1px solid rgba(28,26,22,0.12);
          background: none; font-family: var(--type); font-size: 10px;
          letter-spacing: 0.18em; text-transform: uppercase; cursor: pointer;
          color: var(--ink-xs); white-space: nowrap; flex-shrink: 0; transition: all 0.2s;
        }
        .filter-btn:hover { color: var(--ink); background: var(--cream-dk); }
        .filter-btn.active { background: var(--ink); color: var(--cream); }
        .filter-fade { position: absolute; right:0;top:0;bottom:0;width:60px; pointer-events:none; background:linear-gradient(to right,transparent,var(--cream)); }
        .shop-count-bar {
          padding: 14px 0; border-bottom: 1px solid rgba(28,26,22,0.1);
          font-family: var(--type); font-size: 10px; letter-spacing: 0.15em;
          text-transform: uppercase; color: var(--ink-xs);
        }
        .shop-grid {
          display: grid; grid-template-columns: repeat(3,1fr);
          border-left: 1.5px solid var(--ink);
          border-bottom: 1.5px solid var(--ink);
          margin-top: 0;
        }
        .shop-card {
          border-right: 1.5px solid var(--ink); border-top: 1.5px solid var(--ink);
          cursor: pointer; position: relative; transition: background 0.2s;
          background: var(--cream);
        }
        .shop-card:hover { background: var(--cream-dk); }
        .shop-card:hover { transform: none; }
        .shop-img {
          aspect-ratio: 3/4; background: var(--parch); overflow: hidden;
          position: relative; border-bottom: 1.5px solid var(--ink);
        }
        .shop-img img { width:100%;height:100%;object-fit:cover; }
        .shop-tag-badge {
          position: absolute; top:0;left:0; background:var(--ink);
          color:var(--cream); font-family:var(--type); font-size:8px;
          letter-spacing:0.2em; padding:4px 8px; text-transform:uppercase;
        }
        .shop-new-badge {
          background: var(--wax);
        }
        .shop-add-overlay {
          position:absolute;inset:0;display:flex;align-items:flex-end;padding:12px;
          opacity:0;transition:opacity 0.25s;
        }
        .shop-card:hover .shop-add-overlay { opacity:1; }
        .shop-add-btn {
          width:100%;padding:11px;background:var(--ink);color:var(--cream);
          border:none;font-family:var(--type);font-size:9px;letter-spacing:0.18em;
          text-transform:uppercase;cursor:pointer;transition:background 0.15s;
        }
        .shop-add-btn:hover { background:var(--wax); }
        .shop-info { padding:16px; }
        .shop-name { font-size:14px;font-style:italic;margin-bottom:4px; }
        .shop-desc {
          font-family:var(--type);font-size:10px;color:var(--ink-xs);
          line-height:1.6;margin-bottom:10px;
          display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;
        }
        .shop-price { font-family:var(--type);font-size:13px;color:var(--wax); }
        @media (max-width:1024px) { .shop-grid { grid-template-columns:repeat(2,1fr); } }
        @media (max-width:600px)  { .shop-grid { grid-template-columns:1fr; } }
      `}</style>

      <div className="shop-page">
        <div className="shop-hero">
          <div className="container">
            <h1 className="shop-title">All Products</h1>
            <p className="shop-sub">Paper goods for every kind of analog enthusiast</p>
          </div>
        </div>

        <div className="shop-filters-wrap">
          <div className="shop-filters">
            {allTags.map(tag => (
              <button key={tag}
                className={`filter-btn ${activeTag === tag ? 'active' : ''}`}
                onClick={() => setActiveTag(tag)}>
                {tag}
              </button>
            ))}
          </div>
          <div className="filter-fade"/>
        </div>

        <div className="container">
          <div className="shop-count-bar">{filtered.length} products</div>
        </div>

        <div className="shop-grid" style={{marginLeft:48,marginRight:48,marginBottom:80}}>
          {loading ? [0,1,2,3,4,5].map(i => (
            <div key={i} className="shop-card">
              <div className="shop-img skeleton"/>
              <div style={{padding:16}}>
                <div className="skeleton" style={{height:14,marginBottom:8,width:'65%'}}/>
                <div className="skeleton" style={{height:11,width:'45%'}}/>
              </div>
            </div>
          )) : filtered.map((p, i) => {
            const price     = p.priceRange?.minVariantPrice
            const image     = p.featuredImage?.url || p.images?.edges?.[0]?.node?.url
            const variantId = p.variants?.edges?.[0]?.node?.id
            const tag       = p.tags?.[0]
            const isNew     = i < 3
            return (
              <div className="shop-card" key={p.id} onClick={() => onViewProduct(p)}>
                <div className="shop-img">
                  {image
                    ? <img src={image} alt={p.title}/>
                    : <ProductPlaceholder index={i}/>
                  }
                  {tag && (
                    <div className={`shop-tag-badge ${isNew ? 'shop-new-badge' : ''}`}>
                      {isNew ? 'New' : tag}
                    </div>
                  )}
                  <div className="shop-add-overlay">
                    <button className="shop-add-btn"
                      onClick={e => { e.stopPropagation(); if(variantId) onAddToCart(variantId) }}>
                      + Add to Cart
                    </button>
                  </div>
                </div>
                <div className="shop-info">
                  <div className="shop-name">{p.title}</div>
                  {p.description && <div className="shop-desc">{p.description}</div>}
                  {price && <div className="shop-price">{formatPrice(price.amount, price.currencyCode)}</div>}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
