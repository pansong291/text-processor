import React, { useCallback, useEffect, useMemo } from 'react'
import { App as AntdApp, Flex, Modal, Typography } from 'antd'
import { execute, outputActionOptions, use$self, useUpdater } from '@/utils'
import { getConfigMap, useFuncConfig, useProcedureList, useTestString } from '@/components/context/StorageProvider'
import styled from 'styled-components'
import { OutputAction, ProcedureConfig } from '@/types/base'
import SelectableList from '@/components/base/SelectableList'
import Pinyin from 'pinyin-match'

export type ExecuteMethodWrapper = { method?: (a: OutputAction) => void }

type FilterInfo = Record<
  string,
  {
    nameIndex?: [number, number]
    descIndex?: [number, number]
  }
>

type FilterProcedureListProps = {
  filterText: string
  payload: string
}

const outputActions = outputActionOptions.slice(1)

const FilterProcedureList: React.FC<FilterProcedureListProps> = (props) => {
  const { filterText, payload } = props
  const { notification } = AntdApp.useApp()
  const { procedureList } = useProcedureList()
  const { globalFuncConfigMap } = useFuncConfig()
  const { setTestStr } = useTestString()

  const [filteredProcedureList, filterInfoMap] = useMemo(() => {
    const info: FilterInfo = {}
    if (!filterText) return [procedureList, info]
    if (!procedureList.length) return [procedureList, info]
    const filteredList = procedureList.filter((p) => {
      const ni: any = Pinyin.match(p.name, filterText)
      if (ni) {
        info[p.id] = { nameIndex: [ni[0], ni[1] + 1] }
        return true
      }
      const di: any = Pinyin.match(p.desc, filterText)
      if (di) {
        info[p.id] = { descIndex: [di[0], di[1] + 1] }
        return true
      }
      return false
    })
    return [filteredList, info]
  }, [procedureList, filterText])

  const [outputModalOpen, setOutputModalOpen] = useUpdater(false)
  const [methodWrapper, setMethodWrapper] = useUpdater<ExecuteMethodWrapper>({})

  const handleResult = useCallback((result: string, a: OutputAction) => {
    setTimeout(
      (r) => {
        switch (a) {
          case 'copy':
            window.utools?.copyText(r)
            window.utools?.hideMainWindow()
            break
          case 'copy-paste':
            window.utools?.hideMainWindowPasteText(r)
            break
          case 'type-input':
            window.utools?.hideMainWindowTypeString(r)
            break
        }
        window.utools?.outPlugin()
      },
      300,
      result
    )
  }, [])

  const execProcedure = useCallback(
    (p: ProcedureConfig) => {
      use$self(getConfigMap(`self-${p.id}`, p.operatorList))
      try {
        const result = String(
          execute(
            payload,
            p.operatorList.map((o) => o.id),
            p.end
          )
        )
        if (p.outputAction === 'question') {
          setMethodWrapper({ method: (a) => handleResult(result, a) })
          setOutputModalOpen(true)
        } else {
          handleResult(result, p.outputAction)
        }
      } catch (e) {
        setTestStr(payload)
        notification.error({
          placement: 'bottomRight',
          message: `${p.name} 流程执行异常`,
          description: String(e),
          duration: 0
        })
      }
    },
    [globalFuncConfigMap, payload, handleResult]
  )

  useEffect(() => {
    const onFocusHandler = () => {
      window.utools?.subInputFocus()
    }
    window.addEventListener('focus', onFocusHandler)
    return () => window.removeEventListener('focus', onFocusHandler)
  }, [])

  useEffect(() => {
    const onKeydownHandler = (e: KeyboardEvent) => {
      if (e.code === 'Tab') {
        setOutputModalOpen(false)
      }
    }
    window.addEventListener('keydown', onKeydownHandler)
    return () => window.removeEventListener('keydown', onKeydownHandler)
  }, [])

  return (
    <FilterProcedureListStyle>
      <SelectableList
        enableKeyboard={!outputModalOpen}
        items={filteredProcedureList.map((f) => ({
          key: f.id,
          content: (
            <FilteredProcedureItem
              title={f.name}
              desc={f.desc}
              titleIndex={filterInfoMap[f.id]?.nameIndex}
              descIndex={filterInfoMap[f.id]?.descIndex}
            />
          )
        }))}
        onSelect={(_, i) => execProcedure(filteredProcedureList[i])}
      />
      <Modal
        className="c-oam"
        title="选择输出模式"
        centered
        width={200}
        closeIcon={false}
        footer={null}
        destroyOnClose
        open={outputModalOpen}
        onCancel={() => setOutputModalOpen(false)}>
        <SelectableList
          enableKeyboard={outputModalOpen}
          items={outputActions.map((a) => ({ key: a.value, content: <div style={{ padding: '6px 12px' }}>{a.label}</div> }))}
          onSelect={(k) => {
            setOutputModalOpen(false)
            methodWrapper.method?.(k)
          }}
        />
      </Modal>
    </FilterProcedureListStyle>
  )
}

const FilterProcedureListStyle = styled.div`
  position: absolute;
  inset: 0;
  overflow: hidden auto;
`

const FilteredProcedureItem: React.FC<{
  title: string
  desc: string
  titleIndex?: [number, number]
  descIndex?: [number, number]
}> = (props) => {
  const renderMarkContent = (content: string, contentIndex?: [number, number]) => {
    if (!contentIndex) return content
    let [start, end] = contentIndex
    if (start >= end || start >= content.length || end < 0) return content
    if (start < 0) start = 0
    if (end > content.length) end = content.length
    return (
      <>
        {content.substring(0, start)}
        <Typography.Text mark>{content.substring(start, end)}</Typography.Text>
        {content.substring(end)}
      </>
    )
  }

  return (
    <FilteredProcedureItemStyle>
      <h4 className="fpi-title">{renderMarkContent(props.title, props.titleIndex)}</h4>
      <div className="fpi-desc">{renderMarkContent(props.desc, props.descIndex)}</div>
    </FilteredProcedureItemStyle>
  )
}

const FilteredProcedureItemStyle = styled(Flex)`
  flex-direction: column;
  justify-content: center;
  gap: 2px;
  min-height: 60px;
  padding: 0 16px;
  overflow: hidden;

  & > * {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .fpi-title {
    margin: 0;
  }

  .fpi-desc {
    color: var(--second-font-color);
    font-size: 14px;
  }
`

export default FilterProcedureList
