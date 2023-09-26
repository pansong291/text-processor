import React, { useLayoutEffect, useMemo } from 'react'
import { Form, Input, InputProps, Modal } from 'antd'
import { useUpdater } from '@/utils'

type InputModalProps = {
  onClose: (values?: Array<string>) => void
  title?: React.ReactNode
  with?: string | number
  inputs: Array<InputProps & { label?: string }>
}

const InputModal: React.FC<InputModalProps> = (props) => {
  const [values, setValues] = useUpdater<Array<string>>([])
  const propValues = useMemo<Array<string>>(() => props.inputs.map((i) => i.value as string), props.inputs)
  const open = useMemo(() => !!props.inputs.find((i) => i.value), props.inputs)

  useLayoutEffect(() => {
    setValues(propValues)
  }, [propValues])

  return (
    <Modal centered title={props.title} width={props.with} open={open} onOk={() => props.onClose(values)} onCancel={() => props.onClose()}>
      <Form layout="vertical">
        {props.inputs.map((ip, i) => (
          <Form.Item key={i} label={ip.label}>
            <Input
              {...ip}
              value={values[i]}
              onChange={(e) =>
                setValues((s) => {
                  s[i] = e.target.value
                })
              }
            />
          </Form.Item>
        ))}
      </Form>
    </Modal>
  )
}

export default InputModal
