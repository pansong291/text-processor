import React, { useCallback, useMemo } from 'react'
import { App as AntdApp, Button, Form, Input, Modal, Select, Space } from 'antd'
import { DeleteOutlined, FormOutlined, PlusOutlined } from '@ant-design/icons'
import FunctionDrawer from '@/components/FunctionDrawer'
import SortableList from '@/components/base/SortableList'
import SortableListItem from '@/components/base/SortableListItem'
import { FuncInstance, OperatorConfig, ProcedureConfig } from '@/types/types'
import { arrayMove } from '@dnd-kit/sortable'
import InputModal from '@/components/base/InputModal'
import styled from 'styled-components'
import {
  createOperator,
  createSimpleOptions,
  createUpdater,
  deepMerge,
  deleteStorage,
  execute,
  getStorage,
  setStorage,
  use$global,
  use$self,
  useUpdater
} from '@/utils'
import { useFuncConfig } from '@/components/context/FuncConfigMapProvider'
import ObjectViewer from '@/components/base/ObjectViewer'
import Drawer from '@/components/base/Drawer'
import TextArea from 'antd/es/input/TextArea'

const BLANK_FUNC_INST: FuncInstance = { id: '', definition: '' }

type ProcedureDrawerProps = {
  isGlobal?: boolean
  procedure: ProcedureConfig
  onChange: React.Dispatch<ProcedureConfig>
  onFullyClose: () => void
}

/*
TODO 待实现功能：
 1 正则匹配
 2 结束游标
 3 对象预览 已引入相关组件
 4 全局类型定义
 */

const ProcedureDrawer: React.FC<ProcedureDrawerProps> = ({ isGlobal, procedure, onChange, onFullyClose }) => {
  const { modal } = AntdApp.useApp()
  const [push, setPush] = useUpdater(0)
  const [globalOperatorList, setGlobalOperatorList] = useUpdater<Array<OperatorConfig>>(
    () => getStorage('global-operator-list')?.map?.((o: OperatorConfig) => createOperator(o)) || []
  )
  const funcConfigContext = useFuncConfig()
  const funcConfig = isGlobal ? funcConfigContext.global : funcConfigContext.self
  const setFuncConfig = isGlobal ? funcConfigContext.setGlobal : funcConfigContext.setSelf
  const [funcInst, setFuncInst] = useUpdater<FuncInstance>(BLANK_FUNC_INST)
  const [modalValues, setModalValues] = useUpdater<Array<string>>([])
  const [testStr, setTestStr] = useUpdater('')

  const updateOperatorList = isGlobal
    ? setGlobalOperatorList
    : createUpdater<Array<OperatorConfig>>((value) => {
        procedure.operatorList = value instanceof Function ? value(procedure.operatorList) : value
        onChange(procedure)
      })

  const updateWindowFunctions = useCallback(() => {
    if (isGlobal) use$global(funcConfigContext.global)
    else use$self(funcConfigContext.self)
  }, [isGlobal, funcConfigContext.global, funcConfigContext.self])

  const testOutput = useMemo<any>(() => {
    try {
      updateWindowFunctions()
      return execute(
        [testStr],
        procedure.operatorList.map((o) => o.id),
        procedure.end
      )
    } catch (e) {
      return e
    }
  }, [testStr, procedure.operatorList, procedure.end, updateWindowFunctions])

  const onCloseDrawer = () => {
    onFullyClose()
    if (!isGlobal) {
      return
    }
    setStorage('global-operator-list', globalOperatorList)
  }

  const onEditClick = (item: OperatorConfig) => {
    setPush(-25)
    setFuncInst(Object.assign({ id: item.id }, funcConfig[item.id]))
  }

  return (
    <Drawer
      placement="right"
      width="80%"
      style={{ transform: `translateX(${push}%)`, transition: 'transform .3s' }}
      push={false}
      headerStyle={{ padding: '8px 16px' }}
      title={
        <DrawerTitle>
          <Button type="text" size="small" onClick={() => setModalValues([procedure.name, procedure.desc])}>
            {procedure.name}
          </Button>
          <button
            className="ant-drawer-close"
            title="添加函数"
            onClick={() => {
              const operator = createOperator()
              setFuncConfig((p) => {
                p[operator.id] = { definition: '' }
              })
              updateOperatorList((p) => {
                p.push(operator)
              })
            }}>
            <PlusOutlined />
          </button>
        </DrawerTitle>
      }
      open={!!procedure.id}
      onFullyClose={onCloseDrawer}>
      <DrawerContent>
        <div className="left-wrap">
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
                        centered: true,
                        maskClosable: true,
                        afterClose: Modal.destroyAll,
                        onOk() {
                          deleteStorage(`$self-${item.id}`)
                          setFuncConfig((p) => {
                            delete p[item.id]
                          })
                          updateOperatorList((p) => {
                            if (p[i] === item) p.splice(i, 1)
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
          <Form>
            <Form.Item label="正则匹配">
              <Space.Compact>
                <Input
                  prefix="/"
                  suffix="/"
                  value={procedure.match.regex}
                  onChange={(v) => onChange(deepMerge({ ...procedure }, { match: { regex: v.target.value } }))}
                />
                <Input
                  style={{ width: '8em' }}
                  value={procedure.match.flags}
                  onChange={(e) => {
                    const value = e.target.value
                    if (!value || /^(?!.*(.).*\1)[igmuy]+$/.test(value)) onChange(deepMerge({ ...procedure }, { match: { flags: value } }))
                  }}
                />
              </Space.Compact>
            </Form.Item>
            <Form.Item label="终止游标">
              <Select
                allowClear={true}
                showSearch
                value={procedure.end}
                options={createSimpleOptions(procedure.operatorList.map((o) => o.id))}
                onChange={(v) => onChange({ ...procedure, end: v })}
              />
            </Form.Item>
          </Form>
        </div>
        <div className="right-wrap">
          <TextArea autoSize={{ minRows: 3, maxRows: 6 }} value={testStr} onChange={(e) => setTestStr(e.target.value)} />
          <div className="obj-view-wrap">
            <ObjectViewer className="obj-viewer" data={testOutput} />
          </div>
          <TextArea autoSize={{ minRows: 3, maxRows: 6 }} value={testOutput?.join?.('') ?? String(testOutput)} readOnly={true} />
        </div>
      </DrawerContent>
      <FunctionDrawer
        isGlobal={isGlobal}
        funcInstance={funcInst}
        onChange={(f) => {
          setFuncConfig((p) => {
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

const DrawerTitle = styled.div`
  display: flex;
  justify-content: space-between;
`

const DrawerContent = styled.div`
  width: 100%;
  height: max-content;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;

  .left-wrap {
    flex: 1 1 50%;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .ant-list {
    .ant-list-item {
      padding: 6px 0 6px 12px;
    }

    .sortable-list-item-content {
      gap: 8px;
    }
  }

  .ant-form-item {
    margin-bottom: 16px;
  }

  .right-wrap {
    flex: 1 1 50%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .obj-view-wrap {
    border: 1px solid var(--border-color);
    border-radius: 8px;
    overflow: hidden;
  }
`

export default ProcedureDrawer
