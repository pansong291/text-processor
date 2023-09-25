import React, { useEffect } from 'react'
import { App as AntdApp, ConfigProvider, theme } from 'antd'
import Content from '@/components/Content'
import { createGlobalStyle } from 'styled-components'
import { useTheme } from '@/components/ThemeProvider'
import zhCN from 'antd/locale/zh_CN'
import { useFuncConfig } from '@/components/FuncConfigMapProvider'
import { use$global } from '@/utils'

const App: React.FC = () => {
  const { dark } = useTheme()
  const { global } = useFuncConfig()

  useEffect(() => {
    use$global(global)
  }, [global])

  return (
    <ConfigProvider locale={zhCN} theme={{ algorithm: dark ? theme.darkAlgorithm : theme.defaultAlgorithm }}>
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
  }
`

export default App
