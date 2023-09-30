type FuncDefinition = {
  definition: string
}

type FuncDeclaration = {
  declaration?: string
  doc?: string
}

type Identifiable = { id: string }

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K]
}

export type StrMap<T> = Record<string, T>

export type FuncConfig = FuncDeclaration & FuncDefinition

export type FlatMapCallbackFunc<T extends any> = (value: T, index: number, array: T[]) => T | ReadonlyArray<T>

export type FMCF<T = any> = FlatMapCallbackFunc<T>

export type FuncInstance = FuncConfig & Identifiable

export type StorageKey = `$global-${string}` | `$self-${string}-${string}` | 'global-operator-list' | 'procedure-list' | 'output-action'

export type OperatorConfig = FuncDeclaration & Identifiable

export type RegexConfig = { regex?: string; flags?: string }

export type ProcedureConfig = {
  id: string
  name: string
  desc: string
  match: RegexConfig
  exclude: RegexConfig
  end: string
  operatorList: Array<OperatorConfig>
}

export type OutputAction = 'copy' | 'copy-paste' | 'type-input'

export type Processor<T> = ((state: T) => T | void) | T
