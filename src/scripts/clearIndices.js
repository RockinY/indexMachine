const client = require('../utils/elastic')

client.indices.delete({index: '*'})