import React from 'react'
import { Input, Space } from 'antd'
import { RegexConfig } from '@/types/base'
import { useUpdater } from '@/utils'

type RegexInputProps = {
  value: RegexConfig
  onChange: (r: RegexConfig) => void
}

const RegexInput: React.FC<RegexInputProps> = (props) => {
  const [invalid, setInvalid] = useUpdater(false)

  return (
    <Space.Compact block>
      <Input
        prefix="/"
        suffix="/"
        status={invalid ? 'error' : ''}
        value={props.value.regex}
        onChange={(e) => {
          const value = e.target.value
          try {
            new RegExp(value)
            setInvalid(false)
          } catch (e) {
            setInvalid(true)
          }
          props.onChange({ regex: value, flags: props.value.flags })
        }}
      />
      <Input
        style={{ width: '8em' }}
        placeholder="标志"
        value={props.value.flags}
        onChange={(e) => {
          const value = e.target.value
          if (!value || /^(?!.*(.).*\1)[igmuy]+$/.test(value)) props.onChange({ regex: props.value.regex, flags: value })
        }}
      />
    </Space.Compact>
  )
}

export default RegexInput
