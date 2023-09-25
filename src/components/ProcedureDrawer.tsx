import React, { useEffect, useLayoutEffect, useState } from 'react'
import { Button, Drawer } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import EditorDrawer from '@/components/EditorDrawer'
import SortableList from '@/components/SortableList'
import SortableListItem from '@/components/SortableListItem'
import { FuncConfig, FuncConfMap, OperatorConfig, ProcedureConfig } from '@/types'
import { arrayMove } from '@dnd-kit/sortable'
import InputModal from '@/components/InputModal'
import styled from 'styled-components'
import { createOperator, getStorage, setStorage, updateLibs } from '@/utils'
import { useFuncConfig } from '@/components/FuncConfigMapProvider'

type ProcedureDrawerProps = {
  global?: boolean
  procedure: ProcedureConfig
  open: boolean
  onClose: (p: ProcedureConfig) => void
}

const ProcedureDrawer: React.FC<ProcedureDrawerProps> = (props) => {
  const [procedure, setProcedure] = useState(props.procedure)
  const [globalOperatorList, setGlobalOperatorList] = useState<Array<OperatorConfig>>(
    () => getStorage('global-operator-list')?.map?.((o: OperatorConfig) => createOperator(o)) || []
  )
  const funcConfigContext = useFuncConfig()
  const { funcConfig, updateFuncConfig } = ((fc) => {
    const funcConfig = props.global ? fc.global : fc.self
    const setFuncConfig = props.global ? fc.setGlobal : fc.setSelf
    const updateFuncConfig = (cb: (m: FuncConfMap) => void) => {
      setFuncConfig((o) => {
        cb(o)
        return { ...o }
      })
    }
    return { funcConfig, updateFuncConfig }
  })(funcConfigContext)
  const [funcInstance, setFuncInstance] = useState<FuncConfig & { id: string }>()
  const [modalValue, setModalValue] = useState('')

  const updateProcedure = (cb: (p: ProcedureConfig) => void) => {
    setProcedure((p) => {
      cb(p)
      return { ...p }
    })
  }

  const updateOperatorList = (cb: (p: Array<OperatorConfig>) => void) => {
    if (props.global)
      setGlobalOperatorList((p) => {
        cb(p)
        return [...p]
      })
    else updateProcedure((p) => cb(p.operatorList))
  }

  const onCloseDrawer = () => {
    if (!props.global) {
      props.onClose?.(procedure)
      return
    }
    setStorage('global-operator-list', globalOperatorList)
  }

  useLayoutEffect(() => setProcedure(props.procedure), [props.procedure])

  useEffect(
    () => updateLibs(funcConfigContext.global, funcConfigContext.self, !props.global),
    [funcConfigContext.global, funcConfigContext.self, props.global]
  )

  return (
    <Drawer
      placement="right"
      width="80%"
      style={{ transform: `translateX(-${funcInstance ? 25 : 0}%)`, transition: 'transform .3s' }}
      push={false}
      headerStyle={{ padding: '8px 16px' }}
      title={
        <DrawerTitle>
          <Button className="monospace fw-normal" type="text" size="small" onClick={() => setModalValue(procedure.name)}>
            {procedure.name}
          </Button>
          <button
            className="ant-drawer-close"
            onClick={() => {
              const operator = createOperator()
              updateOperatorList((p) => p.push(operator))
              updateFuncConfig((p) => (p[operator.id] = { definition: '' }))
            }}>
            <PlusOutlined />
          </button>
        </DrawerTitle>
      }
      open={props.open}
      onClose={onCloseDrawer}>
      <SortableList
        bordered
        rowKey="id"
        dataSource={procedure.operatorList}
        onSort={(active, over) => {
          updateProcedure((p) => {
            const from = p.operatorList.findIndex((i) => i.id === active)
            const to = p.operatorList.findIndex((i) => i.id === over)
            p.operatorList = arrayMove(p.operatorList, from, to)
          })
        }}
        renderItem={(item, i) => (
          <SortableListItem
            id={item.id}
            actions={[
              <Button
                type="link"
                size="small"
                onClick={() => {
                  setFuncInstance(Object.assign({ id: item.id }, funcConfig[item.id]))
                }}>
                编辑
              </Button>,
              <Button
                type="link"
                size="small"
                danger
                onClick={() => {
                  updateOperatorList((p) => {
                    if (p[i] === item) p.splice(i, 1)
                  })
                  updateFuncConfig((p) => delete p[item.id])
                }}>
                删除
              </Button>
            ]}>
            <div>{item.id}</div>
          </SortableListItem>
        )}
      />
      <EditorDrawer
        title={<div className="monospace fw-normal">{`function ${funcInstance?.id}(${props.global ? '' : 'value, index, array'})`}</div>}
        open={!!funcInstance}
        code={funcInstance?.definition}
        onClose={(code) => {
          setFuncInstance((fc) => {
            if (fc) {
              updateFuncConfig((p) => {
                if (p[fc.id]) p[fc.id].definition = code
                else p[fc.id] = { definition: code }
              })
            }
            return undefined
          })
        }}
      />
      <InputModal
        title={'修改流程标题'}
        with={300}
        maxLength={30}
        value={modalValue}
        onClose={(v) => {
          if (v) updateProcedure((p) => (p.name = v))
          setModalValue('')
        }}
      />
    </Drawer>
  )
}

const DrawerTitle = styled.div`
  display: flex;
  justify-content: space-between;
`

export default ProcedureDrawer
