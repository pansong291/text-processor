import { FMCFMap, FuncConfMap, FuncDecMap, FuncMap, OperatorConfig, ProcedureConfig, StorageKey } from '@/types'
import * as monaco from 'monaco-editor'

/**
 * 更新编辑器的支持库
 */
export function updateLibs(globalFuncMap: FuncDecMap, selfFuncMap: FuncDecMap, placeArgs = true) {
  monaco.languages.typescript.javascriptDefaults.setExtraLibs([
    {
      content: [
        'type FlatMapCallbackFunc = (value: string, index: number, array: string[]) => string | ReadonlyArray<string>;',
        'declare global {',
        '  namespace globalThis {',
        '    var $global: {',
        Object.entries(globalFuncMap)
          .map(([n, f]) => `/** ${f.doc || ''} */ ${n}:${f.declaration || 'Function'};`)
          .join('\n'),
        '    }',
        '    var $self: {',
        Object.entries(selfFuncMap)
          .map(([n, f]) => `/** ${f.doc || ''} */ ${n}:FlatMapCallbackFunc;`)
          .join('\n'),
        '    }',
        '  }',
        placeArgs
          ? [
              'let /** 数组中当前处理的字符串 */value:string,',
              '/** 索引值 */index:number,',
              '/** 字符串数组 */array:Array<string>;',
              'const arguments:[string,number,Array<string>]=[value,index,array]'
            ].join('\n')
          : '',
        '}',
        'export {}'
      ]
        .map((s) => s.replaceAll(/(\s)+/g, '$1'))
        .filter((s) => s)
        .join('\n')
    }
  ])
}

/**
 * 返回一个只读属性的代理对象
 * @param obj 需要代理的对象
 */
function readonlyProxy<T extends object>(obj: T) {
  return new Proxy(obj, {
    set: () => false,
    setPrototypeOf: () => false,
    defineProperty: () => false,
    deleteProperty: () => false
  })
}

/**
 * 限制递归调用深度
 * @param name 函数名
 * @param limit 限制次数
 * @param fn 函数
 * @param caller 该函数的调用者
 */
function limitDeep<F extends Function>(name: string, limit: number, fn: F, caller: any = null) {
  const counter = { name, deep: 0 }
  return function () {
    if (counter.deep >= limit) {
      throw new Error(`The recursive call of the '${counter.name}' function reaches ${counter.deep} times.`)
    }
    counter.deep++
    try {
      return fn.apply(caller, arguments)
    } finally {
      counter.deep--
    }
  } as unknown as F
}

function putMethod<T extends object>(obj: T, name: string & keyof T, definition: string) {
  obj[name] = limitDeep(name, 256, new Function(definition).call(window), window)
}

/**
 * 在 window 对象上挂载 $self
 */
export function use$self(configMap: FuncConfMap) {
  const $self: FMCFMap = {}
  if (configMap)
    Object.entries(configMap).forEach(([n, d]) => {
      putMethod($self, n, `return function(value,index,array){\n${d.definition}\n}`)
    })
  window.$self = readonlyProxy($self)
}

/**
 * 在 window 对象上挂载 $global
 */
export function use$global(configMap: FuncConfMap) {
  const $global: FuncMap = {}
  if (configMap)
    Object.entries(configMap).forEach(([n, d]) => {
      putMethod($global, n, `return function(){\n${d.definition}\n}`)
    })
  window.$global = readonlyProxy($global)
}

export function getStorage(key: StorageKey, consumer?: (obj: any) => void) {
  try {
    const value = window.utools?.dbStorage.getItem(key)
    if (consumer) consumer(value)
    return value
  } catch (e) {}
}

export function setStorage(key: StorageKey, obj: any) {
  window.utools?.dbStorage.setItem(key, obj)
}

/**
 * 获取随机标识符
 * @param len 长度
 */
export function randomIdentifier(len = 8) {
  const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$'
  len = Math.floor(Math.abs(len))
  let result = ''
  while (len > 0) {
    const r = Math.random()
    let n = r * 64
    if (n < 10 && !result) n = r * 54 + 10
    result += characters.charAt(Math.floor(n))
    len--
  }
  return result
}

export function createProcedure(old?: ProcedureConfig): ProcedureConfig {
  const id = old?.id || randomIdentifier()
  return {
    id,
    name: old?.name || id,
    desc: old?.desc || '',
    match: old?.match || undefined,
    action: old?.action || 'copy',
    operatorList: old?.operatorList?.map?.((o) => createOperator(o)) || []
  }
}

export function createOperator(old?: OperatorConfig): OperatorConfig {
  return {
    id: old?.id || randomIdentifier(),
    declaration: old?.declaration,
    doc: old?.doc
  }
}
