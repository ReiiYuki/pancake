import { createFileRoute } from '@tanstack/react-router'
import { getDocument, updateDocument } from '../server/documents'
import styled from 'styled-components'
import { useState, useEffect } from 'react'
import { TextArea, Input } from '../components/ui/Input'

export const Route = createFileRoute('/docs/$docId')({
  loader: async ({ params }) => {
    const doc = await getDocument({ data: params.docId })
    if (!doc) throw new Error('Document not found')
    return { doc }
  },
  component: DocumentEditor,
})

const EditorContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.xxl} 0;
`

const TitleInput = styled(Input)`
  font-size: 40px;
  font-weight: 700;
  border: none;
  background: transparent;
  padding: 0;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  
  &:focus {
    box-shadow: none;
    outline: none;
  }
`

const ContentArea = styled(TextArea)`
  font-size: 16px;
  line-height: 1.6;
  border: none;
  background: transparent;
  padding: 0;
  min-height: 500px;

  &:focus {
    box-shadow: none;
    outline: none;
  }
`

function DocumentEditor() {
  const { doc } = Route.useLoaderData()
  const [title, setTitle] = useState(doc.title)
  const [content, setContent] = useState(doc.content)

  // Sync hydration
  useEffect(() => {
    setTitle(doc.title)
    setContent(doc.content)
  }, [doc])

  // Simple auto-save simulation
  useEffect(() => {
    const handler = setTimeout(() => {
      if (title !== doc.title || content !== doc.content) {
        updateDocument({ data: { id: doc.id, title, content } })
      }
    }, 1000)
    return () => clearTimeout(handler)
  }, [title, content, doc.id, doc.title, doc.content])

  return (
    <EditorContainer>
      <TitleInput 
        value={title} 
        onChange={(e) => setTitle(e.target.value)} 
        placeholder="Untitled"
      />
      <ContentArea 
        value={content} 
        onChange={(e) => setContent(e.target.value)} 
        placeholder="Start typing..."
      />
    </EditorContainer>
  )
}
