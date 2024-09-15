import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import router from './router'
import './index.css'
import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from './Auth/AuthProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
    <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
)
