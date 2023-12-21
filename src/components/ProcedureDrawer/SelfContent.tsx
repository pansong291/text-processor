import React, { useCallback, useMemo } from 'react'
import { App as AntdApp, Button, Flex, Form, Modal, Select } from 'antd'
import { createOperator, createSimpleOptions, createUpdater, deleteStorage, execute, outputActionOptions, setStorage, use$self } from '@/utils'
import { DeleteOutlined, FormOutlined, PlusOutlined } from '@ant-design/icons'
import SortableList from '@/components/base/SortableList'
import { arrayMove } from '@dnd-kit/sortable'
import SortableListItem from '@/components/base/SortableListItem'
import TextArea from 'antd/es/input/TextArea'
import ObjectViewer from '@/components/base/ObjectViewer'
import styled from 'styled-components'
import { FuncInstance, OperatorConfig, ProcedureConfig } from '@/types/base'
import { useFuncConfig, useTestString } from '@/components/context/StorageProvider'

type SelfContentProps = {
  procedure: ProcedureConfig
  onChange: React.Dispatch<ProcedureConfig>
  onOpenEditor: (funcInst: FuncInstance) => void
}

const SelfContent: React.FC<SelfContentProps> = ({ procedure, onChange, onOpenEditor }) => {
  const { modal } = AntdApp.useApp()
  const { selfFuncConfigMap, setSelfFuncConfigMap } = useFuncConfig()
  const { testStr, setTestStr } = useTestString()

  const updateOperatorList = createUpdater<Array<OperatorConfig>>((value) => {
    procedure.operatorList = value instanceof Function ? value(procedure.operatorList) : value
    onChange(procedure)
  })

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

  const onEditClick = useCallback(
    (item: OperatorConfig) => {
      onOpenEditor(Object.assign({ id: item.id }, selfFuncConfigMap[item.id]))
    },
    [onOpenEditor, selfFuncConfigMap]
  )

  return (
    <SelfContentStyle justify="space-between" align="flex-start" gap={16}>
      <Flex className="sc-part" vertical gap={6}>
        <Form>
          <Form.Item label="输出模式" tooltip={{ title: '设置处理结果的输出模式，其中仅输入将以输入法原理键入文本。' }}>
            <Select options={outputActionOptions} value={procedure.outputAction} onChange={(o) => onChange({ ...procedure, outputAction: o })} />
          </Form.Item>
          <Form.Item label="终止游标" tooltip={{ title: '设置本流程的结束位置。' }}>
            <Select
              allowClear
              showSearch
              value={procedure.end || void 0}
              options={createSimpleOptions(
                procedure.operatorList,
                (o) => o.id,
                (o) => o.doc || o.id
              )}
              onChange={(v) => onChange({ ...procedure, end: v || '' })}
            />
          </Form.Item>
          <Form.Item label="函数列表" style={{ marginBottom: 0 }}>
            <Flex justify="flex-end">
              <button
                className="ant-drawer-close add-func-btn"
                title="添加函数"
                onClick={() => {
                  const operator = createOperator()
                  setStorage(`$self-${procedure.id}-${operator.id}`, '')
                  setSelfFuncConfigMap((p) => {
                    p[operator.id] = { definition: '' }
                  })
                  updateOperatorList((p) => {
                    p.push(operator)
                  })
                }}>
                <PlusOutlined />
              </button>
            </Flex>
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
                        deleteStorage(`$self-${procedure.id}-${item.id}`)
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
              <Button className="border-less btn-ellipsis" size="small" onClick={() => onEditClick(item)}>
                {item.doc || item.id}
              </Button>
            </SortableListItem>
          )}
        />
      </Flex>
      <Flex className="sc-part" vertical gap={16}>
        <TextArea autoSize={{ minRows: 3, maxRows: 6 }} value={testStr} onChange={(e) => setTestStr(e.target.value)} />
        <div className="obj-view-wrap">
          <ObjectViewer className="obj-viewer" data={testOutput} />
        </div>
        <TextArea autoSize={{ minRows: 3, maxRows: 6 }} value={String(testOutput)} readOnly />
      </Flex>
    </SelfContentStyle>
  )
}

const SelfContentStyle = styled(Flex)`
  width: 100%;
  height: max-content;

  .sc-part {
    flex: 0 1 50%;
    overflow: hidden;
  }

  .ant-form-item {
    margin-bottom: 16px;
  }

  button.add-func-btn {
    height: 24px;
    margin-right: 0;
  }

  .ant-list {
    .ant-list-item {
      padding: 0 0 0 6px;
    }

    .sortable-list-item-content {
      padding: 6px;
      gap: 8px;
    }
  }

  .btn-ellipsis {
    overflow: hidden;

    & > span {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }

  .obj-view-wrap {
    border: 1px solid var(--border-color);
    border-radius: 8px;
    overflow: hidden;
  }
`

export default SelfContent
