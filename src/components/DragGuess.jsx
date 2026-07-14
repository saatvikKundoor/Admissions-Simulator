import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDroppable,
  useDraggable,
} from '@dnd-kit/core'
import { playPickup, playStamp } from '../lib/sound'

const COLUMNS = ['Admitted', 'Waitlisted', 'Rejected']

const COLUMN_STYLE = {
  Admitted:   { bg: 'bg-green-50',  border: 'border-green-200',  text: 'text-green-700',  icon: '/icons/admitted.png'   },
  Waitlisted: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', icon: '/icons/waitlisted.png' },
  Rejected:   { bg: 'bg-red-50',    border: 'border-red-200',    text: 'text-red-700',    icon: '/icons/rejected.png'   },
}

function DraggableChip({ id, name }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id })
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`px-3 py-2 bg-white rounded-lg border border-slate-200 text-sm
                  text-slate-800 font-medium shadow-sm select-none touch-none
                  cursor-grab active:cursor-grabbing transition-all duration-150
                  ${isDragging
                    ? 'opacity-0'
                    : 'opacity-100 hover:scale-[1.03] hover:-rotate-1 hover:shadow-md'}`}
    >
      {name}
    </div>
  )
}

// The chip that follows the pointer while actively dragging — scaled up,
// tilted, and shadowed so it visually "lifts" off the page, like picking up
// a slip of paper.
function StaticChip({ name }) {
  return (
    <div className="px-3 py-2 bg-white rounded-lg border border-slate-300 text-sm
                    text-slate-800 font-medium shadow-xl select-none scale-110 -rotate-3">
      {name}
    </div>
  )
}

function DroppableColumn({ columnId, label, schools }) {
  const { setNodeRef, isOver } = useDroppable({ id: columnId })
  const style = COLUMN_STYLE[label]
  return (
    <div
      ref={setNodeRef}
      className={`rounded-2xl border-2 p-4 min-h-[108px] transition-all
                  ${style.bg} ${isOver ? 'border-slate-400 scale-[1.01]' : style.border}`}
    >
      <div className="flex items-center gap-2 mb-3">
        <img src={style.icon} alt={label} className="w-5 h-5" />
        <span className={`text-xs font-semibold uppercase tracking-wide ${style.text}`}>
          {label}
        </span>
        <span className={`ml-auto text-xs font-semibold ${style.text} opacity-60`}>
          {schools.length}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {schools.map(s => (
          <DraggableChip key={s.id} id={s.id} name={s.school_name} />
        ))}
        {schools.length === 0 && (
          <p className="text-xs text-slate-400 select-none py-2">Drop schools here</p>
        )}
      </div>
    </div>
  )
}

function UnplacedTray({ schools }) {
  const { setNodeRef, isOver } = useDroppable({ id: 'tray-unplaced' })
  return (
    <div
      ref={setNodeRef}
      className={`bg-[#E2E4EA] rounded-2xl p-4 h-full transition-all
                  ${isOver ? 'ring-2 ring-slate-400' : ''}`}
    >
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
        Drag each school to your prediction
      </p>
      <div className="flex flex-col gap-2 min-h-[40px]">
        {schools.map(s => (
          <DraggableChip key={s.id} id={s.id} name={s.school_name} />
        ))}
        {schools.length === 0 && (
          <p className="text-xs text-slate-400 select-none">All schools placed!</p>
        )}
      </div>
    </div>
  )
}

export default function DragGuess({ schools, guesses, onDrop, footer }) {
  const [activeSchool, setActiveSchool] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor,   { activationConstraint: { delay: 150, tolerance: 8 } })
  )

  const unplaced   = schools.filter(s => !guesses[s.id])
  const admitted   = schools.filter(s => guesses[s.id] === 'Admitted')
  const waitlisted = schools.filter(s => guesses[s.id] === 'Waitlisted')
  const rejected   = schools.filter(s => guesses[s.id] === 'Rejected')

  function handleDragStart({ active }) {
    setActiveSchool(schools.find(s => s.id === active.id) ?? null)
    playPickup()
  }

  function handleDragEnd({ active, over }) {
    setActiveSchool(null)
    if (!over) return
    if (over.id === 'tray-unplaced') {
      onDrop(active.id, null)
    } else {
      const column = String(over.id).replace('col-', '')
      if (COLUMNS.includes(column)) {
        onDrop(active.id, column)
        playStamp()
      }
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-[200px_1fr] gap-3 items-start">
        <UnplacedTray schools={unplaced} />
        <div className="flex flex-col gap-3">
          <DroppableColumn columnId="col-Admitted"   label="Admitted"   schools={admitted}   />
          <DroppableColumn columnId="col-Waitlisted" label="Waitlisted" schools={waitlisted} />
          <DroppableColumn columnId="col-Rejected"   label="Rejected"   schools={rejected}   />
          {footer}
        </div>
      </div>

      <DragOverlay dropAnimation={null}>
        {activeSchool ? <StaticChip name={activeSchool.school_name} /> : null}
      </DragOverlay>
    </DndContext>
  )
}