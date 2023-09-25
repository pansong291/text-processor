import React, { createContext, useContext, useState } from 'react'
import { FuncConfMap, OperatorConfig } from '@/types'
import { getStorage } from '@/utils'

const FuncConfigMapContext = createContext<{
  global: FuncConfMap
  setGlobal: React.Dispatch<React.SetStateAction<FuncConfMap>>
  self: FuncConfMap
  setSelf: React.Dispatch<React.SetStateAction<FuncConfMap>>
}>({
  global: {},
  setGlobal: () => {},
  self: {},
  setSelf: () => {}
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
  const [global, setGlobal] = useState<FuncConfMap>(getConfigMap('global', getStorage('global-operator-list')))
  const [self, setSelf] = useState<FuncConfMap>({})
  return <FuncConfigMapContext.Provider value={{ global, setGlobal, self, setSelf }}>{props.children}</FuncConfigMapContext.Provider>
}

export const useFuncConfig = () => {
  return useContext(FuncConfigMapContext)
}

export default FuncConfigMapProvider
