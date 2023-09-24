import * as monaco from 'monaco-editor'
// @ts-ignore
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
// @ts-ignore
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
import { updateLibs } from '@/utils'

self.MonacoEnvironment = {
  getWorker(_workerId: any, label: string) {
    if (label === 'typescript' || label === 'javascript') {
      return new tsWorker()
    }
    return new editorWorker()
  }
}

monaco.editor.defineTheme('light', {
  base: 'vs',
  inherit: true,
  rules: [],
  colors: {
    'editor.lineHighlightBackground': '#f0f0f0'
  }
})
monaco.editor.defineTheme('dark', {
  base: 'vs-dark',
  inherit: true,
  rules: [],
  colors: {
    'editor.lineHighlightBackground': '#2c313a'
  }
})

monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true)
monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
  noSemanticValidation: true,
  noSyntaxValidation: false
})
monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
  target: monaco.languages.typescript.ScriptTarget.ESNext,
  allowNonTsExtensions: true
})

const globalFunc: Record<string, { declaration: string; doc?: string }> = {
  test: { declaration: '(s: string) => string', doc: '此方法仅作为测试示例' },
  test2: { declaration: '', doc: '此方法仅作为测试示例无参' }
}

const selfFunc: Record<string, { doc?: string }> = {
  test: { doc: '测试' },
  someTest: { doc: '一些测试' }
}

updateLibs(globalFunc, selfFunc, false)
