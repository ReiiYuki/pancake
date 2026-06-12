import styled from 'styled-components';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { useState, useEffect } from 'react';
import { getComments, createComment } from '../server/tasks';
import type { Task, User, Comment } from '../db/memoryStore';

const ContentWrapper = styled.div`
  display: flex;
  min-height: 500px;
`;

const MainColumn = styled.div`
  flex: 3;
  padding: ${({ theme }) => theme.spacing.xl};
  border-right: 1px solid ${({ theme }) => theme.colors.border};
`;

const SidebarColumn = styled.div`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.xl};
  background-color: ${({ theme }) => theme.colors.surface};
`;

const Title = styled.h2`
  font-size: 24px;
  margin-bottom: 24px;
`;

const SectionHeader = styled.h3`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.light};
  text-transform: uppercase;
  margin-bottom: 12px;
  margin-top: 24px;
`;

const Description = styled.div`
  background: rgba(0,0,0,0.02);
  padding: 16px;
  border-radius: 8px;
  min-height: 100px;
  font-size: 14px;
  white-space: pre-wrap;
  border: 1px solid transparent;
  cursor: pointer;
  
  &:hover {
    background: rgba(0,0,0,0.04);
  }
`;

const PropertyLabel = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.light};
  margin-bottom: 4px;
`;

const PropertyValue = styled.div`
  font-size: 14px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Avatar = styled.img`
  width: 24px;
  height: 24px;
  border-radius: 50%;
`;

const CommentList = styled.div`
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const CommentItem = styled.div`
  display: flex;
  gap: 12px;
`;

const CommentContent = styled.div`
  flex: 1;
  background: white;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 14px;
`;

const CommentAuthor = styled.div`
  font-weight: 500;
  font-size: 12px;
  margin-bottom: 4px;
  display: flex;
  justify-content: space-between;
`;

const CommentInput = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  font-family: inherit;
  font-size: 14px;
  resize: vertical;
  min-height: 80px;
  margin-bottom: 8px;
`;

type PopulatedTask = Task & { assignee?: User };
type PopulatedComment = Comment & { author?: User };

interface TaskModalProps {
  task: PopulatedTask | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TaskModal({ task, isOpen, onClose }: TaskModalProps) {
  const [comments, setComments] = useState<PopulatedComment[]>([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    if (isOpen && task) {
      getComments({ data: task.id }).then(setComments);
    }
  }, [isOpen, task]);

  if (!task) return null;

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      const added = await createComment({ data: { taskId: task.id, content: newComment } });
      setComments([...comments, added as PopulatedComment]);
      setNewComment('');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ContentWrapper>
        <MainColumn>
          <Title>{task.title}</Title>
          <SectionHeader>Description</SectionHeader>
          <Description>
            {task.description || 'Add a more detailed description...'}
          </Description>

          <SectionHeader>Activity</SectionHeader>
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <Avatar src="https://i.pravatar.cc/150?u=user-1" alt="Current User" />
            <div style={{ flex: 1 }}>
              <CommentInput 
                placeholder="Add a comment..." 
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button $variant="primary" onClick={handleAddComment} disabled={!newComment.trim()}>
                  Save
                </Button>
              </div>
            </div>
          </div>

          <CommentList>
            {comments.map(c => (
              <CommentItem key={c.id}>
                <Avatar src={c.author?.avatarUrl} alt={c.author?.name} />
                <CommentContent>
                  <CommentAuthor>
                    <span>{c.author?.name}</span>
                    <span style={{ color: '#6D7A8C' }}>{new Date(c.createdAt).toLocaleDateString()}</span>
                  </CommentAuthor>
                  <div>{c.content}</div>
                </CommentContent>
              </CommentItem>
            ))}
          </CommentList>
        </MainColumn>

        <SidebarColumn>
          <PropertyLabel>Status</PropertyLabel>
          <PropertyValue>
            <span style={{ textTransform: 'uppercase', fontSize: '12px', fontWeight: 600, background: '#e0e5ea', padding: '4px 8px', borderRadius: '4px' }}>
              {task.status.replace('-', ' ')}
            </span>
          </PropertyValue>

          <PropertyLabel>Assignee</PropertyLabel>
          <PropertyValue>
            {task.assignee ? (
              <>
                <Avatar src={task.assignee.avatarUrl} alt={task.assignee.name} />
                {task.assignee.name}
              </>
            ) : (
              <span style={{ color: '#6D7A8C' }}>Unassigned</span>
            )}
          </PropertyValue>

          <PropertyLabel>Priority</PropertyLabel>
          <PropertyValue style={{ textTransform: 'capitalize' }}>
            {task.priority}
          </PropertyValue>

          <PropertyLabel>Labels</PropertyLabel>
          <PropertyValue>
            {task.labels && task.labels.length > 0 ? (
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {task.labels.map(l => (
                  <span key={l} style={{ background: '#e3f2fd', color: '#1976d2', padding: '2px 8px', borderRadius: '12px', fontSize: '12px' }}>
                    {l}
                  </span>
                ))}
              </div>
            ) : (
              <span style={{ color: '#6D7A8C' }}>None</span>
            )}
          </PropertyValue>

          <div style={{ marginTop: 'auto', paddingTop: '40px' }}>
            <PropertyLabel>Created</PropertyLabel>
            <PropertyValue style={{ fontSize: '12px', color: '#6D7A8C' }}>
              {new Date(task.createdAt).toLocaleString()}
            </PropertyValue>
            <PropertyLabel>Updated</PropertyLabel>
            <PropertyValue style={{ fontSize: '12px', color: '#6D7A8C' }}>
              {new Date(task.updatedAt).toLocaleString()}
            </PropertyValue>
          </div>
        </SidebarColumn>
      </ContentWrapper>
    </Modal>
  );
}
