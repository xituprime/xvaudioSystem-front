import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { QuoteCartProvider } from './context/QuoteCartContext'
import SessionExpiredModal from './components/SessionExpiredModal'
import App from './App'
import './index.css'

// Chrome/Edge + Vite HMR: aviso benigno del ResizeObserver; no es fallo de la app.
if (import.meta.env.DEV) {
  const re = /ResizeObserver loop/i
  window.addEventListener(
    'error',
    (e) => {
      if (typeof e.message === 'string' && re.test(e.message)) {
        e.stopImmediatePropagation()
      }
    },
    true,
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AuthProvider>
        <QuoteCartProvider>
          <SessionExpiredModal />
          <App />
        </QuoteCartProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1e293b',
              color: '#f1f5f9',
              border: '1px solid #334155',
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
