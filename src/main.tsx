import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App'
import './user-worker'
import './main.scss'
import { getStorage, use$global } from '@/utils'
import ThemeProvider from '@/components/ThemeContext'
import { FuncConfMap, OperatorConfig } from '@/types'

const globalOperatorList: Array<OperatorConfig> = getStorage('global-operator-list')
const globalConfigMap: FuncConfMap = {}
globalOperatorList?.forEach((oc) => {
  globalConfigMap[oc.id] = {
    declaration: oc.declaration,
    doc: oc.doc,
    definition: String(getStorage(`$global-${oc.id}`) || '')
  }
})
use$global(globalConfigMap)
window.$self = {}
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
)
