import { createFileRoute, Link } from '@tanstack/react-router'
import { getProjects, getTasks } from '../server/tasks'
import { getDocuments } from '../server/documents'
import { Card } from '../components/ui/Card'
import styled from 'styled-components'
import { CheckCircle2, Circle, Clock, FileText } from 'lucide-react'

export const Route = createFileRoute('/')({
  loader: async () => {
    const projects = await getProjects()
    const allTasks = await Promise.all(projects.map(p => getTasks({ data: p.id })))
    const tasks = allTasks.flat()
    
    // My Tasks (mock user-1)
    const myTasks = tasks.filter(t => t.assigneeId === 'user-1' && t.status !== 'done')
    
    // Activity overview
    const projectStats = projects.map((p, i) => {
      const pTasks = allTasks[i]
      return {
        ...p,
        todoTasks: pTasks.filter(t => t.status === 'todo').length,
        inProgressTasks: pTasks.filter(t => t.status === 'in-progress').length,
        doneTasks: pTasks.filter(t => t.status === 'done').length,
      }
    })

    const docs = await getDocuments({ data: 'proj-1' }) // Mock proj-1 docs for now

    return { projects: projectStats, myTasks, docs }
  },
  component: Dashboard,
})

const Header = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`

const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography.sizes.xxl};
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xxl};
`

const DashboardLayout = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xl};
`

const MainCol = styled.div`
  flex: 3;
`

const SideCol = styled.div`
  flex: 1;
`

const ProjectCardTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
`

const ProjectCardDesc = styled.p`
  color: ${({ theme }) => theme.colors.text.light};
  font-size: 14px;
  margin-bottom: 16px;
`

const TaskItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  
  &:last-child {
    border-bottom: none;
  }
`

const DocItem = styled(Link)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  text-decoration: none;
  color: inherit;
  transition: background 0.2s;
  
  &:hover {
    background: rgba(0,0,0,0.02);
  }
  
  &:last-child {
    border-bottom: none;
  }
`

function Dashboard() {
  const { projects, myTasks, docs } = Route.useLoaderData()

  return (
    <div>
      <Header>
        <Title>Good morning, Alice 👋</Title>
      </Header>
      
      <DashboardLayout>
        <MainCol>
          <h2 style={{ marginBottom: '16px', fontSize: '20px' }}>Recent Projects</h2>
          <Grid>
            {projects.map((p) => (
              <Link key={p.id} to={`/projects/${p.id}/board`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <Card $glass $clickable>
                  <ProjectCardTitle>{p.name}</ProjectCardTitle>
                  <ProjectCardDesc>{p.description}</ProjectCardDesc>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: '#6D7A8C' }}>
                    <span><Circle size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} /> {p.todoTasks} To Do</span>
                    <span><Clock size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} /> {p.inProgressTasks} In Progress</span>
                    <span><CheckCircle2 size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} /> {p.doneTasks} Done</span>
                  </div>
                </Card>
              </Link>
            ))}
          </Grid>

          <h2 style={{ marginBottom: '16px', fontSize: '20px' }}>My Tasks</h2>
          <Card $glass style={{ padding: 0 }}>
            {myTasks.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#6D7A8C' }}>You're all caught up! 🎉</div>
            ) : (
              myTasks.map(t => (
                <TaskItem key={t.id}>
                  {t.status === 'in-progress' ? <Clock size={18} color="#f59e0b" /> : <Circle size={18} color="#6D7A8C" />}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, fontSize: '14px' }}>{t.title}</div>
                    <div style={{ fontSize: '12px', color: '#6D7A8C' }}>{t.projectId}</div>
                  </div>
                </TaskItem>
              ))
            )}
          </Card>
        </MainCol>

        <SideCol>
          <h2 style={{ marginBottom: '16px', fontSize: '20px' }}>Recent Docs</h2>
          <Card $glass style={{ padding: 0 }}>
            {docs.map(doc => (
              <DocItem key={doc.id} to={`/docs/${doc.id}`}>
                {doc.icon ? <span>{doc.icon}</span> : <FileText size={18} color="#6D7A8C" />}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, fontSize: '14px' }}>{doc.title}</div>
                  <div style={{ fontSize: '12px', color: '#6D7A8C' }}>{new Date(doc.updatedAt).toLocaleDateString()}</div>
                </div>
              </DocItem>
            ))}
          </Card>
        </SideCol>
      </DashboardLayout>
    </div>
  )
}
