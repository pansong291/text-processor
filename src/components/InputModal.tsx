import React, { useLayoutEffect, useState } from 'react'
import { Input, Modal } from 'antd'

type InputModalProps = {
  value: string
  onClose: (v?: string) => void
  title?: React.ReactNode
  with?: string | number
  placeholder?: string
  maxLength?: number
}

const InputModal: React.FC<InputModalProps> = (props) => {
  const [value, setValue] = useState(props.value)

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
      <Input placeholder={props.placeholder} value={value} maxLength={props.maxLength} onChange={(e) => setValue(e.target.value)} />
    </Modal>
  )
}

export default InputModal
