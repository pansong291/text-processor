import React, { useCallback, useMemo } from 'react'
import { useTheme } from '@/components/context/ThemeProvider'
import { getConfigMap, useFuncConfig, useGlobalOperatorList, useProcedureList } from '@/components/context/StorageProvider'
import { App as AntdApp, Button, Flex, Input, List, Modal, Space, Typography } from 'antd'
import {
  BulbOutlined,
  DeleteOutlined,
  EditOutlined,
  ExportOutlined,
  FormOutlined,
  FunctionOutlined,
  ImportOutlined,
  PlusOutlined
} from '@ant-design/icons'
import {
  createOperator,
  createProcedure,
  deleteStorage,
  getStorage,
  randomIdentifier,
  setStorage,
  useUpdater,
  validateJavaScriptIdentifier
} from '@/utils'
import MoonIcon from '@/components/base/MoonIcon'
import { FuncInstance, ProcedureConfig, ProcedureJSON, StorageKey } from '@/types/base'
import styled from 'styled-components'
import ProcedureDrawer from '@/components/ProcedureDrawer'

const BLANK_PROCEDURE: ProcedureConfig = {
  id: '',
  name: '',
  desc: '',
  outputAction: 'question',
  end: '',
  operatorList: []
}

const ManageProcedureList: React.FC = () => {
  const { modal, message } = AntdApp.useApp()
  const { dark, setDark } = useTheme()
  const { globalOperatorList, setGlobalOperatorList } = useGlobalOperatorList()
  const { procedureList, setProcedureList } = useProcedureList()
  const { setGlobalFuncConfigMap, setSelfFuncConfigMap } = useFuncConfig()

  const onEditClick = useCallback((item: ProcedureConfig) => {
    setSelfFuncConfigMap(getConfigMap(`self-${item.id}`, item.operatorList))
    setProcedure(item)
  }, [])

  const [isGlobal, setIsGlobal] = useUpdater(false)
  const [procedure, setProcedure] = useUpdater<ProcedureConfig>(BLANK_PROCEDURE)

  const [importModalOpen, setImportModalOpen] = useUpdater(false)
  const [importJSON, setImportJSON] = useUpdater('')
  const validJSON = useMemo(() => {
    try {
      if (!importJSON.startsWith('{') && !importJSON.startsWith('[')) return false
      return !!JSON.parse(importJSON)
    } catch (e) {
      return false
    }
  }, [importJSON])

  const chooseImportFile = useCallback(() => {
    const path = window.utools?.showOpenDialog({
      properties: ['openFile', 'treatPackageAsDirectory', 'dontAddToRecent'],
      filters: [
        { name: 'JSON 文本文件', extensions: ['json', 'txt'] },
        { name: '全部文件', extensions: ['*'] }
      ]
    })?.[0]
    if (!path) return
    try {
      setImportJSON(window._preload.readFrom(path))
    } catch (e) {
      message.error(String(e))
    }
  }, [])

  /**
   * 检查导入数据的合法性，主要为函数名称的校验及其唯一性
   */
  const checkImportDataValid = useCallback((globalFunctionList: Array<FuncInstance>, procList: Array<ProcedureJSON>) => {
    const gfSet = new Set<string>()
    for (const f of globalFunctionList) {
      const msg = validateJavaScriptIdentifier(f.id)
      if (msg) throw new SyntaxError(`${f.id} ${msg}`)
      if (gfSet.has(f.id)) throw new Error(`全局函数中存在重复的名称 ${f.id}`)
      gfSet.add(f.id)
    }
    for (const pr of procList) {
      const funcSet = new Set<string>()
      pr.functionList.forEach((f) => {
        const msg = validateJavaScriptIdentifier(f.id)
        if (msg) throw new SyntaxError(`${f.id} ${msg}`)
        if (funcSet.has(f.id)) throw new Error(`${pr.name} 存在重复的函数名称 ${f.id}`)
        funcSet.add(f.id)
      })
    }
  }, [])

  const onImportClick = useCallback(() => {
    try {
      if (!importJSON) throw new Error('请选择文件或输入 JSON 文本')
      const data = JSON.parse(importJSON)
      const globalFunctionList: Array<FuncInstance> = data.globalFunctionList || []

      const overrideImport = () => {
        const procList: Array<ProcedureJSON> = data.procedureList || []
        checkImportDataValid(globalFunctionList, procList)
        for (const f of globalFunctionList) {
          setGlobalOperatorList((p) => {
            const op = p.find((o) => o.id === f.id)
            if (op) {
              op.declaration = f.declaration
              op.doc = f.doc
            } else {
              p.push(createOperator(f))
            }
          })
          setGlobalFuncConfigMap((p) => {
            p[f.id] = { declaration: f.declaration, definition: f.definition, doc: f.doc }
          })
          setStorage(`$global-${f.id}`, f.definition)
        }
        for (const pr of procList) {
          const pid = randomIdentifier()
          const np = createProcedure({
            ...pr,
            id: pid,
            operatorList: pr.functionList.map((f) => {
              setStorage(`$self-${pid}-${f.id}`, f.definition)
              return {
                id: f.id,
                declaration: f.declaration,
                doc: f.doc
              }
            })
          })
          setProcedureList((p) => {
            p.push(np)
          })
        }
        setImportModalOpen(false)
        setImportJSON('')
        message.success('导入成功')
      }

      const globalDistinct = new Set(globalOperatorList.map((o) => o.id))
      if (globalFunctionList.find((f) => globalDistinct.has(f.id))) {
        modal.confirm({
          title: '全局函数命名冲突',
          content: '是否覆盖相同名称的全局函数以继续导入？',
          okType: 'danger',
          centered: true,
          maskClosable: false,
          afterClose: Modal.destroyAll,
          onOk: overrideImport
        })
      } else {
        overrideImport()
      }
    } catch (e) {
      message.error(String(e))
    }
  }, [importJSON, globalOperatorList, checkImportDataValid])

  const onExportClick = useCallback(() => {
    let path = window.utools?.showSaveDialog({
      properties: ['treatPackageAsDirectory', 'showOverwriteConfirmation', 'dontAddToRecent'],
      filters: [
        { name: 'JSON 文本文件', extensions: ['json', 'txt'] },
        { name: '全部文件', extensions: ['*'] }
      ]
    })
    if (!path) return
    try {
      const procList: Array<ProcedureJSON> = []
      for (const p of procedureList) {
        procList.push({
          id: p.id,
          name: p.name,
          desc: p.desc,
          outputAction: p.outputAction,
          end: p.end,
          functionList: p.operatorList.map((o) => ({
            ...o,
            definition: getStorage(`$self-${p.id}-${o.id}`) || ''
          }))
        })
      }
      const globalFunctionList: Array<FuncInstance> = globalOperatorList.map((o) => ({
        ...o,
        definition: getStorage(`$global-${o.id}`) || ''
      }))
      window._preload.writeTo(JSON.stringify({ procedureList: procList, globalFunctionList }), path)
      message.success('导出成功')
    } catch (e) {
      message.error(String(e))
    }
  }, [procedureList, globalOperatorList])

  return (
    <ManageProcedureListStyle vertical gap={16}>
      <Flex justify="flex-end" gap={8}>
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
        <Space.Compact>
          <Button type="default" title="全局函数" icon={<FunctionOutlined />} onClick={() => setIsGlobal(true)} />
          <Button
            icon={<BulbOutlined />}
            onClick={() => window.utools?.shellOpenExternal('https://yuanliao.info/d/19804-text-processor-flatmap')}
          />
          <Button title="导入" icon={<ImportOutlined />} onClick={() => setImportModalOpen(true)} />
          <Button title="导出" icon={<ExportOutlined />} onClick={onExportClick} />
          <Button type={dark ? 'primary' : 'default'} title="暗黑主题" icon={<MoonIcon />} onClick={() => setDark((d) => !d)} />
        </Space.Compact>
      </Flex>
      <List
        bordered
        rowKey="id"
        dataSource={procedureList}
        renderItem={(item, i) => (
          <List.Item
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
                      deleteStorage(...item.operatorList.map<StorageKey>((o) => `$self-${item.id}-${o.id}`))
                      window.utools?.removeFeature(item.id)
                      setProcedureList((p) => {
                        if (p[i] === item) p.splice(i, 1)
                      })
                    }
                  })
                }}
              />
            ]}>
            <Flex className="mpl-list-item">
              <Button className="border-less flex-grow" size="small" onClick={() => onEditClick(item)}>
                {item.name}
              </Button>
              <Typography.Text className="flex-shrink" type="secondary" ellipsis={{ tooltip: true }}>
                {item.desc}
              </Typography.Text>
            </Flex>
          </List.Item>
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
      <Modal title="选择文件或输入 JSON" centered open={importModalOpen} onOk={onImportClick} onCancel={() => setImportModalOpen(false)}>
        <Flex vertical gap={8}>
          <Flex justify="space-between">
            <Button type="primary" onClick={chooseImportFile}>
              选择文件
            </Button>
            <Button
              shape="circle"
              icon={<EditOutlined />}
              title="编辑 JSON"
              disabled={!validJSON}
              onClick={() => {
                window.utools?.redirect(['JSON 编辑器', 'Json'], { type: 'text', data: importJSON })
              }}
            />
          </Flex>
          <Input.TextArea
            autoSize={{ minRows: 6, maxRows: 12 }}
            placeholder="输入 JSON 文本"
            status={validJSON || !importJSON ? '' : 'error'}
            value={importJSON}
            onChange={(e) => setImportJSON(e.target.value)}
            onDrop={(e) => {
              try {
                const file: any = e.dataTransfer.files[0]
                setImportJSON(window._preload.readFrom(file.path))
              } catch (ex) {
                message.error(String(ex))
              }
            }}
          />
        </Flex>
      </Modal>
    </ManageProcedureListStyle>
  )
}

const ManageProcedureListStyle = styled(Flex)`
  padding: 16px 24px;

  .ant-form-item {
    margin-bottom: 0;
  }

  .mpl-list-item {
    padding: 12px 0 12px 12px;
    overflow: hidden;
    gap: 16px;
  }
`

export default ManageProcedureList
