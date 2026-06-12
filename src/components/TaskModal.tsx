import styled from 'styled-components';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { useState, useEffect } from 'react';
import { getComments, createComment, updateTask } from '../server/tasks';
import type { Task, User, Comment } from '../db/memoryStore';
import { RichTextEditor } from './ui/RichTextEditor';
import { useRouter } from '@tanstack/react-router';

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

const DescriptionContainer = styled.div`
  margin-bottom: 24px;
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

const Select = styled.select`
  width: 100%;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: white;
  font-family: inherit;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text.main};
  cursor: pointer;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }
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
  const [description, setDescription] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (isOpen && task) {
      getComments({ data: task.id }).then(setComments);
      setDescription(task.description || '');
    }
  }, [isOpen, task]);

  // Debounced description save
  useEffect(() => {
    if (!task) return;
    const handler = setTimeout(() => {
      if (description !== task.description) {
        updateTask({ data: { id: task.id, description } });
      }
    }, 1000);
    return () => clearTimeout(handler);
  }, [description, task]);

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
          <DescriptionContainer>
            <RichTextEditor 
              content={description}
              onChange={setDescription}
              placeholder="Add a more detailed description..."
            />
          </DescriptionContainer>

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
            <Select 
              value={task.status}
              onChange={async (e) => {
                await updateTask({ data: { id: task.id, status: e.target.value as Task['status'] } });
                router.invalidate();
              }}
            >
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </Select>
          </PropertyValue>

          <PropertyLabel>Assignee</PropertyLabel>
          <PropertyValue>
            {task.assignee && <Avatar src={task.assignee.avatarUrl} alt={task.assignee.name} style={{ width: 20, height: 20 }} />}
            <Select 
              value={task.assigneeId || ''}
              onChange={async (e) => {
                await updateTask({ data: { id: task.id, assigneeId: e.target.value } });
                router.invalidate();
              }}
            >
              <option value="">Unassigned</option>
              <option value="user-1">Alice</option>
              <option value="user-2">Bob</option>
            </Select>
          </PropertyValue>

          <PropertyLabel>Priority</PropertyLabel>
          <PropertyValue>
            <Select 
              value={task.priority}
              onChange={async (e) => {
                await updateTask({ data: { id: task.id, priority: e.target.value as Task['priority'] } });
                router.invalidate();
              }}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </Select>
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
