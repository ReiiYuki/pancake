import { createServerFn } from '@tanstack/react-start';
import { db } from '../db/memoryStore';
import type { Task } from '../db/memoryStore';
import { v4 as uuidv4 } from 'uuid';

export const getTasks = createServerFn({ method: 'GET' })
  .validator((projectId: string) => projectId)
  .handler(async ({ data: projectId }) => {
    return db.tasks.filter((t) => t.projectId === projectId);
  });

export const createTask = createServerFn({ method: 'POST' })
  .validator((data: Omit<Task, 'id'>) => data)
  .handler(async ({ data }) => {
    const newTask: Task = { ...data, id: uuidv4() };
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

export const getProjects = createServerFn({ method: 'GET' })
  .handler(async () => {
    return db.projects;
  });

export const getProject = createServerFn({ method: 'GET' })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    return db.projects.find((p) => p.id === id) || null;
  });
