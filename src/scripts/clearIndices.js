import client from '../utils/elastic'

// Delete all existing indexes
console.log('Start deleting');

client.indices.delete({
  index: '*'
}).then(() => console.log('Done'))