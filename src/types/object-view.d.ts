///<reference types="react"/>

type range16 = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 'A' | 'B' | 'C' | 'D' | 'E' | 'F'
type base16 = `base0${range16}`

declare module 'react-object-view' {
  type ObjectViewProps = {
    data?: any
    palette?: Partial<Record<base16, string>>
    styles?: Partial<{
      fontFamily: string
      fontSize: 14
      lineHeight: 1.6
      tabWidth: 2
      tabSize: 24
      backgroundColor: string
      color: string
      keyColor: string
      valueColor: string
      valueTypeColor: string
      valueBracketsColor: string
      valueStringColor: string
      valueSymbolColor: string
      valueNumberColor: string
      valueBooleanColor: string
      valueFunctionColor: string
      valueFunctionArrowColor: string
      valueRegExpColor: string
      valueDateColor: string
      valueURLColor: string
      valueNullColor: string
      valueNullBackgroundColor: string
      valueUndefinedColor: string
      valueUndefinedBackgroundColor: string
    }>
    options?: Partial<{
      expandLevel: number
      displayEntriesMaxCount: number
      previewPropertiesMaxCount: number
      previewElementsMaxCount: number
      previewStringMaxLength: number
      previewOpacity: number
      hidePreviews: boolean
      hideDataTypes: boolean
      hideObjectSize: boolean
    }>
  }
  const ObjectView: React.FC<ObjectViewProps>
  function customValue(render: () => React.ReactNode = () => null)
  function customPreview(render: () => React.ReactNode = () => null)
  function customEntry(render: () => React.ReactNode = () => null)
}
