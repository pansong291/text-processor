import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App'
import './user-worker'
import './main.scss'
import ThemeProvider from '@/components/context/ThemeProvider'
import StorageProvider from '@/components/context/StorageProvider'

window.$self = {}
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <StorageProvider>
        <App />
      </StorageProvider>
    </ThemeProvider>
  </React.StrictMode>
)
