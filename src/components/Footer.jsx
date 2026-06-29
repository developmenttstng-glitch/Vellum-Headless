export default function Footer({ onNav }) {
  return (
    <>
      <style>{`
        .footer {
          background: var(--ink);
          border-top: 1.5px solid var(--wax);
          padding: 56px 48px 32px;
        }
        .footer-grid {
          display: grid; grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 48px; margin-bottom: 48px;
        }
        .footer-logo {
          display: flex; align-items: center; gap: 10px; margin-bottom: 16px; cursor: pointer;
        }
        .footer-logo-text {
          font-family: var(--type); font-size: 18px; letter-spacing: 0.4em;
          text-transform: uppercase; color: var(--cream);
        }
        .footer-tagline {
          font-family: var(--type); font-size: 10px; letter-spacing: 0.08em;
          color: rgba(237,232,223,0.35); line-height: 1.8; max-width: 240px;
        }
        .footer-col-title {
          font-family: var(--type); font-size: 9px; letter-spacing: 0.28em;
          text-transform: uppercase; color: var(--wax); margin-bottom: 18px;
        }
        .footer-links { display: flex; flex-direction: column; gap: 10px; }
        .footer-link {
          font-family: var(--type); font-size: 10px; letter-spacing: 0.1em;
          color: rgba(237,232,223,0.5); background: none; border: none;
          cursor: pointer; text-align: left; padding: 0; transition: color 0.2s;
        }
        .footer-link:hover { color: var(--cream); }
        .footer-bottom {
          border-top: 1px solid rgba(237,232,223,0.08); padding-top: 24px;
          display: flex; justify-content: space-between; align-items: center;
        }
        .footer-copy {
          font-family: var(--type); font-size: 9px; letter-spacing: 0.1em;
          color: rgba(237,232,223,0.2);
        }
        .footer-bottom-links { display: flex; gap: 20px; }
        .footer-bottom-link {
          font-family: var(--type); font-size: 9px; letter-spacing: 0.1em;
          color: rgba(237,232,223,0.2); background: none; border: none;
          cursor: pointer; transition: color 0.2s;
        }
        .footer-bottom-link:hover { color: rgba(237,232,223,0.5); }
        @media (max-width: 768px) {
          .footer-grid { grid-template-columns: 1fr 1fr; gap: 32px; }
          .footer-bottom { flex-direction: column; gap: 12px; text-align: center; }
          .footer { padding: 40px 20px 24px; }
        }
        @media (max-width: 480px) {
          .footer-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <footer className="footer">
        <div className="footer-grid">
          <div>
            <div className="footer-logo" onClick={() => onNav('home')}>
              <div className="wax-seal" style={{background:'var(--wax)'}}>V</div>
              <div className="footer-logo-text">Vellum</div>
            </div>
            <p className="footer-tagline">
              Paper goods worth keeping. Notebooks, journals,
              washi tape and stationery for the analog soul.
            </p>
          </div>
          <div>
            <div className="footer-col-title">Shop</div>
            <div className="footer-links">
              <button className="footer-link" onClick={() => onNav('shop')}>All Products</button>
              <button className="footer-link" onClick={() => onNav('collection','write')}>Write</button>
              <button className="footer-link" onClick={() => onNav('collection','draw')}>Draw</button>
              <button className="footer-link" onClick={() => onNav('collection','organize')}>Organize</button>
              <button className="footer-link" onClick={() => onNav('collection','decorate')}>Decorate</button>
            </div>
          </div>
          <div>
            <div className="footer-col-title">Company</div>
            <div className="footer-links">
              <button className="footer-link" onClick={() => onNav('about')}>Our Story</button>
              <button className="footer-link">Sustainability</button>
              <button className="footer-link">Press</button>
              <button className="footer-link">Careers</button>
            </div>
          </div>
          <div>
            <div className="footer-col-title">Support</div>
            <div className="footer-links">
              <button className="footer-link">FAQ</button>
              <button className="footer-link">Shipping</button>
              <button className="footer-link">Returns</button>
              <button className="footer-link">Contact</button>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-copy">© 2025 VELLUM. All rights reserved.</div>
          <div className="footer-bottom-links">
            <button className="footer-bottom-link">Privacy</button>
            <button className="footer-bottom-link">Terms</button>
            <button className="footer-bottom-link">Cookies</button>
          </div>
        </div>
      </footer>
    </>
  )
}
