import React, { createContext, useContext } from 'react'
import { FuncConfig, OperatorConfig, OutputAction, ProcedureConfig, Processor, StrMap } from '@/types/base'
import { createOperator, createProcedure, getStorage, useStorage, useUpdater } from '@/utils'

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
  globalFuncConfigMap: C
  setGlobalFuncConfigMap: Updater<C>
  selfFuncConfigMap: C
  setSelfFuncConfigMap: Updater<C>
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
  globalFuncConfigMap: {},
  setGlobalFuncConfigMap() {},
  selfFuncConfigMap: {},
  setSelfFuncConfigMap() {}
})

const StorageProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [outputAction, setOutputAction] = useStorage<OutputAction>('output-action', (o) => o || 'copy')
  const [globalOperatorList, setGlobalOperatorList] = useStorage<Array<OperatorConfig>>(
    'global-operator-list',
    (o) => o?.map?.(createOperator) || defaultGlobalOperatorList()
  )
  const [procedureList, setProcedureList] = useStorage<Array<ProcedureConfig>>(
    'procedure-list',
    (o) => o?.map?.(createProcedure) || defaultProcedureList()
  )

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
  const [globalFuncConfigMap, setGlobalFuncConfigMap] = useUpdater<StrMap<FuncConfig>>(getConfigMap('global', globalOperatorList))
  const [selfFuncConfigMap, setSelfFuncConfigMap] = useUpdater<StrMap<FuncConfig>>({})

  return (
    <FuncConfigMapContext.Provider value={{ globalFuncConfigMap, setGlobalFuncConfigMap, selfFuncConfigMap, setSelfFuncConfigMap }}>
      {children}
    </FuncConfigMapContext.Provider>
  )
}

export const useOutputAction = () => useContext(OutputActionContext)

export const useGlobalOperatorList = () => useContext(GlobalOperatorListContext)

export const useProcedureList = () => useContext(ProcedureListContext)

export const useFuncConfig = () => useContext(FuncConfigMapContext)

export const getConfigMap = (type: 'global' | `self-${string}`, operatorList: Array<OperatorConfig>) => {
  const configMap: StrMap<FuncConfig> = {}
  operatorList?.forEach((oc) => {
    configMap[oc.id] = {
      declaration: oc.declaration,
      doc: oc.doc,
      definition: String(getStorage(`$${type}-${oc.id}`) || defaultFuncDefinition(type === 'global', oc.id))
    }
  })
  return configMap
}

function defaultGlobalOperatorList(): Array<OperatorConfig> {
  return [
    { id: 'joinBy', declaration: '<T>(args:[T,number,T[]],separator?:string) => string|[]', doc: '按指定连接符连接数组中每个元素拼接为字符串' }
  ]
}

function defaultProcedureList(): Array<ProcedureConfig> {
  return [
    {
      id: 'example',
      name: '示例流程',
      desc: '展示流程和函数的定义与使用',
      match: {},
      exclude: {},
      end: '',
      operatorList: [
        { id: 'splitByReg', declaration: 'string', doc: '按正则分割字符串' },
        { id: 'double', declaration: '', doc: '重复每项元素' },
        { id: 'thirdAdd1', declaration: '', doc: '将每第三个元素加 1' },
        { id: 'distinct', declaration: '', doc: '去除相同的值' },
        { id: 'useSelf', declaration: '', doc: '引用当前流程中的其他函数' },
        { id: 'useGlobal', declaration: '', doc: '引用全局函数' }
      ]
    }
  ]
}

function defaultFuncDefinition(isGlobal: boolean, id: string): string {
  if (isGlobal) {
    switch (id) {
      case 'joinBy':
        return "const [[, index, array], separator = ''] = arguments\nreturn index === 0 ? array.join(separator) : []"
    }
  } else {
    switch (id) {
      case 'splitByReg':
        return [
          '/**',
          ' * 函数声明为',
          ' * <T>(value: T, index: number, array: T[]) => T | T[]',
          ' * 可用入参为 value, number, array 以及 arguments',
          ' */',
          'return value.split(/[^a-zA-Z0-9]+/)'
        ].join('\n')
      case 'double':
        return 'return [value, value]'
      case 'thirdAdd1':
        return 'return index % 3 === 2 ? value + 1 : value'
      case 'distinct':
        return [
          'const { sets = new Set() } = array',
          'array.sets = sets',
          'if (sets.has(value)) {',
          '    // 返回空数组表示移除当前 value',
          '    return []',
          '}',
          'sets.add(value)',
          'return value'
        ].join('\n')
      case 'useSelf':
        return ['/**', ' * 当前流程中的函数会被挂载到 window 的 $self 对象上', ' */', 'return this.$self.thirdAdd1(value, index)'].join('\n')
      case 'useGlobal':
        return ['/**', ' * 全局函数会被挂载到 window 的 $global 对象上', ' */', "return this.$global.joinBy(arguments, '_')"].join('\n')
    }
  }
  return ''
}

export default StorageProvider
