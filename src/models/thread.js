import db from '../utils/db'
import client from '../utils/elastic'
import Raven from '../utils/raven'
import { dbThreadToSearchThread } from '../utils/transform'
import {
  listenToNewDocumentsIn,
  listenToDeletedDocumentsIn,
  listenToChangedFieldIn
} from '../utils/changeFeed'
import type { DBThread } from '../utils/flowTypes'

export const getThreadById = (threadId: string): Promise<DBThread> => {
  return db
    .table('threads')
    .get(threadId)
    .run();
}

export const newThread = () => {
  return listenToNewDocumentsIn(db, 'threads', data => {
    const searchableThread = dbThreadToSearchThread(data)
    return client.create({
      index: 'threads',
      type: 'item',
      id: data.id,
      body: searchableThread
    })
    .then(() => {
      debug('indexed new thread in search')
      return
    })
    .catch(err => {
      debug('error indexing a thread')
      console.log(err)
      Raven.captureException(err)
    })
  })
}
