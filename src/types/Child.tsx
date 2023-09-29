import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'

const Child = forwardRef<any, {}>((_, ref) => {
  const [obj, setObj] = useState<any | null>(null)
  const divEl = useRef<HTMLDivElement | null>(null)
  const [val, setVal] = useState('')

  useImperativeHandle(
    ref,
    () => {
      console.log('useImperativeHandle', obj)
      return obj!
    },
    [obj]
  )

  useEffect(() => {
    if (divEl?.current) {
      setObj((e: any) => {
        if (e) return e

        return {
          setValue(v: string) {
            console.log('value', v)
            setVal(v)
          }
        }
      })
    }
  }, [divEl.current])

  return (
    <div ref={divEl} style={{ height: 400 }}>
      {val}
    </div>
  )
})

export default Child
