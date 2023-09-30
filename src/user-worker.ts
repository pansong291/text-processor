import { monaco } from '@/lib/monaco'
// @ts-ignore
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
// @ts-ignore
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
import { utoolsLib } from '@/utils'

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
monaco.editor.createModel(utoolsLib.content, 'typescript', monaco.Uri.parse(utoolsLib.filePath))
