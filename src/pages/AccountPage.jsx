import { useState, useEffect } from 'react'
import { formatPrice } from '../lib/currency'

export default function AccountPage({ customer, onLogout, fetchOrders, onNav }) {
  const [tab,         setTab]         = useState('profile')
  const [orders,      setOrders]      = useState([])
  const [loading,     setLoading]     = useState(false)
  const [activeOrder, setActiveOrder] = useState(null)

  useEffect(() => {
    if (tab === 'orders' && orders.length === 0) {
      setLoading(true)
      fetchOrders().then(o => { setOrders(o); setLoading(false) })
    }
  }, [tab])

  function fmt(d) {
    return new Date(d).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })
  }

  function money(obj) {
    if (!obj) return '—'
    return formatPrice(obj.amount, obj.currencyCode)
  }

  function statusColor(s) {
    if (!s) return 'var(--ink-xs)'
    const sl = s.toLowerCase()
    if (sl.includes('paid')||sl.includes('fulfilled')||sl.includes('delivered')) return 'var(--sage)'
    if (sl.includes('pending')||sl.includes('partial')) return '#b8860b'
    if (sl.includes('refund')||sl.includes('cancel')) return 'var(--wax)'
    return 'var(--ink-xs)'
  }

  return (
    <>
      <style>{`
        .acc { padding-top: 100px; min-height: 100vh; }
        .acc-hero {
          padding: 56px 0 40px; border-bottom: 1.5px solid var(--ink);
          background: var(--parch); position: relative; overflow: hidden;
        }
        .acc-hero::before {
          content:'';position:absolute;inset:0;
          background-image:repeating-linear-gradient(0deg,transparent,transparent 23px,rgba(28,26,22,0.04) 23px,rgba(28,26,22,0.04) 24px),repeating-linear-gradient(90deg,transparent,transparent 23px,rgba(28,26,22,0.04) 23px,rgba(28,26,22,0.04) 24px);
          pointer-events:none;
        }
        .acc-eyebrow {
          font-family:var(--type);font-size:10px;letter-spacing:0.28em;
          text-transform:uppercase;color:var(--wax);margin-bottom:12px;
          position:relative;
        }
        .acc-title {
          font-family:var(--serif);font-size:clamp(32px,4vw,52px);
          font-weight:300;font-style:italic;margin-bottom:4px;position:relative;
        }
        .acc-email {
          font-family:var(--type);font-size:11px;letter-spacing:0.08em;
          color:var(--ink-xs);position:relative;
        }
        .acc-layout {
          display:grid;grid-template-columns:220px 1fr;min-height:60vh;
        }
        .acc-sidebar {
          border-right:1.5px solid var(--ink);padding:40px 0;
          background:var(--cream);
        }
        .sidebar-btn {
          display:block;width:100%;text-align:left;
          font-family:var(--type);font-size:10px;letter-spacing:0.18em;
          text-transform:uppercase;padding:12px 32px;background:none;
          border:none;color:var(--ink-xs);cursor:pointer;transition:all 0.2s;
          border-left:2px solid transparent;
        }
        .sidebar-btn:hover { color:var(--ink); }
        .sidebar-btn.active { color:var(--ink);border-left-color:var(--wax); }
        .sidebar-sep { border:none;border-top:1px solid rgba(28,26,22,0.1);margin:16px 0; }
        .sidebar-logout {
          display:block;width:100%;text-align:left;
          font-family:var(--type);font-size:10px;letter-spacing:0.18em;
          text-transform:uppercase;padding:12px 32px;background:none;
          border:none;color:var(--ink-xs);cursor:pointer;transition:color 0.2s;
        }
        .sidebar-logout:hover { color:var(--wax); }
        .acc-content { padding:40px 48px; }

        /* Profile */
        .profile-avatar {
          width:60px;height:60px;border-radius:50%;
          background:var(--parch);border:1.5px solid var(--ink);
          display:flex;align-items:center;justify-content:center;
          font-family:var(--serif);font-size:22px;font-style:italic;
          color:var(--wax);margin-bottom:16px;
        }
        .profile-name {
          font-family:var(--serif);font-size:24px;font-weight:300;
          font-style:italic;margin-bottom:4px;
        }
        .profile-email {
          font-family:var(--type);font-size:12px;color:var(--ink-xs);
          letter-spacing:0.06em;margin-bottom:28px;
        }
        .profile-card { border:1.5px solid var(--ink);max-width:480px; }
        .profile-row {
          display:flex;justify-content:space-between;align-items:center;
          padding:14px 20px;border-bottom:1px solid rgba(28,26,22,0.1);
          font-family:var(--type);font-size:12px;
        }
        .profile-row:last-child { border-bottom:none; }
        .profile-lbl {
          font-size:9px;letter-spacing:0.18em;text-transform:uppercase;color:var(--ink-xs);
        }
        .profile-val { color:var(--ink); }

        /* Orders */
        .orders-empty { padding:60px 0;text-align:center; }
        .orders-empty-icon {
          font-family:var(--serif);font-size:56px;font-style:italic;
          color:rgba(28,26,22,0.08);margin-bottom:16px;
        }
        .orders-empty-text {
          font-family:var(--type);font-size:10px;letter-spacing:0.2em;
          text-transform:uppercase;color:var(--ink-xs);margin-bottom:24px;
        }
        .order-card {
          border:1.5px solid var(--ink);margin-bottom:12px;
          cursor:pointer;transition:background 0.2s;
        }
        .order-card:hover { background:var(--cream-dk); }
        .order-header {
          display:flex;align-items:center;gap:14px;
          padding:16px 20px;border-bottom:1px solid rgba(28,26,22,0.1);flex-wrap:wrap;
        }
        .order-num {
          font-family:var(--serif);font-size:18px;font-weight:300;font-style:italic;
        }
        .order-date { font-family:var(--type);font-size:11px;color:var(--ink-xs); }
        .order-badge {
          font-family:var(--type);font-size:9px;letter-spacing:0.12em;
          text-transform:uppercase;padding:3px 10px;border:1.5px solid;
        }
        .order-total {
          font-family:var(--serif);font-size:18px;font-weight:300;margin-left:auto;
        }
        .order-items { padding:12px 20px; }
        .order-item-row {
          font-family:var(--type);font-size:11px;color:var(--ink-xs);padding:2px 0;
        }
        .order-actions {
          padding:12px 20px;border-top:1px solid rgba(28,26,22,0.1);
        }
        .order-view-btn {
          font-family:var(--type);font-size:10px;letter-spacing:0.15em;
          text-transform:uppercase;padding:8px 16px;
          border:1.5px solid rgba(28,26,22,0.2);background:none;
          color:var(--ink);cursor:pointer;transition:all 0.15s;
        }
        .order-view-btn:hover { border-color:var(--wax);color:var(--wax); }

        /* Order detail modal */
        .od-overlay {
          position:fixed;inset:0;background:rgba(28,26,22,0.5);
          z-index:500;display:flex;align-items:center;justify-content:center;
          padding:20px;backdrop-filter:blur(4px);animation:fadeIn 0.2s ease;
        }
        .od-modal {
          background:var(--cream);width:100%;max-width:680px;
          max-height:90vh;overflow-y:auto;position:relative;
          border:1.5px solid var(--ink);animation:fadeUp 0.3s ease;
        }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
        .od-close {
          position:absolute;top:16px;right:20px;
          background:none;border:none;font-size:24px;
          cursor:pointer;color:var(--ink-xs);font-family:var(--serif);
          transition:color 0.2s;z-index:1;
        }
        .od-close:hover { color:var(--ink); }
        .od-header { padding:32px;border-bottom:1.5px solid var(--ink); }
        .od-title {
          font-family:var(--serif);font-size:24px;font-weight:300;font-style:italic;margin-bottom:4px;
        }
        .od-date { font-family:var(--type);font-size:11px;color:var(--ink-xs);margin-bottom:12px; }
        .od-badges { display:flex;gap:8px;flex-wrap:wrap; }
        .od-body { padding:28px 32px;display:flex;flex-direction:column;gap:24px; }
        .od-section-label {
          font-family:var(--type);font-size:10px;letter-spacing:0.22em;
          text-transform:uppercase;color:var(--wax);margin-bottom:12px;
          padding-bottom:8px;border-bottom:1px solid rgba(28,26,22,0.1);
        }
        .od-table { width:100%;border-collapse:collapse; }
        .od-table th {
          font-family:var(--type);font-size:9px;letter-spacing:0.15em;
          text-transform:uppercase;color:var(--ink-xs);
          padding:8px 12px;text-align:left;
          border-bottom:1.5px solid var(--ink);background:var(--parch);
        }
        .od-table td {
          font-family:var(--type);font-size:12px;
          padding:12px;border-bottom:1px solid rgba(28,26,22,0.08);
          vertical-align:top;
        }
        .od-totals {
          background:var(--parch);border:1.5px solid var(--ink);padding:16px 20px;
        }
        .od-total-row {
          display:flex;justify-content:space-between;
          padding:4px 0;font-family:var(--type);font-size:12px;
        }
        .od-total-lbl { color:var(--ink-xs); }
        .od-total-row.grand {
          border-top:1px solid rgba(28,26,22,0.15);
          margin-top:8px;padding-top:10px;
        }
        .od-total-row.grand .od-total-lbl { color:var(--ink);font-weight:500; }
        .od-total-row.grand .od-total-val {
          font-family:var(--serif);font-size:20px;font-weight:300;
        }
        .od-two-col { display:grid;grid-template-columns:1fr 1fr;gap:20px; }
        .od-address {
          font-family:var(--type);font-size:12px;color:var(--ink);line-height:1.8;
        }
        .od-fulfillment {
          background:var(--parch);border:1.5px solid var(--ink);padding:16px;
        }
        .od-track-link {
          font-family:var(--type);font-size:9px;letter-spacing:0.12em;
          text-transform:uppercase;padding:4px 12px;
          border:1.5px solid var(--wax);color:var(--wax);
          background:none;cursor:pointer;text-decoration:none;
          transition:all 0.15s;display:inline-block;margin-top:8px;
        }
        .od-track-link:hover { background:var(--wax);color:var(--cream); }

        @media(max-width:768px) {
          .acc-layout { grid-template-columns:1fr; }
          .acc-sidebar { border-right:none;border-bottom:1.5px solid var(--ink);display:flex;flex-wrap:wrap;padding:10px 0; }
          .sidebar-btn { width:auto;border-left:none;border-bottom:2px solid transparent; }
          .sidebar-btn.active { border-bottom-color:var(--wax);border-left-color:transparent; }
          .acc-content { padding:24px 20px; }
          .od-two-col { grid-template-columns:1fr; }
        }
      `}</style>

      <div className="acc">
        <div className="acc-hero">
          <div className="container">
            <div className="acc-eyebrow">My Account</div>
            <div className="acc-title">Welcome, {customer.firstName || customer.name}</div>
            <div className="acc-email">{customer.email}</div>
          </div>
        </div>

        <div className="acc-layout">
          <div className="acc-sidebar">
            <button className={`sidebar-btn ${tab==='profile'?'active':''}`} onClick={()=>setTab('profile')}>Profile</button>
            <button className={`sidebar-btn ${tab==='orders'?'active':''}`}  onClick={()=>setTab('orders')}>Orders</button>
            <hr className="sidebar-sep"/>
            <button className="sidebar-logout" onClick={onLogout}>Sign Out</button>
          </div>

          <div className="acc-content">
            {/* Profile tab */}
            {tab === 'profile' && (
              <div>
                <div className="profile-avatar">
                  {(customer.firstName||customer.email||'V')[0].toUpperCase()}
                </div>
                <div className="profile-name">{customer.firstName} {customer.lastName}</div>
                <div className="profile-email">{customer.email}</div>
                <div className="profile-card">
                  {[
                    ['First Name', customer.firstName||'—'],
                    ['Last Name',  customer.lastName||'—'],
                    ['Email',      customer.email||'—'],
                    ['Account ID', customer.id?.split('/').pop()||'—'],
                  ].map(([l,v]) => (
                    <div className="profile-row" key={l}>
                      <span className="profile-lbl">{l}</span>
                      <span className="profile-val">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Orders tab */}
            {tab === 'orders' && (
              <div>
                {loading ? (
                  <div style={{padding:'40px 0',textAlign:'center',fontFamily:'var(--type)',fontSize:10,letterSpacing:'0.22em',color:'var(--ink-xs)',textTransform:'uppercase'}}>
                    Loading orders...
                  </div>
                ) : orders.length === 0 ? (
                  <div className="orders-empty">
                    <div className="orders-empty-icon">V</div>
                    <div className="orders-empty-text">No orders yet</div>
                    <button className="btn-ink" onClick={() => onNav('shop')}>Start Shopping</button>
                  </div>
                ) : orders.map(order => (
                  <div className="order-card" key={order.id}>
                    <div className="order-header">
                      <div>
                        <div className="order-num">{order.name}</div>
                        <div className="order-date">{fmt(order.processedAt)}</div>
                      </div>
                      <span className="order-badge" style={{color:statusColor(order.financialStatus),borderColor:statusColor(order.financialStatus)}}>
                        {order.financialStatus}
                      </span>
                      <span className="order-badge" style={{color:statusColor(order.fulfillmentStatus),borderColor:statusColor(order.fulfillmentStatus)}}>
                        {order.fulfillmentStatus}
                      </span>
                      <div className="order-total">{money(order.totalPrice)}</div>
                    </div>
                    <div className="order-items">
                      {(order.lineItems?.nodes||[]).slice(0,2).map((item,i)=>(
                        <div className="order-item-row" key={i}>{item.title} × {item.quantity}</div>
                      ))}
                      {(order.lineItems?.nodes||[]).length > 2 && (
                        <div className="order-item-row" style={{color:'var(--wax)'}}>
                          +{order.lineItems.nodes.length-2} more items
                        </div>
                      )}
                    </div>
                    <div className="order-actions">
                      <button className="order-view-btn" onClick={() => setActiveOrder(order)}>
                        View Details →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order detail modal */}
      {activeOrder && (
        <div className="od-overlay" onClick={() => setActiveOrder(null)}>
          <div className="od-modal" onClick={e => e.stopPropagation()}>
            <button className="od-close" onClick={() => setActiveOrder(null)}>×</button>
            <div className="od-header">
              <div className="od-title">Order {activeOrder.name}</div>
              <div className="od-date">Placed on {fmt(activeOrder.processedAt)}</div>
              <div className="od-badges">
                <span className="order-badge" style={{color:statusColor(activeOrder.financialStatus),borderColor:statusColor(activeOrder.financialStatus)}}>{activeOrder.financialStatus}</span>
                <span className="order-badge" style={{color:statusColor(activeOrder.fulfillmentStatus),borderColor:statusColor(activeOrder.fulfillmentStatus)}}>{activeOrder.fulfillmentStatus}</span>
              </div>
            </div>
            <div className="od-body">
              {/* Items */}
              <div>
                <div className="od-section-label">Items Ordered</div>
                <table className="od-table">
                  <thead><tr><th>Product</th><th>Qty</th></tr></thead>
                  <tbody>
                    {(activeOrder.lineItems?.nodes||[]).map((item,i) => (
                      <tr key={i}>
                        <td>
                          <div>{item.title}</div>
                          {item.variantTitle && item.variantTitle !== 'Default Title' && (
                            <div style={{fontSize:10,color:'var(--ink-xs)',marginTop:2}}>{item.variantTitle}</div>
                          )}
                        </td>
                        <td style={{textAlign:'center'}}>{item.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div>
                <div className="od-section-label">Order Total</div>
                <div className="od-totals">
                  {activeOrder.totalShipping && (
                    <div className="od-total-row"><span className="od-total-lbl">Shipping</span><span>{money(activeOrder.totalShipping)}</span></div>
                  )}
                  {activeOrder.totalTax && parseFloat(activeOrder.totalTax.amount) > 0 && (
                    <div className="od-total-row"><span className="od-total-lbl">Tax</span><span>{money(activeOrder.totalTax)}</span></div>
                  )}
                  <div className="od-total-row grand">
                    <span className="od-total-lbl">Total</span>
                    <span className="od-total-val">{money(activeOrder.totalPrice)}</span>
                  </div>
                </div>
              </div>

              {/* Shipping + Fulfillment */}
              <div className="od-two-col">
                {activeOrder.shippingAddress && (
                  <div>
                    <div className="od-section-label">Shipping Address</div>
                    <div className="od-address">
                      {activeOrder.shippingAddress.firstName} {activeOrder.shippingAddress.lastName}<br/>
                      {activeOrder.shippingAddress.address1}<br/>
                      {activeOrder.shippingAddress.address2 && <>{activeOrder.shippingAddress.address2}<br/></>}
                      {activeOrder.shippingAddress.city}, {activeOrder.shippingAddress.province} {activeOrder.shippingAddress.zip}<br/>
                      {activeOrder.shippingAddress.country}
                    </div>
                  </div>
                )}
                <div>
                  <div className="od-section-label">Fulfillment</div>
                  {(activeOrder.fulfillments?.nodes||[]).length === 0 ? (
                    <div style={{fontFamily:'var(--type)',fontSize:12,color:'var(--ink-xs)'}}>Not yet fulfilled</div>
                  ) : activeOrder.fulfillments.nodes.map((f,i) => (
                    <div className="od-fulfillment" key={i}>
                      <div style={{fontFamily:'var(--type)',fontSize:10,letterSpacing:'0.12em',textTransform:'uppercase',color:statusColor(f.status)}}>{f.status}</div>
                      {f.estimatedDeliveryAt && (
                        <div style={{fontFamily:'var(--type)',fontSize:11,color:'var(--ink-xs)',marginTop:4}}>Est. {fmt(f.estimatedDeliveryAt)}</div>
                      )}
                      {(f.trackingInformation||[]).map((t,j) => (
                        <div key={j} style={{marginTop:8}}>
                          {t.company && <div style={{fontFamily:'var(--type)',fontSize:11,color:'var(--ink-xs)'}}>{t.company} · {t.number}</div>}
                          {t.url && <a href={t.url} target="_blank" rel="noreferrer" className="od-track-link">Track Package →</a>}
                        </div>
                      ))}
                      {(!f.trackingInformation||f.trackingInformation.length===0) && (
                        <div style={{fontFamily:'var(--type)',fontSize:11,color:'var(--ink-xs)',marginTop:4}}>No tracking yet</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
