import client from '../utils/elastic'
import raven from '../utils/raven'
import { dbCommunityToSearchCommunity } from '../utils/transform'
import {
  listenToNewDocumentsIn,
  listenToDeletedDocumentsIn,
  listenToChangedFieldIn,
} from '../utils/changeFeed'
import db from '../utils/db'

export const newCommunity = () => {
  return listenToNewDocumentsIn(db, 'communities', data => {
    const searchableCommunity = dbCommunityToSearchCommunity(data)
  })
}