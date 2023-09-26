type FuncDefinition = {
  definition: string
}

type FuncDeclaration = {
  declaration?: string
  doc?: string
}

export type FuncDecMap = Record<string, FuncDeclaration>

export type FuncConfig = FuncDeclaration & FuncDefinition

export type FuncConfMap = Record<string, FuncDeclaration & FuncDefinition>

export type FlatMapCallbackFunc<T extends any> = (value: T, index: number, array: T[]) => T | ReadonlyArray<T>

export type FMCF<T = any> = FlatMapCallbackFunc<T>

export type FMCFMap = Record<string, FMCF>

export type FuncMap = Record<string, Function>

export type StorageKey = `$global-${string}` | `$self-${string}` | 'global-operator-list' | 'procedure-list'

export type OperatorConfig = FuncDeclaration & {
  id: string
}

export type ProcedureConfig = {
  id: string
  name: string
  desc?: string
  match?: string
  end?: string
  action: 'copy' | 'type-input' | 'copy-paste'
  operatorList: Array<OperatorConfig>
}

export type Processor<T> = ((state: T) => T | void) | T
