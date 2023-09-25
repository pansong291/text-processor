import React, { useEffect, useRef } from 'react'
import { Drawer } from 'antd'
import MonacoEditor from '@/components/MonacoEditor'
import { useTheme } from '@/components/ThemeProvider'
import * as monaco from 'monaco-editor'

type EditorDrawerProps = {
  title?: React.ReactNode
  code?: string
  open: boolean
  onClose: (code: string) => void
}

const EditorDrawer: React.FC<EditorDrawerProps> = (props) => {
  const { dark } = useTheme()
  const editor = useRef<monaco.editor.IStandaloneCodeEditor>(null)

  useEffect(() => {
    if (props.code) editor.current?.setValue(props.code)
  }, [props.code])

  return (
    <Drawer
      placement="right"
      width="80%"
      headerStyle={{ padding: '8px 16px' }}
      bodyStyle={{ padding: 0 }}
      title={props.title}
      open={props.open}
      onClose={() => props.onClose(editor.current?.getValue() || '')}>
      <MonacoEditor ref={editor} style={{ height: '100%' }} options={{ theme: dark ? 'dark' : 'light' }} />
    </Drawer>
  )
}

export default EditorDrawer
