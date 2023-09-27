import React, { useEffect, useRef } from 'react'
import { Button } from 'antd'
import MonacoEditor from '@/components/base/MonacoEditor'
import { useTheme } from '@/components/context/ThemeProvider'
import * as monaco from 'monaco-editor'
import { updateLibs, useUpdater } from '@/utils'
import { FuncInstance } from '@/types/types'
import InputModal from '@/components/base/InputModal'
import { useFuncConfig } from '@/components/context/FuncConfigMapProvider'
import Drawer from '@/components/base/Drawer'

type FunctionDrawerProps = {
  global?: boolean
  funcInstance: FuncInstance
  onChange: React.Dispatch<FuncInstance>
  onStartClose?: () => void
  onFullyClose: (code: string) => void
}

const FunctionDrawer: React.FC<FunctionDrawerProps> = (props) => {
  const { dark } = useTheme()
  const editor = useRef<monaco.editor.IStandaloneCodeEditor>(null)
  const funcConfigContext = useFuncConfig()
  const { funcInstance: funcInst, onChange } = props
  const [modalValues, setModalValues] = useUpdater<Array<string>>([])

  useEffect(() => {
    if (props.funcInstance.definition) editor.current?.setValue(props.funcInstance.definition)
  }, [props.funcInstance.definition])

  useEffect(
    () => updateLibs(funcConfigContext.global, funcConfigContext.self, props.global ? null : funcInst.declaration),
    [funcConfigContext.global, funcConfigContext.self, props.global, funcInst.declaration]
  )

  return (
    <Drawer
      placement="right"
      width="80%"
      headerStyle={{ padding: '8px 16px' }}
      bodyStyle={{ padding: 0 }}
      title={
        <Button type="text" size="small" onClick={() => setModalValues([funcInst.id, funcInst.declaration || '', funcInst.doc || ''])}>
          {funcInst.id}
        </Button>
      }
      open={!!props.funcInstance.id}
      onStartClose={props.onStartClose}
      onFullyClose={() => props.onFullyClose(editor.current?.getValue() || '')}>
      <MonacoEditor ref={editor} style={{ height: '100%' }} options={{ theme: dark ? 'dark' : 'light' }} />
      <InputModal
        title={'修改函数信息'}
        with={300}
        inputs={[
          { label: '函数名', maxLength: 30, value: modalValues[0] },
          {
            label: props.global ? '函数声明' : '元素类型',
            maxLength: 200,
            placeholder: props.global ? 'Function' : 'any',
            value: modalValues[1]
          },
          { label: '函数描述', maxLength: 200, value: modalValues[2] }
        ]}
        onClose={(v) => {
          if (v) {
            // TODO 函数名称需要做校验
            if (v[0]) funcInst.id = v[0]
            funcInst.declaration = v[1]
            funcInst.doc = v[2]
            onChange(funcInst)
          }
          setModalValues([])
        }}
      />
    </Drawer>
  )
}

export default FunctionDrawer
