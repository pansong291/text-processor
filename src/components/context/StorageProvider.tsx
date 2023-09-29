import React, { createContext, useContext } from 'react'
import { FuncConfig, OperatorConfig, OutputAction, ProcedureConfig, Processor, StrMap } from '@/types/base'
import { createOperator, createProcedure, getStorage, useUpdater } from '@/utils'

type Updater<T> = React.Dispatch<Processor<T>>

type OutputActionContextType<C = OutputAction> = {
  outputAction: C
  setOutputAction: Updater<C>
}

type GlobalOperatorListContextType<C = Array<OperatorConfig>> = {
  globalOperatorList: C
  setGlobalOperatorList: Updater<C>
}

type ProcedureListContextType<C = Array<ProcedureConfig>> = {
  procedureList: C
  setProcedureList: Updater<C>
}

type FuncConfigMapContextType<C = StrMap<FuncConfig>> = {
  global: C
  setGlobal: Updater<C>
  self: C
  setSelf: Updater<C>
}

const OutputActionContext = createContext<OutputActionContextType>({
  outputAction: 'copy',
  setOutputAction() {}
})

const GlobalOperatorListContext = createContext<GlobalOperatorListContextType>({
  globalOperatorList: [],
  setGlobalOperatorList() {}
})

const ProcedureListContext = createContext<ProcedureListContextType>({
  procedureList: [],
  setProcedureList() {}
})

const FuncConfigMapContext = createContext<FuncConfigMapContextType>({
  global: {},
  setGlobal() {},
  self: {},
  setSelf() {}
})

const StorageProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [outputAction, setOutputAction] = useUpdater<OutputAction>(() => getStorage('output-action'))
  const [globalOperatorList, setGlobalOperatorList] = useUpdater<Array<OperatorConfig>>(
    () => getStorage('global-operator-list')?.map?.(createOperator) || defaultGlobalOperatorList()
  )
  const [procedureList, setProcedureList] = useUpdater<Array<ProcedureConfig>>(() => getStorage('procedure-list')?.map?.(createProcedure) || [])

  return (
    <OutputActionContext.Provider value={{ outputAction, setOutputAction }}>
      <GlobalOperatorListContext.Provider value={{ globalOperatorList, setGlobalOperatorList }}>
        <ProcedureListContext.Provider value={{ procedureList, setProcedureList }}>
          <FuncConfigMapProvider>{children}</FuncConfigMapProvider>
        </ProcedureListContext.Provider>
      </GlobalOperatorListContext.Provider>
    </OutputActionContext.Provider>
  )
}

const FuncConfigMapProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { globalOperatorList } = useGlobalOperatorList()
  const [global, setGlobal] = useUpdater<StrMap<FuncConfig>>(getConfigMap('global', globalOperatorList))
  const [self, setSelf] = useUpdater<StrMap<FuncConfig>>({})

  return <FuncConfigMapContext.Provider value={{ global, setGlobal, self, setSelf }}>{children}</FuncConfigMapContext.Provider>
}

export const useOutputAction = () => useContext(OutputActionContext)

export const useGlobalOperatorList = () => useContext(GlobalOperatorListContext)

export const useProcedureList = () => useContext(ProcedureListContext)

export const useFuncConfig = () => useContext(FuncConfigMapContext)

export const getConfigMap = (type: 'global' | 'self', operatorList: Array<OperatorConfig>) => {
  const configMap: StrMap<FuncConfig> = {}
  operatorList?.forEach((oc) => {
    configMap[oc.id] = {
      declaration: oc.declaration,
      doc: oc.doc,
      definition: String(getStorage(`$${type}-${oc.id}`) || defaultFuncDefinition(type, oc.id))
    }
  })
  return configMap
}

function defaultGlobalOperatorList(): Array<OperatorConfig> {
  return [
    { id: 'joinBy', declaration: '<T>(args:[T,number,T[]],separator?:string) => string|[]', doc: '按指定连接符连接数组中每个元素拼接为字符串' }
  ]
}

function defaultFuncDefinition(type: 'global' | 'self', id: string): string {
  switch (type) {
    case 'global':
      switch (id) {
        case 'joinBy':
          return "const [[, index, array], separator = ''] = arguments\nreturn index === 0 ? array.join(separator) : []"
      }
      break
    case 'self':
      break
  }
  return ''
}

export default StorageProvider
