import { FMCF, FuncDecMap } from '@/types'
import * as monaco from 'monaco-editor'

export function updateLibs(flatMapFuncMap: FuncDecMap, utilFuncMap: FuncDecMap, placeArgs = true) {
  monaco.languages.typescript.javascriptDefaults.setExtraLibs([
    {
      content: [
        'type FlatMapCallbackFunc = (value: string, index: number, array: string[]) => string | ReadonlyArray<string>;',
        'declare global {',
        '  namespace globalThis {',
        '    var $global: {',
        Object.entries(flatMapFuncMap)
          .map(([n, f]) => `/** ${f.doc || ''} */ ${n}:FlatMapCallbackFunc;`)
          .join('\n'),
        '    }',
        '    var $util: {',
        Object.entries(utilFuncMap)
          .map(([n, f]) => `/** ${f.doc || ''} */ ${n}:${f.declaration || 'Function'};`)
          .join('\n'),
        '    }',
        '  }',
        [
          'let /** 数组中当前处理的字符串 */value:string,',
          '/** 索引值 */index:number,',
          '/** 字符串数组 */array:Array<string>;',
          'const arguments:[string,number,Array<string>]=[value,index,array]'
        ]
          .flatMap((s) => (placeArgs ? [s] : []))
          .join('\n'),
        '}',
        'export {}'
      ]
        .map((s) => s.replaceAll(/(\s)+/g, '$1'))
        .filter((s) => s)
        .join('\n')
    }
  ])
}

export function test() {
  const $global: Record<string, FMCF> = {}
  window.$global = new Proxy<Record<string, FMCF>>($global, {
    set: () => false,
    setPrototypeOf: () => false,
    defineProperty: () => false,
    deleteProperty: () => false
  })
  putMethod('a', 'console.log(this);return value.split(",")')

  // putMethod('b', 'o.a(arguments)')

  function limitDeep(name: string, total: number, fn: Function) {
    const counter = { name, deep: 0 }
    return function () {
      if (counter.deep >= total) {
        throw new Error(`The recursive call of the '${counter.name}' function reaches ${counter.deep} times.`)
      }
      counter.deep++
      try {
        return fn.apply(window, arguments)
      } finally {
        counter.deep--
      }
    }
  }

  function putMethod(name: string, definition: string) {
    $global[name] = limitDeep(name, 3, new Function(`return function(value,index,array){\n${definition}\n}`).call(null))
  }

  const str = ',1,2,3,'
  let arr = [str]
  const handler = ['a']
  for (const fn of handler) {
    arr = arr.flatMap($global[fn])
  }
  console.log($global, arr)
}
