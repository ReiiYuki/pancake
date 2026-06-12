import { v4 as uuidv4 } from 'uuid';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  projectId: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
}

export interface Document {
  id: string;
  title: string;
  content: string;
  projectId: string;
}

export const db = {
  tasks: [] as Task[],
  projects: [
    { id: 'proj-1', name: 'Frontend Refactor', description: 'Refactoring to TanStack Start' }
  ] as Project[],
  documents: [] as Document[],
};

// Seed some initial data
db.tasks.push({
  id: uuidv4(),
  title: 'Setup Database',
  description: 'Create the in-memory database',
  status: 'done',
  priority: 'high',
  projectId: 'proj-1'
});

db.tasks.push({
  id: uuidv4(),
  title: 'Implement Board UI',
  description: 'Create Jira-like drag and drop board',
  status: 'todo',
  priority: 'medium',
  projectId: 'proj-1'
});

db.documents.push({
  id: uuidv4(),
  title: 'Project Roadmap',
  content: '# Roadmap\n\n- Q1: Launch MVP\n- Q2: Add Realtime sync',
  projectId: 'proj-1'
});
