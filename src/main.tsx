import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import SuperAdminApp from './SuperAdminApp.tsx'
import { ThemeProvider } from './context/ThemeContext'
import { PermissionProvider } from './context/PermissionContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <PermissionProvider>
        <SuperAdminApp />
      </PermissionProvider>
    </ThemeProvider>
  </StrictMode>,
)
