import './utils/dotenv'
import createServer from './server'
import raven from './utils/raven'
import initialize from './scripts/initialize'

const debug = require('debug')('elastic:indexing')
const port = process.env.PORT || 3007

debug('\n✉️ Search worker, is starting...');
debug('Logging with debug enabled!');
debug('');

// Initialize the elastic index
initialize()

const server = createServer();
server.listen(PORT, 'localhost', () => {
  debug(
    `💉 Healthcheck server running at ${server.address().address}:${
      server.address().port
    }`
  );
});

process.on('unhandledRejection', async err => {
  console.error('Unhandled rejection', err);
  try {
    await new Promise(resolve => Raven.captureException(err, resolve));
  } catch (err) {
    console.error('Raven error', err);
  } finally {
    process.exit(1);
  }
});

process.on('uncaughtException', async err => {
  console.error('Uncaught exception', err);
  try {
    await new Promise(resolve => Raven.captureException(err, resolve));
  } catch (err) {
    console.error('Raven error', err);
  } finally {
    process.exit(1);
  }
});