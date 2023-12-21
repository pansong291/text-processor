import React, { useEffect, useRef } from 'react'
import styled from 'styled-components'
import { useUpdater } from '@/utils'

type SelectableListItemProps<K extends React.Key> = {
  key: K
  content?: React.ReactNode
}

type SelectableListProps<K extends React.Key> = {
  className?: string
  items: Array<SelectableListItemProps<K>>
  onSelect: (k: K, i: number) => void
  enableKeyboard?: boolean
}

const SelectableList = function <K extends React.Key>(props: SelectableListProps<K>) {
  const { className, items, onSelect, enableKeyboard } = props
  const [current, setCurrent] = useUpdater(0)

  useEffect(() => setCurrent((i) => (i >= items.length ? 0 : i)), [items])

  useEffect(() => {
    if (!enableKeyboard) return

    const total = items.length
    const onKeyDownHandler = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'ArrowUp':
          setCurrent((i) => (i + total - 1) % total)
          break
        case 'ArrowDown':
          setCurrent((i) => (i + 1) % total)
          break
        case 'Enter':
        case 'NumpadEnter':
          onSelect(items[current].key, current)
          break
      }
    }
    window.addEventListener('keydown', onKeyDownHandler)
    return () => window.removeEventListener('keydown', onKeyDownHandler)
  }, [enableKeyboard, items, onSelect, current])

  return (
    <div className={className}>
      {items.map((li, i) => (
        <SelectableListItem key={li.key} selected={current === i} onMouseEnter={() => setCurrent(i)} onClick={() => onSelect(li.key, i)}>
          {li.content}
        </SelectableListItem>
      ))}
    </div>
  )
}

const SelectableListItem: React.FC<
  React.PropsWithChildren<{
    selected?: boolean
    onMouseEnter?: VoidFunction
    onClick?: VoidFunction
  }>
> = ({ selected, onMouseEnter, onClick, children }) => {
  const elRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!elRef.current || !selected) return
    elRef.current.scrollIntoView({ behavior: 'instant' as any, block: 'nearest', inline: 'start' })
  }, [selected])

  return (
    <SelectableListItemStyle ref={elRef} className={selected ? 'selected' : ''} onMouseEnter={onMouseEnter} onClick={onClick}>
      {children}
    </SelectableListItemStyle>
  )
}

const SelectableListItemStyle = styled.div`
  border-radius: 8px;
  margin: 4px;
  cursor: pointer;
  transition: background-color 0.3s;

  &.selected {
    background-color: var(--selected-list-bg-color);
  }
`

export default SelectableList
