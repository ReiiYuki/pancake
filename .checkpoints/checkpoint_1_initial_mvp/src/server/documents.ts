import { createServerFn } from '@tanstack/react-start';
import { db } from '../db/memoryStore';
import type { Document } from '../db/memoryStore';
import { v4 as uuidv4 } from 'uuid';

export const getDocuments = createServerFn({ method: 'GET' })
  .validator((projectId: string) => projectId)
  .handler(async ({ data: projectId }) => {
    return db.documents.filter((d) => d.projectId === projectId);
  });

export const getDocument = createServerFn({ method: 'GET' })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    return db.documents.find((d) => d.id === id) || null;
  });

export const updateDocument = createServerFn({ method: 'POST' })
  .validator((data: { id: string; title: string; content: string }) => data)
  .handler(async ({ data }) => {
    const docIndex = db.documents.findIndex((d) => d.id === data.id);
    if (docIndex > -1) {
      db.documents[docIndex].title = data.title;
      db.documents[docIndex].content = data.content;
      return db.documents[docIndex];
    }
    throw new Error('Document not found');
  });
