import { createFileRoute } from '@tanstack/react-router'
import { getTasks, updateTaskStatus } from '../server/tasks'
import styled from 'styled-components'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import type { DropResult } from '@hello-pangea/dnd'
import { useState, useEffect } from 'react'
import type { Task } from '../db/memoryStore'

export const Route = createFileRoute('/projects/$projectId/board')({
  loader: async ({ params }) => {
    const tasks = await getTasks({ data: params.projectId })
    return { tasks }
  },
  component: Board,
})

const BoardContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.lg};
  height: calc(100vh - 120px);
  overflow-x: auto;
  align-items: flex-start;
`

const Column = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  width: 320px;
  min-width: 320px;
  display: flex;
  flex-direction: column;
  max-height: 100%;
  border: 1px solid ${({ theme }) => theme.colors.border};
`

const ColumnHeader = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const TaskList = styled.div<{ $isDraggingOver: boolean }>`
  padding: ${({ theme }) => theme.spacing.sm};
  flex: 1;
  overflow-y: auto;
  background-color: ${({ $isDraggingOver, theme }) => 
    $isDraggingOver ? 'rgba(0,0,0,0.02)' : 'transparent'};
  min-height: 100px;
`

const TaskCard = styled.div<{ $isDragging: boolean }>`
  background-color: white;
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  box-shadow: ${({ $isDragging, theme }) => 
    $isDragging ? theme.shadows.lg : theme.shadows.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  cursor: grab;

  &:active {
    cursor: grabbing;
  }
`

const COLUMNS: { id: Task['status']; title: string }[] = [
  { id: 'todo', title: 'To Do' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'done', title: 'Done' }
]

function Board() {
  const { tasks: initialTasks } = Route.useLoaderData()
  const [tasks, setTasks] = useState(initialTasks)

  // Hydration sync
  useEffect(() => {
    setTasks(initialTasks)
  }, [initialTasks])

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result

    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) return

    const newStatus = destination.droppableId as Task['status']
    
    // Optimistic update
    const updatedTasks = tasks.map(t => 
      t.id === draggableId ? { ...t, status: newStatus } : t
    )
    setTasks(updatedTasks)

    // Server update
    try {
      await updateTaskStatus({ data: { id: draggableId, status: newStatus } })
    } catch (e) {
      // Revert if error
      setTasks(initialTasks)
    }
  }

  return (
    <div>
      <h1 style={{ marginBottom: '24px' }}>Project Board</h1>
      <DragDropContext onDragEnd={onDragEnd}>
        <BoardContainer>
          {COLUMNS.map(col => (
            <Column key={col.id}>
              <ColumnHeader>
                {col.title}
                <span style={{ fontSize: '12px', color: '#6D7A8C' }}>
                  {tasks.filter(t => t.status === col.id).length}
                </span>
              </ColumnHeader>
              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <TaskList
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    $isDraggingOver={snapshot.isDraggingOver}
                  >
                    {tasks.filter(t => t.status === col.id).map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <TaskCard
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            $isDragging={snapshot.isDragging}
                          >
                            <div style={{ fontWeight: 500, marginBottom: '8px' }}>{task.title}</div>
                            <div style={{ fontSize: '12px', color: '#6D7A8C' }}>{task.priority} priority</div>
                          </TaskCard>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </TaskList>
                )}
              </Droppable>
            </Column>
          ))}
        </BoardContainer>
      </DragDropContext>
    </div>
  )
}
