import { v4 as uuidv4 } from 'uuid';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: 'admin' | 'member';
}

export interface Comment {
  id: string;
  taskId: string;
  authorId: string;
  content: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  projectId: string;
  assigneeId?: string;
  reporterId: string;
  createdAt: string;
  updatedAt: string;
  labels: string[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  projectId: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
}

export const db = {
  users: [
    { id: 'user-1', name: 'Alice', email: 'alice@example.com', avatarUrl: 'https://i.pravatar.cc/150?u=alice', role: 'admin' },
    { id: 'user-2', name: 'Bob', email: 'bob@example.com', avatarUrl: 'https://i.pravatar.cc/150?u=bob', role: 'member' }
  ] as User[],
  projects: [
    { id: 'proj-1', name: 'Frontend Refactor', description: 'Refactoring to TanStack Start', ownerId: 'user-1', createdAt: '2023-01-01T00:00:00Z', updatedAt: '2023-01-01T00:00:00Z' }
  ] as Project[],
  documents: [] as Document[],
  tasks: [] as Task[],
};

// Seed some data
db.tasks.push({
  id: uuidv4(),
  title: 'Setup Database',
  description: 'Create the in-memory database',
  status: 'done',
  priority: 'high',
  projectId: 'proj-1',
  assigneeId: 'user-1',
  reporterId: 'user-1',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  labels: ['backend']
});

db.tasks.push({
  id: uuidv4(),
  title: 'Implement Board UI',
  description: 'Create Jira-like drag and drop board',
  status: 'todo',
  priority: 'medium',
  projectId: 'proj-1',
  assigneeId: 'user-2',
  reporterId: 'user-1',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  labels: ['frontend']
});

db.documents.push({
  id: uuidv4(),
  projectId: 'proj-1',
  title: 'Architecture Spec',
  content: '<p>This is the initial spec for Pancake.</p>',
  authorId: 'user-1',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});
