import { formatPrice } from '../lib/currency'
import { useCollection } from '../hooks/useProducts'

function CollectionView({ handle, onAddToCart, onViewProduct, onBack }) {
  const { collection, loading } = useCollection(handle)

  if (loading) return (
    <div style={{paddingTop:160,textAlign:'center'}}>
      <div style={{fontFamily:'var(--serif)',fontSize:56,fontStyle:'italic',color:'rgba(28,26,22,0.1)',marginBottom:16}}>V</div>
      <div style={{fontFamily:'var(--type)',fontSize:10,letterSpacing:'0.25em',color:'var(--ink-xs)',textTransform:'uppercase'}}>Loading...</div>
    </div>
  )
  if (!collection) return null

  const products = collection.products?.edges?.map(e => e.node) || []

  return (
    <>
      <style>{`
        .colv { padding-top: 100px; min-height: 100vh; }
        .colv-hero {
          padding: 56px 0 40px; border-bottom: 1.5px solid var(--ink);
          background: var(--parch); position: relative; overflow: hidden;
          min-height: 260px; display: flex; align-items: center;
        }
        .colv-hero-img {
          position: absolute; inset: 0;
          overflow: hidden;
        }
        .colv-hero-img img {
          width: 100%; height: 100%; object-fit: cover; opacity: 0.12;
        }
        .colv-hero::before {
          content:'';position:absolute;inset:0;
          background-image:repeating-linear-gradient(0deg,transparent,transparent 23px,rgba(28,26,22,0.04) 23px,rgba(28,26,22,0.04) 24px),repeating-linear-gradient(90deg,transparent,transparent 23px,rgba(28,26,22,0.04) 23px,rgba(28,26,22,0.04) 24px);
          pointer-events:none;
        }
        .colv-back {
          font-family:var(--type);font-size:10px;letter-spacing:0.18em;
          text-transform:uppercase;color:var(--ink-xs);background:none;
          border:none;cursor:pointer;margin-bottom:20px;transition:color 0.2s;
          display:flex;align-items:center;gap:6px;padding:0;
        }
        .colv-back:hover { color:var(--ink); }
        .colv-title {
          font-family:var(--serif);font-size:clamp(36px,5vw,68px);
          font-weight:300;font-style:italic;margin-bottom:8px;position:relative;
        }
        .colv-desc {
          font-family:var(--type);font-size:11px;letter-spacing:0.1em;
          color:var(--ink-xs);max-width:480px;line-height:1.7;position:relative;
        }
        .colv-grid {
          display:grid;grid-template-columns:repeat(3,1fr);
          border-left:1.5px solid var(--ink);border-bottom:1.5px solid var(--ink);
          margin:0 48px 80px;
        }
        .colv-card {
          border-right:1.5px solid var(--ink);border-top:1.5px solid var(--ink);
          cursor:pointer;position:relative;transition:background 0.2s;
          background:var(--cream);
        }
        .colv-card:hover { background:var(--cream-dk); }
        .colv-img {
          aspect-ratio:3/4;background:var(--parch);overflow:hidden;
          position:relative;border-bottom:1.5px solid var(--ink);
        }
        .colv-img img { width:100%;height:100%;object-fit:cover; }
        .colv-overlay {
          position:absolute;inset:0;display:flex;align-items:flex-end;
          padding:12px;opacity:0;transition:opacity 0.25s;
        }
        .colv-card:hover .colv-overlay { opacity:1; }
        .colv-add {
          width:100%;padding:11px;background:var(--ink);color:var(--cream);
          border:none;font-family:var(--type);font-size:9px;letter-spacing:0.18em;
          text-transform:uppercase;cursor:pointer;transition:background 0.15s;
        }
        .colv-add:hover { background:var(--wax); }
        .colv-info { padding:16px; }
        .colv-name { font-size:14px;font-style:italic;margin-bottom:6px; }
        .colv-price { font-family:var(--type);font-size:13px;color:var(--wax); }
        @media(max-width:768px) { .colv-grid { grid-template-columns:repeat(2,1fr);margin:0 20px 60px; } }
      `}</style>

      <div className="colv">
        <div className="colv-hero">
          {collection.image && (
            <div className="colv-hero-img">
              <img src={collection.image.url} alt={collection.title}/>
            </div>
          )}
          <div className="container" style={{position:'relative',zIndex:1}}>
            <button className="colv-back" onClick={onBack}>← All Collections</button>
            <h1 className="colv-title">{collection.title}</h1>
            {collection.description && <p className="colv-desc">{collection.description}</p>}
          </div>
        </div>

        <div className="colv-grid">
          {products.map((p, i) => {
            const price     = p.priceRange?.minVariantPrice
            const image     = p.featuredImage?.url || p.images?.edges?.[0]?.node?.url
            const variantId = p.variants?.edges?.[0]?.node?.id
            return (
              <div className="colv-card" key={p.id} onClick={() => onViewProduct(p)}>
                <div className="colv-img">
                  {image
                    ? <img src={image} alt={p.title}/>
                    : <svg width="100%" height="100%" viewBox="0 0 160 200" preserveAspectRatio="xMidYMid slice">
                        <rect width="160" height="200" fill={['#ddd6c8','#c8d4c0','#d0c8b8','#e4ddd1'][i%4]}/>
                        {Array.from({length:10},(_,j)=><line key={j} x1="16" y1={32+j*14} x2="144" y2={32+j*14} stroke="rgba(28,26,22,0.08)" strokeWidth="0.7"/>)}
                      </svg>
                  }
                  <div className="colv-overlay">
                    <button className="colv-add"
                      onClick={e=>{e.stopPropagation();if(variantId)onAddToCart(variantId)}}>
                      + Add to Cart
                    </button>
                  </div>
                </div>
                <div className="colv-info">
                  <div className="colv-name">{p.title}</div>
                  {price && <div className="colv-price">{formatPrice(price.amount,price.currencyCode)}</div>}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}

export default function CollectionsPage({ collections, onNav, onAddToCart, onViewProduct, activeCollection }) {
  if (activeCollection) {
    return <CollectionView
      handle={activeCollection}
      onAddToCart={onAddToCart}
      onViewProduct={onViewProduct}
      onBack={() => onNav('collections')}
    />
  }

  const display = collections.filter(c => c.handle !== 'bestsellers')

  return (
    <>
      <style>{`
        .cp { padding-top: 100px; min-height: 100vh; }
        .cp-hero {
          padding: 56px 0 48px; border-bottom: 1.5px solid var(--ink);
          background: var(--parch); position: relative; overflow: hidden;
          margin-bottom: 0;
        }
        .cp-hero::before {
          content:'';position:absolute;inset:0;
          background-image:repeating-linear-gradient(0deg,transparent,transparent 23px,rgba(28,26,22,0.04) 23px,rgba(28,26,22,0.04) 24px),repeating-linear-gradient(90deg,transparent,transparent 23px,rgba(28,26,22,0.04) 23px,rgba(28,26,22,0.04) 24px);
          pointer-events:none;
        }
        .cp-title { font-family:var(--serif);font-size:clamp(36px,5vw,68px);font-weight:300;font-style:italic;position:relative; }
        .cp-grid {
          display:grid;grid-template-columns:repeat(4,1fr);
          border-bottom:1.5px solid var(--ink);
        }
        .cp-card {
          padding:40px 32px;border-right:1.5px solid var(--ink);
          cursor:pointer;transition:background 0.2s;position:relative;
          border-top:1.5px solid var(--ink);background:var(--cream);
          min-height:320px; overflow:hidden;
        }
        .cp-card:last-child { border-right:none; }
        .cp-card:hover { background:var(--cream-dk); }
        .cp-card-img {
          position:absolute;inset:0;pointer-events:none;
        }
        .cp-card-img img {
          width:100%;height:100%;object-fit:cover;
          opacity:0.08;transition:opacity 0.3s;
        }
        .cp-card:hover .cp-card-img img { opacity:0.14; }
        .cp-card-content { position:relative;z-index:1; }
        .cp-num {
          font-family:var(--type);font-size:10px;letter-spacing:0.2em;
          color:var(--ink-xs);margin-bottom:14px;
        }
        .cp-icon { font-size:28px;color:rgba(28,26,22,0.13);margin-bottom:14px; }
        .cp-name { font-size:26px;font-style:italic;margin-bottom:10px; }
        .cp-desc {
          font-family:var(--type);font-size:10px;letter-spacing:0.04em;
          color:var(--ink-xs);line-height:1.8;margin-bottom:22px;
        }
        .cp-link {
          font-family:var(--type);font-size:9px;letter-spacing:0.22em;
          text-transform:uppercase;color:var(--wax);
          border-bottom:1px solid var(--wax);display:inline-block;padding-bottom:2px;
        }
        .cp-stamp {
          position:absolute;bottom:24px;right:24px;
          width:44px;height:44px;border:1.5px solid rgba(139,58,42,0.2);
          border-radius:50%;display:flex;align-items:center;justify-content:center;
          font-family:var(--type);font-size:7px;letter-spacing:0.08em;
          color:rgba(139,58,42,0.2);transform:rotate(-12deg);
          text-align:center;text-transform:uppercase;line-height:1.3;
        }
        @media(max-width:1024px) {
          .cp-grid { grid-template-columns:repeat(2,1fr); }
          .cp-card:nth-child(2) { border-right:none; }
          .cp-card:nth-child(3) { border-top:1.5px solid var(--ink); }
        }
        @media(max-width:600px) { .cp-grid { grid-template-columns:1fr; } .cp-card { border-right:none; } }
      `}</style>

      <div className="cp">
        <div className="cp-hero">
          <div className="container">
            <h1 className="cp-title">Collections</h1>
          </div>
        </div>
        <div className="cp-grid">
          {display.length > 0 ? display.map((col,i) => (
            <div className="cp-card" key={col.id} onClick={() => onNav('collection',col.handle)}>
              {col.image && (
                <div className="cp-card-img">
                  <img src={col.image.url} alt={col.title}/>
                </div>
              )}
              <div className="cp-card-content">
                <div className="cp-num">0{i+1} / {col.title}</div>
                <div className="cp-icon">{['◻','◇','○','◈'][i%4]}</div>
                <div className="cp-name">{col.title}</div>
                <div className="cp-desc">{col.description || 'Explore this collection.'}</div>
                <div className="cp-link">Browse →</div>
                {i===0 && <div className="cp-stamp">New<br/>Stock</div>}
                {i===3 && <div className="cp-stamp">Best<br/>Seller</div>}
              </div>
            </div>
          )) : [
            {handle:'write',title:'Write',desc:'Notebooks, journals and notepads for every kind of writer.',icon:'◻'},
            {handle:'draw',title:'Draw',desc:'Sketchbooks and paper for artists at every level.',icon:'◇'},
            {handle:'organize',title:'Organize',desc:'Planners, calendars and tools that bring clarity.',icon:'○'},
            {handle:'decorate',title:'Decorate',desc:'Washi tape, stickers and stamps for every page.',icon:'◈'},
          ].map((c,i) => (
            <div className="cp-card" key={c.handle} onClick={() => onNav('collection',c.handle)}>
              <div className="cp-num">0{i+1} / {c.title}</div>
              <div className="cp-icon">{c.icon}</div>
              <div className="cp-name">{c.title}</div>
              <div className="cp-desc">{c.desc}</div>
              <div className="cp-link">Browse →</div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
