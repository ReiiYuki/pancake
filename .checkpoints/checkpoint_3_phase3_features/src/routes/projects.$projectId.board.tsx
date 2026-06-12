import { createFileRoute, Link } from '@tanstack/react-router'
import { getProject, getTasks, updateTaskStatus, createTask, deleteTask } from '../server/tasks'
import { styled } from 'styled-components'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import type { DropResult } from '@hello-pangea/dnd'
import { useState, useEffect } from 'react'
import type { Task, User } from '../db/memoryStore'
import { Plus, Trash2, LayoutGrid, List as ListIcon } from 'lucide-react'
import { TaskModal } from '../components/TaskModal'

type PopulatedTask = Task & { assignee?: User };

export const Route = createFileRoute('/projects/$projectId/board')({
  loader: async ({ params }) => {
    const project = await getProject({ data: params.projectId })
    const tasks = await getTasks({ data: params.projectId })
    if (!project) throw new Error('Project not found')
    return { project, tasks, projectId: params.projectId }
  },
  component: ProjectBoard,
})

const HeaderContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`

const ProjectTitle = styled.h1`
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`

const Tabs = styled.div`
  display: flex;
  gap: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  margin-bottom: 24px;
`

const Tab = styled(Link)`
  padding: 8px 16px;
  text-decoration: none;
  color: ${({ theme }) => theme.colors.text.light};
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &.active {
    color: ${({ theme }) => theme.colors.primary};
    border-bottom: 2px solid ${({ theme }) => theme.colors.primary};
  }
`

const BoardContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.lg};
  height: calc(100vh - 120px);
  overflow-x: auto;
  align-items: flex-start;
`

const FilterBar = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
`

const FilterSelect = styled.select`
  padding: 8px;
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text.main};
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
  position: relative;

  &:active {
    cursor: grabbing;
  }

  .delete-btn {
    opacity: 0;
    position: absolute;
    top: 8px;
    right: 8px;
    background: transparent;
    border: none;
    color: ${({ theme }) => theme.colors.text.light};
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
      color: ${({ theme }) => theme.colors.primaryHover};
    }
  }

  &:hover .delete-btn {
    opacity: 1;
  }
`

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.text.light};
  background: transparent;
  border: none;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  cursor: pointer;
  border-bottom-left-radius: ${({ theme }) => theme.borderRadius.lg};
  border-bottom-right-radius: ${({ theme }) => theme.borderRadius.lg};
  transition: all ${({ theme }) => theme.transitions.default};

  &:hover {
    background-color: rgba(0,0,0,0.03);
    color: ${({ theme }) => theme.colors.text.main};
  }
`

const InlineAddForm = styled.div`
  padding: ${({ theme }) => theme.spacing.sm};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.background};
  border-bottom-left-radius: ${({ theme }) => theme.borderRadius.lg};
  border-bottom-right-radius: ${({ theme }) => theme.borderRadius.lg};

  input {
    width: 100%;
    padding: 8px;
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 4px;
    margin-bottom: 8px;
  }
  
  .actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    
    button {
      padding: 4px 12px;
      border-radius: 4px;
      cursor: pointer;
      border: none;
    }
    .cancel {
      background: transparent;
      color: ${({ theme }) => theme.colors.text.light};
    }
    .add {
      background: ${({ theme }) => theme.colors.primary};
      color: white;
    }
  }
`

const COLUMNS: { id: Task['status']; title: string }[] = [
  { id: 'todo', title: 'To Do' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'done', title: 'Done' }
]

