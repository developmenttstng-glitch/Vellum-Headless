import { useEffect, useState, useRef } from 'react'

export default function CallbackPage({ handleCallback }) {
  const [status, setStatus] = useState('processing')
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current) return
    ran.current = true

    handleCallback().then(success => {
      if (success) {
        setStatus('success')
        setTimeout(() => window.location.replace('/?account=1'), 800)
      } else {
        setStatus('error')
        setTimeout(() => window.location.replace('/'), 2500)
      }
    }).catch(() => {
      setStatus('error')
      setTimeout(() => window.location.replace('/'), 2500)
    })
  }, [])

  return (
    <div style={{
      minHeight:'100vh', display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center', gap:24,
      background:'var(--cream)', fontFamily:'var(--serif)',
    }}>
      <div style={{fontFamily:'var(--type)',fontSize:20,letterSpacing:'0.4em',textTransform:'uppercase'}}>
        Vellum
      </div>

      {status === 'processing' && (
        <>
          <div style={{
            width:36, height:36,
            border:'1.5px solid rgba(28,26,22,0.15)',
            borderTop:'1.5px solid var(--wax)',
            borderRadius:'50%',
            animation:'spin 1s linear infinite',
          }}/>
          <div style={{fontFamily:'var(--type)',fontSize:10,letterSpacing:'0.25em',color:'var(--ink-xs)',textTransform:'uppercase'}}>
            Signing you in...
          </div>
        </>
      )}

      {status === 'success' && (
        <>
          <div style={{fontFamily:'var(--serif)',fontSize:48,fontStyle:'italic',color:'var(--wax)'}}>✓</div>
          <div style={{fontFamily:'var(--type)',fontSize:10,letterSpacing:'0.25em',color:'var(--ink-xs)',textTransform:'uppercase'}}>
            Welcome back
          </div>
        </>
      )}

      {status === 'error' && (
        <>
          <div style={{fontFamily:'var(--serif)',fontSize:48,fontStyle:'italic',color:'var(--ink-xs)'}}>✕</div>
          <div style={{fontFamily:'var(--type)',fontSize:10,letterSpacing:'0.25em',color:'var(--ink-xs)',textTransform:'uppercase'}}>
            Sign in failed — redirecting
          </div>
        </>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
