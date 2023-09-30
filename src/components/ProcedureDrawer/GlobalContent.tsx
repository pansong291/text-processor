import React from 'react'
import { FuncInstance, OperatorConfig } from '@/types/base'
import { useFuncConfig, useGlobalOperatorList } from '@/components/context/StorageProvider'
import styled from 'styled-components'
import { App as AntdApp, Button, Form, Modal, Typography } from 'antd'
import { createOperator, deleteStorage, setStorage } from '@/utils'
import { DeleteOutlined, FormOutlined, PlusOutlined } from '@ant-design/icons'
import SortableList from '@/components/base/SortableList'
import { arrayMove } from '@dnd-kit/sortable'
import SortableListItem from '@/components/base/SortableListItem'

type GlobalContentProps = {
  onOpenEditor: (funcInst: FuncInstance) => void
}

const GlobalContent: React.FC<GlobalContentProps> = ({ onOpenEditor }) => {
  const { modal } = AntdApp.useApp()
  const { globalOperatorList, setGlobalOperatorList } = useGlobalOperatorList()
  const { globalFuncConfigMap, setGlobalFuncConfigMap } = useFuncConfig()

  const onEditClick = (item: OperatorConfig) => {
    onOpenEditor(Object.assign({ id: item.id }, globalFuncConfigMap[item.id]))
  }

  return (
    <DrawerContent>
      <Form>
        <Form.Item label="函数列表" style={{ marginBottom: 0 }}>
          <div className="func-add-btn-wrap">
            <button
              className="ant-drawer-close"
              title="添加函数"
              onClick={() => {
                const operator = createOperator()
                setStorage(`$global-${operator.id}`, '')
                setGlobalFuncConfigMap((p) => {
                  p[operator.id] = { definition: '' }
                })
                setGlobalOperatorList((p) => {
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
        dataSource={globalOperatorList}
        onSort={(active, over) => {
          setGlobalOperatorList((p) => {
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
                      deleteStorage(`$global-${item.id}`)
                      setGlobalFuncConfigMap((p) => {
                        delete p[item.id]
                      })
                      setGlobalOperatorList((p) => {
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
            <Typography.Text className="flex-shrink" type="secondary" ellipsis={{ tooltip: true }}>
              {item.doc}
            </Typography.Text>
          </SortableListItem>
        )}
      />
    </DrawerContent>
  )
}

const DrawerContent = styled.div`
  width: 100%;
  height: max-content;
  display: flex;
  flex-direction: column;
  gap: 8px;

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
`

export default GlobalContent