function ProjectBoard() {
  const { project, tasks: initialTasks, projectId } = Route.useLoaderData()
  const [tasks, setTasks] = useState<PopulatedTask[]>(initialTasks)
  const [addingToCol, setAddingToCol] = useState<Task['status'] | null>(null)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [selectedTask, setSelectedTask] = useState<PopulatedTask | null>(null)
  const [filterAssignee, setFilterAssignee] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')

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

    try {
      await updateTaskStatus({ data: { id: draggableId, status: newStatus } })
    } catch (e) {
      setTasks(initialTasks) // Revert
    }
  }

  const handleAddTask = async (status: Task['status']) => {
    if (!newTaskTitle.trim()) return
    
    // Optimistic creation
    const tempId = `temp-${Date.now()}`
    const tempTask: PopulatedTask = {
      id: tempId,
      title: newTaskTitle,
      description: '',
      status,
      priority: 'medium',
      projectId,
      reporterId: 'user-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      labels: []
    }
    setTasks([...tasks, tempTask])
    setAddingToCol(null)
    setNewTaskTitle('')

    try {
      const realTask = await createTask({
        data: {
          title: tempTask.title,
          description: '',
          status,
          priority: 'medium',
          projectId
        }
      })
      // Cast since server doesn't populate assignee on creation yet
      setTasks(current => current.map(t => t.id === tempId ? (realTask as PopulatedTask) : t))
    } catch (e) {
      setTasks(tasks) // Revert
    }
  }

  const handleDeleteTask = async (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation()
    // Optimistic
    setTasks(current => current.filter(t => t.id !== taskId))
    try {
      await deleteTask({ data: taskId })
    } catch (e) {
      setTasks(initialTasks)
    }
  }

  return (
    <div>
      <HeaderContainer>
        <ProjectTitle>{project.name}</ProjectTitle>
        <Tabs>
          <Tab to={`/projects/${project.id}/board`} className="active">
            <LayoutGrid size={16} /> Board
          </Tab>
          <Tab to={`/projects/${project.id}/list`}>
            <ListIcon size={16} /> List
          </Tab>
        </Tabs>
      </HeaderContainer>

      <FilterBar>
        <FilterSelect value={filterAssignee} onChange={e => setFilterAssignee(e.target.value)}>
          <option value="all">All Assignees</option>
          <option value="user-1">Alice</option>
          <option value="user-2">Bob</option>
          <option value="unassigned">Unassigned</option>
        </FilterSelect>
        <FilterSelect value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
          <option value="all">All Priorities</option>
          <option value="high">High Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="low">Low Priority</option>
        </FilterSelect>
      </FilterBar>
      
      <DragDropContext onDragEnd={onDragEnd}>
        <BoardContainer>
          {COLUMNS.map(col => (
            <Column key={col.id}>
              <ColumnHeader>
                {col.title}
                <span style={{ fontSize: '12px', color: '#6D7A8C' }}>
                  {tasks.filter(t => t.status === col.id && (filterAssignee === 'all' || (filterAssignee === 'unassigned' ? !t.assigneeId : t.assigneeId === filterAssignee)) && (filterPriority === 'all' || t.priority === filterPriority)).length}
                </span>
              </ColumnHeader>
              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <TaskList
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    $isDraggingOver={snapshot.isDraggingOver}
                  >
                    {tasks.filter(t => t.status === col.id && (filterAssignee === 'all' || (filterAssignee === 'unassigned' ? !t.assigneeId : t.assigneeId === filterAssignee)) && (filterPriority === 'all' || t.priority === filterPriority)).map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <TaskCard
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            $isDragging={snapshot.isDragging}
                            onClick={() => setSelectedTask(task)}
                          >
                            <div style={{ fontWeight: 500, marginBottom: '8px', paddingRight: '20px' }}>{task.title}</div>
                            <button className="delete-btn" onClick={(e) => handleDeleteTask(e, task.id)}>
                              <Trash2 size={14} />
                            </button>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ fontSize: '12px', color: '#6D7A8C' }}>{task.priority} priority</div>
                              {task.assignee && (
                                <img 
                                  src={task.assignee.avatarUrl} 
                                  alt={task.assignee.name} 
                                  title={task.assignee.name}
                                  style={{ width: '24px', height: '24px', borderRadius: '50%' }}
                                />
                              )}
                            </div>
                          </TaskCard>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </TaskList>
                )}
              </Droppable>
              {addingToCol === col.id ? (
                <InlineAddForm>
                  <input 
                    autoFocus
                    placeholder="What needs to be done?"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddTask(col.id)
                      if (e.key === 'Escape') {
                        setAddingToCol(null)
                        setNewTaskTitle('')
                      }
                    }}
                  />
                  <div className="actions">
                    <button className="cancel" onClick={() => {
                      setAddingToCol(null)
                      setNewTaskTitle('')
                    }}>Cancel</button>
                    <button className="add" onClick={() => handleAddTask(col.id)}>Add</button>
                  </div>
                </InlineAddForm>
              ) : (
                <AddButton onClick={() => setAddingToCol(col.id)}>
                  <Plus size={16} /> Add Task
                </AddButton>
              )}
            </Column>
          ))}
        </BoardContainer>
      </DragDropContext>
      
      <TaskModal 
        task={selectedTask} 
        isOpen={!!selectedTask} 
        onClose={() => setSelectedTask(null)} 
      />
    </div>
  )
}
