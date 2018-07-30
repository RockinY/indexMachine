import '../utils/dotenv'
import db from '../utils/db'
import client from '../utils/elastic'
import {
  dbUserToSearchUser,
  dbMessageToSearchThread,
  dbThreadToSearchThread,
  dbCommunityToSearchCommunity
} from '../utils/transform'

const debug = require('debug')('elastic:reindex')

// Users
Promise.all([
  db
  .table('users')
  .filter(row => row.hasFields(['deletedAt', 'bannedAt']).not())
  .filter(row => row('username').ne(null))
  .run()
  .then(users => {
    users.forEach(data => {
      const searchableUser = dbUserToSearchUser(data)
      return client.update({
        index: 'users',
        type: 'item',
        id: data.id,
        body: {
          doc: searchableUser,
          doc_as_upsert: true
        },
      })
      .then(() => {
        debug('user indexed in search');
        return;
      })
      .catch(err => {
        debug('error index a user');
        console.error(err);
        return
      })
    })
  }),

  // Messages
  db
    .table('messages')
    .filter(row => row.hasFields('deletedAt').not())
    .run()
    .then(messages => {
      messages.forEach(async data => {
        const searchableMessage = await dbMessageToSearchThread(data)
        if (!searchableMessage) {
          return
        }
        return client.update({
          index: 'threads',
          type: 'item',
          id: data.id,
          body: {
            doc: searchableMessage,
            doc_as_upsert: true
          },
        })
        .then(() => {
          debug('message indexed in search');
          return;
        })
        .catch(err => {
          debug('error index an message');
          console.error(err);
          return
        })
      })
    }),

  // Thread
  db
    .table('threads')
    .filter(row => row.hasFields('deletedAt').not())
    .run()
    .then(threads => {
      threads.forEach(data => {
        const searchableThread = dbThreadToSearchThread(data)
        return client.update({
          index: 'threads',
          type: 'item',
          id: data.id,
          body: {
            doc: searchableThread,
            doc_as_upsert: true
          },
        })
        .then(() => {
          debug('thread indexed in search');
          return;
        })
        .catch(err => {
          debug('error index a thread');
          console.error(err);
          return
        })
      })
    }),

  // Communities
  db
    .table('communities')
    .filter(row => row.hasFields('deletedAt').not())
    .run()
    .then(communities => {
      communities.forEach(data => {
        const searchableCommunity = dbCommunityToSearchCommunity(data)
        return client.update({
          index: 'communities',
          type: 'item',
          id: data.id,
          body: {
            doc: searchableCommunity,
            doc_as_upsert: true
          },
        })
        .then(() => {
          debug('community indexed in search');
          return;
        })
        .catch(err => {
          debug('error index a community');
          console.error(err);
          return
        })
      })
    })
]).then(() => {
  process.exit(0)
})
