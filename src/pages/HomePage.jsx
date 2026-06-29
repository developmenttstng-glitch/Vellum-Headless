import { useEffect, useRef, useState } from 'react'
import { formatPrice } from '../lib/currency'

// Scroll reveal hook
function useReveal() {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if(e.isIntersecting) setVisible(true) }, { threshold: 0.12 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return [ref, visible]
}

function Reveal({ children, delay = 0, style = {} }) {
  const [ref, visible] = useReveal()
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'none' : 'translateY(28px)',
      transition: `opacity 0.9s ease ${delay}s, transform 0.9s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
      ...style
    }}>
      {children}
    </div>
  )
}

// Product placeholder when no image
function ProductPlaceholder({ size = 'lg' }) {
  const patterns = [
    // Lined
    <svg key="lined" width="100%" height="100%" viewBox="0 0 160 200" preserveAspectRatio="xMidYMid slice">
      <rect width="160" height="200" fill="#ddd6c8"/>
      {Array.from({length:12},(_,i)=><line key={i} x1="20" y1={40+i*14} x2="140" y2={40+i*14} stroke="rgba(28,26,22,0.1)" strokeWidth="0.8"/>)}
      <text x="80" y="28" textAnchor="middle" fontSize="10" fill="rgba(28,26,22,0.2)" fontFamily="'Courier New',monospace" letterSpacing="2">LINED</text>
    </svg>,
    // Dotted
    <svg key="dotted" width="100%" height="100%" viewBox="0 0 160 200" preserveAspectRatio="xMidYMid slice">
      <rect width="160" height="200" fill="#c8d4c0"/>
      {Array.from({length:8},(_,r)=>Array.from({length:10},(_,c)=><circle key={`${r}-${c}`} cx={20+c*14} cy={40+r*14} r="1" fill="rgba(28,26,22,0.15)"/>))}
      <text x="80" y="28" textAnchor="middle" fontSize="10" fill="rgba(28,26,22,0.2)" fontFamily="'Courier New',monospace" letterSpacing="2">DOTTED</text>
    </svg>,
    // Graph
    <svg key="graph" width="100%" height="100%" viewBox="0 0 160 200" preserveAspectRatio="xMidYMid slice">
      <rect width="160" height="200" fill="#d0c8b8"/>
      {Array.from({length:10},(_,i)=><line key={`h${i}`} x1="0" y1={30+i*16} x2="160" y2={30+i*16} stroke="rgba(28,26,22,0.08)" strokeWidth="0.5"/>)}
      {Array.from({length:10},(_,i)=><line key={`v${i}`} x1={i*18} y1="30" x2={i*18} y2="200" stroke="rgba(28,26,22,0.08)" strokeWidth="0.5"/>)}
      <text x="80" y="20" textAnchor="middle" fontSize="10" fill="rgba(28,26,22,0.2)" fontFamily="'Courier New',monospace" letterSpacing="2">GRAPH</text>
    </svg>,
    // Plain
    <svg key="plain" width="100%" height="100%" viewBox="0 0 160 200" preserveAspectRatio="xMidYMid slice">
      <rect width="160" height="200" fill="#e4ddd1"/>
      <text x="80" y="105" textAnchor="middle" fontSize="40" fill="rgba(28,26,22,0.08)" fontFamily="Georgia,serif" fontStyle="italic">V</text>
      <text x="80" y="130" textAnchor="middle" fontSize="9" fill="rgba(28,26,22,0.15)" fontFamily="'Courier New',monospace" letterSpacing="3">VELLUM</text>
    </svg>,
  ]
  const idx = Math.floor(Math.random() * patterns.length)
  return patterns[idx]
}

export default function HomePage({ products, collections, loading, onNav, onAddToCart, cartLoading, onViewProduct }) {
  const bestsellers = products.slice(0, 4)
  const [heroReady, setHeroReady] = useState(false)
  const [typeText,  setTypeText]  = useState('')
  const fullText = 'Paper goods worth keeping.'

  useEffect(() => {
    setTimeout(() => setHeroReady(true), 100)
    // Typewriter effect
    let i = 0
    const timer = setInterval(() => {
      if (i <= fullText.length) {
        setTypeText(fullText.slice(0, i))
        i++
      } else {
        clearInterval(timer)
      }
    }, 60)
    return () => clearInterval(timer)
  }, [])

  const displayCollections = collections.filter(c => c.handle !== 'bestsellers').slice(0, 4)

  return (
    <>
      <style>{`
        /* ── Hero ── */
        .hero {
          min-height: 100vh; display: grid; grid-template-columns: 1fr 1fr;
          border-bottom: 1.5px solid var(--ink); position: relative; overflow: hidden;
        }
        .hero-left {
          padding: 120px 60px 80px;
          display: flex; flex-direction: column; justify-content: center;
          border-right: 1.5px solid var(--ink); position: relative;
          background: var(--cream);
        }
        /* Aged stain */
        .hero-left::before {
          content: ''; position: absolute; top: -60px; left: -60px;
          width: 260px; height: 260px; border-radius: 50%;
          background: radial-gradient(circle, rgba(139,58,42,0.06) 0%, transparent 70%);
          pointer-events: none;
        }
        .hero-vol {
          font-family: var(--type); font-size: 10px; letter-spacing: 0.3em;
          color: var(--ink-xs); margin-bottom: 28px;
          display: flex; align-items: center; gap: 10px;
          opacity: 0; animation: fadeUp 0.6s 0.3s ease forwards;
        }
        .hero-vol::before {
          content: ''; display: inline-block; width: 24px; height: 1px; background: var(--ink-xs);
        }
        .hero-title {
          font-size: clamp(52px, 7vw, 88px); font-weight: 300; line-height: 0.95;
          letter-spacing: -0.02em; color: var(--ink); margin-bottom: 28px;
          opacity: 0; animation: fadeUp 0.7s 0.5s ease forwards;
        }
        .hero-title em { font-style: italic; }
        .hero-title .wax-word {
          display: inline-block; position: relative;
        }
        .hero-title .wax-word::after {
          content: ''; position: absolute; bottom: 4px; left: 0; right: 0;
          height: 3px; background: var(--wax); opacity: 0.7;
          clip-path: polygon(0% 40%, 3% 70%, 6% 30%, 9% 80%, 12% 25%,
            15% 70%, 18% 35%, 21% 75%, 24% 30%, 27% 65%, 30% 40%,
            33% 70%, 36% 25%, 39% 75%, 42% 40%, 45% 70%, 48% 25%,
            51% 65%, 54% 40%, 57% 75%, 60% 30%, 63% 70%, 66% 25%,
            69% 65%, 72% 40%, 75% 75%, 78% 30%, 81% 65%, 84% 40%,
            87% 70%, 90% 25%, 93% 65%, 96% 40%, 100% 55%,
            100% 100%, 0% 100%);
        }
        .hero-typewriter {
          font-family: var(--type); font-size: 13px; letter-spacing: 0.04em;
          color: var(--ink-lt); line-height: 1.8; margin-bottom: 40px;
          min-height: 24px;
          opacity: 0; animation: fadeIn 0.5s 0.9s ease forwards;
        }
        .hero-typewriter::after {
          content: '|'; animation: blink 1s infinite; margin-left: 2px; color: var(--wax);
        }
        .hero-actions {
          display: flex; gap: 14px; flex-wrap: wrap;
          opacity: 0; animation: fadeUp 0.6s 1.1s ease forwards;
        }
        .hero-annotation {
          position: absolute; bottom: 48px; left: 60px;
          font-family: var(--serif); font-style: italic; font-size: 13px;
          color: var(--ink-xs); display: flex; align-items: center; gap: 8px;
          opacity: 0; animation: fadeIn 0.8s 1.4s ease forwards;
        }
        .hero-right {
          background: var(--parch); position: relative;
          display: flex; align-items: center; justify-content: center;
          overflow: hidden;
        }
        .hero-right.graph-bg {}
        /* Rotation text */
        .hero-right-label {
          position: absolute; right: -36px; top: 50%;
          transform: translateY(-50%) rotate(90deg);
          font-family: var(--type); font-size: 9px; letter-spacing: 0.3em;
          text-transform: uppercase; color: rgba(28,26,22,0.15);
          white-space: nowrap;
        }
        /* Product stack */
        .hero-stack { position: relative; width: 280px; height: 340px; }
        .hero-book {
          position: absolute; border: 1.5px solid var(--ink);
          overflow: hidden;
        }
        .hero-book-1 {
          width: 210px; height: 268px; right: 10px; top: 20px;
          transform: rotate(4deg);
          box-shadow: 5px 5px 0 rgba(28,26,22,0.18);
        }
        .hero-book-2 {
          width: 185px; height: 240px; left: 5px; top: 48px;
          transform: rotate(-6deg);
          box-shadow: 4px 4px 0 rgba(28,26,22,0.14); z-index: 2;
        }
        .hero-book-3 {
          width: 165px; height: 210px; left: 42px; top: 78px;
          transform: rotate(2deg);
          box-shadow: 3px 3px 0 rgba(28,26,22,0.1); z-index: 3;
        }
        .hero-tape {
          position: absolute; height: 18px; background: rgba(210,190,150,0.55);
          border: 0.5px solid rgba(0,0,0,0.1); transform: rotate(-10deg);
        }
        /* Washi strips */
        .washi-stack {
          position: absolute; bottom: 36px; left: 18px;
          display: flex; flex-direction: column; gap: 5px;
          transform: rotate(-7deg); z-index: 5;
        }
        .washi { height: 16px; border: 0.5px solid rgba(0,0,0,0.12); opacity: 0.72; }

        /* ── Marquee ── */
        .marquee-wrap {
          border-top: 1.5px solid var(--ink); border-bottom: 1.5px solid var(--ink);
          background: var(--ink); padding: 13px 0; overflow: hidden; white-space: nowrap;
        }
        .marquee-track { display: inline-block; animation: marquee 20s linear infinite; }
        .m-item {
          display: inline-block; font-family: var(--type); font-size: 10px;
          letter-spacing: 0.28em; text-transform: uppercase; color: var(--cream);
          padding: 0 30px;
        }
        .m-dot {
          display: inline-block; width: 4px; height: 4px; background: var(--wax);
          border-radius: 50%; vertical-align: middle; margin: 0 6px;
        }

        /* ── Bestsellers ── */
        .best-section { padding: 80px 0; background: var(--cream); }
        .section-head {
          display: flex; align-items: flex-end; justify-content: space-between;
          border-bottom: 1.5px solid var(--ink); padding-bottom: 20px; margin-bottom: 48px;
        }
        .section-label {
          font-family: var(--type); font-size: 10px; letter-spacing: 0.28em;
          text-transform: uppercase; color: var(--ink-xs); margin-bottom: 8px;
        }
        .section-title {
          font-size: clamp(28px,3.5vw,44px); font-weight: 300; line-height: 1;
        }
        .section-title em { font-style: italic; }
        .see-all-btn {
          font-family: var(--type); font-size: 10px; letter-spacing: 0.18em;
          text-transform: uppercase; color: var(--ink-xs); background: none;
          border: none; cursor: pointer; border-bottom: 1px solid var(--ink-xs);
          padding-bottom: 2px; transition: all 0.2s; flex-shrink: 0;
        }
        .see-all-btn:hover { color: var(--ink); border-color: var(--ink); }
        .products-grid {
          display: grid; grid-template-columns: repeat(4,1fr);
          border: 1.5px solid var(--ink); gap: 0;
        }
        .product-card {
          border-right: 1.5px solid var(--ink); cursor: pointer;
          transition: background 0.2s; position: relative;
          background: var(--cream);
        }
        .product-card:last-child { border-right: none; }
        .product-card:hover { background: var(--cream-dk); }
        .product-card:nth-child(odd) { transform: rotate(0.3deg); }
        .product-card:nth-child(even) { transform: rotate(-0.4deg); }
        .product-card:hover { transform: translate(-2px,-2px) rotate(0); box-shadow: 4px 4px 0 var(--ink); z-index: 1; }
        .product-img-wrap {
          aspect-ratio: 3/4; background: var(--parch);
          border-bottom: 1.5px solid var(--ink); position: relative; overflow: hidden;
        }
        .product-img-wrap img { width:100%;height:100%;object-fit:cover; }
        .product-new-tag {
          position: absolute; top: 0; left: 0; background: var(--ink);
          color: var(--cream); font-family: var(--type); font-size: 8px;
          letter-spacing: 0.2em; padding: 4px 8px; text-transform: uppercase;
        }
        .product-add-overlay {
          position: absolute; inset: 0; display: flex; align-items: flex-end;
          padding: 12px; opacity: 0; transition: opacity 0.25s;
        }
        .product-card:hover .product-add-overlay { opacity: 1; }
        .product-add-btn {
          width: 100%; padding: 10px; background: var(--ink); color: var(--cream);
          border: none; font-family: var(--type); font-size: 9px;
          letter-spacing: 0.18em; text-transform: uppercase; cursor: pointer;
          transition: background 0.15s;
        }
        .product-add-btn:hover { background: var(--wax); }
        .product-tape {
          position: absolute; top: -9px; left: 50%; margin-left: -22px;
          width: 44px; height: 16px; background: rgba(210,190,150,0.55);
          border: 0.5px solid rgba(0,0,0,0.1); transform: rotate(-4deg);
        }
        .product-info { padding: 16px; }
        .product-name { font-size: 13px; font-style: italic; margin-bottom: 4px; }
        .product-collection { font-family: var(--type); font-size: 9px; letter-spacing: 0.15em; text-transform: uppercase; color: var(--ink-xs); margin-bottom: 8px; }
        .product-price { font-family: var(--type); font-size: 13px; color: var(--wax); }

        /* ── Dark editorial ── */
        .editorial {
          display: grid; grid-template-columns: 1fr 1fr;
          border-top: 1.5px solid var(--ink);
          min-height: 500px;
          position: relative;
        }
        .ed-left {
          background: var(--ink); padding: 80px 60px;
          display: flex; flex-direction: column; justify-content: center;
          border-right: 1.5px solid var(--wax); position: relative; overflow: hidden;
        }
        .ed-left-dot {
          position: absolute; inset: 0;
          background-image: radial-gradient(circle, rgba(255,255,255,0.035) 1px, transparent 1px);
          background-size: 18px 18px; pointer-events: none;
        }
        .ed-bigv {
          position: absolute; bottom: -40px; right: 10px;
          font-size: 240px; font-style: italic; font-weight: 300;
          color: rgba(255,255,255,0.03); line-height: 1; pointer-events: none;
          font-family: var(--serif);
        }
        .ed-eyebrow {
          font-family: var(--type); font-size: 10px; letter-spacing: 0.28em;
          text-transform: uppercase; color: var(--wax); margin-bottom: 20px; position: relative; z-index:1;
        }
        .ed-title {
          font-size: clamp(32px,3.5vw,50px); font-weight: 300; font-style: italic;
          color: var(--cream); line-height: 1.15; margin-bottom: 20px; position: relative; z-index:1;
        }
        .ed-text {
          font-family: var(--type); font-size: 11px; letter-spacing: 0.04em;
          color: rgba(237,232,223,0.4); line-height: 1.9;
          margin-bottom: 32px; max-width: 320px; position: relative; z-index:1;
        }
        .ed-right {
          background: var(--parch); display: flex; align-items: center;
          justify-content: center; position: relative; overflow: hidden;
        }
        /* Burn edges on editorial right */
        .ed-right::before {
          content: ''; position: absolute; top:0;left:0;right:0;height:30px;
          background: linear-gradient(to bottom, rgba(28,26,22,0.25), transparent);
          z-index: 2; pointer-events:none;
        }
        .ed-right::after {
          content: ''; position: absolute; bottom:0;left:0;right:0;height:30px;
          background: linear-gradient(to top, rgba(28,26,22,0.2), transparent);
          z-index: 2; pointer-events:none;
        }
        .flatlay {
          position: relative; width: 280px; height: 300px;
        }
        .fl-item {
          position: absolute; border: 1.5px solid var(--ink); overflow: hidden;
        }

        /* ── Collections ── */
        .collections-section {
          border-top: 1.5px solid var(--ink); background: var(--cream);
        }
        /* Burn effect on top */
        .collections-burn {
          height: 32px; background: var(--ink); position: relative;
        }
        .collections-burn::after {
          content: ''; position: absolute; bottom: -16px; left:0;right:0; height:18px;
          background: var(--ink);
          -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='18'%3E%3Cpath d='M0 0 Q30 8 60 3 Q90 -2 120 6 Q150 14 180 4 Q210 -4 240 8 Q270 18 300 5 Q330 -3 360 9 Q390 17 420 3 Q450 -3 480 10 Q510 18 540 4 Q570 -2 600 7 Q630 16 660 2 Q690 -4 720 9 Q750 18 780 5 Q810 -2 840 8 Q870 17 900 3 Q930 -3 960 10 Q990 18 1020 4 Q1050 -2 1080 8 Q1110 16 1140 3 Q1170 -3 1200 6 L1200 18 L0 18Z' fill='black'/%3E%3C/svg%3E");
          -webkit-mask-size: 100% 100%;
          mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='18'%3E%3Cpath d='M0 0 Q30 8 60 3 Q90 -2 120 6 Q150 14 180 4 Q210 -4 240 8 Q270 18 300 5 Q330 -3 360 9 Q390 17 420 3 Q450 -3 480 10 Q510 18 540 4 Q570 -2 600 7 Q630 16 660 2 Q690 -4 720 9 Q750 18 780 5 Q810 -2 840 8 Q870 17 900 3 Q930 -3 960 10 Q990 18 1020 4 Q1050 -2 1080 8 Q1110 16 1140 3 Q1170 -3 1200 6 L1200 18 L0 18Z' fill='black'/%3E%3C/svg%3E");
          mask-size: 100% 100%;
          z-index: 3;
        }
        .collections-grid {
          display: grid; grid-template-columns: repeat(4,1fr);
          border-bottom: 1.5px solid var(--ink);
        }
        .coll-card {
          padding: 40px 32px; border-right: 1.5px solid var(--ink);
          cursor: pointer; transition: background 0.2s; position: relative;
          background: var(--cream); overflow: hidden;
        }
        .coll-card:last-child { border-right: none; }
        .coll-card:hover { background: var(--cream-dk); }
        .coll-card-img {
          position: absolute; inset: 0; pointer-events: none;
        }
        .coll-card-img img {
          width: 100%; height: 100%; object-fit: cover;
          opacity: 0.08; transition: opacity 0.3s;
        }
        .coll-card:hover .coll-card-img img { opacity: 0.13; }
        .coll-card-content { position: relative; z-index: 1; }
        .coll-num {
          font-family: var(--type); font-size: 10px; letter-spacing: 0.2em;
          color: var(--ink-xs); margin-bottom: 14px;
        }
        .coll-icon { font-size: 26px; color: rgba(28,26,22,0.14); margin-bottom: 12px; }
        .coll-name { font-size: 22px; font-style: italic; margin-bottom: 8px; }
        .coll-desc {
          font-family: var(--type); font-size: 10px; letter-spacing: 0.04em;
          color: var(--ink-xs); line-height: 1.7; margin-bottom: 20px;
        }
        .coll-link {
          font-family: var(--type); font-size: 9px; letter-spacing: 0.2em;
          text-transform: uppercase; color: var(--wax);
          border-bottom: 1px solid var(--wax); display: inline-block; padding-bottom: 2px;
        }
        .rubber-stamp {
          position: absolute; bottom: 20px; right: 20px;
          width: 42px; height: 42px; border: 1.5px solid rgba(139,58,42,0.22);
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          font-family: var(--type); font-size: 7px; letter-spacing: 0.08em;
          color: rgba(139,58,42,0.22); transform: rotate(-12deg); text-align: center;
          text-transform: uppercase; line-height: 1.3;
        }

        /* ── CTA strip ── */
        .cta-strip {
          padding: 72px 0; background: var(--cream);
          border-top: 1.5px solid var(--ink); text-align: center;
        }
        .cta-title { font-size: clamp(28px,4vw,52px); font-weight: 300; margin-bottom: 12px; }
        .cta-title em { font-style: italic; color: var(--wax); }
        .cta-sub {
          font-family: var(--type); font-size: 11px; letter-spacing: 0.12em;
          color: var(--ink-xs); margin-bottom: 32px;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .products-grid { grid-template-columns: repeat(2,1fr); }
          .collections-grid { grid-template-columns: repeat(2,1fr); }
          .coll-card:nth-child(2) { border-right: none; }
          .coll-card:nth-child(2), .coll-card:nth-child(3), .coll-card:nth-child(4) { border-top: 1.5px solid var(--ink); }
        }
        @media (max-width: 768px) {
          .hero { grid-template-columns: 1fr; }
          .hero-left { padding: 120px 24px 60px; border-right: none; border-bottom: 1.5px solid var(--ink); }
          .hero-right { min-height: 320px; }
          .hero-annotation { display: none; }
          .editorial { grid-template-columns: 1fr; }
          .ed-right { min-height: 280px; }
          .ed-left { padding: 60px 24px; }
          .products-grid { grid-template-columns: repeat(2,1fr); }
          .collections-grid { grid-template-columns: 1fr; }
          .coll-card { border-right: none; border-bottom: 1.5px solid var(--ink); }
          .coll-card:last-child { border-bottom: none; }
        }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>

      {/* Hero */}
      <section className="hero">
        <div className="hero-left">
          <div className="hero-vol">Vol. I &nbsp;/&nbsp; Est. 2025</div>
          <h1 className="hero-title">
            Paper<br/>
            <em>goods</em><br/>
            <span className="wax-word">worth</span><br/>
            keeping.
          </h1>
          <p className="hero-typewriter">{typeText}</p>
          <div className="hero-actions">
            <button className="btn-ink" onClick={() => onNav('shop')}>Shop Now</button>
            <button className="btn-ghost" onClick={() => onNav('collections')}>Collections</button>
          </div>
          <div className="hero-annotation">
            <svg width="32" height="20" viewBox="0 0 32 20" fill="none">
              <path d="M2 18 Q8 4 20 8 Q26 10 28 4" stroke="var(--ink-xs)" strokeWidth="1" fill="none" strokeLinecap="round" strokeDasharray="3 2"/>
              <path d="M24 2 L28 4 L25 8" stroke="var(--ink-xs)" strokeWidth="1" fill="none" strokeLinecap="round"/>
            </svg>
            for the analog soul
          </div>
        </div>
        <div className="hero-right graph-bg">
          <div className="hero-stack">
            <div className="hero-book hero-book-1">
              <ProductPlaceholder/>
            </div>
            <div className="hero-book hero-book-2">
              <div className="hero-tape" style={{width:44,top:-9,left:'50%',marginLeft:-22}}/>
              <svg width="100%" height="100%" viewBox="0 0 185 240" preserveAspectRatio="xMidYMid slice">
                <rect width="185" height="240" fill="#c8d4c0"/>
                {Array.from({length:10},(_,i)=><circle key={i*10} cx={20+((i*37)%145)} cy={30+i*18} r="1.2" fill="rgba(28,26,22,0.12)"/>)}
                <text x="92" y="130" textAnchor="middle" fontSize="28" fill="rgba(28,26,22,0.08)" fontFamily="Georgia,serif" fontStyle="italic">Draw</text>
              </svg>
            </div>
            <div className="hero-book hero-book-3">
              <svg width="100%" height="100%" viewBox="0 0 165 210" preserveAspectRatio="xMidYMid slice">
                <rect width="165" height="210" fill="#e4ddd1"/>
                {Array.from({length:8},(_,r)=>Array.from({length:7},(_,c)=><rect key={`${r}${c}`} x={10+c*22} y={20+r*24} width="1.5" height="1.5" fill="rgba(28,26,22,0.1)"/>))}
                <text x="82" y="115" textAnchor="middle" fontSize="24" fill="rgba(28,26,22,0.07)" fontFamily="Georgia,serif" fontStyle="italic">Vellum</text>
              </svg>
            </div>
            <div className="washi-stack">
              <div className="washi" style={{width:76,background:'rgba(139,58,42,0.32)'}}/>
              <div className="washi" style={{width:58,marginLeft:10,background:'rgba(122,142,114,0.28)'}}/>
              <div className="washi" style={{width:68,marginLeft:5,background:'rgba(80,100,140,0.22)'}}/>
            </div>
            <div className="corner-sticker" style={{position:'absolute',top:0,right:0,background:'var(--ink)',color:'var(--cream)',fontFamily:'var(--type)',fontSize:8,letterSpacing:'0.18em',padding:'4px 8px',textTransform:'uppercase',zIndex:10}}>New</div>
          </div>
          <div className="hero-right-label">Stationery · Paper Goods · Est. 2025</div>
        </div>
      </section>

      {/* Marquee */}
      <div className="marquee-wrap">
        <div className="marquee-track">
          {['Notebooks','Washi Tape','Journals','Planners','Sketchbooks','Stickers','Ink Pads','Paper Goods',
            'Notebooks','Washi Tape','Journals','Planners','Sketchbooks','Stickers','Ink Pads','Paper Goods'].map((t,i)=>(
            <span key={i}><span className="m-item">{t}</span><span className="m-dot"/></span>
          ))}
        </div>
      </div>

      {/* Bestsellers */}
      <section className="best-section">
        <div className="container">
          <Reveal>
            <div className="section-head">
              <div>
                <div className="section-label">— Currently in stock</div>
                <div className="section-title">Most <em>loved</em></div>
              </div>
              <button className="see-all-btn" onClick={() => onNav('shop')}>View all products →</button>
            </div>
          </Reveal>
          <div className="products-grid">
            {loading ? [0,1,2,3].map(i => (
              <div key={i} style={{borderRight:'1.5px solid var(--ink)'}}>
                <div className="skeleton" style={{aspectRatio:'3/4'}}/>
                <div style={{padding:16}}>
                  <div className="skeleton" style={{height:14,marginBottom:8,width:'70%'}}/>
                  <div className="skeleton" style={{height:12,width:'40%'}}/>
                </div>
              </div>
            )) : bestsellers.map((p, i) => {
              const price     = p.priceRange?.minVariantPrice
              const image     = p.featuredImage?.url || p.images?.edges?.[0]?.node?.url
              const variantId = p.variants?.edges?.[0]?.node?.id
              const isNew     = i < 2
              return (
                <Reveal key={p.id} delay={i * 0.08}>
                  <div className="product-card" onClick={() => onViewProduct(p)}>
                    {i % 2 === 0 && <div className="product-tape"/>}
                    <div className="product-img-wrap">
                      {image
                        ? <img src={image} alt={p.title}/>
                        : <ProductPlaceholder/>
                      }
                      {isNew && <div className="product-new-tag">New</div>}
                      <div className="product-add-overlay">
                        <button className="product-add-btn"
                          onClick={e => { e.stopPropagation(); if(variantId) onAddToCart(variantId) }}>
                          + Add to Cart
                        </button>
                      </div>
                    </div>
                    <div className="product-info">
                      <div className="product-name">{p.title}</div>
                      <div className="product-collection">{p.tags?.[0] || p.vendor}</div>
                      {price && <div className="product-price">{formatPrice(price.amount, price.currencyCode)}</div>}
                    </div>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* Editorial */}
      <section className="editorial">
        <div className="ed-left">
          <div className="ed-left-dot"/>
          <div className="ed-eyebrow">// The VELLUM story</div>
          <h2 className="ed-title">Made for<br/>hands that<br/>still write.</h2>
          <p className="ed-text">
            In a world of screens, there is something irreplaceable
            about pen on paper. VELLUM exists for those who know
            this feeling and refuse to let it go.
          </p>
          <button className="btn-cream" onClick={() => onNav('about')}>Read our story</button>
          <div className="ed-bigv">V</div>
        </div>
        <div className="ed-right graph-bg">
          <div className="flatlay">
            <div className="fl-item" style={{width:160,height:200,top:20,right:20,transform:'rotate(3deg)',boxShadow:'5px 5px 0 rgba(28,26,22,0.12)',background:'#f5f0e6'}}>
              <svg width="160" height="200" viewBox="0 0 160 200">
                <rect width="10" height="200" fill="rgba(28,26,22,0.06)"/>
                {Array.from({length:10},(_,i)=><line key={i} x1="20" y1={30+i*14} x2="148" y2={30+i*14} stroke="rgba(28,26,22,0.09)" strokeWidth="0.8"/>)}
                <text x="84" y="18" textAnchor="middle" fontSize="9" fill="rgba(28,26,22,0.18)" fontFamily="'Courier New',monospace" letterSpacing="2">JOURNAL</text>
              </svg>
            </div>
            <div className="fl-item" style={{width:110,height:16,top:8,left:28,transform:'rotate(-8deg)',background:'rgba(139,58,42,0.32)',borderColor:'rgba(28,26,22,0.1)'}}/>
            <div className="fl-item" style={{width:130,height:14,top:30,left:18,transform:'rotate(-5deg)',background:'rgba(122,142,114,0.28)',borderColor:'rgba(28,26,22,0.1)'}}/>
            <div className="fl-item" style={{width:82,height:100,bottom:28,left:18,transform:'rotate(-4deg)',boxShadow:'3px 3px 0 rgba(28,26,22,0.1)',background:'#e0d8cc'}}>
              <svg width="82" height="100" viewBox="0 0 82 100">
                {Array.from({length:6},(_,i)=><line key={i} x1="10" y1={20+i*12} x2="72" y2={20+i*12} stroke="rgba(28,26,22,0.1)" strokeWidth="0.8"/>)}
              </svg>
            </div>
            <div style={{position:'absolute',bottom:48,right:38,width:34,height:34,background:'var(--wax)',borderRadius:'50%',border:'1.5px solid var(--ink)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'var(--type)',fontSize:11,color:'var(--cream)',zIndex:5,boxShadow:'2px 2px 0 rgba(28,26,22,0.2)'}}>V</div>
          </div>
        </div>
      </section>

      {/* Collections */}
      <section className="collections-section">
        <div className="collections-burn"/>
        <div style={{paddingTop:32}}>
          <div className="container" style={{paddingBottom:32}}>
            <Reveal>
              <div className="section-head" style={{marginBottom:40}}>
                <div>
                  <div className="section-label">— Browse by theme</div>
                  <div className="section-title">Our <em>Collections</em></div>
                </div>
                <button className="see-all-btn" onClick={() => onNav('collections')}>All collections →</button>
              </div>
            </Reveal>
          </div>
          <div className="collections-grid">
            {displayCollections.length > 0 ? displayCollections.map((col, i) => (
              <div className="coll-card" key={col.id}
                onClick={() => onNav('collection', col.handle)}>
                {col.image && (
                  <div className="coll-card-img">
                    <img src={col.image.url} alt={col.title}/>
                  </div>
                )}
                <div className="coll-card-content">
                  <div className="coll-num">0{i+1} / {col.title}</div>
                  <div className="coll-icon">{['◻','◇','○','◈'][i]}</div>
                  <div className="coll-name">{col.title}</div>
                  <div className="coll-desc">{col.description || 'Explore this collection.'}</div>
                  <div className="coll-link">Browse →</div>
                  {i === 0 && <div className="rubber-stamp">New<br/>Stock</div>}
                  {i === 3 && <div className="rubber-stamp">Best<br/>Seller</div>}
                </div>
              </div>
            )) : [
              {title:'Write',desc:'Notebooks, journals and notepads.',icon:'◻',handle:'write'},
              {title:'Draw',desc:'Sketchbooks and artist paper.',icon:'◇',handle:'draw'},
              {title:'Organize',desc:'Planners, calendars and tools.',icon:'○',handle:'organize'},
              {title:'Decorate',desc:'Washi tape, stickers and stamps.',icon:'◈',handle:'decorate'},
            ].map((c,i) => (
              <div className="coll-card" key={c.handle}
                onClick={() => onNav('collection', c.handle)}>
                <div className="coll-num">0{i+1} / {c.title}</div>
                <div className="coll-icon">{c.icon}</div>
                <div className="coll-name">{c.title}</div>
                <div className="coll-desc">{c.desc}</div>
                <div className="coll-link">Browse →</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-strip">
        <div className="container">
          <Reveal>
            <h2 className="cta-title">Ready to <em>write</em> something?</h2>
            <p className="cta-sub">Notebooks, journals and paper goods for the analog soul</p>
            <button className="btn-ink" onClick={() => onNav('shop')}>Shop All Products</button>
          </Reveal>
        </div>
      </section>
    </>
  )
}
