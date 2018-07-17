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

const debug = require('debug')('elastic:model:thread')

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
      console.error(err)
      Raven.captureException(err)
    })
  })
}

export const deletedThread = () => {
  listenToDeletedDocumentsIn(db, 'threads', data => {
    return client.delete({
      index: 'threads',
      type: 'item',
      id: data.id
    })
    .then(() => {
      debug('deleted thread in search')
      return
    })
    .catch(err => {
      debug('error deleting a thread')
      console.error(err)
      Raven.captureException(err)
    })
  })
}

export const movedThread = () => {
  listenToChangedFieldIn(db, 'channelId')('threads', data => {
    return client.updateByQuery({
      index: 'threads',
      type: 'item',
      body: {
        script: {
          lang: 'painless',
          source: `ctx._source.channelId = ${data.channelId}`
        },
        query: {
          match: {
            threadId: data.id
          }
        }
      }
    })
    .then(() => {
      debug('changed thread channel in search')
      return
    })
    .catch(err => {
      debug('error changing thread channel')
      console.error(err)
      Raven.captureException(err)
    })
  })
}

export const editedThread = () => {
  listenToChangedFieldIn(db, 'modifiedAt')('threads', data => {
    const searchableThread = dbThreadToSearchThread(data)
    return client.update({
      index: 'threads',
      type: 'item',
      id: data.id,
      body: {
        doc: searchableThread
      }
    })
    .then(() => {
      debug('edited thread in search')
      return
    })
    .catch(err => {
      debug('error editing a thread')
      console.error(err)
      Raven.captureException(err)
    })
  })
}
