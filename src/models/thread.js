import db from '../utils/db'
import type { DBThread } from '../utils/flowTypes'

export const getThreadById = (threadId: string): Promise<DBThread> => {
  return db
    .table('threads')
    .get(threadId)
    .run();
};