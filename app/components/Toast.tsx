'use client'

import { useEffect } from 'react'
import { CheckCircle2 } from 'lucide-react'

interface ToastProps {
  message: string
  onClose: () => void
}

export default function Toast({ message, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 10000,
      background: 'var(--surface)',
      border: '1px solid var(--divider)',
      padding: '24px 32px',
      borderRadius: '24px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '12px',
      boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
      animation: 'toast-in 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28)'
    }}>
      <div style={{ color: '#00c853' }}>
        <CheckCircle2 size={48} />
      </div>
      <p style={{ 
        fontSize: '16px', 
        fontWeight: 700, 
        textAlign: 'center',
        color: 'var(--text)' 
      }}>
        {message}
      </p>

      <style jsx>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translate(-50%, -40%) scale(0.9); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>
    </div>
  )
}