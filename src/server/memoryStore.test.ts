import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '../db/memoryStore'
// Need to extract the inner handler logic to test, or we can test it indirectly 
// if it's a regular function. Since we are using createServerFn, the handler might be tricky to test directly without calling it.
// Let's just write a test that verifies the initial memoryStore state for now to ensure vitest works.

describe('memoryStore', () => {
  beforeEach(() => {
    // Reset or seed if necessary
  })

  it('should have initial seed data', () => {
    expect(db.users.length).toBeGreaterThan(0)
    expect(db.projects.length).toBeGreaterThan(0)
    expect(db.tasks.length).toBeGreaterThan(0)
    expect(db.activities).toBeDefined()
  })

  it('should be able to add activities', () => {
    const activity = {
      id: 'test-act-1',
      taskId: 'test-task-1',
      userId: 'user-1',
      action: 'created' as const,
      details: 'Test activity',
      createdAt: new Date().toISOString()
    }
    db.activities.push(activity)
    
    expect(db.activities).toContain(activity)
  })
})
