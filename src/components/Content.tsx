import React from 'react'
import { App as AntdApp, Button, Modal, Typography } from 'antd'
import { useTheme } from '@/components/ThemeProvider'
import { createProcedure, deleteStorage, getStorage, useUpdater } from '@/utils'
import MoonIcon from '@/components/MoonIcon'
import styled from 'styled-components'
import { DeleteOutlined, FormOutlined, FunctionOutlined, PlusOutlined } from '@ant-design/icons'
import ProcedureDrawer from '@/components/ProcedureDrawer'
import SortableListItem from '@/components/SortableListItem'
import SortableList from '@/components/SortableList'
import { arrayMove } from '@dnd-kit/sortable'
import { ProcedureConfig, StorageKey } from '@/types'

const Content: React.FC = () => {
  const { modal } = AntdApp.useApp()
  const { dark, setDark } = useTheme()
  const [procedureList, setProcedureList] = useUpdater<Array<ProcedureConfig>>(
    () => getStorage('procedure-list')?.map?.((p: ProcedureConfig) => createProcedure(p)) || []
  )
  const [openProcedure, setOpenProcedure] = useUpdater(false)
  const [procedure, setProcedure] = useUpdater<ProcedureConfig>({ id: '', name: '', action: 'copy', operatorList: [] })

  const onEditClick = (item: ProcedureConfig) => {
    setProcedure(item)
    setOpenProcedure(true)
  }

  return (
    <ContentStyle>
      <div className="title-line">
        <Button
          type="primary"
          shape="circle"
          title="添加流程"
          icon={<PlusOutlined />}
          onClick={() =>
            setProcedureList((p) => {
              p.push(createProcedure())
            })
          }
        />
        <Button type="default" shape="circle" title="全局函数" icon={<FunctionOutlined />} onClick={() => setOpenProcedure(true)} />
        <Button type={dark ? 'primary' : 'default'} shape="circle" title="暗黑主题" icon={<MoonIcon />} onClick={() => setDark((d) => !d)} />
      </div>
      <SortableList
        bordered
        rowKey="id"
        dataSource={procedureList}
        onSort={(active, over) => {
          setProcedureList((p) => {
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
                    title: '删除流程',
                    content: `此操作无法撤销，确定要继续删除 ${item.name} 吗？`,
                    okType: 'danger',
                    maskClosable: true,
                    afterClose: Modal.destroyAll,
                    onOk() {
                      deleteStorage(...item.operatorList.map<StorageKey>((o) => `$self-${o.id}`))
                      setProcedureList((p) => {
                        if (p[i] === item) p.splice(i, 1)
                      })
                    }
                  })
                }}
              />
            ]}>
            <Button className="monospace border-less flex-grow" size="small" onClick={() => onEditClick(item)}>
              {item.name}
            </Button>
            <Typography.Text className="monospace flex-shrink" type="secondary" ellipsis={{ tooltip: true }}>
              {item.desc}
            </Typography.Text>
          </SortableListItem>
        )}
      />
      <ProcedureDrawer
        procedure={procedure}
        open={openProcedure}
        onClose={(pc) => {
          setProcedureList((p) => {
            const i = p.findIndex((o) => o.id === procedure.id)
            if (i >= 0) p.splice(i, 1, pc)
          })
          setOpenProcedure(false)
        }}
      />
    </ContentStyle>
  )
}

const ContentStyle = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px 24px;

  .title-line {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }
`

export default Content
