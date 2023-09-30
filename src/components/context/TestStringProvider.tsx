import React, { createContext, useContext } from 'react'
import { Processor } from '@/types/base'
import { useUpdater } from '@/utils'

type TestStringContextType = {
  testStr: string
  setTestStr: React.Dispatch<Processor<string>>
}

const TestStringContext = createContext<TestStringContextType>({
  testStr: '',
  setTestStr() {}
})

const TestStringProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [testStr, setTestStr] = useUpdater('!-a,b_c%d@b#=')
  return <TestStringContext.Provider value={{ testStr, setTestStr }}>{children}</TestStringContext.Provider>
}

export const useTestString = () => useContext(TestStringContext)

export default TestStringProvider
