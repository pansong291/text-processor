import React, { useCallback, useEffect } from 'react'
import { Flex } from 'antd'
import { useUpdater } from '@/utils'
import FilterProcedureList from '@/components/Content/FilterProcedureList'
import ManageProcedureList from '@/components/Content/ManageProcedureList'

type DisplayMode = 'blank' | 'manage' | 'list'

const Content: React.FC = () => {
  const [filterText, setFilterText] = useUpdater('')
  const [payload, setPayload] = useUpdater('')
  const [displayMode, setDisplayMode] = useUpdater<DisplayMode>('blank')

  const activateSubInput = useCallback(() => {
    window.utools?.setSubInput(
      (obj: any) => {
        setFilterText(obj.text)
      },
      '搜索流程；Enter 键执行选中流程；Tab 键关闭弹窗',
      true
    )
    setFilterText('')
  }, [])

  useEffect(() => {
    window.utools?.onPluginOut(() => {
      setDisplayMode((o) => (o === 'list' ? 'blank' : o))
    })
  }, [])

  useEffect(() => {
    window.utools?.onPluginEnter(({ type, payload }) => {
      if (type === 'over') {
        setDisplayMode('list')
        setPayload(payload)
        activateSubInput()
      } else {
        setDisplayMode('manage')
        setPayload('')
      }
    })
    if (displayMode !== 'list') return
    activateSubInput()
    return () => {
      window.utools?.removeSubInput()
    }
  }, [activateSubInput, displayMode])

  return (
    <Flex vertical>
      {displayMode === 'manage' && <ManageProcedureList />}
      {displayMode === 'list' && <FilterProcedureList filterText={filterText} payload={payload} />}
    </Flex>
  )
}

export default Content
