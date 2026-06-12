import { createFileRoute } from '@tanstack/react-router'
import { getDocument, updateDocument } from '../server/documents'
import styled from 'styled-components'
import { useState, useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { Input } from '../components/ui/Input'
import { Image as ImageIcon, SmilePlus } from 'lucide-react'

export const Route = createFileRoute('/docs/$docId')({
  loader: async ({ params }) => {
    const doc = await getDocument({ data: params.docId })
    if (!doc) throw new Error('Document not found')
    return { doc }
  },
  component: DocumentEditor,
})

const EditorPage = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`

const CoverImage = styled.div<{ $url?: string }>`
  height: 30vh;
  width: 100%;
  background-color: ${({ theme }) => theme.colors.border};
  background-image: ${({ $url }) => $url ? `url(${$url})` : 'none'};
  background-size: cover;
  background-position: center;
  position: relative;
  
  &:hover .cover-controls {
    opacity: 1;
  }
`

const CoverControls = styled.div`
  position: absolute;
  bottom: 16px;
  right: 16px;
  opacity: 0;
  transition: opacity 0.2s;
  display: flex;
  gap: 8px;
`

const ControlButton = styled.button`
  background: white;
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: ${({ theme }) => theme.shadows.sm};
  
  &:hover {
    background: #f9fafb;
  }
`

const ContentWrapper = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing.xl};
  width: 100%;
  position: relative;
`

const IconContainer = styled.div`
  font-size: 72px;
  margin-top: -36px;
  margin-bottom: 16px;
  position: relative;
  width: max-content;
  
  &:hover .icon-controls {
    opacity: 1;
  }
`

const IconControls = styled.div`
  position: absolute;
  top: 0;
  right: -80px;
  opacity: 0;
  transition: opacity 0.2s;
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

const DEFAULT_COVERS = [
  'https://images.unsplash.com/photo-1707343843437-caacff5cfa74',
  'https://images.unsplash.com/photo-1506744626753-eda81827436f',
  'https://images.unsplash.com/photo-1493246507139-91e8fad9978e'
]

function DocumentEditor() {
  const { doc } = Route.useLoaderData()
  const [title, setTitle] = useState(doc.title)
  const [coverUrl, setCoverUrl] = useState(doc.coverUrl)
  const [icon, setIcon] = useState(doc.icon || '📄')

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Start typing your document...',
      }),
    ],
    content: doc.content,
    onUpdate: ({ editor }) => {
      updateDocument({ data: { id: doc.id, content: editor.getHTML() } })
    },
  })

  // Sync hydration
  useEffect(() => {
    setTitle(doc.title)
    setCoverUrl(doc.coverUrl)
    setIcon(doc.icon || '📄')
    if (editor && editor.getHTML() !== doc.content) {
      editor.commands.setContent(doc.content)
    }
  }, [doc, editor])

  // Debounced auto-save
  useEffect(() => {
    const handler = setTimeout(() => {
      if (title !== doc.title || coverUrl !== doc.coverUrl || icon !== doc.icon) {
        updateDocument({ data: { id: doc.id, title, coverUrl, icon } })
      }
    }, 1000)
    return () => clearTimeout(handler)
  }, [title, coverUrl, icon, doc.id, doc.title, doc.coverUrl, doc.icon])

  const addRandomCover = () => {
    const random = DEFAULT_COVERS[Math.floor(Math.random() * DEFAULT_COVERS.length)];
    setCoverUrl(random);
  }

  const removeCover = () => {
    setCoverUrl(undefined);
  }

  return (
    <EditorPage>
      {coverUrl ? (
        <CoverImage $url={coverUrl}>
          <CoverControls className="cover-controls">
            <ControlButton onClick={addRandomCover}>Change Cover</ControlButton>
            <ControlButton onClick={removeCover}>Remove</ControlButton>
          </CoverControls>
        </CoverImage>
      ) : (
        <ContentWrapper style={{ paddingTop: '40px' }}>
          <ControlButton onClick={addRandomCover} style={{ marginBottom: '16px', background: 'transparent', border: 'none', padding: 0 }}>
            <ImageIcon size={16} /> Add Cover
          </ControlButton>
        </ContentWrapper>
      )}

      <ContentWrapper>
        <IconContainer>
          {icon}
          <IconControls className="icon-controls">
            <ControlButton onClick={() => setIcon(prompt('Enter an emoji:') || icon)}>
              <SmilePlus size={14} /> Change
            </ControlButton>
          </IconControls>
        </IconContainer>
        
        <TitleInput 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          placeholder="Untitled"
        />
        <TiptapWrapper>
          <EditorContent editor={editor} />
        </TiptapWrapper>
      </ContentWrapper>
    </EditorPage>
  )
}
