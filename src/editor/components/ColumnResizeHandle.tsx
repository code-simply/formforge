import React, { useState } from 'react'
import { FormColumn } from '../../core/types'
import { cn } from '../../ui/utils'
import { GripVertical } from 'lucide-react'

export interface ColumnResizeHandleProps {
  leftColumn: FormColumn
  rightColumn: FormColumn
  onResize: (leftWidth: number, rightWidth: number) => void
}

export const ColumnResizeHandle: React.FC<ColumnResizeHandleProps> = ({
  leftColumn,
  rightColumn,
  onResize,
}) => {
  const [isDragging, setIsDragging] = useState(false)
  const [liveInfo, setLiveInfo] = useState<{ left: number; right: number } | null>(null)

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    const handleEl = e.currentTarget
    const rowEl = handleEl.closest('.canvas-row-grid') as HTMLElement
    if (!rowEl) return

    const startX = e.clientX
    const rowWidth = rowEl.getBoundingClientRect().width
    const startLeft = leftColumn.width || 6
    const startRight = rightColumn.width || 6
    const totalSpan = startLeft + startRight

    setIsDragging(true)
    setLiveInfo({ left: startLeft, right: startRight })

    let currentLeft = startLeft

    const onPointerMove = (moveEvt: PointerEvent) => {
      const deltaX = moveEvt.clientX - startX
      const unitWidth = rowWidth / 12
      const deltaSpan = Math.round(deltaX / unitWidth)

      const nextLeft = Math.min(Math.max(startLeft + deltaSpan, 1), totalSpan - 1)
      const nextRight = totalSpan - nextLeft

      if (nextLeft !== currentLeft) {
        currentLeft = nextLeft
        setLiveInfo({ left: nextLeft, right: nextRight })
        onResize(nextLeft, nextRight)
      }
    }

    const onPointerUp = () => {
      setIsDragging(false)
      setLiveInfo(null)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
    }

    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
  }

  return (
    <div
      onPointerDown={handlePointerDown}
      className={cn(
        'group/resizer absolute -right-2 top-0 bottom-0 w-4 z-30 flex items-center justify-center cursor-col-resize select-none touch-none',
        isDragging && 'z-50'
      )}
      title="Drag to resize adjacent columns"
    >
      {/* Visual divider line */}
      <div
        className={cn(
          'w-1 h-3/4 rounded-full transition-all duration-150',
          isDragging
            ? 'w-1.5 h-full bg-foreground shadow-sm ring-2 ring-background'
            : 'bg-border/80 group-hover/resizer:bg-foreground group-hover/resizer:w-1.5'
        )}
      />

      {/* Grip icon pill */}
      <div
        className={cn(
          'absolute top-1/2 -translate-y-1/2 rounded-full border bg-background p-0.5 shadow-sm transition-transform',
          isDragging
            ? 'scale-110 border-foreground bg-accent'
            : 'opacity-0 group-hover/resizer:opacity-100 group-hover/resizer:scale-100'
        )}
      >
        <GripVertical className="h-3 w-3 text-foreground" />
      </div>

      {/* Floating live indicator badge when dragging */}
      {isDragging && liveInfo && (
        <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] font-mono px-2 py-0.5 rounded shadow-lg whitespace-nowrap z-50 pointer-events-none flex items-center space-x-1">
          <span>{liveInfo.left}/12</span>
          <span className="opacity-60">|</span>
          <span>{liveInfo.right}/12</span>
        </div>
      )}
    </div>
  )
}
