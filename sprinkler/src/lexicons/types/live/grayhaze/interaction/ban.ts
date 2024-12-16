/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { ValidationResult, BlobRef } from '@atproto/lexicon'
import { isObj, hasProp } from '../../../../util.js'
import { lexicons } from '../../../../lexicons.js'
import { CID } from 'multiformats/cid'

export interface Record {
  /** DID of the account to be blocked. */
  subject: string
  /** DID of the channel owner for which this ban should apply to. Channel moderators must provide this property. */
  target?: string
  [k: string]: unknown
}

export function isRecord(v: unknown): v is Record {
  return (
    isObj(v) &&
    hasProp(v, '$type') &&
    (v.$type === 'live.grayhaze.interaction.ban#main' ||
      v.$type === 'live.grayhaze.interaction.ban')
  )
}

export function validateRecord(v: unknown): ValidationResult {
  return lexicons.validate('live.grayhaze.interaction.ban#main', v)
}
