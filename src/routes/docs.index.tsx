import { createFileRoute, Link } from '@tanstack/react-router'
import { getDocuments } from '../server/documents'
import styled from 'styled-components'
import { Card } from '../components/ui/Card'
import { FileText } from 'lucide-react'

export const Route = createFileRoute('/docs/')({
  loader: async () => {
    // Hardcoding proj-1 for demo purposes
    const docs = await getDocuments({ data: 'proj-1' })
    return { docs }
  },
  component: DocsList,
})

const Header = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`

const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography.sizes.xxl};
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
`

const DocCard = styled(Card)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  
  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`

function DocsList() {
  const { docs } = Route.useLoaderData()

  return (
    <div>
      <Header>
        <Title>Documents</Title>
      </Header>
      
      <Grid>
        {docs.map(doc => (
          <Link to={`/docs/${doc.id}`} key={doc.id}>
            <DocCard $clickable $glass>
              <FileText size={24} color="#6D7A8C" />
              <div style={{ fontWeight: 500 }}>{doc.title}</div>
            </DocCard>
          </Link>
        ))}
      </Grid>
    </div>
  )
}
