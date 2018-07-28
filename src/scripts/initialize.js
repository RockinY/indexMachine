const client = require('../utils/elastic')

const debug = require('debug')('elastic:scripts:initialize')

const initialize = () => {
  client.indices.exists({index: `threads`})
    .then((exists) => {
      if (exists) {
        return
      }

      client.indices.create({
        index: `threads`,
        body: {
          mappings: {
            item: {
              properties: {
                body: {
                  type: 'text',
                  analyzer: 'ik_max_word',
                  search_analyzer: 'ik_max_word'
                },
                title: {
                  type: 'text',
                  analyzer: 'ik_max_word',
                  search_analyzer: 'ik_max_word'
                },
                channelId: {
                  type: 'keyword'
                },
                communityId: {
                  type: 'keyword'
                },
                threadId: {
                  type: 'keyword'
                },
                creatorId: {
                  type: 'keyword'
                }
              }
            }
          }
        }
      }).then(() => {
        debug(`Done initialize threads.`)
      })
    })

  client.indices.exists({index: `users`})
    .then((exists) => {
      if (exists) {
        return
      }

      client.indices.create({
        index: `users`,
        body: {
          mappings: {
            item: {
              properties: {
                name: {
                  type: 'text',
                  analyzer: 'ik_max_word',
                  search_analyzer: 'ik_max_word'
                },
                username: {
                  type: 'text',
                  analyzer: 'ik_max_word',
                  search_analyzer: 'ik_max_word'
                },
                description: {
                  type: 'text',
                  analyzer: 'ik_max_word',
                  search_analyzer: 'ik_max_word'
                }
              }
            }
          }
        }
      }).then(() => {
        debug(`Done initialize users.`)
      })
    })

  client.indices.exists({index: `communities`})
    .then((exists) => {
      if (exists) {
        return
      }

      client.indices.create({
        index: `communities`,
        body: {
          mappings: {
            item: {
              properties: {               
                description: {
                  type: 'text',
                  analyzer: 'ik_max_word',
                  search_analyzer: 'ik_max_word'
                },
                name: {
                  type: 'text',
                  analyzer: 'ik_max_word',
                  search_analyzer: 'ik_max_word'
                }
              }
            }
          }
        }
      }).then(() => {
        debug(`Done initialize communities.`)
      })
    })
}

module.exports = initialize