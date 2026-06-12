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

export const createDocument = createServerFn({ method: 'POST' })
  .validator((data: Omit<Document, 'id' | 'createdAt' | 'updatedAt' | 'authorId'>) => data)
  .handler(async ({ data }) => {
    const newDoc: Document = { 
      ...data, 
      id: uuidv4(),
      authorId: 'user-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.documents.push(newDoc);
    return newDoc;
  });

export const deleteDocument = createServerFn({ method: 'POST' })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    const docIndex = db.documents.findIndex((d) => d.id === id);
    if (docIndex > -1) {
      const [deletedDoc] = db.documents.splice(docIndex, 1);
      return deletedDoc;
    }
    throw new Error('Document not found');
  });
