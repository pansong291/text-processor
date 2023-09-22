type FuncDefinition = {
  definition: string
}

type FuncDeclaration = {
  declaration?: string
  doc?: string
}

export type FlatMapCallbackFunc = (value: string, index: number, array: string[]) => string | ReadonlyArray<string>

export type FMCF = FlatMapCallbackFunc

export type FuncDecMap = Record<string, FuncDeclaration>

export type FuncConfig = FuncDeclaration & FuncDefinition

export type FuncConfMap = Record<string, FuncDeclaration & FuncDefinition>
