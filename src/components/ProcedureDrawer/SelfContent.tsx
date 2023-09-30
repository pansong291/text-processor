import React, { useCallback, useEffect, useMemo } from 'react'
import { App as AntdApp, Button, Form, Modal, Select, Switch } from 'antd'
import RegexInput from '@/components/base/RegexInput'
import {
  createOperator,
  createSimpleOptions,
  createUpdater,
  createUtoolsFeature,
  deleteStorage,
  execute,
  setStorage,
  use$self,
  useUpdater
} from '@/utils'
import { DeleteOutlined, FormOutlined, PlusOutlined } from '@ant-design/icons'
import SortableList from '@/components/base/SortableList'
import { arrayMove } from '@dnd-kit/sortable'
import SortableListItem from '@/components/base/SortableListItem'
import TextArea from 'antd/es/input/TextArea'
import ObjectViewer from '@/components/base/ObjectViewer'
import styled from 'styled-components'
import { FuncInstance, OperatorConfig, ProcedureConfig } from '@/types/base'
import { useFuncConfig } from '@/components/context/StorageProvider'
import { useTestString } from '@/components/context/TestStringProvider'

type SelfContentProps = {
  procedure: ProcedureConfig
  onChange: React.Dispatch<ProcedureConfig>
  onOpenEditor: (funcInst: FuncInstance) => void
}

const SelfContent: React.FC<SelfContentProps> = ({ procedure, onChange, onOpenEditor }) => {
  const { modal } = AntdApp.useApp()
  const { selfFuncConfigMap, setSelfFuncConfigMap } = useFuncConfig()
  const [featureEnabled, setFeatureEnabled] = useUpdater(false)
  const { testStr, setTestStr } = useTestString()

  const updateOperatorList = createUpdater<Array<OperatorConfig>>((value) => {
    procedure.operatorList = value instanceof Function ? value(procedure.operatorList) : value
    onChange(procedure)
  })

  const updateFeatureState = useCallback(() => {
    const enabled = !!(procedure.id && window.utools?.getFeatures([procedure.id])?.length)
    setFeatureEnabled(enabled)
  }, [procedure.id])

  const onFeatureEnableChange = (e: boolean) => {
    if (e) {
      window.utools?.setFeature(createUtoolsFeature(procedure))
    } else {
      window.utools?.removeFeature(procedure.id)
    }
    updateFeatureState()
  }

  /* 利用 useMemo 来重新挂载函数而不是 useEffect，因为 useEffect 总是在组件渲染之后才执行，此处需要在计算测试值之前进行更新挂载 */
  useMemo(() => use$self(selfFuncConfigMap), [selfFuncConfigMap])

  const testOutput = useMemo<any>(() => {
    try {
      return execute(
        testStr,
        procedure.operatorList.map((o) => o.id),
        procedure.end
      )
    } catch (e) {
      return e
    }
  }, [testStr, procedure.operatorList, procedure.end, selfFuncConfigMap])

  const onEditClick = (item: OperatorConfig) => {
    onOpenEditor(Object.assign({ id: item.id }, selfFuncConfigMap[item.id]))
  }

  useEffect(() => {
    updateFeatureState()
  }, [updateFeatureState])

  useEffect(() => {
    if (procedure.id && featureEnabled) {
      window.utools?.removeFeature(procedure.id)
      window.utools?.setFeature(createUtoolsFeature(procedure))
    }
  }, [featureEnabled, procedure.id, procedure.name, procedure.desc])

  return (
    <DrawerContent>
      <div className="left-wrap">
        <Form>
          <Form.Item label="独立入口">
            <Switch checked={featureEnabled} onChange={onFeatureEnableChange} />
          </Form.Item>
          <Form.Item label="正则匹配">
            <RegexInput value={procedure.match} onChange={(r) => onChange({ ...procedure, match: r })} />
          </Form.Item>
          <Form.Item label="正则排除">
            <RegexInput value={procedure.exclude} onChange={(r) => onChange({ ...procedure, exclude: r })} />
          </Form.Item>
          <Form.Item label="终止游标">
            <Select
              allowClear
              showSearch
              value={procedure.end}
              options={createSimpleOptions(procedure.operatorList.map((o) => o.id))}
              onChange={(v) => onChange({ ...procedure, end: v })}
            />
          </Form.Item>
          <Form.Item label="函数列表" style={{ marginBottom: 0 }}>
            <div className="func-add-btn-wrap">
              <button
                className="ant-drawer-close"
                title="添加函数"
                onClick={() => {
                  const operator = createOperator()
                  setStorage(`$self-${operator.id}`, '')
                  setSelfFuncConfigMap((p) => {
                    p[operator.id] = { definition: '' }
                  })
                  updateOperatorList((p) => {
                    p.push(operator)
                  })
                }}>
                <PlusOutlined />
              </button>
            </div>
          </Form.Item>
        </Form>
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
                        setSelfFuncConfigMap((p) => {
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
              <Button className="border-less" size="small" onClick={() => onEditClick(item)}>
                {item.id}
              </Button>
            </SortableListItem>
          )}
        />
      </div>
      <div className="right-wrap">
        <TextArea autoSize={{ minRows: 3, maxRows: 6 }} value={testStr} onChange={(e) => setTestStr(e.target.value)} />
        <div className="obj-view-wrap">
          <ObjectViewer className="obj-viewer" data={testOutput} />
        </div>
        <TextArea autoSize={{ minRows: 3, maxRows: 6 }} value={String(testOutput)} readOnly />
      </div>
    </DrawerContent>
  )
}

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
    gap: 6px;
  }

  .ant-form-item {
    margin-bottom: 16px;
  }

  .func-add-btn-wrap {
    display: flex;
    justify-content: flex-end;

    button {
      height: 24px;
      margin-right: 0;
    }
  }

  .ant-list {
    .ant-list-item {
      padding: 6px 0 6px 12px;
    }

    .sortable-list-item-content {
      gap: 8px;
    }
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

export default SelfContent
