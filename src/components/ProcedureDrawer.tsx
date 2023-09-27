import React from 'react'
import { App as AntdApp, Button, Modal } from 'antd'
import { DeleteOutlined, FormOutlined, PlusOutlined } from '@ant-design/icons'
import FunctionDrawer from '@/components/FunctionDrawer'
import SortableList from '@/components/base/SortableList'
import SortableListItem from '@/components/base/SortableListItem'
import { FuncInstance, OperatorConfig, ProcedureConfig } from '@/types/types'
import { arrayMove } from '@dnd-kit/sortable'
import InputModal from '@/components/base/InputModal'
import styled from 'styled-components'
import { createOperator, createUpdater, deleteStorage, getStorage, setStorage, useUpdater } from '@/utils'
import { useFuncConfig } from '@/components/context/FuncConfigMapProvider'
import ObjectViewer from '@/components/base/ObjectViewer'
import Drawer from '@/components/base/Drawer'

const BLANK_FUNC_INST: FuncInstance = { id: '', definition: '' }

type ProcedureDrawerProps = {
  global?: boolean
  procedure: ProcedureConfig
  onChange: React.Dispatch<ProcedureConfig>
  onFullyClose: () => void
}

/*
TODO 待实现功能：
 1 正则匹配
 2 结束游标
 3 对象预览 已引入相关组件
 Drawer 目前存在 bug： 已解决
 关闭时，动画还未结束，里面的内容就已经清空了，有一瞬间可见的空白闪烁
 */

const ProcedureDrawer: React.FC<ProcedureDrawerProps> = (props) => {
  const { modal } = AntdApp.useApp()
  const [push, setPush] = useUpdater(0)
  const { procedure, onChange } = props
  const [globalOperatorList, setGlobalOperatorList] = useUpdater<Array<OperatorConfig>>(
    () => getStorage('global-operator-list')?.map?.((o: OperatorConfig) => createOperator(o)) || []
  )
  const funcConfigContext = useFuncConfig()
  const funcConfig = props.global ? funcConfigContext.global : funcConfigContext.self
  const setFuncConfig = props.global ? funcConfigContext.setGlobal : funcConfigContext.setSelf
  const [funcInst, setFuncInst] = useUpdater<FuncInstance>(BLANK_FUNC_INST)
  const [modalValues, setModalValues] = useUpdater<Array<string>>([])

  const updateOperatorList = props.global
    ? setGlobalOperatorList
    : createUpdater<Array<OperatorConfig>>((value) => {
        procedure.operatorList = value instanceof Function ? value(procedure.operatorList) : value
        onChange(procedure)
      })

  const onCloseDrawer = () => {
    props.onFullyClose()
    if (!props.global) {
      return
    }
    setStorage('global-operator-list', globalOperatorList)
  }

  const onEditClick = (item: OperatorConfig) => {
    setPush(-25)
    setFuncInst(Object.assign({ id: item.id }, funcConfig[item.id]))
  }

  return (
    <Drawer
      placement="right"
      width="80%"
      style={{ transform: `translateX(${push}%)`, transition: 'transform .3s' }}
      push={false}
      headerStyle={{ padding: '8px 16px' }}
      title={
        <DrawerTitle>
          <Button type="text" size="small" onClick={() => setModalValues([procedure.name, procedure.desc || ''])}>
            {procedure.name}
          </Button>
          <button
            className="ant-drawer-close"
            title="添加函数"
            onClick={() => {
              const operator = createOperator()
              updateOperatorList((p) => {
                p.push(operator)
              })
              setFuncConfig((p) => {
                p[operator.id] = { definition: '' }
              })
            }}>
            <PlusOutlined />
          </button>
        </DrawerTitle>
      }
      open={!!props.procedure.id}
      onFullyClose={onCloseDrawer}>
      <DrawerContent>
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
                      maskClosable: true,
                      afterClose: Modal.destroyAll,
                      onOk() {
                        deleteStorage(`$self-${item.id}`)
                        updateOperatorList((p) => {
                          if (p[i] === item) p.splice(i, 1)
                        })
                        setFuncConfig((p) => {
                          delete p[item.id]
                        })
                      }
                    })
                  }}
                />
              ]}>
              <Button className="border-less flex-grow" size="small" onClick={() => onEditClick(item)}>
                {item.id}
              </Button>
            </SortableListItem>
          )}
        />
        <ObjectViewer
          className="obj-view-wrap"
          data={{
            string: 'Every stop I make, I make a new friend.',
            integer: 42,
            map: new Map<string, any>([
              ['foo', 1],
              ['bar', { baz: null }]
            ]),
            url: 'http://localhost:3000',
            array: [['a', 1], 1, Symbol('sym'), 'Mutley, you snickering, floppy eared hound.', { foo: 'nested' }, null],
            float: 3.14159,
            object: {
              boolTrue: true,
              emptySet: new Set()
            },
            boolFalse: false,
            set: new Set([1, 'string', { foo: 1 }]),
            date: new Date(),
            reg: /^pattern\d+/gi,
            async *asyncGenerator() {},
            arrow: () => {},
            anon: function () {},
            undef: undefined,
            baz: null,
            sym: Symbol('sym'),
            err: new Error('unknown'),
            plain: 'foo: bar',
            syit: Symbol.iterator
          }}
        />
      </DrawerContent>
      <FunctionDrawer
        global={props.global}
        funcInstance={funcInst}
        onChange={(f) => {
          setFuncConfig((p) => {
            delete p[funcInst.id]
            p[f.id] = { definition: f.definition, declaration: f.declaration, doc: f.doc }
          })
          setFuncInst(f)
        }}
        onStartClose={() => setPush(0)}
        onFullyClose={(code) => {
          setFuncConfig((p) => {
            p[funcInst.id].definition = code
          })
          setFuncInst(BLANK_FUNC_INST)
        }}
      />
      <InputModal
        title={'修改流程信息'}
        with={300}
        inputs={[
          { label: '流程名称', maxLength: 30, value: modalValues[0] },
          { label: '流程描述', maxLength: 200, value: modalValues[1] }
        ]}
        onClose={(v) => {
          if (v) {
            if (v[0]) procedure.name = v[0]
            procedure.desc = v[1]
            onChange(procedure)
          }
          setModalValues([])
        }}
      />
    </Drawer>
  )
}

const DrawerTitle = styled.div`
  display: flex;
  justify-content: space-between;
`

const DrawerContent = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;

  .ant-list {
    flex: 1 1 0;
  }

  .obj-view-wrap {
    flex: 1 1 0;
    height: 50%;
  }
`

export default ProcedureDrawer
