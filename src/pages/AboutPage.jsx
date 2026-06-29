export default function AboutPage({ onNav }) {
  return (
    <>
      <style>{`
        .about { padding-top: 100px; min-height: 100vh; }
        .about-hero {
          min-height: 55vh; display: flex; align-items: center; justify-content: center;
          text-align: center; background: var(--parch); border-bottom: 1.5px solid var(--ink);
          position: relative; overflow: hidden;
        }
        .about-hero::before {
          content:'';position:absolute;inset:0;
          background-image:repeating-linear-gradient(0deg,transparent,transparent 23px,rgba(28,26,22,0.04) 23px,rgba(28,26,22,0.04) 24px),repeating-linear-gradient(90deg,transparent,transparent 23px,rgba(28,26,22,0.04) 23px,rgba(28,26,22,0.04) 24px);
          pointer-events:none;
        }
        .about-hero-content { position:relative;z-index:1;padding:60px 20px; }
        .about-eyebrow {
          font-family:var(--type);font-size:10px;letter-spacing:0.3em;
          text-transform:uppercase;color:var(--wax);margin-bottom:16px;
        }
        .about-hero-title {
          font-family:var(--serif);font-size:clamp(40px,6vw,80px);
          font-weight:300;line-height:1.1;
        }
        .about-hero-title em { font-style:italic;color:var(--wax); }
        .about-section { padding:80px 0; }
        .about-section:nth-child(even) { background:var(--parch); border-top:1.5px solid var(--ink); border-bottom:1.5px solid var(--ink); }
        .about-grid { display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center; }
        .about-img-box {
          aspect-ratio:4/5;background:var(--parch);
          border:1.5px solid var(--ink);position:relative;overflow:hidden;
        }
        .about-img-box img { width:100%;height:100%;object-fit:cover; }
        .about-img-placeholder {
          width:100%;height:100%;display:flex;align-items:center;justify-content:center;
        }
        .about-content-eyebrow {
          font-family:var(--type);font-size:10px;letter-spacing:0.3em;
          text-transform:uppercase;color:var(--wax);margin-bottom:16px;
        }
        .about-content-title {
          font-family:var(--serif);font-size:clamp(28px,3vw,44px);
          font-weight:300;line-height:1.2;margin-bottom:22px;
        }
        .about-content-title em { font-style:italic; }
        .about-content-text {
          font-family:var(--type);font-size:12px;letter-spacing:0.04em;
          color:var(--ink-lt);line-height:1.9;margin-bottom:18px;
        }
        .about-values {
          display:grid;grid-template-columns:repeat(4,1fr);gap:0;
          border:1.5px solid var(--ink);margin:80px 0;
        }
        .about-value {
          padding:36px 28px;border-right:1.5px solid var(--ink);
          text-align:center;transition:background 0.2s;
        }
        .about-value:last-child { border-right:none; }
        .about-value:hover { background:var(--cream-dk); }
        .value-icon {
          font-family:var(--serif);font-size:32px;color:rgba(28,26,22,0.14);
          margin-bottom:14px;display:block;
        }
        .value-title {
          font-family:var(--type);font-size:10px;letter-spacing:0.18em;
          text-transform:uppercase;margin-bottom:10px;
        }
        .value-text {
          font-family:var(--type);font-size:10px;color:var(--ink-xs);
          line-height:1.65;
        }
        .about-cta {
          background:var(--ink);padding:80px 0;text-align:center;
          border-top:1.5px solid var(--wax);
        }
        .about-cta-title {
          font-family:var(--serif);font-size:clamp(28px,4vw,52px);
          font-weight:300;font-style:italic;color:var(--cream);margin-bottom:12px;
        }
        .about-cta-sub {
          font-family:var(--type);font-size:11px;letter-spacing:0.15em;
          color:rgba(237,232,223,0.4);margin-bottom:32px;
        }
        @media(max-width:768px) {
          .about-grid { grid-template-columns:1fr;gap:40px; }
          .about-values { grid-template-columns:repeat(2,1fr); }
          .about-value:nth-child(2) { border-right:none; }
          .about-value:nth-child(3) { border-top:1.5px solid var(--ink); }
        }
      `}</style>

      <div className="about">
        <div className="about-hero">
          <div className="about-hero-content">
            <div className="about-eyebrow">Our Story</div>
            <h1 className="about-hero-title">
              Made for hands<br/>that still <em>write.</em>
            </h1>
          </div>
        </div>

        <section className="about-section">
          <div className="container">
            <div className="about-grid">
              <div className="about-img-box">
                <div className="about-img-placeholder">
                  <svg width="100%" height="100%" viewBox="0 0 300 375" preserveAspectRatio="xMidYMid slice">
                    <rect width="300" height="375" fill="#e4ddd1"/>
                    <rect width="20" height="375" fill="rgba(28,26,22,0.06)"/>
                    {Array.from({length:18},(_,i)=><line key={i} x1="30" y1={40+i*18} x2="278" y2={40+i*18} stroke="rgba(28,26,22,0.07)" strokeWidth="0.8"/>)}
                    <text x="150" y="195" textAnchor="middle" fontSize="56" fill="rgba(28,26,22,0.06)" fontFamily="Georgia,serif" fontStyle="italic">V</text>
                  </svg>
                </div>
              </div>
              <div>
                <div className="about-content-eyebrow">The Beginning</div>
                <h2 className="about-content-title">
                  A store for those<br/>who <em>still write by hand</em>
                </h2>
                <p className="about-content-text">
                  VELLUM began as a simple frustration. In a world of apps, notifications
                  and endless screens, finding quality paper goods that actually deserved
                  your attention had become surprisingly difficult.
                </p>
                <p className="about-content-text">
                  We set out to build a curated collection of the things worth writing in,
                  drawing on and decorating with. Every product in the VELLUM range is
                  chosen for one reason — it makes the act of using it feel meaningful.
                </p>
                <p className="about-content-text">
                  Because some things are better on paper.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="about-section">
          <div className="container">
            <div className="about-values">
              {[
                {icon:'◻',title:'Quality First',text:'Every product is tested before it makes the range. If it does not write, draw or hold well, it does not get in.'},
                {icon:'◇',title:'Curated Range',text:'We carry fewer products, carefully chosen. Not everything, just the things worth keeping.'},
                {icon:'◈',title:'Paper People',text:'We are analog enthusiasts ourselves. Every choice we make comes from the perspective of someone who actually uses these things.'},
                {icon:'○',title:'Honest Pricing',text:'Good paper goods do not have to cost a fortune. We price fairly and transparently.'},
              ].map(v => (
                <div className="about-value" key={v.title}>
                  <span className="value-icon">{v.icon}</span>
                  <div className="value-title">{v.title}</div>
                  <div className="value-text">{v.text}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="about-cta">
          <div className="container">
            <div className="about-cta-title">Ready to write something?</div>
            <div className="about-cta-sub">Notebooks, journals and paper goods for the analog soul</div>
            <button className="btn-cream" onClick={() => onNav('shop')}>Shop All Products</button>
          </div>
        </div>
      </div>
    </>
  )
}
