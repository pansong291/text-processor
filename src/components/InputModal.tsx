import React, { useLayoutEffect } from 'react'
import { Form, Input, Modal } from 'antd'
import { useUpdater } from '@/utils'

type InputModalProps = {
  value: string
  onClose: (v?: string) => void
  title?: React.ReactNode
  with?: string | number
  placeholder?: string
  maxLength?: number
}

const InputModal: React.FC<InputModalProps> = (props) => {
  const [value, setValue] = useUpdater(props.value)

  useLayoutEffect(() => {
    setValue(props.value)
  }, [props.value])

  return (
    <Modal
      centered
      title={props.title}
      width={props.with}
      open={!!props.value}
      onOk={() => props.onClose(value)}
      onCancel={() => props.onClose()}>
      <Form layout="vertical">
        <Form.Item label="函数名">
          <Input placeholder={props.placeholder} value={value} maxLength={props.maxLength} onChange={(e) => setValue(e.target.value)} />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default InputModal
