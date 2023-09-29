import React, { useEffect, useRef } from 'react'
import Child from './Child'

const Parent: React.FC = () => {
  const oRef = useRef<any>(null)

  useEffect(() => {
    console.log('useEffect setValue')
    oRef.current?.setValue(String(Date.now()))
  }, [oRef.current])

  return (
    <div>
      <Child ref={oRef} />
    </div>
  )
}

export default Parent
