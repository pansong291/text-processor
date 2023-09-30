import React from 'react'
import { List, ListProps } from 'antd'
import { DndContext, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'

type SortableListProps<T> = ListProps<T> & {
  onSort: (active: string | number, over: string | number) => void
}

const SortableList = <T extends { id: string }>({ onSort, ...props }: SortableListProps<T>): React.ReactElement => {
  return (
    <DndContext
      modifiers={[restrictToVerticalAxis]}
      onDragEnd={({ active, over }: DragEndEvent) => {
        if (over && active.id !== over.id) {
          onSort(active.id, over.id)
        }
      }}>
      <SortableContext items={props.dataSource?.map((d) => d.id) || []} strategy={verticalListSortingStrategy}>
        <List {...props} />
      </SortableContext>
    </DndContext>
  )
}

export default SortableList
