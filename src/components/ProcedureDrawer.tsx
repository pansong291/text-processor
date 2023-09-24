import React, { useLayoutEffect, useState } from 'react'
import { Button, Drawer, Input } from 'antd'
import EditorDrawer from '@/components/EditorDrawer'
import SortableList from '@/components/SortableList'
import SortableListItem from '@/components/SortableListItem'
import { OperatorConfig, ProcedureConfig } from '@/types'
import { arrayMove } from '@dnd-kit/sortable'

type ProcedureDrawerProps = {
  global?: boolean
  procedure: ProcedureConfig
  open: boolean
  onClose: (p: ProcedureConfig) => void
}

const ProcedureDrawer: React.FC<ProcedureDrawerProps> = (props) => {
  const [procedure, setProcedure] = useState(props.procedure)
  const [openEditor, setOpenEditor] = useState(false)
  const [fnConfig, setFnConfig] = useState<OperatorConfig>({ id: '' })
  const [fnCode, setFnCode] = useState('')

  const updateProcedure = (cb: (p: ProcedureConfig) => void) => {
    setProcedure((p) => {
      cb(p)
      return { ...p }
    })
  }

  useLayoutEffect(() => setProcedure(props.procedure), [props.procedure])

  return (
    <Drawer
      placement="right"
      width="80%"
      style={{ transform: `translateX(-${openEditor ? 25 : 0}%)`, transition: 'transform .3s' }}
      push={false}
      headerStyle={{ padding: '8px 16px' }}
      title={<div className="monospace fw-normal">{procedure.id}</div>}
      open={props.open}
      onClose={() => props.onClose?.(procedure)}>
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
                  setFnConfig(item)
                  setFnCode('')
                  setOpenEditor(true)
                }}>
                编辑
              </Button>,
              <Button
                type="link"
                size="small"
                danger
                onClick={() => {
                  updateProcedure((p) => {
                    if (p.operatorList[i] === item) p.operatorList.splice(i, 1)
                  })
                }}>
                删除
              </Button>
            ]}>
            <div>{item.id}</div>
            <Input
              size="small"
              status={''}
              value={item.id}
              onChange={(e) =>
                updateProcedure((p) => {
                  if (p.operatorList[i] === item) p.operatorList[i].id = e.target.value
                })
              }
            />
          </SortableListItem>
        )}
      />
      <EditorDrawer
        title={<div className="monospace fw-normal">{`function ${fnConfig.id}(${props.global ? '' : 'value, index, array'})`}</div>}
        open={openEditor}
        code={fnCode}
        onClose={(code) => {
          setFnCode(code)
          setOpenEditor(false)
        }}
      />
    </Drawer>
  )
}

export default ProcedureDrawer
