/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { ValidationResult, BlobRef } from '@atproto/lexicon'
import { isObj, hasProp } from '../../../../util.js'
import { lexicons } from '../../../../lexicons.js'
import * as LiveGrayhazeInteractionChat from './chat.js'
import * as LiveGrayhazeActorDefs from '../actor/defs.js'

export interface ChatView {
  src: LiveGrayhazeInteractionChat.Record
  author: LiveGrayhazeActorDefs.ProfileViewBasic
  [k: string]: unknown
}

export function isChatView(v: unknown): v is ChatView {
  return (
    isObj(v) &&
    hasProp(v, '$type') &&
    v.$type === 'live.grayhaze.interaction.defs#chatView'
  )
}

export function validateChatView(v: unknown): ValidationResult {
  return lexicons.validate('live.grayhaze.interaction.defs#chatView', v)
}
