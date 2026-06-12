import { createFileRoute } from '@tanstack/react-router'
import { getProjects, getTasks } from '../server/tasks'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import styled from 'styled-components'

export const Route = createFileRoute('/')({
  loader: async () => {
    const projects = await getProjects()
    const tasks = await getTasks({ data: 'proj-1' })
    return { projects, tasks }
  },
  component: Dashboard,
})

const PageHeader = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography.sizes.xxl};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xxl};
`

const ProjectCardTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`

const ProjectCardDesc = styled.p`
  color: ${({ theme }) => theme.colors.text.light};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`

function Dashboard() {
  const { projects, tasks } = Route.useLoaderData()

  const todoTasks = tasks.filter(t => t.status === 'todo').length
  const doneTasks = tasks.filter(t => t.status === 'done').length

  return (
    <div>
      <PageHeader>
        <Title>Good morning, team!</Title>
        <Button variant="primary">+ New Project</Button>
      </PageHeader>

      <h2 style={{ marginBottom: '16px' }}>Recent Projects</h2>
      <Grid>
        {projects.map((p) => (
          <Card key={p.id} $glass $clickable>
            <ProjectCardTitle>{p.name}</ProjectCardTitle>
            <ProjectCardDesc>{p.description}</ProjectCardDesc>
            <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: '#6D7A8C' }}>
              <span>{todoTasks} To Do</span>
              <span>{doneTasks} Done</span>
            </div>
          </Card>
        ))}
      </Grid>
      
      <h2 style={{ marginBottom: '16px' }}>My Priorities</h2>
      <Card>
        {tasks.map(t => (
          <div key={t.id} style={{ padding: '12px 0', borderBottom: '1px solid #E8ECEE', display: 'flex', justifyContent: 'space-between' }}>
            <span>{t.title}</span>
            <span style={{ 
              padding: '4px 8px', 
              borderRadius: '4px', 
              backgroundColor: t.status === 'done' ? '#E3FCEF' : '#F2F4F7',
              color: t.status === 'done' ? '#006644' : '#6D7A8C',
              fontSize: '12px'
            }}>
              {t.status}
            </span>
          </div>
        ))}
      </Card>
    </div>
  )
}
