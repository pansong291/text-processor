import { customValue, ObjectView, ObjectViewProps } from 'react-object-view'
import React from 'react'
import styled from 'styled-components'
import { useTheme } from '@/components/context/ThemeProvider'

type ObjectViewerProps = {
  className?: string
  style?: React.CSSProperties
  data: any
}

const darkTheme: ObjectViewProps['palette'] = {
  base00: '#1f1f1f',
  base01: '#373637',
  base05: '#8B878f',
  base06: '#fafafa',
  base08: '#ff6188',
  base09: '#ab9df2',
  base0A: '#78dce8',
  base0B: '#ffd866',
  base0C: '#78dce8',
  base0D: '#a9dc76',
  base0E: '#ff6188',
  base0F: '#fc9867'
}

const lightTheme: ObjectViewProps['palette'] = {
  base00: '#ffffff',
  base01: '#eeedee',
  base05: '#8B878f',
  base06: '#373637',
  base08: '#ff003b',
  base09: '#2900ff',
  base0A: '#00b4c0',
  base0B: '#d7a800',
  base0C: '#a900d8',
  base0D: '#4cac00',
  base0E: '#ff6188',
  base0F: '#ec733c'
}

const errorRender =
  <E extends Error>(e: E) =>
  () =>
    <span style={{ color: 'red' }}>{String(e)}</span>

const isPrimitive = (value: any) => value === null || ['undefined', 'string', 'number', 'bigint', 'boolean', 'symbol'].includes(typeof value)

const customRenderError = (data: any) => {
  if (!isPrimitive(data))
    Object.entries<any>(data).forEach(([k, v]) => {
      if (Object.prototype.toString.call(v) === '[object Error]') v = Object.assign(v!, customValue(errorRender(v)))
      else v = customRenderError(v)
      data[k] = v
    })
  return data
}

const ObjectViewer: React.FC<ObjectViewerProps> = (props) => {
  const { dark } = useTheme()
  const palette = dark ? darkTheme : lightTheme

  return (
    <ObjectViewStyle className={props.className} style={{ ...props.style, backgroundColor: palette.base00 }}>
      <ObjectView data={{ data: customRenderError(props.data) }} styles={{ fontFamily: 'var(--font-family-mono)' }} palette={palette} />
    </ObjectViewStyle>
  )
}

const ObjectViewStyle = styled.div`
  min-height: 6.4em;
  overflow: auto;

  & > main {
    * {
      white-space: nowrap;
    }

    li > div > i {
      opacity: 0.5 !important;
    }

    & > ol > li {
      & > div {
        min-height: 1.6em;

        & > label,
        & > span {
          display: none;
        }
      }

      & > ol {
        transform: translateX(-1em);
      }
    }
  }
`

export default ObjectViewer
