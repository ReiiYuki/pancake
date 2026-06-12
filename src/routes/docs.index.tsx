import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { getDocuments, createDocument, deleteDocument } from '../server/documents'
import styled from 'styled-components'
import { Card } from '../components/ui/Card'
import { FileText, Plus, Trash2 } from 'lucide-react'
import { useState, useEffect } from 'react'

export const Route = createFileRoute('/docs/')({
  loader: async () => {
    // Hardcoding proj-1 for demo purposes
    const docs = await getDocuments({ data: 'proj-1' })
    return { docs }
  },
  component: DocsList,
})

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};
  position: relative;
  
  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }

  .delete-btn {
    opacity: 0;
    background: transparent;
    border: none;
    color: ${({ theme }) => theme.colors.text.light};
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px;
    
    &:hover {
      color: ${({ theme }) => theme.colors.primaryHover};
    }
  }

  &:hover .delete-btn {
    opacity: 1;
  }
`

const CreateButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  padding: 8px 16px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }
`

function DocsList() {
  const { docs: initialDocs } = Route.useLoaderData()
  const [docs, setDocs] = useState(initialDocs)
  const navigate = useNavigate()

  useEffect(() => {
    setDocs(initialDocs)
  }, [initialDocs])

  const handleCreate = async () => {
    try {
      const newDoc = await createDocument({
        data: {
          title: 'Untitled Document',
          content: '',
          projectId: 'proj-1'
        }
      })
      navigate({ to: `/docs/${newDoc.id}` })
    } catch (e) {
      console.error(e)
    }
  }

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm('Are you sure you want to delete this document?')) return

    setDocs(current => current.filter(d => d.id !== id))
    try {
      await deleteDocument({ data: id })
    } catch (err) {
      setDocs(initialDocs)
    }
  }

  return (
    <div>
      <Header>
        <Title>Documents</Title>
        <CreateButton onClick={handleCreate}>
          <Plus size={16} /> New Document
        </CreateButton>
      </Header>
      
      <Grid>
        {docs.map(doc => (
          <Link to={`/docs/${doc.id}`} key={doc.id} style={{ textDecoration: 'none', color: 'inherit' }}>
            <DocCard $clickable $glass>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {doc.icon ? <span style={{ fontSize: '24px' }}>{doc.icon}</span> : <FileText size={24} color="#6D7A8C" />}
                <div style={{ fontWeight: 500 }}>{doc.title}</div>
              </div>
              <button className="delete-btn" onClick={(e) => handleDelete(e, doc.id)}>
                <Trash2 size={16} />
              </button>
            </DocCard>
          </Link>
        ))}
      </Grid>
    </div>
  )
}
