// @flow
const debug = require('debug')('elastic:transform');
import type {
  DBThread,
  DBUser,
  DBCommunity,
  DBMessage,
  SearchThread,
  SearchUser,
  SearchCommunity,
} from './flowTypes';
import { getThreadById } from '../models/thread';
import { byteCount } from './textParsing';
import { toPlainText, toState } from './draft';
import {
  onlyContainsEmoji,
} from './textParsing';

export const dbThreadToSearchThread = (thread: DBThread): SearchThread => {
  let title = thread.content.title;
  let body =
    thread.type === 'DRAFTJS'
      ? thread.content.body
        ? toPlainText(toState(JSON.parse(thread.content.body)))
        : ''
      : thread.content.body || '';

  return {
    channelId: thread.channelId,
    communityId: thread.communityId,
    creatorId: thread.creatorId,
    lastActive: new Date(thread.lastActive).getTime(),
    threadId: thread.id,
    messageContent: {
      body: '',
    },
    threadContent: {
      title,
      body,
    },
    objectID: thread.id,
    createdAt: new Date(thread.createdAt).getTime(),
  };
};

const filterMessageString = (message: DBMessage): ?string => {
  // don't index photo uploads
  if (message.messageType === 'media') {
    debug('message was media, dont send');
    return null;
  }

  // don't index dms
  if (message.threadType === 'directMessageThread') {
    debug('message was in dm, dont send');
    return null;
  }

  // don't index emoji messages
  let messageString =
    message.messageType &&
    message.messageType === 'draftjs' &&
    toPlainText(toState(JSON.parse(message.content.body)));

  // if no string could be parsed
  if (!messageString || messageString.length === 0) {
    debug('message could not be parsed or was 0 characters');
    return null;
  }

  // if the message is only an emoji
  const emojiOnly = messageString && onlyContainsEmoji(messageString);
  if (emojiOnly) {
    debug('message was emoji only, dont send');
    return null;
  }

  // passed all checks
  return messageString;
};

export const dbMessageToSearchThread = async (
  message: DBMessage
): Promise<?SearchThread> => {
  const messageString = filterMessageString(message);
  if (!messageString) return;

  const thread = await getThreadById(message.threadId);
  if (!thread || thread.deletedAt) return;

  return {
    channelId: thread.channelId,
    communityId: thread.communityId,
    creatorId: message.senderId,
    createdAt: new Date(thread.createdAt).getTime(),
    lastActive: new Date(thread.lastActive).getTime(),
    threadId: thread.id,
    messageContent: {
      body: messageString,
    },
    threadContent: {
      title: '',
      body: '',
    },
    objectID: message.id,
  };
};

export const dbUserToSearchUser = (user: DBUser): SearchUser => {
  return {
    name: user.name,
    username: user.username,
    description: user.description,
    website: user.website,
    objectID: user.id,
  };
};

export const dbCommunityToSearchCommunity = (
  community: DBCommunity
): SearchCommunity => {
  return {
    description: community.description,
    name: community.name,
    slug: community.slug,
    website: community.website ? community.website : null,
    objectID: community.id,
  };
};
