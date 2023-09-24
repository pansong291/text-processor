import React, { createContext, useContext, useState } from 'react'

const ThemeContext = createContext<{ dark: boolean; setDark: React.Dispatch<React.SetStateAction<boolean>> }>({
  dark: false,
  setDark() {}
})

const ThemeProvider: React.FC<React.PropsWithChildren> = (props) => {
  const [dark, setDark] = useState(window.utools?.isDarkColors() || false)
  return <ThemeContext.Provider value={{ dark, setDark }}>{props.children}</ThemeContext.Provider>
}

export const useTheme = () => {
  return useContext(ThemeContext)
}

export default ThemeProvider
