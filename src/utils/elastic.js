const elasticsearch = require('elasticsearch')

const client = new elasticsearch.Client({
  host: process.env.ELASTIC_HOST,
  log: 'trace',
  apiVersion: '6.2'
})

module.exports = client