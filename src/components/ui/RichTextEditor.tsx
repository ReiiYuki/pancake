import styled from 'styled-components';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect, useRef } from 'react';

const EditorWrapper = styled.div<{ $isFocused: boolean }>`
  border: 1px solid ${({ theme, $isFocused }) => 
    $isFocused ? theme.colors.primary : theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.sm};
  background-color: white;
  transition: all 0.2s;
  min-height: 100px;
  cursor: text;

  .ProseMirror {
    outline: none;
    font-size: 14px;
    line-height: 1.5;

    p.is-editor-empty:first-child::before {
      content: attr(data-placeholder);
      float: left;
      color: ${({ theme }) => theme.colors.text.light};
      pointer-events: none;
      height: 0;
    }

    ul, ol {
      padding-left: 1.5rem;
      margin-bottom: 0.5rem;
    }
  }
`;

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  editable?: boolean;
}

export function RichTextEditor({ content, onChange, placeholder = 'Add a description...', editable = true }: RichTextEditorProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Sync content if it changes externally
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) return null;

  return (
    <EditorWrapper 
      $isFocused={editor.isFocused}
      onClick={() => editor.commands.focus()}
      ref={wrapperRef}
    >
      <EditorContent editor={editor} />
    </EditorWrapper>
  );
}
