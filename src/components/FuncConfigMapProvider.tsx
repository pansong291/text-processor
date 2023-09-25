import React, { createContext, useContext } from 'react'
import { FuncConfMap, OperatorConfig, Processor } from '@/types'
import { getStorage, useUpdater } from '@/utils'

const FuncConfigMapContext = createContext<{
  global: FuncConfMap
  setGlobal: React.Dispatch<Processor<FuncConfMap>>
  self: FuncConfMap
  setSelf: React.Dispatch<Processor<FuncConfMap>>
}>({
  global: {},
  setGlobal() {},
  self: {},
  setSelf() {}
})

export const getConfigMap = (type: 'global' | 'self', operatorList: Array<OperatorConfig>) => {
  const configMap: FuncConfMap = {}
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
  const [global, setGlobal] = useUpdater<FuncConfMap>(getConfigMap('global', getStorage('global-operator-list')))
  const [self, setSelf] = useUpdater<FuncConfMap>({})

  return <FuncConfigMapContext.Provider value={{ global, setGlobal, self, setSelf }}>{props.children}</FuncConfigMapContext.Provider>
}

export const useFuncConfig = () => {
  return useContext(FuncConfigMapContext)
}

export default FuncConfigMapProvider
