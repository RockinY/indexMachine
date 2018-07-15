import './utils/dotenv'
import createServer from './server'
import raven from './utils/raven'
import initialize from './scripts/initialize'
import {
  newThread,
  deletedThread,
  movedThread,
  editedThread
} from './models/thread'
import {
  newCommunity,
  deletedCommunity,
  editedCommunity
} from './models/community'
import { newMessage, deletedMessage } from './models/message'
import {
  newUser,
  deletedUser,
  editedUser,
  bannedUser,
  unbannedUser
} from './models/user'

const debug = require('debug')('elastic:indexing')
const port = process.env.PORT || 3007

debug('Search Indexing worker, is starting...');
debug('Logging with debug enabled!');
debug('');

// Initialize the elastic index
initialize()

newThread();
deletedThread();
movedThread();
editedThread();

newCommunity();
deletedCommunity();
editedCommunity();

newUser();
deletedUser();
bannedUser();
unbannedUser();
editedUser();

newMessage();
deletedMessage();

const server = createServer();
server.listen(port, 'localhost', () => {
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