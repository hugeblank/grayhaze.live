/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { type ValidationResult, BlobRef } from '@atproto/lexicon'
import { isObj, hasProp } from '$lib/lexicons/util'
import { lexicons } from '$lib/lexicons/lexicons'
import { CID } from 'multiformats/cid'
import * as LiveGrayhazeInteractionChat from '$lib/lexicons/types/live/grayhaze/interaction/chat'
import * as LiveGrayhazeActorDefs from '$lib/lexicons/types/live/grayhaze/actor/defs'
import * as LiveGrayhazeInteractionBan from '$lib/lexicons/types/live/grayhaze/interaction/ban'

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
