import React, { useEffect } from 'react'
import { App as AntdApp, ConfigProvider, theme } from 'antd'
import Content from '@/components/Content'
import { createGlobalStyle } from 'styled-components'
import { useTheme } from '@/components/context/ThemeProvider'
import zhCN from 'antd/locale/zh_CN'
import { useFuncConfig } from '@/components/context/StorageProvider'
import { use$global } from '@/utils'

const App: React.FC = () => {
  const { dark } = useTheme()
  const { globalFuncConfigMap } = useFuncConfig()

  useEffect(() => use$global(globalFuncConfigMap), [globalFuncConfigMap])

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{ algorithm: dark ? theme.darkAlgorithm : theme.defaultAlgorithm, token: { fontFamily: 'var(--font-family-mono)' } }}>
      <AntdApp>
        <GlobalStyle mode={dark ? 'dark' : 'light'} />
        <Content />
      </AntdApp>
    </ConfigProvider>
  )
}

const GlobalStyle = createGlobalStyle<{ mode: 'dark' | 'light' }>`
  body {
    --bg-color: var(--bg-color-${(props) => props.mode});
    --bg-color-inverse-rgb: var(--bg-color-inverse-${(props) => props.mode}-rgb);
    --border-color: var(--border-color-${(props) => props.mode});
  }
`

export default App
