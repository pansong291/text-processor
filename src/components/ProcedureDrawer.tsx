import React, { useEffect } from 'react'
import { App as AntdApp, Button, Drawer, Modal } from 'antd'
import { DeleteOutlined, FormOutlined, PlusOutlined } from '@ant-design/icons'
import FunctionDrawer from '@/components/FunctionDrawer'
import SortableList from '@/components/SortableList'
import SortableListItem from '@/components/SortableListItem'
import { FuncInstance, OperatorConfig, ProcedureConfig } from '@/types'
import { arrayMove } from '@dnd-kit/sortable'
import InputModal from '@/components/InputModal'
import styled from 'styled-components'
import { createOperator, createUpdater, deleteStorage, getStorage, setStorage, updateLibs, useUpdater } from '@/utils'
import { useFuncConfig } from '@/components/FuncConfigMapProvider'
import ObjectViewer from '@/components/ObjectViewer'

const BLANK_FUNC_INST: FuncInstance = { id: '', definition: '' }

type ProcedureDrawerProps = {
  global?: boolean
  procedure: ProcedureConfig
  onChange: React.Dispatch<ProcedureConfig>
  onClose: () => void
}

/*
TODO 待实现功能：
 1 正则匹配
 2 结束游标
 3 对象预览
 Drawer 目前存在 bug：
 关闭时，动画还未结束，里面的内容就已经清空了，有一瞬间可见的空白闪烁
 */

const ProcedureDrawer: React.FC<ProcedureDrawerProps> = (props) => {
  const { modal } = AntdApp.useApp()
  const { procedure, onChange } = props
  const [globalOperatorList, setGlobalOperatorList] = useUpdater<Array<OperatorConfig>>(
    () => getStorage('global-operator-list')?.map?.((o: OperatorConfig) => createOperator(o)) || []
  )
  const funcConfigContext = useFuncConfig()
  const funcConfig = props.global ? funcConfigContext.global : funcConfigContext.self
  const setFuncConfig = props.global ? funcConfigContext.setGlobal : funcConfigContext.setSelf
  const [funcInst, setFuncInst] = useUpdater<FuncInstance>(BLANK_FUNC_INST)
  const [modalValues, setModalValues] = useUpdater<Array<string>>([])

  const updateOperatorList = props.global
    ? setGlobalOperatorList
    : createUpdater<Array<OperatorConfig>>((value) => {
        procedure.operatorList = value instanceof Function ? value(procedure.operatorList) : value
        onChange(procedure)
      })

  const onCloseDrawer = () => {
    props.onClose()
    if (!props.global) {
      return
    }
    setStorage('global-operator-list', globalOperatorList)
  }

  useEffect(
    () => updateLibs(funcConfigContext.global, funcConfigContext.self, !props.global),
    [funcConfigContext.global, funcConfigContext.self, props.global]
  )

  const onEditClick = (item: OperatorConfig) => {
    setFuncInst(Object.assign({ id: item.id }, funcConfig[item.id]))
  }

  return (
    <Drawer
      placement="right"
      width="80%"
      style={{ transform: `translateX(-${funcInst.id ? 25 : 0}%)`, transition: 'transform .3s' }}
      push={false}
      headerStyle={{ padding: '8px 16px' }}
      title={
        <DrawerTitle>
          <Button type="text" size="small" onClick={() => setModalValues([procedure.name, procedure.desc || ''])}>
            {procedure.name}
          </Button>
          <button
            className="ant-drawer-close"
            title="添加函数"
            onClick={() => {
              const operator = createOperator()
              updateOperatorList((p) => {
                p.push(operator)
              })
              setFuncConfig((p) => {
                p[operator.id] = { definition: '' }
              })
            }}>
            <PlusOutlined />
          </button>
        </DrawerTitle>
      }
      open={!!props.procedure.id}
      onClose={onCloseDrawer}>
      <DrawerContent>
        <SortableList
          bordered
          rowKey="id"
          dataSource={procedure.operatorList}
          onSort={(active, over) => {
            updateOperatorList((p) => {
              const from = p.findIndex((i) => i.id === active)
              const to = p.findIndex((i) => i.id === over)
              return arrayMove(p, from, to)
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
              <Button className="border-less flex-grow" size="small" onClick={() => onEditClick(item)}>
                {item.id}
              </Button>
            </SortableListItem>
          )}
        />
        <div className="obj-view-wrap">
          <ObjectViewer data={['a', 'b', { c: true }, [], () => {}, {}]} />
        </div>
      </DrawerContent>
      <FunctionDrawer
        global={props.global}
        funcInstance={funcInst}
        onChange={(f) => {
          setFuncConfig((p) => {
            delete p[funcInst.id]
            p[f.id] = { definition: f.definition, declaration: f.declaration, doc: f.doc }
          })
          setFuncInst(f)
        }}
        onClose={(code) => {
          setFuncConfig((p) => {
            p[funcInst.id].definition = code
          })
          setFuncInst(BLANK_FUNC_INST)
        }}
      />
      <InputModal
        title={'修改流程信息'}
        with={300}
        inputs={[
          { label: '流程名称', maxLength: 30, value: modalValues[0] },
          { label: '流程描述', maxLength: 200, value: modalValues[1] }
        ]}
        onClose={(v) => {
          if (v) {
            if (v[0]) procedure.name = v[0]
            procedure.desc = v[1]
            onChange(procedure)
          }
          setModalValues([])
        }}
      />
    </Drawer>
  )
}

const DrawerTitle = styled.div`
  display: flex;
  justify-content: space-between;
`

const DrawerContent = styled.div`
  display: flex;
  justify-content: space-between;

  .ant-list {
    flex: 1 1 0;
  }

  .obj-view-wrap {
    flex: 1 1 0;
  }
`

export default ProcedureDrawer
