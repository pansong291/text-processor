import React, { useState } from 'react'
import { Button, Input } from 'antd'

type ContentProps = {
  setDark?: (d: boolean) => void
}

const Content: React.FC<ContentProps> = () => {
  const [text, setText] = useState('')
  return (
    <div>
      <Input value={text} onInput={(e) => setText(e.currentTarget.value)} />
      <Button
        onClick={() => {
          window.utools.hideMainWindowPasteText(text)
        }}>
        粘贴
      </Button>
      <Button
        onClick={() => {
          window.utools.hideMainWindowTypeString(text)
        }}>
        输入
      </Button>
    </div>
  )
}

export default Content
