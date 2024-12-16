/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { ValidationResult, BlobRef } from '@atproto/lexicon'
import { isObj, hasProp } from '../../../../util.js'
import { lexicons } from '../../../../lexicons.js'
import { CID } from 'multiformats/cid'
import * as LiveGrayhazeInteractionChat from './chat.js'
import * as LiveGrayhazeActorDefs from '../actor/defs.js'
import * as LiveGrayhazeInteractionBan from './ban.js'

export interface ChatView {
  chat_uri?: string
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

export interface BanView {
  author: LiveGrayhazeActorDefs.ProfileViewBasic
  src: LiveGrayhazeInteractionBan.Record
  [k: string]: unknown
}

export function isBanView(v: unknown): v is BanView {
  return (
    isObj(v) &&
    hasProp(v, '$type') &&
    v.$type === 'live.grayhaze.interaction.defs#banView'
  )
}

export function validateBanView(v: unknown): ValidationResult {
  return lexicons.validate('live.grayhaze.interaction.defs#banView', v)
}
