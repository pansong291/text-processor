import React, { useState } from 'react'
import { App as AntdApp, ConfigProvider, theme } from 'antd'
import Content from '@/components/Content'
import { createGlobalStyle } from 'styled-components'

const App: React.FC = () => {
  const [dark, setDark] = useState<boolean>(window.utools?.isDarkColors() || false)

  return (
    <ConfigProvider theme={{ algorithm: dark ? theme.darkAlgorithm : theme.defaultAlgorithm }}>
      <AntdApp>
        <GlobalStyle dark={dark} />
        <Content dark={dark} setDark={setDark} />
      </AntdApp>
    </ConfigProvider>
  )
}

const GlobalStyle = createGlobalStyle<{ dark: boolean }>`
  body {
    background: ${(props) => (props.dark ? '#141414' : '#fff')};
  }
`

export default App
