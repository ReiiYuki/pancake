import { createServerFn } from '@tanstack/react-start';
import { db } from '../db/memoryStore';
import type { Task } from '../db/memoryStore';
import { v4 as uuidv4 } from 'uuid';

export const getTasks = createServerFn({ method: 'GET' })
  .validator((projectId: string) => projectId)
  .handler(async ({ data: projectId }) => {
    const projectTasks = db.tasks.filter((t) => t.projectId === projectId);
    return projectTasks.map(t => {
      const assignee = t.assigneeId ? db.users.find(u => u.id === t.assigneeId) : undefined;
      return { ...t, assignee };
    });
  });

export const createTask = createServerFn({ method: 'POST' })
  .validator((data: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'reporterId' | 'labels'>) => data)
  .handler(async ({ data }) => {
    const newTask: Task = { 
      ...data, 
      id: uuidv4(),
      reporterId: 'user-1', // Mocking current user
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      labels: []
    };
    db.tasks.push(newTask);
    return newTask;
  });

export const updateTaskStatus = createServerFn({ method: 'POST' })
  .validator((data: { id: string; status: Task['status'] }) => data)
  .handler(async ({ data }) => {
    const taskIndex = db.tasks.findIndex((t) => t.id === data.id);
    if (taskIndex > -1) {
      db.tasks[taskIndex].status = data.status;
      return db.tasks[taskIndex];
    }
    throw new Error('Task not found');
  });

export const updateTask = createServerFn({ method: 'POST' })
  .validator((data: Partial<Task> & { id: string }) => data)
  .handler(async ({ data }) => {
    const taskIndex = db.tasks.findIndex((t) => t.id === data.id);
    if (taskIndex > -1) {
      db.tasks[taskIndex] = { ...db.tasks[taskIndex], ...data, updatedAt: new Date().toISOString() };
      return db.tasks[taskIndex];
    }
    throw new Error('Task not found');
  });

export const deleteTask = createServerFn({ method: 'POST' })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    const taskIndex = db.tasks.findIndex((t) => t.id === id);
    if (taskIndex > -1) {
      const [deletedTask] = db.tasks.splice(taskIndex, 1);
      return deletedTask;
    }
    throw new Error('Task not found');
  });

export const getProjects = createServerFn({ method: 'GET' })
  .handler(async () => {
    return db.projects;
  });

export const getProject = createServerFn({ method: 'GET' })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    return db.projects.find((p) => p.id === id) || null;
  });

export const getComments = createServerFn({ method: 'GET' })
  .validator((taskId: string) => taskId)
  .handler(async ({ data: taskId }) => {
    const comments = (db as any).comments || [];
    return comments.filter((c: any) => c.taskId === taskId).map((c: any) => {
      const author = db.users.find(u => u.id === c.authorId);
      return { ...c, author };
    });
  });

export const createComment = createServerFn({ method: 'POST' })
  .validator((data: { taskId: string; content: string }) => data)
  .handler(async ({ data }) => {
    if (!(db as any).comments) {
      (db as any).comments = [];
    }
    const newComment = {
      id: uuidv4(),
      taskId: data.taskId,
      content: data.content,
      authorId: 'user-1', // Mocking current user
      createdAt: new Date().toISOString()
    };
    (db as any).comments.push(newComment);
    const author = db.users.find(u => u.id === newComment.authorId);
    return { ...newComment, author };
  });
