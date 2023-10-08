import React from 'react'
import { Button, Typography } from 'antd'
import FunctionDrawer from '@/components/FunctionDrawer'
import { FuncInstance, OperatorConfig, ProcedureConfig } from '@/types/base'
import InputModal from '@/components/base/InputModal'
import { createUpdater, deleteStorage, setStorage, useUpdater } from '@/utils'
import { useFuncConfig, useGlobalOperatorList } from '@/components/context/StorageProvider'
import Drawer from '@/components/base/Drawer'
import SelfContent from '@/components/ProcedureDrawer/SelfContent'
import GlobalContent from '@/components/ProcedureDrawer/GlobalContent'

const BLANK_FUNC_INST: FuncInstance = { id: '', definition: '' }

type ProcedureDrawerProps = {
  isGlobal?: boolean
  procedure: ProcedureConfig
  onChange: React.Dispatch<ProcedureConfig>
  onFullyClose: () => void
}

/*
TODO 待实现功能：
 - 全局类型定义
 */

const ProcedureDrawer: React.FC<ProcedureDrawerProps> = ({ isGlobal, procedure, onChange, onFullyClose }) => {
  const [push, setPush] = useUpdater(0)
  const { setGlobalOperatorList } = useGlobalOperatorList()
  const funcConfigContext = useFuncConfig()
  const setFuncConfigMap = isGlobal ? funcConfigContext.setGlobalFuncConfigMap : funcConfigContext.setSelfFuncConfigMap
  const [funcInst, setFuncInst] = useUpdater<FuncInstance>(BLANK_FUNC_INST)
  const [modalValues, setModalValues] = useUpdater<Array<string>>([])

  const updateOperatorList = isGlobal
    ? setGlobalOperatorList
    : createUpdater<Array<OperatorConfig>>((value) => {
        procedure.operatorList = value instanceof Function ? value(procedure.operatorList) : value
        onChange(procedure)
      })

  const onOpenEditor = (f: FuncInstance) => {
    setPush(-25)
    setFuncInst(f)
  }

  const onCloseDrawer = () => {
    onFullyClose()
  }

  return (
    <Drawer
      placement="right"
      width="80%"
      style={{ transform: `translateX(${push}%)`, transition: 'transform .3s' }}
      push={false}
      headerStyle={{ padding: '8px 16px' }}
      title={
        isGlobal ? (
          '全局函数'
        ) : (
          <>
            <Button type="text" size="small" onClick={() => setModalValues([procedure.name, procedure.desc])}>
              {procedure.name}
            </Button>
            <Typography.Text className="fw-normal" type="secondary" ellipsis={{ tooltip: { placement: 'bottomLeft' } }}>
              {procedure.desc}
            </Typography.Text>
          </>
        )
      }
      open={isGlobal || !!procedure.id}
      onFullyClose={onCloseDrawer}>
      {isGlobal ? (
        <GlobalContent onOpenEditor={onOpenEditor} />
      ) : (
        <SelfContent procedure={procedure} onChange={onChange} onOpenEditor={onOpenEditor} />
      )}
      <FunctionDrawer
        isGlobal={isGlobal}
        funcInstance={funcInst}
        onChange={(f) => {
          if (funcInst.id !== f.id) deleteStorage(isGlobal ? `$global-${funcInst.id}` : `$self-${procedure.id}-${funcInst.id}`)
          setStorage(isGlobal ? `$global-${f.id}` : `$self-${procedure.id}-${f.id}`, f.definition)
          setFuncConfigMap((p) => {
            delete p[funcInst.id]
            p[f.id] = { definition: f.definition, declaration: f.declaration, doc: f.doc }
          })
          updateOperatorList((p) => {
            const op = p.find((o) => o.id === funcInst.id)
            if (op) {
              op.id = f.id
              op.declaration = f.declaration
              op.doc = f.doc
            }
          })
          setFuncInst(f)
        }}
        onStartClose={() => setPush(0)}
        onFullyClose={() => setFuncInst(BLANK_FUNC_INST)}
      />
      <InputModal
        title={'修改流程信息'}
        with={300}
        inputs={[
          { label: '流程名称', maxLength: 30, value: modalValues[0] },
          { textarea: true, label: '流程描述', maxLength: 200, autoSize: true, value: modalValues[1] }
        ]}
        onClose={(v) => {
          if (v) {
            onChange({ ...procedure, name: v[0] || procedure.name, desc: v[1] })
          }
          setModalValues([])
        }}
      />
    </Drawer>
  )
}

export default ProcedureDrawer
