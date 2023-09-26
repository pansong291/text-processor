import React, { createContext, useContext } from 'react'
import { FuncConfig, OperatorConfig, Processor, StrMap } from '@/types'
import { getStorage, useUpdater } from '@/utils'

type ContextType<C = StrMap<FuncConfig>> = {
  global: C
  setGlobal: React.Dispatch<Processor<C>>
  self: C
  setSelf: React.Dispatch<Processor<C>>
}

const FuncConfigMapContext = createContext<ContextType>({
  global: {},
  setGlobal() {},
  self: {},
  setSelf() {}
})

export const getConfigMap = (type: 'global' | 'self', operatorList: Array<OperatorConfig>) => {
  const configMap: StrMap<FuncConfig> = {}
  operatorList?.forEach((oc) => {
    configMap[oc.id] = {
      declaration: oc.declaration,
      doc: oc.doc,
      definition: String(getStorage(`$${type}-${oc.id}`) || '')
    }
  })
  return configMap
}

const FuncConfigMapProvider: React.FC<React.PropsWithChildren> = (props) => {
  const [global, setGlobal] = useUpdater<StrMap<FuncConfig>>(getConfigMap('global', getStorage('global-operator-list')))
  const [self, setSelf] = useUpdater<StrMap<FuncConfig>>({})

  return <FuncConfigMapContext.Provider value={{ global, setGlobal, self, setSelf }}>{props.children}</FuncConfigMapContext.Provider>
}

export const useFuncConfig = () => {
  return useContext(FuncConfigMapContext)
}

export default FuncConfigMapProvider
