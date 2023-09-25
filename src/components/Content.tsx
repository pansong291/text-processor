import React, { useState } from 'react'
import { Button, Typography } from 'antd'
import { useTheme } from '@/components/ThemeProvider'
import { createProcedure, getStorage } from '@/utils'
import MoonIcon from '@/components/MoonIcon'
import styled from 'styled-components'
import { PlusOutlined, SettingOutlined } from '@ant-design/icons'
import ProcedureDrawer from '@/components/ProcedureDrawer'
import SortableListItem from '@/components/SortableListItem'
import SortableList from '@/components/SortableList'
import { arrayMove } from '@dnd-kit/sortable'
import { ProcedureConfig } from '@/types'

const Content: React.FC = () => {
  const { dark, setDark } = useTheme()
  const [procedureList, setProcedureList] = useState<Array<ProcedureConfig>>(
    () => getStorage('procedure-list')?.map?.((p: ProcedureConfig) => createProcedure(p)) || []
  )
  const [openProcedure, setOpenProcedure] = useState(false)
  const [procedure, setProcedure] = useState<ProcedureConfig>({ id: '', name: '', action: 'copy', operatorList: [] })

  const updateList = (cb: (p: Array<ProcedureConfig>) => void) => {
    setProcedureList((p) => {
      cb(p)
      return [...p]
    })
  }

  return (
    <ContentStyle>
      <div className="title-line">
        <Button type="primary" shape="circle" icon={<PlusOutlined />} onClick={() => updateList((p) => p.push(createProcedure()))} />
        <Button type="default" shape="circle" icon={<SettingOutlined />} onClick={() => setOpenProcedure(true)} />
        <Button type={dark ? 'primary' : 'default'} shape="circle" icon={<MoonIcon />} onClick={() => setDark((d) => !d)} />
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
              <Button
                type="link"
                size="small"
                onClick={() => {
                  setProcedure(item)
                  setOpenProcedure(true)
                }}>
                编辑
              </Button>,
              <Button
                type="link"
                size="small"
                danger
                onClick={() => {
                  updateList((p) => {
                    if (p[i] === item) p.splice(i, 1)
                  })
                }}>
                删除
              </Button>
            ]}>
            <Typography.Text style={{ flex: '1 0 auto' }}>
              <Button className="monospace" type="text" size="small">
                {item.name}
              </Button>
            </Typography.Text>
            <Typography.Text style={{ flex: '0 1 auto' }} type="secondary" ellipsis={{ tooltip: true }}>
              <span className="monospace">{item.desc}</span>
            </Typography.Text>
          </SortableListItem>
        )}
      />
      <ProcedureDrawer
        procedure={procedure}
        open={openProcedure}
        onClose={(pc) => {
          updateList((p) => {
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
