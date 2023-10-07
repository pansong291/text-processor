import React, { useEffect } from 'react'
import { App as AntdApp, ConfigProvider, theme } from 'antd'
import Content from '@/components/Content'
import { useTheme } from '@/components/context/ThemeProvider'
import zhCN from 'antd/locale/zh_CN'
import { useFuncConfig } from '@/components/context/StorageProvider'
import { use$global } from '@/utils'

const App: React.FC = () => {
  const { dark } = useTheme()
  const { globalFuncConfigMap } = useFuncConfig()

  useEffect(() => use$global(globalFuncConfigMap), [globalFuncConfigMap])

  useEffect(() => {
    document.documentElement.dataset['theme'] = dark ? 'dark' : 'light'
  }, [dark])

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{ algorithm: dark ? theme.darkAlgorithm : theme.defaultAlgorithm, token: { fontFamily: 'var(--font-family-mono)' } }}>
      <AntdApp>
        <Content />
      </AntdApp>
    </ConfigProvider>
  )
}

export default App
