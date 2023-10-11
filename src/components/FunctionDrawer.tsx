import React, { useEffect } from 'react'
import { App as AntdApp, Button, Typography } from 'antd'
import MonacoEditor from '@/components/base/MonacoEditor'
import { useTheme } from '@/components/context/ThemeProvider'
import { defaultElementType, defaultFunctionType, updateLibs, useUpdater, validateJavaScriptIdentifier, validateNotContain } from '@/utils'
import { FuncInstance } from '@/types/base'
import InputModal from '@/components/base/InputModal'
import { useFuncConfig } from '@/components/context/StorageProvider'
import Drawer from '@/components/base/Drawer'
import { monaco } from '@/lib/monaco'

type FunctionDrawerProps = {
  isGlobal?: boolean
  funcInstance: FuncInstance
  funcIdSet: Set<string>
  onChange: React.Dispatch<FuncInstance>
  onStartClose?: () => void
  onFullyClose: () => void
}

const FunctionDrawer: React.FC<FunctionDrawerProps> = ({
  isGlobal,
  funcInstance: funcInst,
  funcIdSet,
  onChange,
  onStartClose,
  onFullyClose
}) => {
  const { message } = AntdApp.useApp()
  const { dark } = useTheme()
  const [editor, setEditor] = useUpdater<monaco.editor.IStandaloneCodeEditor>()
  const funcConfigContext = useFuncConfig()
  const [modalValues, setModalValues] = useUpdater<Array<string>>([])

  useEffect(() => {
    editor?.setValue(funcInst.definition || '')
  }, [editor, funcInst.definition])

  useEffect(
    () => updateLibs(funcConfigContext.globalFuncConfigMap, funcConfigContext.selfFuncConfigMap, isGlobal ? null : funcInst.declaration),
    [funcConfigContext.globalFuncConfigMap, funcConfigContext.selfFuncConfigMap, isGlobal, funcInst.declaration]
  )

  return (
    <Drawer
      placement="right"
      width="80%"
      headerStyle={{ padding: '8px 16px' }}
      bodyStyle={{ padding: 0 }}
      title={
        <>
          <Button type="text" size="small" onClick={() => setModalValues([funcInst.id, funcInst.declaration || '', funcInst.doc || ''])}>
            function {funcInst.id}()
          </Button>
          <Typography.Text className="fw-normal" type="secondary" ellipsis={{ tooltip: { placement: 'bottomLeft' } }}>
            {funcInst.doc}
          </Typography.Text>
        </>
      }
      open={!!funcInst.id}
      onStartClose={() => {
        /* 重要：必须在关闭动画前更新代码；如果在关闭动画之后更新会由于 state 的惰更新机制导致缺少必要的渲染 */
        onChange({ ...funcInst, definition: editor?.getValue() || '' })
        onStartClose?.()
      }}
      onFullyClose={onFullyClose}>
      <MonacoEditor onLoaded={setEditor} style={{ height: '100%' }} options={{ theme: dark ? 'dark' : 'light' }} />
      <InputModal
        title={'修改函数信息'}
        with={300}
        inputs={[
          { label: '函数名', maxLength: 30, value: modalValues[0] },
          {
            label: isGlobal ? '函数声明' : '元素类型',
            maxLength: 200,
            placeholder: isGlobal ? defaultFunctionType : defaultElementType,
            value: modalValues[1]
          },
          { textarea: true, label: '函数描述', maxLength: 200, autoSize: true, value: modalValues[2] }
        ]}
        onClose={(v) => {
          if (v) {
            const msg = validateJavaScriptIdentifier(v[0]) || validateNotContain(funcInst.id, v[0], funcIdSet)
            if (msg) {
              message.error(msg)
              return
            }
            onChange({ id: v[0], declaration: v[1], doc: v[2], definition: funcInst.definition })
          }
          setModalValues([])
        }}
      />
    </Drawer>
  )
}

export default FunctionDrawer
