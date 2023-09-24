import React from 'react'
import { App as AntdApp, ConfigProvider, theme } from 'antd'
import Content from '@/components/Content'
import { createGlobalStyle } from 'styled-components'
import { useTheme } from '@/components/ThemeContext'
import zhCN from 'antd/locale/zh_CN'

const App: React.FC = () => {
  const { dark } = useTheme()

  return (
    <ConfigProvider locale={zhCN} theme={{ algorithm: dark ? theme.darkAlgorithm : theme.defaultAlgorithm }}>
      <AntdApp>
        <GlobalStyle mode={dark ? 'dark' : 'light'} />
        <Content />
      </AntdApp>
    </ConfigProvider>
  )
}

const GlobalStyle = createGlobalStyle<{ mode: string }>`
  body {
    --bg-color: var(--bg-color-${(props) => props.mode});
    --bg-color-inverse-rgb: var(--bg-color-inverse-${(props) => props.mode}-rgb);
  }
`

export default App
