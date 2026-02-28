// src/features/board/utils/postDraft.js
import { format } from 'date-fns'

export function createDraftPost({ loggedInUser, day = new Date(), type = 'post' }) {
  return {
    title: '',
    author: loggedInUser,
    targetDate: format(day, 'yyyy-MM-dd'),
    type,
    content: '',
    mentions: [],
    priority: 'normalny',
    tags: [],
    date: new Date().toISOString(),
  }
}