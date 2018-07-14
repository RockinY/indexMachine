import client from '../utils/elastic'
import mapping from './mapping'

const debug = require('debug')('elastic:scripts:initialize')

const initialize = () => {
  debug(`Check index ${process.env.ELASTIC_INDEX}`)
  client.indices.exists({index: process.env.ELASTIC_INDEX})
    .then((exists) => {
      if (exists) {
        debug(`Index ${process.env.ELASTIC_INDEX} already exists.`)
        return
      }

      debug(`Creating index ${process.env.ELASTIC_INDEX}`)
      client.indices.create({
        index: process.env.ELASTIC_INDEX
      }).then(() => {
        debug(`Creating mapping for analyzer`)
        mapping()
        .then(() => debug('Initialize done.'))
      })
    })
}

export default initialize