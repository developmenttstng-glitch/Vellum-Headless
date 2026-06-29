import { useState } from 'react'
import { formatPrice } from '../lib/currency'

export default function ProductPage({ product, onAddToCart, cartLoading, onBack }) {
  const [activeImg, setActiveImg] = useState(0)
  const [selected,  setSelected]  = useState(null)
  const [qty,       setQty]       = useState(1)
  const [added,     setAdded]     = useState(false)

  if (!product) return null

  const images    = product.images?.edges?.map(e => e.node) || []
  const variants  = product.variants?.edges?.map(e => e.node) || []
  const price     = product.priceRange?.minVariantPrice
  const mainImg   = images[activeImg]?.url || product.featuredImage?.url
  const activeVar = selected || variants[0]

  function handleAdd() {
    if (!activeVar?.id) return
    onAddToCart(activeVar.id, qty)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <>
      <style>{`
        .pdp { padding-top: 100px; min-height: 100vh; }
        .pdp-back {
          font-family:var(--type);font-size:10px;letter-spacing:0.18em;
          text-transform:uppercase;color:var(--ink-xs);background:none;
          border:none;cursor:pointer;transition:color 0.2s;
          display:flex;align-items:center;gap:6px;padding:0;
          margin-bottom:40px;
        }
        .pdp-back:hover { color:var(--ink); }
        .pdp-grid {
          display:grid;grid-template-columns:1fr 1fr;gap:80px;
          align-items:start;margin-bottom:80px;
        }
        .pdp-images { position:sticky;top:110px; }
        .pdp-main {
          aspect-ratio:3/4;background:var(--parch);overflow:hidden;
          margin-bottom:12px;border:1.5px solid var(--ink);position:relative;
          cursor:zoom-in;
        }
        .pdp-main img { width:100%;height:100%;object-fit:cover;transition:transform 0.5s var(--slow); }
        .pdp-main:hover img { transform:scale(1.04); }
        .pdp-thumbs { display:flex;gap:8px; }
        .pdp-thumb {
          width:72px;height:88px;background:var(--parch);overflow:hidden;
          cursor:pointer;border:1.5px solid transparent;transition:border-color 0.2s;flex-shrink:0;
        }
        .pdp-thumb.active { border-color:var(--ink); }
        .pdp-thumb img { width:100%;height:100%;object-fit:cover; }
        .pdp-info { padding-top:8px; }
        .pdp-tag {
          font-family:var(--type);font-size:10px;letter-spacing:0.25em;
          text-transform:uppercase;color:var(--wax);margin-bottom:14px;
        }
        .pdp-title {
          font-family:var(--serif);font-size:clamp(26px,3vw,40px);
          font-weight:300;font-style:italic;line-height:1.2;margin-bottom:16px;
        }
        .pdp-price {
          font-family:var(--type);font-size:26px;color:var(--wax);
          margin-bottom:28px;
        }
        .pdp-hr { border:none;border-top:1px solid rgba(28,26,22,0.15);margin:24px 0; }
        .pdp-desc {
          font-family:var(--type);font-size:12px;letter-spacing:0.04em;
          color:var(--ink-lt);line-height:1.85;margin-bottom:24px;
        }
        .pdp-lbl {
          font-family:var(--type);font-size:9px;letter-spacing:0.22em;
          text-transform:uppercase;color:var(--ink-xs);margin-bottom:12px;
        }
        .pdp-variants { display:flex;gap:8px;flex-wrap:wrap;margin-bottom:22px; }
        .pdp-variant {
          padding:9px 18px;border:1.5px solid rgba(28,26,22,0.2);
          background:none;font-family:var(--type);font-size:11px;
          cursor:pointer;transition:all 0.15s;color:var(--ink);letter-spacing:0.06em;
        }
        .pdp-variant.active { border-color:var(--ink);background:var(--ink);color:var(--cream); }
        .pdp-variant:hover:not(.active) { border-color:var(--ink-lt); }
        .pdp-variant:disabled { opacity:0.35;cursor:not-allowed;text-decoration:line-through; }
        .pdp-qty { display:flex;align-items:center;margin-bottom:22px; }
        .pdp-qty-btn {
          width:38px;height:38px;border:1.5px solid rgba(28,26,22,0.2);
          background:none;font-size:18px;cursor:pointer;transition:all 0.15s;
          display:flex;align-items:center;justify-content:center;
        }
        .pdp-qty-btn:hover { border-color:var(--ink); }
        .pdp-qty-num {
          width:52px;height:38px;
          border-top:1.5px solid rgba(28,26,22,0.2);border-bottom:1.5px solid rgba(28,26,22,0.2);
          display:flex;align-items:center;justify-content:center;
          font-family:var(--type);font-size:13px;
        }
        .pdp-add {
          width:100%;padding:18px;background:var(--ink);color:var(--cream);
          border:none;font-family:var(--type);font-size:10px;letter-spacing:0.22em;
          text-transform:uppercase;cursor:pointer;transition:all 0.25s;
          margin-bottom:12px;box-shadow:3px 3px 0 var(--wax);
          position:relative;overflow:hidden;
        }
        .pdp-add:hover { background:var(--wax);box-shadow:5px 5px 0 rgba(139,58,42,0.4); }
        .pdp-add:disabled { opacity:0.5;cursor:not-allowed;box-shadow:none; }
        .pdp-features {
          display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:24px;
        }
        .pdp-feature {
          padding:18px;background:var(--parch);border:1px solid rgba(28,26,22,0.1);
        }
        .pdp-feature-icon { font-size:18px;margin-bottom:8px;color:rgba(28,26,22,0.15); }
        .pdp-feature-title {
          font-family:var(--type);font-size:9px;letter-spacing:0.14em;
          text-transform:uppercase;margin-bottom:4px;
        }
        .pdp-feature-text {
          font-family:var(--type);font-size:10px;color:var(--ink-xs);line-height:1.55;
        }
        @media(max-width:768px) {
          .pdp-grid { grid-template-columns:1fr;gap:32px; }
          .pdp-images { position:static; }
          .pdp-features { grid-template-columns:1fr; }
        }
      `}</style>

      <div className="pdp">
        <div className="container">
          <button className="pdp-back" onClick={onBack}>← Back</button>
          <div className="pdp-grid">
            <div className="pdp-images">
              <div className="pdp-main">
                {mainImg
                  ? <img src={mainImg} alt={product.title}/>
                  : <svg width="100%" height="100%" viewBox="0 0 300 400" preserveAspectRatio="xMidYMid slice">
                      <rect width="300" height="400" fill="#e4ddd1"/>
                      {Array.from({length:18},(_,i)=><line key={i} x1="30" y1={50+i*18} x2="270" y2={50+i*18} stroke="rgba(28,26,22,0.08)" strokeWidth="0.9"/>)}
                      <text x="150" y="210" textAnchor="middle" fontSize="60" fill="rgba(28,26,22,0.06)" fontFamily="Georgia,serif" fontStyle="italic">V</text>
                    </svg>
                }
              </div>
              {images.length > 1 && (
                <div className="pdp-thumbs">
                  {images.map((img,i) => (
                    <div key={i}
                      className={`pdp-thumb ${activeImg===i?'active':''}`}
                      onClick={() => setActiveImg(i)}>
                      <img src={img.url} alt={`${product.title} ${i+1}`}/>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pdp-info">
              {product.tags?.[0] && <div className="pdp-tag">{product.tags[0]}</div>}
              <h1 className="pdp-title">{product.title}</h1>
              {price && <div className="pdp-price">{formatPrice(price.amount, price.currencyCode)}</div>}
              <hr className="pdp-hr"/>
              {product.description && <p className="pdp-desc">{product.description}</p>}

              {variants.length > 1 && (
                <div>
                  <div className="pdp-lbl">// Select variant</div>
                  <div className="pdp-variants">
                    {variants.map(v => (
                      <button key={v.id}
                        className={`pdp-variant ${activeVar?.id===v.id?'active':''}`}
                        onClick={() => setSelected(v)}
                        disabled={!v.availableForSale}>
                        {v.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="pdp-lbl">// Quantity</div>
              <div className="pdp-qty">
                <button className="pdp-qty-btn" onClick={() => setQty(q=>Math.max(1,q-1))}>−</button>
                <div className="pdp-qty-num">{qty}</div>
                <button className="pdp-qty-btn" onClick={() => setQty(q=>q+1)}>+</button>
              </div>

              <button className="pdp-add" onClick={handleAdd}
                disabled={cartLoading || !activeVar?.availableForSale}>
                {!activeVar?.availableForSale ? 'Sold Out'
                  : added ? '✓ Added to Cart'
                  : cartLoading ? 'Adding...'
                  : '+ Add to Cart'}
              </button>

              <hr className="pdp-hr"/>

              <div className="pdp-features">
                {[
                  {icon:'◻',title:'Acid-Free Paper',text:'Long-lasting, archive-quality paper in every product'},
                  {icon:'◇',title:'Lay-Flat Binding',text:'Thread or spiral bound for comfortable, flat writing'},
                  {icon:'◈',title:'Local Delivery',text:'Fast shipping across the Philippines'},
                  {icon:'○',title:'Easy Returns',text:'30-day hassle-free return policy'},
                ].map(f => (
                  <div className="pdp-feature" key={f.title}>
                    <div className="pdp-feature-icon">{f.icon}</div>
                    <div className="pdp-feature-title">{f.title}</div>
                    <div className="pdp-feature-text">{f.text}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
