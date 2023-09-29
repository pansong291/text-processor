import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import * as monaco from 'monaco-editor'
import { useUpdater } from '@/utils'

type MonacoEditorProps = {
  className?: string
  style?: React.CSSProperties
  options?: monaco.editor.IEditorOptions & monaco.editor.IGlobalEditorOptions
}

const MonacoEditor = forwardRef<monaco.editor.IStandaloneCodeEditor, MonacoEditorProps>((props, ref) => {
  const [editor, setEditor] = useUpdater<monaco.editor.IStandaloneCodeEditor | null>(null)
  const monacoEl = useRef<HTMLDivElement | null>(null)

  useImperativeHandle(ref, () => editor!, [editor])

  useEffect(() => {
    if (monacoEl.current) {
      setEditor((e) => {
        if (e) return e

        return monaco.editor.create(
          monacoEl.current!,
          Object.assign(
            {
              value: '',
              language: 'javascript',
              automaticLayout: true,
              autoDetectHighContrast: false,
              roundedSelection: false,
              scrollBeyondLastLine: false,
              renderFinalNewline: 'on',
              cursorBlinking: 'smooth',
              cursorSmoothCaretAnimation: 'on',
              smoothScrolling: true,
              dragAndDrop: true,
              emptySelectionClipboard: false,
              renderControlCharacters: true,
              renderLineHighlight: 'all',
              renderWhitespace: 'boundary',
              showUnused: true,
              bracketPairColorization: {
                enabled: true
              },
              guides: {
                bracketPairs: 'active'
              },
              fontFamily: 'var(--font-family-mono)'
            },
            props.options
          )
        )
      })
    }
  }, [monacoEl.current])

  useEffect(() => {
    if (!editor || !props.options) return
    editor.updateOptions(props.options)
  }, [editor, props.options])

  return <div className={props.className} style={props.style} ref={monacoEl} />
})

export default MonacoEditor
