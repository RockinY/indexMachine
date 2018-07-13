import elasticsearch from 'elasticsearch'

const client = new elasticsearch.Client({
  host: process.env.ELASTIC_HOST,
  log: 'trace'
})

export default client