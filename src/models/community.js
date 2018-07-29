import client from '../utils/elastic'
import raven from '../utils/raven'
import { dbCommunityToSearchCommunity } from '../utils/transform'
import {
  listenToNewDocumentsIn,
  listenToDeletedDocumentsIn,
  listenToChangedFieldIn,
} from '../utils/changeFeed'
import db from '../utils/db'
import Raven from '../utils/raven';

const debug = require('debug')('elastic:model:community')

export const newCommunity = () => {
  return listenToNewDocumentsIn(db, 'communities', data => {
    const searchableCommunity = dbCommunityToSearchCommunity(data)
    return client.create({
      index: 'communities',
      type: 'item',
      id: data.id,
      body: searchableCommunity
    })
    .then(() => {
      debug('stored new community in search')
      return
    })
    .catch(err => {
      debug('error indexing a community')
      console.error(err)
      Raven.captureException(err)
    })
  })
}

export const deletedCommunity = () => {
  listenToDeletedDocumentsIn(db, 'communities', data => {
    return client.delete({
      index: 'communities',
      type: 'item',
      id: data.id
    })
    .then(() => {
      debug('deleted community in search')
      return
    })
    .catch(err => {
      debug('error deleting a community')
      console.error(err)
      Raven.captureException(err)
    })
  })
}

export const editedCommunity = () => {
  listenToChangedFieldIn(db, 'modifiedAt')('communities', data => {
    const searchableCommunity = dbCommunityToSearchCommunity(data)
    return client.update({
      index: 'communities',
      type: 'item',
      id: data.id,
      body: {
        doc: searchableCommunity,
        doc_as_upsert: true
      }
    })
    .then(() => {
      debug('stored edited community in search');
      return
    })
    .catch(err => {
      debug('error updating a community')
      console.error(err)
      Raven.captureException(err)
    })
  })
}