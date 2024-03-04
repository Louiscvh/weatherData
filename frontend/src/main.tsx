import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import {AuthProvider} from "@/context/AuthContext.tsx";
import {ThemeProvider} from "@/components/theme-provider.tsx";
import { Toaster } from "@/components/ui/sonner"

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <AuthProvider>
              <Toaster />
              <App />
          </AuthProvider>
      </ThemeProvider>
  </React.StrictMode>,
)
