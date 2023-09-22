import React, { useEffect, useRef } from 'react'
import { Button } from 'antd'
import MonacoEditor from '@/components/MonacoEditor'
import { editor } from 'monaco-editor'

type ContentProps = {
  dark?: boolean
  setDark: React.Dispatch<React.SetStateAction<boolean>>
}

const Content: React.FC<ContentProps> = (props) => {
  const editor = useRef<editor.IStandaloneCodeEditor>(null)

  const getCodeText = () => {
    return editor.current?.getValue() || ''
  }

  useEffect(() => {}, [])

  return (
    <div>
      <Button onClick={() => props.setDark((d) => !d)}>切换主题</Button>
      <MonacoEditor ref={editor} style={{ height: 500 }} options={{ theme: props.dark ? 'dark' : 'light' }} />
      <Button
        onClick={() => {
          alert(getCodeText())
          window.utools?.hideMainWindowPasteText(getCodeText())
        }}>
        粘贴
      </Button>
      <Button
        onClick={() => {
          window.utools?.hideMainWindowTypeString(getCodeText())
        }}>
        输入
      </Button>
    </div>
  )
}

export default Content
