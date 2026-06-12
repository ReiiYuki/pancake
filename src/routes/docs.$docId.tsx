import { createFileRoute } from '@tanstack/react-router'
import { getDocument, updateDocument } from '../server/documents'
import styled from 'styled-components'
import { useState, useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { Input } from '../components/ui/Input'

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

const TiptapWrapper = styled.div`
  .ProseMirror {
    min-height: 500px;
    outline: none;
    font-size: 16px;
    line-height: 1.6;

    p.is-editor-empty:first-child::before {
      content: attr(data-placeholder);
      float: left;
      color: ${({ theme }) => theme.colors.text.light};
      pointer-events: none;
      height: 0;
    }
    
    h1, h2, h3, h4, h5, h6 {
      margin-top: 1.5em;
      margin-bottom: 0.5em;
      font-weight: 600;
    }

    ul, ol {
      padding-left: 1.5rem;
      margin-bottom: 1rem;
    }
  }
`

function DocumentEditor() {
  const { doc } = Route.useLoaderData()
  const [title, setTitle] = useState(doc.title)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Start typing your document...',
      }),
    ],
    content: doc.content,
    onUpdate: ({ editor }) => {
      // Auto-save simulation
      updateDocument({ data: { id: doc.id, title, content: editor.getHTML() } })
    },
  })

  // Sync hydration
  useEffect(() => {
    setTitle(doc.title)
    if (editor && editor.getHTML() !== doc.content) {
      editor.commands.setContent(doc.content)
    }
  }, [doc, editor])

  // Auto-save title simulation
  useEffect(() => {
    const handler = setTimeout(() => {
      if (title !== doc.title) {
        updateDocument({ data: { id: doc.id, title, content: editor?.getHTML() || '' } })
      }
    }, 1000)
    return () => clearTimeout(handler)
  }, [title, doc.id, doc.title, editor])

  return (
    <EditorContainer>
      <TitleInput 
        value={title} 
        onChange={(e) => setTitle(e.target.value)} 
        placeholder="Untitled"
      />
      <TiptapWrapper>
        <EditorContent editor={editor} />
      </TiptapWrapper>
    </EditorContainer>
  )
}
