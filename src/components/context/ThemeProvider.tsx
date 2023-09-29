import React, { createContext, useContext } from 'react'
import { useUpdater } from '@/utils'
import { Processor } from '@/types/base'

const ThemeContext = createContext<{ dark: boolean; setDark: React.Dispatch<Processor<boolean>> }>({
  dark: false,
  setDark() {}
})

const ThemeProvider: React.FC<React.PropsWithChildren> = (props) => {
  const [dark, setDark] = useUpdater(window.utools?.isDarkColors() || false)
  return <ThemeContext.Provider value={{ dark, setDark }}>{props.children}</ThemeContext.Provider>
}

export const useTheme = () => {
  return useContext(ThemeContext)
}

export default ThemeProvider
