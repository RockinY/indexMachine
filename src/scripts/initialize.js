import client from '../utils/elastic'

const debug = require('debug')('elastic:scripts')

const initialize = () => {
  debug(`Check index ${process.env.ELASTIC_INDEX}`)
  client.indices.exists({
    index: process.env.ELASTIC_INDEX
  }, (exists) => {
    if (exists) {
      debug(`Index ${process.env.ELASTIC_INDEX} already exists.`)
    } else {
      debug(`Creating index ${process.env.ELASTIC_INDEX}`)
      return client.indices.create({
        index: process.env.ELASTIC_INDEX
      }, () => {
        debug(`Creating mapping for analyzer`)
        client.indices.putMapping({
          index: process.env.ELASTIC_INDEX,
          updateAllTypes: true,
          body: {
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
        }, () => {
          debug(`Done initialize!`)
        })
      })
    }
  })
}

export default initialize