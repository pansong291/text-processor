import React from 'react'
import { Input, Space } from 'antd'
import { RegexConfig } from '@/types/base'

type RegexInputProps = {
  value: RegexConfig
  onChange: (r: RegexConfig) => void
}

const RegexInput: React.FC<RegexInputProps> = (props) => {
  return (
    <Space.Compact>
      <Input
        prefix="/"
        suffix="/"
        value={props.value.regex}
        onChange={(v) => props.onChange({ regex: v.target.value, flags: props.value.flags })}
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
