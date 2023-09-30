import React, { useEffect } from 'react'
import { App as AntdApp, Button, Form, Modal, Segmented, SegmentedProps, Typography } from 'antd'
import { useTheme } from '@/components/context/ThemeProvider'
import { createProcedure, deleteStorage, execute, use$self, useUpdater } from '@/utils'
import MoonIcon from '@/components/base/MoonIcon'
import styled from 'styled-components'
import { DeleteOutlined, FormOutlined, FunctionOutlined, PlusOutlined } from '@ant-design/icons'
import ProcedureDrawer from '@/components/ProcedureDrawer'
import SortableListItem from '@/components/base/SortableListItem'
import SortableList from '@/components/base/SortableList'
import { arrayMove } from '@dnd-kit/sortable'
import { OutputAction, ProcedureConfig, StorageKey } from '@/types/base'
import { getConfigMap, useFuncConfig, useOutputAction, useProcedureList } from '@/components/context/StorageProvider'
import { useTestString } from '@/components/context/TestStringProvider'

const BLANK_PROCEDURE: ProcedureConfig = { id: '', name: '', desc: '', match: {}, exclude: {}, end: '', operatorList: [] }

const outputActionOptions: SegmentedProps['options'] = [
  { label: '仅复制', value: 'copy' },
  { label: '复制粘贴', value: 'copy-paste' },
  { label: '仅输入', value: 'type-input' }
]

const Content: React.FC = () => {
  const { modal } = AntdApp.useApp()
  const { dark, setDark } = useTheme()
  const { outputAction, setOutputAction } = useOutputAction()
  const { procedureList, setProcedureList } = useProcedureList()
  const { globalFuncConfigMap, setSelfFuncConfigMap } = useFuncConfig()
  const { setTestStr } = useTestString()

  const [isGlobal, setIsGlobal] = useUpdater(false)
  const [procedure, setProcedure] = useUpdater<ProcedureConfig>(BLANK_PROCEDURE)

  const onEditClick = (item: ProcedureConfig) => {
    setSelfFuncConfigMap(getConfigMap('self', item.operatorList))
    setProcedure(item)
  }

  useEffect(() => {
    window.utools?.onPluginEnter(({ code, type, payload }) => {
      if (type !== 'over') return
      let procedure
      if (code === '@process') {
        procedure = procedureList.find((p) => {
          try {
            const match = !p.match.regex || new RegExp(p.match.regex, p.match.flags).test(payload)
            if (!match || !p.exclude.regex) return match
            const exclude = new RegExp(p.exclude.regex, p.exclude.flags).test(payload)
            return !exclude
          } catch (e) {
            return false
          }
        })
      } else {
        procedure = procedureList.find((p) => p.id === code)
      }
      if (!procedure) return

      use$self(getConfigMap('self', procedure.operatorList))
      try {
        const result = String(
          execute(
            payload,
            procedure.operatorList.map((o) => o.id),
            procedure.end
          )
        )
        switch (outputAction) {
          case 'copy':
            window.utools?.copyText(result)
            window.utools?.hideMainWindow()
            break
          case 'copy-paste':
            window.utools?.hideMainWindowPasteText(result)
            break
          case 'type-input':
            window.utools?.hideMainWindowTypeString(result)
            break
        }
      } catch (e) {
        console.error(e)
        setTestStr(payload)
        setProcedure(payload)
      }
    })
  }, [globalFuncConfigMap, outputAction, procedureList])

  return (
    <ContentStyle>
      <div className="title-line">
        <Form.Item label="输出模式">
          <Segmented options={outputActionOptions} value={outputAction} onChange={(v) => setOutputAction(v as OutputAction)} />
        </Form.Item>
        <div className="action-btn-wrap">
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
          <Button type="default" shape="circle" title="全局函数" icon={<FunctionOutlined />} onClick={() => setIsGlobal(true)} />
          <Button type={dark ? 'primary' : 'default'} shape="circle" title="暗黑主题" icon={<MoonIcon />} onClick={() => setDark((d) => !d)} />
        </div>
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
                    centered: true,
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
            <Button className="border-less flex-grow" size="small" onClick={() => onEditClick(item)}>
              {item.name}
            </Button>
            <Typography.Text className="flex-shrink" type="secondary" ellipsis={{ tooltip: true }}>
              {item.desc}
            </Typography.Text>
          </SortableListItem>
        )}
      />
      <ProcedureDrawer
        isGlobal={isGlobal}
        procedure={procedure}
        onChange={(pc) => {
          setProcedureList((p) => {
            const i = p.findIndex((o) => o.id === procedure.id)
            if (i >= 0) p.splice(i, 1, pc)
          })
          setProcedure(pc)
        }}
        onFullyClose={() => {
          setIsGlobal(false)
          setProcedure(BLANK_PROCEDURE)
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
    justify-content: space-between;

    .ant-form-item {
      margin-bottom: 0;
    }

    .action-btn-wrap {
      display: flex;
      gap: 8px;
    }
  }
`

export default Content
