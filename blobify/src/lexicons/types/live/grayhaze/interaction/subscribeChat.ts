/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { HeadersMap, XRPCError } from '@atproto/xrpc'
import { ValidationResult, BlobRef } from '@atproto/lexicon'
import { isObj, hasProp } from '../../../../util.js'
import { lexicons } from '../../../../lexicons.js'
import { CID } from 'multiformats/cid'
import * as LiveGrayhazeInteractionDefs from './defs.js'

/** Represents an event occuring related to the stream chat, like a message, or a ban */
export interface Message {
  message: LiveGrayhazeInteractionDefs.ChatView
  [k: string]: unknown
}

export function isMessage(v: unknown): v is Message {
  return (
    isObj(v) &&
    hasProp(v, '$type') &&
    v.$type === 'live.grayhaze.interaction.subscribeChat#message'
  )
}

export function validateMessage(v: unknown): ValidationResult {
  return lexicons.validate('live.grayhaze.interaction.subscribeChat#message', v)
}