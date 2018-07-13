import createServer from './server'

const debug = require('debug')('elastic:indexing')
const port = process.env.PORT || 3007

debug('\n✉️ Search worker, is starting...');
debug('Logging with debug enabled!');
debug('');

const server = createServer();
server.listen(PORT, 'localhost', () => {
  debug(
    `💉 Healthcheck server running at ${server.address().address}:${
      server.address().port
    }`
  );
});