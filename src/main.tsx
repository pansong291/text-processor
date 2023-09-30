import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App'
import './user-worker'
import './main.scss'
import ThemeProvider from '@/components/context/ThemeProvider'
import StorageProvider from '@/components/context/StorageProvider'
import TestStringProvider from '@/components/context/TestStringProvider'

window.$self = {}
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <StorageProvider>
        <TestStringProvider>
          <App />
        </TestStringProvider>
      </StorageProvider>
    </ThemeProvider>
  </React.StrictMode>
)
