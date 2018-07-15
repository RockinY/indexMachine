// @flow
import db from '../utils/db'
import client from '../utils/elastic'
import Raven from '../utils/raven'
import { dbUserToSearchUser } from '../utils/transform'
import {
  listenToNewDocumentsIn,
  listenToDeletedDocumentsIn,
  listenToChangedFieldIn,
  listenToDeletedFieldIn,
  listenToNewFieldIn
} from '../utils/changeFeed'
import type { DBUser } from '../utils/flowTypes'

const debug = require('debug')('elastic:model:user')

export const newUser = () => {
  listenToNewDocumentsIn(db, 'users', data => {
    // dont save any user without a username - they can't be linked to!
    if (!data.username) {
      debug('new user without a username, returning')
      return
    }

    const searchableUser = dbUserToSearchUser(data)
    return client.create({
      index: 'users',
      type: 'item',
      id: data.id,
      body: searchableUser
    })
    .then(() => {
      debug('stored new user in search')
      return
    })
    .catch(err => {
      debug('error indexing a user')
      console.error(err)
      Raven.captureException(err)
    })
  })
}

export const deletedUser = () => {
  listenToDeletedDocumentsIn(db, 'users', data => {
    return client.delete({
      index: 'users',
      type: 'item',
      id: data.id
    })
    .then(() => {
      debug('deleted user in search')
      return
    })
    .catch(err => {
      debug('error deleting a user!')
      console.error(err)
      Raven.captureException(err)
    })
  })
}

export const bannedUser = () => {
  listenToNewFieldIn(db, 'bannedAt')('users', (user: DBUser) => {
    debug('User banned')

    return client.delete({
      index: 'users',
      type: 'item',
      id: user.id
    })
    .then(() => {
      debug('deleted user in search')
      return
    })
    .catch(err => {
      debug('error deleting a user!')
      console.error(err)
      Raven.captureException(err)
    })
  })
}

export const unbannedUser = () => {
  listenToNewFieldIn(db, 'bannedAt')('users', (user: DBUser) => {
    debug('User unbanned')

    if (user.bannedAt) {
      debug('User still has banned field, retunning')
      return
    }

    const searchableUser = dbUserToSearchUser(user)
    return client.create({
      index: 'users',
      type: 'item',
      id: user.id,
      body: searchableUser
    })
    .then(() => {
      debug('stored unbanned user in search')
      return
    })
    .catch(err => {
      debug('error indexing a user')
      console.error(err)
      Raven.captureException(err)
    })
  })
}

export const editedUser = () => {
  listenToChangedFieldIn(db, 'modifiedAt')('users', data => {
    // if we deleted the users email or username, we are deleting their account
    if (!data.username) {
      return client.delete({
        index: 'users',
        type: 'item',
        id: data.id
      })
      .then(() => {
        debug('deleted user in search')
        return
      })
      .catch(err => {
        debug('error deleting a user!')
        console.error(err)
        Raven.captureException(err)
      })
    }

    const searchableUser = dbUserToSearchUser(data)
    return client.update({
      index: 'users',
      type: 'item',
      id: data.id,
      body: searchableUser
    })
    .then(() => {
      debug('edited user in search');
      return;
    })
    .catch(err => {
      debug('error editing a user');
      console.error(err);
      Raven.captureException(err);
    })
  })
}