import React from 'react'
import { Drawer as AntdDrawer, DrawerProps } from 'antd'
import { useUpdater } from '@/utils'

type ThisDrawerProps = Omit<DrawerProps, 'onClose' | 'afterOpenChange'> &
  Partial<{
    onStartClose: () => void
    onFullyClose: () => void
    onFullyOpen: () => void
  }>

const Drawer: React.FC<ThisDrawerProps> = ({ children, open, onStartClose, onFullyClose, onFullyOpen, ...props }) => {
  const [shouldOpen, setShouldOpen] = useUpdater(true)
  return (
    <AntdDrawer
      open={shouldOpen && open}
      onClose={() => {
        setShouldOpen(false)
        onStartClose?.()
      }}
      afterOpenChange={(o) => {
        if (!o) {
          onFullyClose?.()
          setShouldOpen(true)
        } else {
          onFullyOpen?.()
        }
      }}
      {...props}>
      {children}
    </AntdDrawer>
  )
}

export default Drawer
