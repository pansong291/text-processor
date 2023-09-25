import React, { useEffect, useLayoutEffect } from 'react'
import { App as AntdApp, Button, Drawer, Modal, Typography } from 'antd'
import { DeleteOutlined, FormOutlined, PlusOutlined } from '@ant-design/icons'
import EditorDrawer from '@/components/EditorDrawer'
import SortableList from '@/components/SortableList'
import SortableListItem from '@/components/SortableListItem'
import { FuncConfig, OperatorConfig, ProcedureConfig } from '@/types'
import { arrayMove } from '@dnd-kit/sortable'
import InputModal from '@/components/InputModal'
import styled from 'styled-components'
import { createOperator, deleteStorage, getStorage, setStorage, updateLibs, useUpdater } from '@/utils'
import { useFuncConfig } from '@/components/FuncConfigMapProvider'

type ProcedureDrawerProps = {
  global?: boolean
  procedure: ProcedureConfig
  open: boolean
  onClose: (p: ProcedureConfig) => void
}

const ProcedureDrawer: React.FC<ProcedureDrawerProps> = (props) => {
  const { modal } = AntdApp.useApp()
  const [procedure, setProcedure] = useUpdater(props.procedure)
  const [globalOperatorList, setGlobalOperatorList] = useUpdater<Array<OperatorConfig>>(
    () => getStorage('global-operator-list')?.map?.((o: OperatorConfig) => createOperator(o)) || []
  )
  const funcConfigContext = useFuncConfig()
  const funcConfig = props.global ? funcConfigContext.global : funcConfigContext.self
  const setFuncConfig = props.global ? funcConfigContext.setGlobal : funcConfigContext.setSelf
  const [funcInstance, setFuncInstance] = useUpdater<FuncConfig & { id: string }>()
  const [modalValue, setModalValue] = useUpdater('')

  const updateOperatorList = (cb: (p: Array<OperatorConfig>) => void) => {
    if (props.global)
      setGlobalOperatorList((p) => {
        cb(p)
      })
    else
      setProcedure((p) => {
        cb(p.operatorList)
      })
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

  const onEditClick = (item: OperatorConfig) => {
    setFuncInstance(Object.assign({ id: item.id }, funcConfig[item.id]))
  }

  return (
    <Drawer
      placement="right"
      width="80%"
      style={{ transform: `translateX(-${funcInstance ? 25 : 0}%)`, transition: 'transform .3s' }}
      push={false}
      headerStyle={{ padding: '8px 16px' }}
      title={
        <DrawerTitle>
          <Button className="monospace" type="text" size="small" onClick={() => setModalValue(procedure.name)}>
            {procedure.name}
          </Button>
          <button
            className="ant-drawer-close"
            title="添加函数"
            onClick={() => {
              const operator = createOperator()
              updateOperatorList((p) => p.push(operator))
              setFuncConfig((p) => {
                p[operator.id] = { definition: '' }
              })
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
          setProcedure((p) => {
            const from = p.operatorList.findIndex((i) => i.id === active)
            const to = p.operatorList.findIndex((i) => i.id === over)
            p.operatorList = arrayMove(p.operatorList, from, to)
          })
        }}
        renderItem={(item, i) => (
          <SortableListItem
            id={item.id}
            actions={[
              <Button type="text" size="small" title="编辑" icon={<FormOutlined />} onClick={() => onEditClick(item)} />,
              <Button
                type="text"
                size="small"
                danger
                title="删除"
                icon={<DeleteOutlined />}
                onClick={() => {
                  modal.confirm({
                    title: '删除函数',
                    content: `此操作无法撤销，确定要继续删除 ${item.id} 吗？`,
                    okType: 'danger',
                    maskClosable: true,
                    afterClose: Modal.destroyAll,
                    onOk() {
                      deleteStorage(`$self-${item.id}`)
                      updateOperatorList((p) => {
                        if (p[i] === item) p.splice(i, 1)
                      })
                      setFuncConfig((p) => {
                        delete p[item.id]
                      })
                    }
                  })
                }}
              />
            ]}>
            <Button className="monospace border-less flex-grow" size="small" onClick={() => onEditClick(item)}>
              {item.id}
            </Button>
            <Typography.Text className="monospace flex-shrink" type="secondary" ellipsis={{ tooltip: true }}>
              {item.declaration}
            </Typography.Text>
          </SortableListItem>
        )}
      />
      <EditorDrawer
        title={<div className="monospace fw-normal">{`function ${funcInstance?.id}(${props.global ? '' : 'value, index, array'})`}</div>}
        open={!!funcInstance}
        code={funcInstance?.definition}
        onClose={(code) => {
          if (funcInstance)
            setFuncConfig((p) => {
              if (p[funcInstance.id]) p[funcInstance.id].definition = code
              else p[funcInstance.id] = { definition: code }
            })
          setFuncInstance(undefined)
        }}
      />
      <InputModal
        title={'修改流程名称'}
        with={300}
        maxLength={30}
        value={modalValue}
        onClose={(v) => {
          if (v)
            setProcedure((p) => {
              p.name = v
            })
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
