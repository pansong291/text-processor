type FuncDefinition = {
  definition: string
}

type FuncDeclaration = {
  declaration?: string
  doc?: string
}

type Identifiable = { id: string }

export type StrMap<T> = Record<string, T>

export type FuncConfig = FuncDeclaration & FuncDefinition

export type FlatMapCallbackFunc<T extends any> = (value: T, index: number, array: T[]) => T | ReadonlyArray<T>

export type FMCF<T = any> = FlatMapCallbackFunc<T>

export type FuncInstance = FuncConfig & Identifiable

export type StorageKey = `$global-${string}` | `$self-${string}` | 'global-operator-list' | 'procedure-list'

export type OperatorConfig = FuncDeclaration & Identifiable

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
