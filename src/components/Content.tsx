import React, { useEffect, useMemo } from 'react'
import { App as AntdApp, Button, Flex, Form, Input, Modal, Segmented, Space, Typography } from 'antd'
import { useTheme } from '@/components/context/ThemeProvider'
import {
  createOperator,
  createProcedure,
  deleteStorage,
  execute,
  getStorage,
  outputActionOptions,
  randomIdentifier,
  setStorage,
  use$self,
  useUpdater,
  validateJavaScriptIdentifier
} from '@/utils'
import MoonIcon from '@/components/base/MoonIcon'
import styled from 'styled-components'
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
import ProcedureDrawer from '@/components/ProcedureDrawer'
import SortableListItem from '@/components/base/SortableListItem'
import SortableList from '@/components/base/SortableList'
import { arrayMove } from '@dnd-kit/sortable'
import { FuncInstance, OutputAction, ProcedureConfig, ProcedureJSON, StorageKey } from '@/types/base'
import { getConfigMap, useFuncConfig, useGlobalOperatorList, useOutputAction, useProcedureList } from '@/components/context/StorageProvider'
import { useTestString } from '@/components/context/TestStringProvider'

const BLANK_PROCEDURE: ProcedureConfig = {
  id: '',
  name: '',
  desc: '',
  condition: {},
  outputAction: 'copy',
  match: {},
  exclude: {},
  end: '',
  operatorList: []
}

const Content: React.FC = () => {
  const { modal, message, notification } = AntdApp.useApp()
  const { dark, setDark } = useTheme()
  const { outputAction, setOutputAction } = useOutputAction()
  const { globalOperatorList, setGlobalOperatorList } = useGlobalOperatorList()
  const { procedureList, setProcedureList } = useProcedureList()
  const { globalFuncConfigMap, setGlobalFuncConfigMap, setSelfFuncConfigMap } = useFuncConfig()
  const { setTestStr } = useTestString()

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

  const chooseImportFile = () => {
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
  }

  /**
   * 检查导入数据的合法性，主要为函数名称的校验及其唯一性
   */
  const checkImportDataValid = (globalFunctionList: Array<FuncInstance>, procList: Array<ProcedureJSON>) => {
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
  }

  const onImportClick = () => {
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
  }

  const onExportClick = () => {
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
          condition: p.condition,
          outputAction: p.outputAction,
          match: p.match,
          exclude: p.exclude,
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
  }

  const onEditClick = (item: ProcedureConfig) => {
    setSelfFuncConfigMap(getConfigMap(`self-${item.id}`, item.operatorList))
    setProcedure(item)
  }

  useEffect(() => {
    window.utools?.onPluginEnter(({ code, type, payload }) => {
      if (type !== 'over') return
      let procedure
      const execByOrder = code === '@process'
      if (execByOrder) {
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
      if (!procedure) {
        message.warning('未匹配到可执行的流程')
        return
      }

      use$self(getConfigMap(`self-${procedure.id}`, procedure.operatorList))
      try {
        const result = String(
          execute(
            payload,
            procedure.operatorList.map((o) => o.id),
            procedure.end
          )
        )
        const outputMode = execByOrder ? outputAction : procedure.outputAction
        switch (outputMode) {
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
        setTestStr(payload)
        notification.error({
          placement: 'bottomRight',
          message: `${procedure.name} 流程执行异常`,
          description: String(e),
          duration: 0
        })
      }
    })
  }, [globalFuncConfigMap, outputAction, procedureList])

  return (
    <ContentStyle vertical gap={16}>
      <Flex justify="space-between">
        <Form.Item label="输出模式">
          <Segmented options={outputActionOptions} value={outputAction} onChange={(v) => setOutputAction(v as OutputAction)} />
        </Form.Item>
        <Flex gap={8}>
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
      </Flex>
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
    </ContentStyle>
  )
}

const ContentStyle = styled(Flex)`
  padding: 16px 24px;

  .ant-form-item {
    margin-bottom: 0;
  }
`

export default Content
