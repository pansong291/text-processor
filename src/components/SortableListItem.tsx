import React from 'react'
import { List } from 'antd'
import { ListItemProps } from 'antd/es/list'
import { MenuOutlined } from '@ant-design/icons'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import styled from 'styled-components'

type SortableListItemProps = ListItemProps & {
  id: string
}

const SortableListItem: React.FC<SortableListItemProps> = ({ children, id, style, ...props }) => {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id })
  return (
    <List.Item
      {...props}
      ref={setNodeRef}
      style={{
        ...style,
        transform: CSS.Transform.toString(transform && { ...transform, scaleY: 1 }),
        transition,
        ...(isDragging ? { position: 'relative', zIndex: 9999 } : {})
      }}
      {...attributes}>
      <ListItemContent>
        <MenuOutlined ref={setActivatorNodeRef} style={{ touchAction: 'none', cursor: 'move' }} {...listeners} />
        {children}
      </ListItemContent>
    </List.Item>
  )
}

const ListItemContent = styled.div`
  display: flex;
  gap: 16px;
`

export default SortableListItem
