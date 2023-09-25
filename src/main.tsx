import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App'
import './user-worker'
import './main.scss'
import ThemeProvider from '@/components/ThemeProvider'
import FuncConfigMapProvider from '@/components/FuncConfigMapProvider'

window.$self = {}
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <FuncConfigMapProvider>
        <App />
      </FuncConfigMapProvider>
    </ThemeProvider>
  </React.StrictMode>
)
