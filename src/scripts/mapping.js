import client from '../utils/elastic'

const debug = require('debug')('elastic:scripts:mapping')

const mapping = () => {
  return Promise.all([
    client.indices.putMapping({
      index: process.env.ELASTIC_INDEX,
      type: 'threads',
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
          }
        }
      }
    }),
    client.indices.putMapping({
      index: process.env.ELASTIC_INDEX,
      type: 'messages',
      body: {
        properties: {
          body: {
            type: 'text',
            analyzer: 'ik_max_word',
            search_analyzer: 'ik_max_word'
          }
        }
      }
    }),
    client.indices.putMapping({
      index: process.env.ELASTIC_INDEX,
      type: 'users',
      body: {
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
    }),
    client.indices.putMapping({
      index: process.env.ELASTIC_INDEX,
      type: 'communities',
      body: {
        properties: {
          name: {
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
    })
  ]) 
}

export default mapping