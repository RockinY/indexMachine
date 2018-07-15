// @flow
import client from '../utils/elastic'
import Raven from '../utils/raven'
import db from '../utils/db'
import { dbMessageToSearchThread } from '../utils/transform'
import {
  listenToNewDocumentsIn,
  listenToDeletedFieldIn,
  listenToDeletedDocumentsIn
} from '../utils/changeFeed'

const debug = require('debug')('elastic:model:message')

export const newMessage = () => {
  listenToNewDocumentsIn(db, 'messages', async data => {
    const searchableMessage = await dbMessageToSearchThread(data)
    if (!searchableMessage) {
      debug('no searchable message created, exiting')
      return
    }

    return client.create({
      index: 'threads',
      type: 'item',
      id: data.id,
      body: searchableMessage
    })
    .then(() => {
      debug('indexed new message in search')
      return
    })
    .catch(err => {
      debug('error indexing a message')
      console.log(err)
      Raven.captureException(err)
    })
  })
}

export const deleteMessage = () => {
  listenToDeletedDocumentsIn(db, 'messages', data => {
    return client.delete({
      index: 'threads',
      type: 'item',
      id: data.id
    })
    .then(() => {
      debug('delete message in search')
      return
    })
    .catch(err => {
      debug('error delete a message')
      console.log(err)
      Raven.captureException(err)
    })
  })
}