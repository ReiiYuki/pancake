import { createFileRoute, Link } from '@tanstack/react-router'
import { getProject, getTasks } from '../server/tasks'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Task, User } from '../db/memoryStore'
import { styled } from 'styled-components'
import { CheckCircle2, Circle, Clock, MoreHorizontal, LayoutGrid, List as ListIcon } from 'lucide-react'
import { TaskModal } from '../components/TaskModal'

type PopulatedTask = Task & { assignee?: User };

export const Route = createFileRoute('/projects/$projectId/list')({
  loader: async ({ params }) => {
    const project = await getProject({ data: params.projectId })
    const tasks = await getTasks({ data: params.projectId })
    if (!project) throw new Error('Project not found')
    return { project, tasks }
  },
  component: ProjectListView,
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

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`

const Th = styled.th`
  text-align: left;
  padding: 12px 16px;
  color: ${({ theme }) => theme.colors.text.light};
  font-weight: 500;
  font-size: 14px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`

const Td = styled.td`
  padding: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  vertical-align: middle;
  font-size: 14px;
`

const TaskRow = styled(motion.tr)`
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    background: rgba(0,0,0,0.02);
  }
`

const StatusBadge = styled.span<{ $status: string }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  background-color: ${({ $status }) => 
    $status === 'done' ? '#e8f5e9' : 
    $status === 'in-progress' ? '#fff8e1' : '#f5f5f5'};
  color: ${({ $status }) => 
    $status === 'done' ? '#2e7d32' : 
    $status === 'in-progress' ? '#f57f17' : '#616161'};
  text-transform: capitalize;
`

function ProjectListView() {
  const { project, tasks: initialTasks } = Route.useLoaderData()
  const [tasks, setTasks] = useState<PopulatedTask[]>(initialTasks)
  const [selectedTask, setSelectedTask] = useState<PopulatedTask | null>(null)
  const [filterAssignee, setFilterAssignee] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    setTasks(initialTasks)
  }, [initialTasks])

  return (
    <div>
      <HeaderContainer>
        <ProjectTitle>{project.name}</ProjectTitle>
        <Tabs>
          <Tab to={`/projects/${project.id}/board`}>
            <LayoutGrid size={16} /> Board
          </Tab>
          <Tab to={`/projects/${project.id}/list`} className="active">
            <ListIcon size={16} /> List
          </Tab>
        </Tabs>
      </HeaderContainer>

      <FilterBar>
        <FilterSelect value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">All Statuses</option>
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </FilterSelect>
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

      <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #e0e5ea', overflow: 'hidden' }}>
        <Table>
          <thead>
            <tr>
              <Th style={{ width: '40%' }}>Task Name</Th>
              <Th>Status</Th>
              <Th>Assignee</Th>
              <Th>Priority</Th>
              <Th>Due Date</Th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {tasks.filter(t => 
                (filterStatus === 'all' || t.status === filterStatus) &&
                (filterAssignee === 'all' || (filterAssignee === 'unassigned' ? !t.assigneeId : t.assigneeId === filterAssignee)) &&
                (filterPriority === 'all' || t.priority === filterPriority)
              ).map((task) => (
                <TaskRow 
                  key={task.id} 
                  onClick={() => setSelectedTask(task)}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                >
                  <Td style={{ fontWeight: 500 }}>{task.title}</Td>
                  <Td>
                    <StatusBadge $status={task.status}>
                      {task.status.replace('-', ' ')}
                    </StatusBadge>
                  </Td>
                  <Td>
                    {task.assignee ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <img src={task.assignee.avatarUrl} alt="" style={{ width: 24, height: 24, borderRadius: '50%' }} />
                        {task.assignee.name}
                      </div>
                    ) : (
                      <span style={{ color: '#9e9e9e' }}>Unassigned</span>
                    )}
                  </Td>
                  <Td style={{ textTransform: 'capitalize' }}>
                    {task.priority}
                  </Td>
                  <Td style={{ color: '#9e9e9e' }}>
                    {new Date(task.createdAt).toLocaleDateString()}
                  </Td>
                </TaskRow>
              ))}
            </AnimatePresence>
          </tbody>
        </Table>
      </div>

      <TaskModal 
        task={selectedTask} 
        isOpen={!!selectedTask} 
        onClose={() => setSelectedTask(null)} 
      />
    </div>
  )
}
