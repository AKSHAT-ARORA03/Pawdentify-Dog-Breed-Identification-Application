import React from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from './auth/AuthContext'
import AppRoutes from './AppRoutes.jsx'
import './styles.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  </React.StrictMode>
)
