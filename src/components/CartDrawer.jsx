import { formatPrice } from '../lib/currency'

export default function CartDrawer({ lines, totalPrice, currency, onClose, onCheckout, loading, onUpdateQuantity, onRemoveLine }) {
  return (
    <>
      <style>{`
        .cart-overlay {
          position: fixed; inset: 0; background: rgba(28,26,22,0.4);
          z-index: 300; backdrop-filter: blur(3px);
          animation: fadeIn 0.25s ease;
        }
        .cart-drawer {
          position: fixed; right: 0; top: 0; bottom: 0; width: 400px;
          background: var(--cream); z-index: 301;
          display: flex; flex-direction: column;
          border-left: 1.5px solid var(--ink);
          animation: slideIn 0.35s var(--slow);
          box-shadow: -8px 0 40px rgba(0,0,0,0.1);
        }
        @keyframes slideIn { from { transform: translateX(100%) } to { transform: translateX(0) } }
        .cart-header {
          padding: 24px 32px; border-bottom: 1.5px solid var(--ink);
          display: flex; justify-content: space-between; align-items: center;
        }
        .cart-title { font-family: var(--type); font-size: 11px; letter-spacing: 0.3em; text-transform: uppercase; }
        .cart-close { background: none; border: none; font-size: 24px; cursor: pointer; font-family: var(--serif); color: var(--ink-lt); transition: color 0.2s; }
        .cart-close:hover { color: var(--ink); }
        .cart-body { flex: 1; overflow-y: auto; padding: 24px 32px; }
        .cart-empty { text-align: center; padding: 60px 0; font-family: var(--type); font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--ink-xs); }
        .cart-empty-icon { font-family: var(--serif); font-size: 56px; font-style: italic; color: rgba(28,26,22,0.1); margin-bottom: 16px; }
        .cart-item { display: flex; gap: 14px; padding: 18px 0; border-bottom: 1px solid rgba(28,26,22,0.1); }
        .cart-item-img { width: 64px; height: 80px; flex-shrink: 0; background: var(--parch); border: 1px solid rgba(28,26,22,0.15); overflow: hidden; }
        .cart-item-img img { width:100%;height:100%;object-fit:cover; }
        .cart-item-name { font-size: 13px; font-style: italic; margin-bottom: 3px; }
        .cart-item-variant { font-family: var(--type); font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-xs); margin-bottom: 8px; }
        .cart-item-price { font-family: var(--type); font-size: 12px; color: var(--wax); }
        .cart-controls { display: flex; align-items: center; gap: 0; margin-top: 10px; }
        .qty-btn { width: 26px; height: 26px; border: 1px solid rgba(28,26,22,0.2); background: none; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center; transition: all 0.15s; }
        .qty-btn:hover { border-color: var(--ink); background: var(--ink); color: var(--cream); }
        .qty-num { width: 32px; height: 26px; border-top: 1px solid rgba(28,26,22,0.2); border-bottom: 1px solid rgba(28,26,22,0.2); display: flex; align-items: center; justify-content: center; font-family: var(--type); font-size: 12px; }
        .remove-btn { margin-left: 10px; background: none; border: none; font-size: 16px; cursor: pointer; color: var(--ink-xs); transition: color 0.15s; font-family: var(--serif); }
        .remove-btn:hover { color: var(--wax); }
        .cart-footer { padding: 24px 32px; border-top: 1.5px solid var(--ink); }
        .cart-total { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 20px; }
        .cart-total-label { font-family: var(--type); font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--ink-xs); }
        .cart-total-val { font-family: var(--serif); font-size: 28px; font-weight: 300; }
        .checkout-btn { width: 100%; padding: 16px; background: var(--ink); color: var(--cream); border: none; font-family: var(--type); font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase; cursor: pointer; transition: background 0.2s; box-shadow: 3px 3px 0 var(--wax); }
        .checkout-btn:hover { background: var(--wax); }
        .checkout-btn:disabled { opacity: 0.5; cursor: not-allowed; box-shadow: none; }
        @media (max-width: 480px) { .cart-drawer { width: 100%; } }
      `}</style>

      <div className="cart-overlay" onClick={onClose}/>
      <div className="cart-drawer">
        <div className="cart-header">
          <div className="cart-title">Your Cart — {lines.reduce((s,l)=>s+l.quantity,0)} items</div>
          <button className="cart-close" onClick={onClose}>×</button>
        </div>

        <div className="cart-body">
          {lines.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-icon">V</div>
              Your cart is empty
            </div>
          ) : lines.map(line => (
            <div className="cart-item" key={line.id}>
              <div className="cart-item-img">
                {line.merchandise?.product?.featuredImage
                  ? <img src={line.merchandise.product.featuredImage.url} alt={line.merchandise.product.title}/>
                  : null
                }
              </div>
              <div style={{flex:1}}>
                <div className="cart-item-name">{line.merchandise.product.title}</div>
                {line.merchandise.title !== 'Default Title' && (
                  <div className="cart-item-variant">{line.merchandise.title}</div>
                )}
                <div className="cart-item-price">
                  {formatPrice(line.merchandise.price.amount, line.merchandise.price.currencyCode)}
                </div>
                <div className="cart-controls">
                  <button className="qty-btn"
                    onClick={() => line.quantity > 1
                      ? onUpdateQuantity(line.id, line.quantity - 1)
                      : onRemoveLine(line.id)}>−</button>
                  <div className="qty-num">{line.quantity}</div>
                  <button className="qty-btn"
                    onClick={() => onUpdateQuantity(line.id, line.quantity + 1)}>+</button>
                  <button className="remove-btn" onClick={() => onRemoveLine(line.id)}>×</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-footer">
          <div className="cart-total">
            <span className="cart-total-label">Total</span>
            <span className="cart-total-val">{formatPrice(totalPrice, currency)}</span>
          </div>
          <button className="checkout-btn" onClick={onCheckout}
            disabled={lines.length === 0 || loading}>
            {loading ? 'Processing...' : 'Proceed to Checkout'}
          </button>
        </div>
      </div>
    </>
  )
}
